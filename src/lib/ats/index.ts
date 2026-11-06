import { fetchGreenhouseJobs, NormalizedAtsJob } from './greenhouse';
import { fetchLeverJobs } from './lever';
import { fetchAshbyJobs } from './ashby';

export * from './greenhouse';
export * from './lever';
export * from './ashby';
export * from './detect';

export async function fetchJobsForBoard(
  provider: 'greenhouse' | 'lever' | 'ashby',
  boardSlug: string
): Promise<NormalizedAtsJob[]> {
  switch (provider) {
    case 'greenhouse':
      return await fetchGreenhouseJobs(boardSlug);
    case 'lever':
      return await fetchLeverJobs(boardSlug);
    case 'ashby':
      return await fetchAshbyJobs(boardSlug);
    default:
      throw new Error(`Unsupported ATS provider: ${provider}`);
  }
}
