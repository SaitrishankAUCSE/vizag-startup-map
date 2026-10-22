import listingsData from '@/data/listings.json';
import jobsData from '@/data/jobs.json';
import { Listing, Job, ListingFilters } from '@/types';
import { getDistanceToVizagCoastlineKm } from '@/lib/utils/geo';

// Pre-computed hydrated listings
const hydratedListings: Listing[] = (listingsData as any[]).map((item) => {
  const matchingJobs = (jobsData as Job[]).filter((j) => j.listing_id === item.id);
  return {
    ...item,
    jobs_count: matchingJobs.length,
    open_jobs: matchingJobs,
    distance_to_beach_km: getDistanceToVizagCoastlineKm(item.lat, item.lng),
  };
});

/**
 * Fetch listings with optional filtering
 */
export async function getListings(filters?: ListingFilters): Promise<Listing[]> {
  let results = [...hydratedListings];

  if (!filters) {
    return results;
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    results = results.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.sector?.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q)
    );
  }

  if (filters.type) {
    results = results.filter((l) => l.type.toLowerCase() === filters.type?.toLowerCase());
  }

  if (filters.area) {
    results = results.filter((l) => l.area.toLowerCase() === filters.area?.toLowerCase());
  }

  if (filters.sector) {
    results = results.filter((l) => l.sector?.toLowerCase() === filters.sector?.toLowerCase());
  }

  if (filters.stage) {
    results = results.filter((l) => l.stage?.toLowerCase() === filters.stage?.toLowerCase());
  }

  if (filters.hiring_only) {
    results = results.filter((l) => (l.jobs_count || 0) > 0);
  }

  return results;
}

/**
 * Fetch a single listing by slug
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const found = hydratedListings.find(
    (l) => l.slug.toLowerCase() === slug.toLowerCase()
  );
  return found || null;
}

/**
 * Fetch all active jobs
 */
export async function getJobs(): Promise<Job[]> {
  return jobsData as Job[];
}

/**
 * Fetch jobs for a specific listing
 */
export async function getJobsByListingId(listingId: string): Promise<Job[]> {
  return (jobsData as Job[]).filter((j) => j.listing_id === listingId);
}

/**
 * Get aggregate counts for the ecosystem
 */
export async function getEcosystemStats() {
  const startups = hydratedListings.filter((l) => l.type === 'startup').length;
  const investors = hydratedListings.filter((l) => l.type === 'investor').length;
  const incubators = hydratedListings.filter((l) => l.type === 'incubator').length;
  const campuses = hydratedListings.filter((l) => l.type === 'campus').length;
  const coworking = hydratedListings.filter((l) => l.type === 'coworking').length;
  const jobs = (jobsData as Job[]).length;

  return {
    startups,
    investors,
    incubators,
    campuses,
    coworking,
    jobs,
    total: hydratedListings.length,
  };
}
