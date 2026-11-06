import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/firebase/service';

/**
 * 1-Click Ecosystem CSV / Excel Export
 * Exports all verified startups, incubators, workspaces, and labs in Visakhapatnam.
 */
export async function GET(req: NextRequest) {
  try {
    const listings = await getListings();

    const headers = [
      'name',
      'business_model',
      'type',
      'sector',
      'stage',
      'area',
      'address',
      'one_liner',
      'description',
      'website',
      'founder_name',
      'founder_linkedin',
      'founded_year',
      'team_size',
      'funding_text',
      'careers_url',
      'open_jobs_count',
      'is_verified',
      'verified_on',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listings.map((l: any) => {
      // Determine business model
      const isProduct =
        l.business_model === 'product' ||
        ['SaaS', 'AI', 'Agritech', 'Healthtech', 'Deeptech', 'Fintech', 'Gaming', 'D2C', 'Pharma'].includes(
          l.sector || ''
        );
      const businessModel = isProduct ? 'Product-based' : 'Service-based / Solutions';

      return [
        escapeCsv(l.name),
        escapeCsv(businessModel),
        escapeCsv(l.type),
        escapeCsv(l.sector || ''),
        escapeCsv(l.stage || ''),
        escapeCsv(l.area),
        escapeCsv(l.address || ''),
        escapeCsv(l.one_liner || ''),
        escapeCsv(l.description || ''),
        escapeCsv(l.website || ''),
        escapeCsv(l.founder_name || ''),
        escapeCsv(l.founder_linkedin || l.linkedin_url || l.linkedin || ''),
        l.founded_year || '',
        escapeCsv(l.team_size || ''),
        escapeCsv(l.funding_text || l.funding_range || ''),
        escapeCsv(l.careers_url || ''),
        l.jobs_count || 0,
        l.is_verified ? 'Yes' : 'No',
        escapeCsv(l.verified_on || l.verified_at || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vizag_startups_ecosystem_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('[CSV Export Error]:', err);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
