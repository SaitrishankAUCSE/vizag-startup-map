import { NextRequest, NextResponse } from 'next/server';
import {
  parseCsvText,
  CsvRowSchema,
  normalizeWebsiteUrl,
  checkWebsiteStatus,
} from '@/lib/utils/csv';
import { geocodeVizagAddress } from '@/lib/utils/geocode';
import {
  getAllListings,
  createListingWithSource,
} from '@/lib/firebase/service';
import { ListingType } from '@/types';

export interface ImportItemReport {
  name: string;
  reason?: string;
  slug?: string;
  needsPin?: boolean;
}

export interface ImportReport {
  totalRows: number;
  created: ImportItemReport[];
  skipped: ImportItemReport[];
  failed: ImportItemReport[];
}

export async function POST(req: NextRequest) {
  try {
    let csvText = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csvText || '';
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV content is empty' }, { status: 400 });
    }

    const rawRows = parseCsvText(csvText);
    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'Could not parse any valid rows from CSV' }, { status: 400 });
    }

    // Load existing listings to detect duplicates
    const existingListings = await getAllListings('all');
    const existingDomains = new Set<string>();
    const existingNames = new Set<string>();

    existingListings.forEach((l) => {
      existingNames.add(`${l.name.toLowerCase().trim()}_${(l.area || '').toLowerCase().trim()}`);
      if (l.website) {
        const { domain } = normalizeWebsiteUrl(l.website);
        if (domain) existingDomains.add(domain);
      }
    });

    const report: ImportReport = {
      totalRows: rawRows.length,
      created: [],
      skipped: [],
      failed: [],
    };

    for (const raw of rawRows) {
      const parsed = CsvRowSchema.safeParse(raw);
      if (!parsed.success) {
        report.failed.push({
          name: raw.name || 'Unknown',
          reason: parsed.error.issues.map((i) => i.message).join('; '),
        });
        continue;
      }

      const row = parsed.data;
      const { normalizedUrl, domain } = normalizeWebsiteUrl(row.website);

      // Duplicate detection
      const nameKey = `${row.name.toLowerCase().trim()}_${(row.area || '').toLowerCase().trim()}`;
      if (existingNames.has(nameKey)) {
        report.skipped.push({
          name: row.name,
          reason: `Duplicate startup name in the same area: "${row.name}" (${row.area})`,
        });
        continue;
      }

      if (domain && existingDomains.has(domain)) {
        report.skipped.push({
          name: row.name,
          reason: `Duplicate website domain: "${domain}"`,
        });
        continue;
      }

      // Website HTTP status check (8 second timeout)
      let websiteStatus: number | null = null;
      if (normalizedUrl) {
        websiteStatus = await checkWebsiteStatus(normalizedUrl);
      }

      // Address Geocoding with Nominatim
      const geocodeResult = await geocodeVizagAddress(row.address || '', row.area);

      // Prepare listing payload
      const listingData = {
        name: row.name,
        type: row.type as ListingType,
        one_liner: row.one_liner || null,
        description: row.one_liner || `${row.name} in ${row.area}, Visakhapatnam.`,
        sector: row.sector || null,
        stage: row.stage || null,
        area: row.area,
        address: row.address || null,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
        website: normalizedUrl,
        linkedin_url: row.linkedin_url || null,
        website_status: websiteStatus,
        status: (geocodeResult.needsPin ? 'needs_review' : 'pending') as any, // Pending admin approval
      };

      const sourceData = {
        source_type: row.source_type,
        source_url: row.source_url || normalizedUrl || null,
        note: `CSV Import. Geocoding: ${geocodeResult.attribution}`,
        added_by: 'admin_csv_import',
      };

      const atsData =
        row.ats_provider && row.ats_board_slug
          ? {
              provider: row.ats_provider as 'greenhouse' | 'lever' | 'ashby',
              board_slug: row.ats_board_slug,
            }
          : undefined;

      try {
        const created = await createListingWithSource(listingData, sourceData, atsData);

        // Track in current batch so later rows in same CSV don't duplicate
        existingNames.add(nameKey);
        if (domain) existingDomains.add(domain);

        report.created.push({
          name: row.name,
          slug: created.slug,
          needsPin: geocodeResult.needsPin,
        });
      } catch (err) {
        report.failed.push({
          name: row.name,
          reason: (err as Error).message || 'Failed to save listing to database',
        });
      }
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'CSV import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
