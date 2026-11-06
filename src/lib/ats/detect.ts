/**
 * Auto-detect ATS provider and board slug from career URLs.
 * Supported providers: Greenhouse, Lever, Ashby.
 */

export interface AtsDetectionResult {
  provider: 'greenhouse' | 'lever' | 'ashby' | null;
  boardSlug: string | null;
}

export function detectAtsFromUrl(rawUrl?: string | null): AtsDetectionResult {
  if (!rawUrl || !rawUrl.trim()) {
    return { provider: null, boardSlug: null };
  }

  const url = rawUrl.trim();

  // 1. Greenhouse: boards.greenhouse.io/{slug} or job-boards.greenhouse.io/{slug}
  const ghMatch = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([a-zA-Z0-9_\-]+)/i);
  if (ghMatch && ghMatch[1]) {
    return { provider: 'greenhouse', boardSlug: ghMatch[1] };
  }

  // 2. Lever: jobs.lever.co/{slug}
  const leverMatch = url.match(/jobs\.lever\.co\/([a-zA-Z0-9_\-]+)/i);
  if (leverMatch && leverMatch[1]) {
    return { provider: 'lever', boardSlug: leverMatch[1] };
  }

  // 3. Ashby: jobs.ashbyhq.com/{slug}
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([a-zA-Z0-9_\-]+)/i);
  if (ashbyMatch && ashbyMatch[1]) {
    return { provider: 'ashby', boardSlug: ashbyMatch[1] };
  }

  return { provider: null, boardSlug: null };
}
