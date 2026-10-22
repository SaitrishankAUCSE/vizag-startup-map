// Unified data access service with resilient fallback

import { createServerSupabaseClient } from './server';
import { createAdminClient } from './admin';
import { INITIAL_MOCK_LISTINGS, INITIAL_MOCK_JOBS } from '@/data/mockData';
import { Listing, Job, Submission } from '@/types';
import { getDistanceToVizagCoastlineKm } from '@/lib/utils/geo';

// In-memory store for mutations when working without remote DB
let localListings: Listing[] = [...INITIAL_MOCK_LISTINGS];
let localJobs: Job[] = [...INITIAL_MOCK_JOBS];
let localSubmissions: Submission[] = [];

export async function getListings(): Promise<Listing[]> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    try {
      const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (!error && listings && listings.length > 0) {
        // Fetch active jobs count for each listing
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true);

        return listings.map((item) => {
          const itemJobs = (jobs || []).filter((j) => j.listing_id === item.id);
          return {
            ...item,
            jobs_count: itemJobs.length,
            open_jobs: itemJobs,
            distance_to_beach_km: getDistanceToVizagCoastlineKm(item.lat, item.lng),
          };
        });
      }
    } catch {
      // Fall through to mock dataset
    }
  }

  return localListings;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (!error && data) {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('listing_id', data.id)
          .eq('is_active', true);

        return {
          ...data,
          jobs_count: jobs?.length || 0,
          open_jobs: jobs || [],
          distance_to_beach_km: getDistanceToVizagCoastlineKm(data.lat, data.lng),
        };
      }
    } catch {
      // Fall through
    }
  }

  const found = localListings.find((l) => l.slug === slug);
  return found || null;
}

export async function getActiveJobs(): Promise<Job[]> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, listings(name, slug, logo_url, area)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((j) => ({
          id: j.id,
          listing_id: j.listing_id,
          title: j.title,
          location: j.location,
          apply_url: j.apply_url,
          is_active: j.is_active,
          created_at: j.created_at,
          updated_at: j.updated_at,
          company_name: (j.listings as unknown as { name?: string })?.name,
          company_slug: (j.listings as unknown as { slug?: string })?.slug,
          company_logo: (j.listings as unknown as { logo_url?: string })?.logo_url,
          company_area: (j.listings as unknown as { area?: string })?.area,
        }));
      }
    } catch {
      // Fall through
    }
  }

  return localJobs;
}

export async function createSubmission(
  listingData: Partial<Listing>,
  founderName: string,
  contactEmail: string
): Promise<{ success: boolean; id: string }> {
  const supabaseAdmin = createAdminClient();

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .insert({
          listing_data: listingData,
          founder_name: founderName,
          contact_email: contactEmail,
          status: 'pending',
        })
        .select('id')
        .single();

      if (!error && data) {
        return { success: true, id: data.id };
      }
    } catch {
      // Fall through
    }
  }

  const id = `sub_${Date.now()}`;
  localSubmissions.push({
    id,
    listing_data: listingData,
    founder_name: founderName,
    contact_email: contactEmail,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return { success: true, id };
}

export async function getSubmissions(): Promise<Submission[]> {
  const supabaseAdmin = createAdminClient();

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fall through
    }
  }

  return localSubmissions;
}

export async function approveSubmission(submissionId: string): Promise<boolean> {
  const subIndex = localSubmissions.findIndex((s) => s.id === submissionId);
  if (subIndex !== -1) {
    const sub = localSubmissions[subIndex];
    sub.status = 'approved';
    const newListing: Listing = {
      id: `list_${Date.now()}`,
      slug:
        sub.listing_data.slug ||
        (sub.listing_data.name || 'startup')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      name: sub.listing_data.name || 'Untitled Startup',
      type: sub.listing_data.type || 'startup',
      description: sub.listing_data.description || '',
      sector: sub.listing_data.sector || 'SaaS',
      stage: sub.listing_data.stage || 'Bootstrapped',
      area: sub.listing_data.area || 'Rushikonda',
      address: sub.listing_data.address || 'Visakhapatnam',
      lat: sub.listing_data.lat || 17.72,
      lng: sub.listing_data.lng || 83.32,
      website: sub.listing_data.website || null,
      linkedin: sub.listing_data.linkedin || null,
      logo_url: sub.listing_data.logo_url || null,
      founded_year: sub.listing_data.founded_year || new Date().getFullYear(),
      team_size: sub.listing_data.team_size || '1-10',
      funding_range: sub.listing_data.funding_range || 'Bootstrapped',
      status: 'approved',
      is_featured: false,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      jobs_count: 0,
      open_jobs: [],
      distance_to_beach_km: getDistanceToVizagCoastlineKm(
        sub.listing_data.lat || 17.72,
        sub.listing_data.lng || 83.32
      ),
    };
    localListings.unshift(newListing);
    return true;
  }
  return false;
}

// In-memory claims, favourites, and analytics tracking
interface LocalClaim {
  id: string;
  listing_id: string;
  listing_name?: string;
  listing_slug?: string;
  founder_name: string;
  work_email: string;
  proof_url: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface LocalFavourite {
  id: string;
  user_id: string;
  listing_id: string;
  list_name: string;
  created_at: string;
}

interface LocalAnalytics {
  listing_id: string;
  event: 'view' | 'website_click';
  created_at: string;
}

const localClaims: LocalClaim[] = [
  {
    id: 'claim_sample_1',
    listing_id: 'b0000000-0000-0000-0000-000000000003',
    listing_name: 'Sample BaySaaS Analytics',
    listing_slug: 'sample-baysaas-analytics',
    founder_name: 'Vikram Varma',
    work_email: 'vikram@baysaas.sample.com',
    proof_url: 'https://linkedin.com/in/sample-vikram-baysaas',
    notes: 'Co-founder and CEO of BaySaaS based at Rushikonda IT SEZ',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const localFavourites: LocalFavourite[] = [];
const localAnalytics: LocalAnalytics[] = [
  { listing_id: 'b0000000-0000-0000-0000-000000000003', event: 'view', created_at: new Date().toISOString() },
  { listing_id: 'b0000000-0000-0000-0000-000000000003', event: 'view', created_at: new Date().toISOString() },
  { listing_id: 'b0000000-0000-0000-0000-000000000003', event: 'website_click', created_at: new Date().toISOString() },
  { listing_id: 'b0000000-0000-0000-0000-000000000004', event: 'view', created_at: new Date().toISOString() },
  { listing_id: 'b0000000-0000-0000-0000-000000000004', event: 'view', created_at: new Date().toISOString() },
];

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch {
      // Fall through
    }
  }
  return localListings.find((l) => l.id === id) || null;
}

export async function updateListingProfile(
  listingId: string,
  updates: Partial<Listing>
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);
      if (!error) return true;
    } catch {
      // Fall through
    }
  }

  const idx = localListings.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    localListings[idx] = {
      ...localListings[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

// Jobs CRUD with rule enforcement: 1 job for Free listings, 5 jobs for Featured listings
export async function createJob(
  listingId: string,
  title: string,
  location: string,
  applyUrl: string
): Promise<{ success: boolean; job?: Job; error?: string }> {
  const listing = await getListingById(listingId);
  if (!listing) {
    return { success: false, error: 'Listing not found' };
  }

  // Count existing active jobs
  const existingJobs = localJobs.filter((j) => j.listing_id === listingId && j.is_active);
  const maxAllowed = listing.is_featured ? 5 : 1;

  if (existingJobs.length >= maxAllowed) {
    return {
      success: false,
      error: `Job post limit reached (${existingJobs.length}/${maxAllowed}). ${
        !listing.is_featured ? 'Upgrade to Featured Listing to post up to 5 jobs.' : ''
      }`,
    };
  }

  const newJob: Job = {
    id: `job_${Date.now()}`,
    listing_id: listingId,
    title,
    location,
    apply_url: applyUrl,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_name: listing.name,
    company_slug: listing.slug,
    company_logo: listing.logo_url,
    company_area: listing.area,
  };

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').insert({
        listing_id: listingId,
        title,
        location,
        apply_url: applyUrl,
        is_active: true,
      }).select('*').single();
      if (!error && data) {
        return { success: true, job: { ...newJob, id: data.id } };
      }
    } catch {
      // Fall through
    }
  }

  localJobs.unshift(newJob);

  // Update listing cached jobs
  const lIdx = localListings.findIndex((l) => l.id === listingId);
  if (lIdx !== -1) {
    localListings[lIdx].jobs_count = (localListings[lIdx].jobs_count || 0) + 1;
    localListings[lIdx].open_jobs = [
      newJob,
      ...(localListings[lIdx].open_jobs || []),
    ];
  }

  return { success: true, job: newJob };
}

export async function toggleJobStatus(jobId: string, isActive: boolean): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('jobs').update({ is_active: isActive }).eq('id', jobId);
      if (!error) return true;
    } catch {
      // Fall through
    }
  }

  const job = localJobs.find((j) => j.id === jobId);
  if (job) {
    job.is_active = isActive;
    job.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function deleteJob(jobId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (!error) return true;
    } catch {
      // Fall through
    }
  }

  const idx = localJobs.findIndex((j) => j.id === jobId);
  if (idx !== -1) {
    localJobs.splice(idx, 1);
    return true;
  }
  return false;
}

// Claims management
export async function createClaim(
  listingId: string,
  founderName: string,
  workEmail: string,
  proofUrl: string,
  notes?: string
): Promise<{ success: boolean; id: string; error?: string }> {
  const listing = await getListingById(listingId);
  if (!listing) {
    return { success: false, id: '', error: 'Listing not found' };
  }

  const id = `claim_${Date.now()}`;
  const claim: LocalClaim = {
    id,
    listing_id: listingId,
    listing_name: listing.name,
    listing_slug: listing.slug,
    founder_name: founderName,
    work_email: workEmail,
    proof_url: proofUrl,
    notes,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localClaims.unshift(claim);
  return { success: true, id };
}

export async function getClaims(): Promise<LocalClaim[]> {
  return localClaims;
}

export async function approveClaim(claimId: string): Promise<boolean> {
  const claim = localClaims.find((c) => c.id === claimId);
  if (!claim) return false;

  claim.status = 'approved';
  claim.updated_at = new Date().toISOString();

  // Mark listing as claimed & verified
  const listing = localListings.find((l) => l.id === claim.listing_id);
  if (listing) {
    listing.is_verified = true;
    listing.owner_id = `user_${claim.work_email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    listing.last_verified_at = new Date().toISOString();
  }

  return true;
}

// Favourites management
export async function getFavourites(userId: string): Promise<LocalFavourite[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('favourites').select('*').eq('user_id', userId);
      if (!error && data) return data;
    } catch {
      // Fall through
    }
  }
  return localFavourites.filter((f) => f.user_id === userId);
}

export async function addFavourite(
  userId: string,
  listingId: string,
  listName = 'My Watchlist'
): Promise<boolean> {
  const existing = localFavourites.find(
    (f) => f.user_id === userId && f.listing_id === listingId && f.list_name === listName
  );
  if (existing) return true;

  const fav: LocalFavourite = {
    id: `fav_${Date.now()}`,
    user_id: userId,
    listing_id: listingId,
    list_name: listName,
    created_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('favourites').insert({
        user_id: userId,
        listing_id: listingId,
        list_name: listName,
      });
    } catch {
      // Fall through
    }
  }

  localFavourites.push(fav);
  return true;
}

export async function removeFavourite(userId: string, listingId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('favourites').delete().eq('user_id', userId).eq('listing_id', listingId);
    } catch {
      // Fall through
    }
  }

  const idx = localFavourites.findIndex(
    (f) => f.user_id === userId && f.listing_id === listingId
  );
  if (idx !== -1) {
    localFavourites.splice(idx, 1);
    return true;
  }
  return false;
}

// Analytics tracking
export async function recordAnalyticsEvent(
  listingId: string,
  event: 'view' | 'website_click'
): Promise<void> {
  localAnalytics.push({
    listing_id: listingId,
    event,
    created_at: new Date().toISOString(),
  });

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('analytics_events').insert({
        listing_id: listingId,
        event,
      });
    } catch {
      // Fall through
    }
  }
}

export async function getListingAnalytics(
  listingId: string
): Promise<{ views: number; clicks: number }> {
  const events = localAnalytics.filter((e) => e.listing_id === listingId);
  const views = events.filter((e) => e.event === 'view').length;
  const clicks = events.filter((e) => e.event === 'website_click').length;
  return { views, clicks };
}
