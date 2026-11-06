import { z } from 'zod';
import { ListingType, Sector, Stage, Area } from '@/types';

export const CsvRowSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['startup', 'investor', 'incubator', 'campus', 'coworking']).default('startup'),
  one_liner: z.string().max(240).optional().nullable(),
  sector: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  area: z.string().default('Other'),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable().or(z.literal('')),
  source_type: z
    .enum([
      'founder_submission',
      'incubator_page',
      'startup_india',
      'company_website',
      'news',
      'manual_research',
    ])
    .default('manual_research'),
  source_url: z.string().optional().nullable(),
  careers_url: z.string().optional().nullable(),
  ats_provider: z.enum(['greenhouse', 'lever', 'ashby']).optional().nullable().or(z.literal('')),
  ats_board_slug: z.string().optional().nullable().or(z.literal('')),
});

export type ValidatedCsvRow = z.infer<typeof CsvRowSchema>;

/**
 * Normalize website URL to clean domain or full URL
 */
export function normalizeWebsiteUrl(rawUrl?: string | null): { normalizedUrl: string | null; domain: string | null } {
  if (!rawUrl || !rawUrl.trim()) {
    return { normalizedUrl: null, domain: null };
  }

  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    const domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    return {
      normalizedUrl: `${parsed.protocol}//${parsed.host}`,
      domain,
    };
  } catch {
    return { normalizedUrl: null, domain: null };
  }
}

/**
 * Check if website responds (HTTP 200/301/302, 8-second timeout).
 */
export async function checkWebsiteStatus(url: string | null): Promise<number | null> {
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VizagStartupMapBot/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status;
  } catch {
    // Retry with GET if HEAD was blocked by server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VizagStartupMapBot/1.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.status;
    } catch {
      return 0; // Unreachable
    }
  }
}

/**
 * Simple CSV parser handling quotes and commas.
 */
export function parseCsvText(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/[\s-]+/g, '_'));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = values[index] !== undefined ? values[index].trim() : '';
    });
    rows.push(rowObj);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}
