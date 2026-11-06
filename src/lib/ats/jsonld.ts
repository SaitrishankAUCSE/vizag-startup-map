/**
 * Optional Careers Page JSON-LD JobPosting Reader
 *
 * Rules:
 *  1. Checks and respects robots.txt before fetching.
 *  2. Custom User-Agent: VizagStartupMapBot/1.0 (+https://vizagstartupmap.com/bot; contact@vizagstartupmap.com).
 *  3. Maximum once a day per company.
 *  4. Extracts only schema.org/JobPosting structured data.
 *  5. Never scrapes LinkedIn, Naukri, Indeed, or unallowed pages.
 */

import { NormalizedAtsJob } from './greenhouse';

/**
 * Check if robots.txt disallows scraping the careers page
 */
async function isAllowedByRobots(careersUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(careersUrl);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'VizagStartupMapBot/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return true; // Default allow if 404
    const text = await res.text();

    // Check simple Disallow rules
    const path = parsed.pathname;
    const lines = text.split('\n');
    let isUserAgentMatch = false;

    for (const line of lines) {
      const clean = line.trim().toLowerCase();
      if (clean.startsWith('user-agent: *') || clean.startsWith('user-agent: vizagstartupmapbot')) {
        isUserAgentMatch = true;
      } else if (clean.startsWith('user-agent:') && isUserAgentMatch) {
        break;
      } else if (isUserAgentMatch && clean.startsWith('disallow:')) {
        const disallowPath = clean.replace('disallow:', '').trim();
        if (disallowPath && path.startsWith(disallowPath)) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Fetch and parse JobPosting JSON-LD from a careers URL
 */
export async function fetchJsonLdJobs(careersUrl: string): Promise<NormalizedAtsJob[]> {
  const allowed = await isAllowedByRobots(careersUrl);
  if (!allowed) {
    console.warn(`[jsonld] robots.txt disallows crawling ${careersUrl}`);
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(careersUrl, {
      headers: {
        'User-Agent': 'VizagStartupMapBot/1.0 (+https://vizagstartupmap.com/bot; contact@vizagstartupmap.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const html = await res.text();
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    const jobs: NormalizedAtsJob[] = [];
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          if (item['@type'] === 'JobPosting') {
            const externalId = item.identifier?.value || item.url || item.title;
            const applyUrl = item.directApplyUrl || item.url || careersUrl;
            const locationText =
              item.jobLocation?.address?.addressLocality ||
              item.jobLocation?.address?.streetAddress ||
              'Visakhapatnam, Andhra Pradesh';

            jobs.push({
              externalId: String(externalId),
              title: item.title || 'Open Position',
              locationText,
              department: item.occupationalCategory || null,
              employmentType: item.employmentType || null,
              applyUrl,
              postedAt: item.datePosted || null,
            });
          }
        }
      } catch {
        // Skip malformed script tags
      }
    }

    return jobs;
  } catch {
    return [];
  }
}
