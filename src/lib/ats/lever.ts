/**
 * Lever ATS Adapter
 * Endpoint: GET https://api.lever.co/v0/postings/{slug}?mode=json
 */

import { NormalizedAtsJob } from './greenhouse';

export async function fetchLeverJobs(boardSlug: string): Promise<NormalizedAtsJob[]> {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(boardSlug)}?mode=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'VizagStartupMap-AtsSync/1.0 (+https://vizagstartupmap.com)',
      Accept: 'application/json',
    },
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Lever API responded with HTTP ${res.status}`);
  }

  const postings: any[] = await res.json();
  if (!Array.isArray(postings)) return [];

  return postings.map((job) => ({
    externalId: String(job.id),
    title: job.text || 'Untitled Role',
    locationText: job.categories?.location || 'Visakhapatnam, Andhra Pradesh',
    department: job.categories?.department || job.categories?.team || null,
    employmentType: job.categories?.commitment || null,
    applyUrl: job.hostedUrl || `https://jobs.lever.co/${boardSlug}/${job.id}`,
    postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
  }));
}
