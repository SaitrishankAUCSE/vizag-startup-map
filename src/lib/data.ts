// Unified data access bridge – reads from Firebase Firestore via the service layer.
// Next.js route segments set `export const revalidate = 300` (5-min cache) so that
// Firestore reads are batched and the Spark-plan daily quota is protected.

import {
  getListings as serviceGetListings,
  getListingBySlug as serviceGetListingBySlug,
  getActiveJobs,
  getPublicStats,
} from '@/lib/firebase/service';
import { Listing, Job, ListingFilters, PublicStats } from '@/types';

/**
 * Fetch listings with optional client-side filtering.
 * Filtering is performed here (on already-cached data) so we avoid extra
 * Firestore reads per filter combination.
 */
export async function getListings(filters?: ListingFilters): Promise<Listing[]> {
  const allListings = await serviceGetListings();
  let results = [...allListings];

  if (!filters) return results;

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    results = results.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.one_liner && l.one_liner.toLowerCase().includes(q)) ||
        (l.sector && l.sector.toLowerCase().includes(q)) ||
        (l.area && l.area.toLowerCase().includes(q))
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

  if (filters.hiring_only || filters.hiringOnly) {
    results = results.filter((l) => (l.jobs_count || 0) > 0);
  }

  return results;
}

/**
 * Fetch a single listing by slug.
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  return serviceGetListingBySlug(slug);
}

/**
 * Fetch all active jobs.
 */
export async function getJobs(): Promise<Job[]> {
  return getActiveJobs();
}

/**
 * Fetch jobs for a specific listing.
 */
export async function getJobsByListingId(listingId: string): Promise<Job[]> {
  const jobs = await getActiveJobs();
  return jobs.filter((j) => j.listing_id === listingId);
}

/**
 * Get aggregate counts for the ecosystem from the stats/public Firestore doc.
 */
export async function getEcosystemStats(): Promise<
  PublicStats & {
    startups: number;
    investors: number;
    incubators: number;
    campuses: number;
    coworking: number;
    jobs: number;
    total: number;
  }
> {
  const stats = await getPublicStats();
  return {
    ...stats,
    startups: stats.total_startups,
    investors: stats.total_investors,
    incubators: stats.total_incubators,
    campuses: stats.total_campuses,
    coworking: stats.total_coworking,
    jobs: stats.open_roles,
    total:
      stats.total_startups +
      stats.total_investors +
      stats.total_incubators +
      stats.total_campuses +
      stats.total_coworking,
  };
}
