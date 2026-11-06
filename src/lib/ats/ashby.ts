/**
 * Ashby ATS Adapter
 * Endpoint: GET https://api.ashbyhq.com/posting-api/job-board/{slug}
 */

import { NormalizedAtsJob } from './greenhouse';

export async function fetchAshbyJobs(boardSlug: string): Promise<NormalizedAtsJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(boardSlug)}`;

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
    throw new Error(`Ashby API responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  const jobs: any[] = data.jobs || [];

  return jobs.map((job) => ({
    externalId: String(job.id),
    title: job.title || 'Untitled Role',
    locationText: job.location || 'Visakhapatnam, Andhra Pradesh',
    department: job.department || null,
    employmentType: job.employmentType || null,
    applyUrl: job.jobUrl || `https://jobs.ashbyhq.com/${boardSlug}/${job.id}`,
    postedAt: job.publishedAt || null,
  }));
}
