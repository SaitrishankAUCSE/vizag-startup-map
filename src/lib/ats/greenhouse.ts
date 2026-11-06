/**
 * Greenhouse ATS Adapter
 * Endpoint: GET https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
 */

export interface NormalizedAtsJob {
  externalId: string;
  title: string;
  locationText: string;
  department?: string | null;
  employmentType?: string | null;
  applyUrl: string;
  postedAt?: string | null;
}

export async function fetchGreenhouseJobs(boardSlug: string): Promise<NormalizedAtsJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardSlug)}/jobs?content=true`;

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
    throw new Error(`Greenhouse API responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  const jobs: any[] = data.jobs || [];

  return jobs.map((job) => {
    // Extract department if available
    let department: string | null = null;
    if (Array.isArray(job.departments) && job.departments.length > 0) {
      department = job.departments[0].name || null;
    }

    return {
      externalId: String(job.id),
      title: job.title || 'Untitled Role',
      locationText: job.location?.name || 'Visakhapatnam, Andhra Pradesh',
      department,
      employmentType: null,
      applyUrl: job.absolute_url || `https://boards.greenhouse.io/${boardSlug}/jobs/${job.id}`,
      postedAt: job.updated_at || null,
    };
  });
}
