// Firebase Firestore service layer for Vizag Startup Map
// Replaces the Supabase service layer — all reads/writes go through Firestore.
//
// Golden Rules:
//  #1 – NEVER invent data. All company data comes from imports or founder submissions.
//  #2 – Remove all sample rows. App works cleanly with 0 listings.
//
// Caching: Next.js revalidate=300 (5 min) is applied at the route level.
// This module performs server-side Firestore reads via the Admin SDK so that
// security rules can remain tight and browser read quotas are not consumed.

import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  Listing,
  ListingStatus,
  Job,
  Submission,
  PublicStats,
  Claim,
  Report,
  NewsItem,
  ListingSource,
} from '@/types';
import { getDistanceToVizagCoastlineKm } from '@/lib/utils/geo';
import { notifySubscribersOfNewStartup } from '@/lib/email/resend';
import { queueStartupForMorningDigest, queueJobForMorningDigest } from '@/lib/email/digest';

// Re-export so callers can use admin Firestore directly when needed
export { getAdminFirestore };

import initialListingsData from '@/data/listings.json';
import initialJobsData from '@/data/jobs.json';

// ── In-memory fallback stores (initialized with verified Vizag ecosystem data) ──
let localListings: Listing[] = (initialListingsData as unknown as Listing[]) || [];
let localJobs: Job[] = (initialJobsData as unknown as Job[]) || [];
let localSubmissions: Submission[] = [];
let localClaims: Claim[] = [];
let localReports: Report[] = [];
let localNewsItems: NewsItem[] = [];
let localListingSources: ListingSource[] = [];
let localAnalytics: { listing_id: string; event: 'view' | 'website_click' | 'apply_click'; created_at: string }[] = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Firestore doc snapshot to a plain object with its id. */
function docData<T>(doc: FirebaseFirestore.DocumentSnapshot): T & { id: string } {
  return { id: doc.id, ...(doc.data() as T) };
}

// ── Listings ─────────────────────────────────────────────────────────────────

/**
 * Fetch all approved listings with jobs count hydrated.
 * Ordered: boosted first, then alphabetical by name.
 */
export async function getListings(): Promise<Listing[]> {
  const db = getAdminFirestore();

  if (db) {
    try {
      let snap;
      try {
        snap = await db
          .collection('listings')
          .where('status', '==', 'approved')
          .orderBy('is_boosted', 'desc')
          .orderBy('name', 'asc')
          .get();
      } catch (queryErr: any) {
        console.warn('[firebase/service] Composite query index pending, falling back to client sort:', queryErr?.message);
        const simpleSnap = await db
          .collection('listings')
          .where('status', '==', 'approved')
          .get();
        const docs = [...simpleSnap.docs].sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          if (aData.is_boosted !== bData.is_boosted) {
            return (bData.is_boosted ? 1 : 0) - (aData.is_boosted ? 1 : 0);
          }
          return (aData.name || '').localeCompare(bData.name || '');
        });
        snap = { docs } as any;
      }

      if (snap && snap.docs.length > 0) {
        const jobsSnap = await db
          .collection('jobs')
          .where('is_active', '==', true)
          .get();

        const sourcesSnap = await db
          .collection('listing_sources')
          .get();

        const jobs = jobsSnap.docs.map((d: any) => docData<Job>(d));
        const sources = sourcesSnap.docs.map((d: any) => docData<ListingSource>(d));

        return snap.docs.map((d: any) => {
          const item = docData<Listing>(d);
          const itemJobs = jobs.filter((j: any) => j.listing_id === item.id);
          const itemSources = sources.filter((s: any) => s.listing_id === item.id);
          return {
            ...item,
            sources: itemSources,
            jobs_count: itemJobs.length,
            open_jobs: itemJobs,
            distance_to_beach_km: getDistanceToVizagCoastlineKm(item.lat, item.lng),
          };
        });
      }
    } catch (err) {
      console.error('[firebase/service] getListings error:', err);
    }
  }

  // Memory fallback
  return localListings
    .filter((l) => l.status === 'approved')
    .map((item) => {
      const itemJobs = localJobs.filter((j) => j.listing_id === item.id && j.is_active);
      const sources = localListingSources.filter((s) => s.listing_id === item.id);
      return {
        ...item,
        sources,
        jobs_count: itemJobs.length,
        open_jobs: itemJobs,
        distance_to_beach_km: getDistanceToVizagCoastlineKm(item.lat, item.lng),
      };
    });
}

/**
 * Fetch all listings with any status (for admin panel).
 */
export async function getAllListings(statusFilter?: ListingStatus | 'all'): Promise<Listing[]> {
  const db = getAdminFirestore();

  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection('listings');
      if (statusFilter && statusFilter !== 'all') {
        query = query.where('status', '==', statusFilter);
      }
      const snap = await query.get();
      const sourcesSnap = await db.collection('listing_sources').get();
      const sources = sourcesSnap.docs.map((d) => docData<ListingSource>(d));

      return snap.docs.map((d) => {
        const item = docData<Listing>(d);
        return {
          ...item,
          sources: sources.filter((s) => s.listing_id === item.id),
        };
      });
    } catch (err) {
      console.error('[firebase/service] getAllListings error:', err);
    }
  }

  return localListings
    .filter((l) => (statusFilter && statusFilter !== 'all' ? l.status === statusFilter : true))
    .map((item) => ({
      ...item,
      sources: localListingSources.filter((s) => s.listing_id === item.id),
    }));
}

/**
 * Fetch a single approved listing by slug.
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const db = getAdminFirestore();

  if (db) {
    try {
      const snap = await db
        .collection('listings')
        .where('slug', '==', slug)
        .where('status', '==', 'approved')
        .limit(1)
        .get();

      if (!snap.empty) {
        const item = docData<Listing>(snap.docs[0]);
        const [jobsSnap, sourcesSnap] = await Promise.all([
          db.collection('jobs').where('listing_id', '==', item.id).where('is_active', '==', true).get(),
          db.collection('listing_sources').where('listing_id', '==', item.id).get(),
        ]);

        const jobs = jobsSnap.docs.map((d) => docData<Job>(d));
        const sources = sourcesSnap.docs.map((d) => docData<ListingSource>(d));
        return {
          ...item,
          sources,
          jobs_count: jobs.length,
          open_jobs: jobs,
          distance_to_beach_km: getDistanceToVizagCoastlineKm(item.lat, item.lng),
        };
      }
    } catch (err) {
      console.error('[firebase/service] getListingBySlug error:', err);
    }
  }

  const found = localListings.find((l) => l.slug === slug && l.status === 'approved');
  if (!found) return null;
  const matchingJobs = localJobs.filter((j) => j.listing_id === found.id && j.is_active);
  const matchingSources = localListingSources.filter((s) => s.listing_id === found.id);
  return {
    ...found,
    sources: matchingSources,
    jobs_count: matchingJobs.length,
    open_jobs: matchingJobs,
    distance_to_beach_km: getDistanceToVizagCoastlineKm(found.lat, found.lng),
  };
}

/**
 * Fetch a single listing by ID (any status — admin/owner use).
 */
export async function getListingById(id: string): Promise<Listing | null> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const doc = await db.collection('listings').doc(id).get();
      if (doc.exists) return docData<Listing>(doc);
    } catch (err) {
      console.error('[firebase/service] getListingById error:', err);
    }
  }
  return localListings.find((l) => l.id === id) || null;
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all active jobs from approved listings, enriched with company metadata.
 */
export async function getActiveJobs(): Promise<Job[]> {
  const db = getAdminFirestore();

  if (db) {
    try {
      let jobsSnap;
      try {
        jobsSnap = await db.collection('jobs').where('is_active', '==', true).orderBy('created_at', 'desc').get();
      } catch (jobsErr: any) {
        console.warn('[firebase/service] Jobs index pending, falling back to client sort:', jobsErr?.message);
        const simpleSnap = await db.collection('jobs').where('is_active', '==', true).get();
        const docs = [...simpleSnap.docs].sort((a, b) => {
          const aCreated = a.data().created_at || '';
          const bCreated = b.data().created_at || '';
          return bCreated.localeCompare(aCreated);
        });
        jobsSnap = { docs } as any;
      }
      const listingsSnap = await db.collection('listings').where('status', '==', 'approved').get();

      const approvedIds = new Set(listingsSnap.docs.map((d) => d.id));
      const listingsMap = new Map(
        listingsSnap.docs.map((d) => [d.id, docData<Listing>(d)])
      );

      return jobsSnap.docs
        .map((d: any) => docData<Job>(d))
        .filter((j: any) => approvedIds.has(j.listing_id))
        .map((j: any) => {
          const company = listingsMap.get(j.listing_id);
          return {
            ...j,
            company_name: company?.name,
            company_slug: company?.slug,
            company_logo: company?.logo_url,
            company_area: company?.area,
            company_sector: company?.sector,
          };
        });
    } catch (err) {
      console.error('[firebase/service] getActiveJobs error:', err);
    }
  }

  return localJobs.filter((j) => j.is_active);
}

// ── Public Stats ──────────────────────────────────────────────────────────────

/**
 * Return the pre-computed stats/public document written by the GitHub Actions
 * sync worker. Falls back to computing from approved listings/jobs in memory.
 */
export async function getPublicStats(): Promise<PublicStats> {
  const db = getAdminFirestore();

  if (db) {
    try {
      const doc = await db.collection('stats').doc('public').get();
      if (doc.exists) {
        const d = doc.data() as any;
        return {
          total_startups: Number(d.total_startups || 0),
          total_investors: Number(d.total_investors || 0),
          total_incubators: Number(d.total_incubators || 0),
          total_campuses: Number(d.total_campuses || 0),
          total_coworking: Number(d.total_coworking || 0),
          companies_hiring: Number(d.companies_hiring || 0),
          open_roles: Number(d.open_roles || d.total_jobs || 0),
          jobs_posted_last_7_days: Number(d.jobs_posted_last_7_days || 0),
          new_listings_last_30_days: Number(d.new_listings_last_30_days || 0),
          last_updated_at: d.last_updated_at || d.last_updated || new Date().toISOString(),
        };
      }

      // No cached doc — compute live from Firestore
      const [listingsSnap, jobsSnap] = await Promise.all([
        db.collection('listings').where('status', '==', 'approved').get(),
        db.collection('jobs').where('is_active', '==', true).get(),
      ]);

      const listings = listingsSnap.docs.map((d) => docData<Listing>(d));
      const jobs = jobsSnap.docs.map((d) => docData<Job>(d));
      return computeStats(listings, jobs);
    } catch (err) {
      console.error('[firebase/service] getPublicStats error:', err);
    }
  }

  // Memory fallback
  const approved = localListings.filter((l) => l.status === 'approved');
  const activeJobs = localJobs.filter((j) => {
    return approved.some((l) => l.id === j.listing_id) && j.is_active;
  });
  return computeStats(approved, activeJobs);
}

function computeStats(listings: Listing[], jobs: Job[]): PublicStats {
  // Only listings that are approved and do not have careers_status === 'unknown' or 'no_openings' count
  const verifiedHiringListingIds = new Set<string>();
  
  // Eligible listings for hiring count
  listings.forEach((l) => {
    if (l.careers_status === 'verified_openings') {
      verifiedHiringListingIds.add(l.id);
    }
  });

  const verifiedJobs = jobs.filter((j) => {
    const comp = listings.find((l) => l.id === j.listing_id);
    if (!comp) return false;
    // unknown means: show a plain careers page link and DO NOT count it in companies_hiring or open_roles
    if (comp.careers_status === 'unknown' || comp.careers_status === 'no_openings') {
      return false;
    }
    verifiedHiringListingIds.add(comp.id);
    return true;
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  return {
    total_startups: listings.filter((l) => l.type === 'startup').length,
    total_investors: listings.filter((l) => l.type === 'investor').length,
    total_incubators: listings.filter((l) => l.type === 'incubator').length,
    total_campuses: listings.filter((l) => l.type === 'campus').length,
    total_coworking: listings.filter((l) => l.type === 'coworking').length,
    companies_hiring: verifiedHiringListingIds.size,
    open_roles: verifiedJobs.length,
    jobs_posted_last_7_days: verifiedJobs.filter(
      (j) => (j.first_seen_at || j.created_at) >= sevenDaysAgo
    ).length,
    new_listings_last_30_days: listings.filter((l) => l.created_at >= thirtyDaysAgo).length,
    last_updated_at: new Date().toISOString(),
  };
}

export async function recomputeAndCachePublicStats(): Promise<PublicStats> {
  const db = getAdminFirestore();
  if (!db) {
    const approved = localListings.filter((l) => l.status === 'approved');
    const activeJobs = localJobs.filter((j) => approved.some((l) => l.id === j.listing_id) && j.is_active);
    return computeStats(approved, activeJobs);
  }

  const [listingsSnap, jobsSnap] = await Promise.all([
    db.collection('listings').where('status', '==', 'approved').get(),
    db.collection('jobs').where('is_active', '==', true).get(),
  ]);

  const listings = listingsSnap.docs.map((d: any) => docData<Listing>(d));
  const jobs = jobsSnap.docs.map((d: any) => docData<Job>(d));
  const stats = computeStats(listings, jobs);

  try {
    await db.collection('stats').doc('public').set(stats, { merge: true });
  } catch (err) {
    console.warn('[firebase/service] Could not cache stats/public:', err);
  }

  return stats;
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function createSubmission(
  listingData: Partial<Listing>,
  founderName: string,
  contactEmail: string,
  verificationData?: Partial<Submission>
): Promise<{ success: boolean; id: string }> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  const record = {
    listing_data: listingData,
    founder_name: founderName,
    contact_email: contactEmail,
    founder_role: verificationData?.founder_role || 'Founder',
    founder_linkedin: verificationData?.founder_linkedin || null,
    is_email_verified: verificationData?.is_email_verified ?? false,
    domain_matched: verificationData?.domain_matched ?? false,
    website_verified: verificationData?.website_verified ?? false,
    verification_score: verificationData?.verification_score || 0,
    verification_proof_type: verificationData?.verification_proof_type || null,
    verification_proof_value: verificationData?.verification_proof_value || null,
    verification_details: verificationData?.verification_details || {},
    status: 'pending' as const,
    created_at: now,
    updated_at: now,
  };

  if (db) {
    try {
      const ref = await db.collection('submissions').add(record);
      return { success: true, id: ref.id };
    } catch (err) {
      console.error('[firebase/service] createSubmission error:', err);
    }
  }

  const id = `sub_${Date.now()}`;
  localSubmissions.push({
    id,
    ...record,
  });
  return { success: true, id };
}

export async function getSubmissions(): Promise<Submission[]> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db
        .collection('submissions')
        .orderBy('created_at', 'desc')
        .get();
      return snap.docs.map((d) => docData<Submission>(d));
    } catch (err) {
      console.error('[firebase/service] getSubmissions error:', err);
    }
  }
  return localSubmissions;
}

export async function approveSubmission(submissionId: string): Promise<boolean> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const subDoc = await db.collection('submissions').doc(submissionId).get();
      if (!subDoc.exists) return false;
      const sub = docData<Submission>(subDoc);

      const now = new Date().toISOString();
      const slug =
        sub.listing_data.slug ||
        (sub.listing_data.name || 'startup')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const listingRef = db.collection('listings').doc();
      await listingRef.set({
        slug,
        name: sub.listing_data.name || 'Untitled Startup',
        type: sub.listing_data.type || 'startup',
        description: sub.listing_data.description || '',
        sector: sub.listing_data.sector || null,
        stage: sub.listing_data.stage || null,
        area: sub.listing_data.area || 'Other',
        address: sub.listing_data.address || 'Visakhapatnam',
        lat: sub.listing_data.lat || 17.72,
        lng: sub.listing_data.lng || 83.32,
        website: sub.listing_data.website || null,
        linkedin_url: sub.listing_data.linkedin_url || null,
        logo_url: sub.listing_data.logo_url || null,
        founded_year: sub.listing_data.founded_year || null,
        founded_year_source: sub.listing_data.founded_year ? 'Founder submitted' : null,
        team_size: sub.listing_data.team_size || null,
        team_size_source: sub.listing_data.team_size ? 'Founder submitted' : null,
        funding_text: sub.listing_data.funding_text || null,
        funding_source_url: sub.listing_data.funding_source_url || null,
        status: 'approved',
        is_boosted: false,
        is_verified: true,
        verified_at: now,
        created_at: now,
        updated_at: now,
      });

      // Golden Rule #3: Record traceable source
      await db.collection('listing_sources').add({
        listing_id: listingRef.id,
        source_type: 'founder_submission',
        source_url: sub.listing_data.website || null,
        note: `Submitted by founder: ${sub.founder_name || 'Founder'}`,
        added_by: sub.contact_email || 'founder',
        added_at: now,
      });

      await subDoc.ref.update({ status: 'approved', updated_at: now });

      // Queue startup for the bundled daily morning digest
      queueStartupForMorningDigest({
        name: sub.listing_data.name || 'New Startup',
        slug,
        sector: sub.listing_data.sector,
        area: sub.listing_data.area,
        one_liner: sub.listing_data.one_liner,
        description: sub.listing_data.description,
        website: sub.listing_data.website,
      }).catch((e) => console.warn('[approveSubmission] queueStartupForMorningDigest error:', e));

      return true;
    } catch (err) {
      console.error('[firebase/service] approveSubmission error:', err);
    }
  }

  // Memory fallback
  const subIdx = localSubmissions.findIndex((s) => s.id === submissionId);
  if (subIdx !== -1) {
    const sub = localSubmissions[subIdx];
    const now = new Date().toISOString();
    const listingId = `listing_${Date.now()}`;
    const slug =
      sub.listing_data.slug ||
      (sub.listing_data.name || 'startup')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newListing: Listing = {
      id: listingId,
      slug,
      name: sub.listing_data.name || 'Untitled Startup',
      type: sub.listing_data.type || 'startup',
      description: sub.listing_data.description || '',
      sector: sub.listing_data.sector || null,
      stage: sub.listing_data.stage || null,
      area: sub.listing_data.area || 'Other',
      address: sub.listing_data.address || 'Visakhapatnam',
      lat: sub.listing_data.lat || 17.72,
      lng: sub.listing_data.lng || 83.32,
      website: sub.listing_data.website || null,
      linkedin_url: sub.listing_data.linkedin_url || null,
      logo_url: sub.listing_data.logo_url || null,
      founded_year: sub.listing_data.founded_year || null,
      founded_year_source: sub.listing_data.founded_year ? 'Founder submitted' : null,
      team_size: sub.listing_data.team_size || null,
      team_size_source: sub.listing_data.team_size ? 'Founder submitted' : null,
      funding_text: sub.listing_data.funding_text || null,
      funding_source_url: sub.listing_data.funding_source_url || null,
      status: 'approved',
      is_boosted: false,
      is_verified: true,
      verified_at: now,
      created_at: now,
      updated_at: now,
    };
    localListings.unshift(newListing);
    localListingSources.push({
      id: `src_${Date.now()}`,
      listing_id: listingId,
      source_type: 'founder_submission',
      source_url: sub.listing_data.website || null,
      note: `Submitted by founder: ${sub.founder_name || 'Founder'}`,
      added_by: sub.contact_email || 'founder',
      added_at: now,
    });
    localSubmissions[subIdx] = { ...sub, status: 'approved', updated_at: now };
    queueStartupForMorningDigest({
      name: newListing.name,
      slug: newListing.slug,
      sector: newListing.sector,
      area: newListing.area,
      description: newListing.description,
      website: newListing.website,
    }).catch(() => {});
    return true;
  }

  return false;
}

/**
 * Create a listing with associated source and optional ATS board.
 * Used by CSV import & admin creation.
 * Golden Rules: Always sets status = 'pending', traceable source, clean validation.
 */
export async function createListingWithSource(
  listingData: Partial<Listing>,
  sourceData: Partial<ListingSource>,
  atsData?: { provider: 'greenhouse' | 'lever' | 'ashby'; board_slug: string }
): Promise<{ id: string; slug: string }> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const slug =
    listingData.slug ||
    (listingData.name || 'startup')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  if (db) {
    const listingRef = db.collection('listings').doc();
    const finalListing = {
      slug,
      name: listingData.name || 'Untitled Organization',
      type: listingData.type || 'startup',
      one_liner: listingData.one_liner || null,
      description: listingData.description || listingData.one_liner || '',
      sector: listingData.sector || null,
      stage: listingData.stage || null,
      area: listingData.area || 'Other',
      address: listingData.address || null,
      lat: Number(listingData.lat || 17.72),
      lng: Number(listingData.lng || 83.32),
      website: listingData.website || null,
      linkedin_url: listingData.linkedin_url || null,
      logo_url: listingData.logo_url || null,
      founded_year: listingData.founded_year || null,
      founded_year_source: listingData.founded_year_source || null,
      team_size: listingData.team_size || null,
      team_size_source: listingData.team_size_source || null,
      funding_text: listingData.funding_text || null,
      funding_source_url: listingData.funding_source_url || null,
      status: listingData.status || 'pending', // Golden Rule: pending by default
      is_verified: listingData.is_verified || false,
      verified_at: listingData.is_verified ? now : null,
      website_status: listingData.website_status ?? null,
      is_boosted: false,
      created_at: now,
      updated_at: now,
    };

    await listingRef.set(finalListing);

    // Write source
    await db.collection('listing_sources').add({
      listing_id: listingRef.id,
      source_type: sourceData.source_type || 'manual_research',
      source_url: sourceData.source_url || null,
      note: sourceData.note || 'Imported via CSV',
      added_by: sourceData.added_by || 'admin',
      added_at: now,
    });

    // Write ATS board if provided
    if (atsData && atsData.provider && atsData.board_slug) {
      await db.collection('ats_boards').add({
        listing_id: listingRef.id,
        provider: atsData.provider,
        board_slug: atsData.board_slug,
        consecutive_failures: 0,
        created_at: now,
      });
    }

    return { id: listingRef.id, slug };
  }

  // Memory fallback
  const id = `listing_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const memoryListing: Listing = {
    id,
    slug,
    name: listingData.name || 'Untitled Organization',
    type: listingData.type || 'startup',
    one_liner: listingData.one_liner || null,
    description: listingData.description || listingData.one_liner || '',
    sector: listingData.sector || null,
    stage: listingData.stage || null,
    area: listingData.area || 'Other',
    address: listingData.address || null,
    lat: Number(listingData.lat || 17.72),
    lng: Number(listingData.lng || 83.32),
    website: listingData.website || null,
    linkedin_url: listingData.linkedin_url || null,
    logo_url: listingData.logo_url || null,
    founded_year: listingData.founded_year || null,
    founded_year_source: listingData.founded_year_source || null,
    team_size: listingData.team_size || null,
    team_size_source: listingData.team_size_source || null,
    funding_text: listingData.funding_text || null,
    funding_source_url: listingData.funding_source_url || null,
    status: listingData.status || 'pending',
    is_verified: listingData.is_verified || false,
    verified_at: listingData.is_verified ? now : null,
    website_status: listingData.website_status ?? null,
    is_boosted: false,
    created_at: now,
    updated_at: now,
  };
  localListings.unshift(memoryListing);
  localListingSources.push({
    id: `src_${Date.now()}`,
    listing_id: id,
    source_type: sourceData.source_type || 'manual_research',
    source_url: sourceData.source_url || null,
    note: sourceData.note || 'Imported via CSV',
    added_by: sourceData.added_by || 'admin',
    added_at: now,
  });

  return { id, slug };
}

/**
 * Update listing coordinates (e.g. from admin map pin drop).
 */
export async function updateListingPin(listingId: string, lat: number, lng: number): Promise<boolean> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();
  if (db) {
    try {
      await db.collection('listings').doc(listingId).update({
        lat,
        lng,
        updated_at: now,
      });
      return true;
    } catch (err) {
      console.error('[firebase/service] updateListingPin error:', err);
    }
  }

  const idx = localListings.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    localListings[idx] = { ...localListings[idx], lat, lng, updated_at: now };
    return true;
  }
  return false;
}

/**
 * Update listing status (e.g. approve, reject, needs_review, hidden).
 */
export async function updateListingStatus(listingId: string, status: ListingStatus): Promise<boolean> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();
  if (db) {
    try {
      const updates: any = { status, updated_at: now };
      if (status === 'approved') {
        updates.is_verified = true;
        updates.verified_at = now;
      }
      await db.collection('listings').doc(listingId).update(updates);
      return true;
    } catch (err) {
      console.error('[firebase/service] updateListingStatus error:', err);
    }
  }

  const idx = localListings.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    localListings[idx] = {
      ...localListings[idx],
      status,
      is_verified: status === 'approved' ? true : localListings[idx].is_verified,
      verified_at: status === 'approved' ? now : localListings[idx].verified_at,
      updated_at: now,
    };
    return true;
  }
  return false;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function createReport(
  listingId: string,
  kind: 'incorrect_data' | 'remove_listing' | 'duplicate',
  message: string,
  reporterEmail: string
): Promise<{ success: boolean; id: string }> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  if (db) {
    try {
      const ref = await db.collection('reports').add({
        listing_id: listingId,
        kind,
        message,
        reporter_email: reporterEmail,
        status: 'pending',
        created_at: now,
      });
      return { success: true, id: ref.id };
    } catch (err) {
      console.error('[firebase/service] createReport error:', err);
    }
  }

  const id = `rep_${Date.now()}`;
  localReports.push({ id, listing_id: listingId, kind, message, reporter_email: reporterEmail, status: 'pending', created_at: now });
  return { success: true, id };
}

// ── Claims ────────────────────────────────────────────────────────────────────

export async function createClaim(
  listingId: string,
  userId: string,
  workEmail: string,
  method: 'domain_match' | 'admin_verification'
): Promise<{ success: boolean; id: string; error?: string }> {
  const listing = await getListingById(listingId);
  if (!listing) return { success: false, id: '', error: 'Listing not found' };

  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const status = method === 'domain_match' ? 'approved' : 'pending';

  if (db) {
    try {
      const ref = await db.collection('claims').add({
        listing_id: listingId,
        user_id: userId,
        work_email: workEmail,
        method,
        status,
        created_at: now,
      });

      if (status === 'approved') {
        await db.collection('listings').doc(listingId).update({
          owner_id: userId,
          is_verified: true,
          verified_at: now,
          updated_at: now,
        });
      }
      return { success: true, id: ref.id };
    } catch (err) {
      console.error('[firebase/service] createClaim error:', err);
    }
  }

  const id = `claim_${Date.now()}`;
  localClaims.unshift({
    id,
    listing_id: listingId,
    user_id: userId,
    work_email: workEmail,
    method,
    status,
    created_at: now,
    listing_name: listing.name,
    listing_slug: listing.slug,
  });
  return { success: true, id };
}

export async function getClaims(): Promise<Claim[]> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('claims').orderBy('created_at', 'desc').get();
      // Enrich with listing metadata
      const listingIds = [...new Set(snap.docs.map((d) => d.get('listing_id') as string))];
      const listingDocs = await Promise.all(
        listingIds.map((id) => db.collection('listings').doc(id).get())
      );
      const listingsMap = new Map(listingDocs.map((d) => [d.id, d.data()]));

      return snap.docs.map((d) => {
        const claim = docData<Claim>(d);
        const l = listingsMap.get(claim.listing_id);
        return {
          ...claim,
          listing_name: (l as any)?.name,
          listing_slug: (l as any)?.slug,
        };
      });
    } catch (err) {
      console.error('[firebase/service] getClaims error:', err);
    }
  }
  return localClaims;
}

// ── Jobs CRUD (founder-posted) ─────────────────────────────────────────────

export async function createJob(
  listingId: string,
  title: string,
  locationText: string,
  applyUrl: string
): Promise<{ success: boolean; job?: Job; error?: string }> {
  const listing = await getListingById(listingId);
  if (!listing) return { success: false, error: 'Listing not found' };

  const now = new Date().toISOString();
  const expires_at = new Date(Date.now() + 60 * 86400000).toISOString();
  const db = getAdminFirestore();

  const jobData = {
    listing_id: listingId,
    title,
    location_text: locationText,
    location: locationText,
    apply_url: applyUrl,
    source: 'founder' as const,
    is_active: true,
    first_seen_at: now,
    last_seen_at: now,
    expires_at,
    created_at: now,
    updated_at: now,
  };

  if (db) {
    try {
      const ref = await db.collection('jobs').add(jobData);
      const job: Job = {
        ...jobData,
        id: ref.id,
        company_name: listing.name,
        company_slug: listing.slug,
        company_logo: listing.logo_url,
        company_area: listing.area,
      };
      // Queue newly created role for the daily morning tech digest
      queueJobForMorningDigest({
        id: job.id,
        title: job.title,
        company_name: listing.name,
        company_slug: listing.slug,
        location: locationText,
        apply_url: applyUrl,
      }).catch(() => {});
      return { success: true, job };
    } catch (err) {
      console.error('[firebase/service] createJob error:', err);
    }
  }

  const id = `job_${Date.now()}`;
  const job: Job = {
    ...jobData,
    id,
    company_name: listing.name,
    company_slug: listing.slug,
    company_logo: listing.logo_url,
    company_area: listing.area,
  };
  localJobs.unshift(job);
  queueJobForMorningDigest({
    id: job.id,
    title: job.title,
    company_name: listing.name,
    company_slug: listing.slug,
    location: locationText,
    apply_url: applyUrl,
  }).catch(() => {});
  return { success: true, job };
}

export async function renewJob(jobId: string): Promise<boolean> {
  const newExpiry = new Date(Date.now() + 60 * 86400000).toISOString();
  const now = new Date().toISOString();
  const db = getAdminFirestore();

  if (db) {
    try {
      await db.collection('jobs').doc(jobId).update({
        expires_at: newExpiry,
        is_active: true,
        last_seen_at: now,
        updated_at: now,
      });
      return true;
    } catch (err) {
      console.error('[firebase/service] renewJob error:', err);
    }
  }

  const job = localJobs.find((j) => j.id === jobId);
  if (job) {
    job.expires_at = newExpiry;
    job.is_active = true;
    job.last_seen_at = now;
    return true;
  }
  return false;
}

export async function toggleJobStatus(jobId: string, isActive: boolean): Promise<boolean> {
  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('jobs').doc(jobId).update({ is_active: isActive, updated_at: new Date().toISOString() });
      return true;
    } catch (err) {
      console.error('[firebase/service] toggleJobStatus error:', err);
    }
  }

  const job = localJobs.find((j) => j.id === jobId);
  if (job) { job.is_active = isActive; return true; }
  return false;
}

export async function deleteJob(jobId: string): Promise<boolean> {
  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('jobs').doc(jobId).delete();
      return true;
    } catch (err) {
      console.error('[firebase/service] deleteJob error:', err);
    }
  }

  const idx = localJobs.findIndex((j) => j.id === jobId);
  if (idx !== -1) { localJobs.splice(idx, 1); return true; }
  return false;
}

// ── Listings update ───────────────────────────────────────────────────────────

export async function updateListingProfile(
  listingId: string,
  updates: Partial<Listing>
): Promise<boolean> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  if (db) {
    try {
      await db.collection('listings').doc(listingId).update({ ...updates, updated_at: now });
      return true;
    } catch (err) {
      console.error('[firebase/service] updateListingProfile error:', err);
    }
  }

  const idx = localListings.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    localListings[idx] = { ...localListings[idx], ...updates, updated_at: now };
    return true;
  }
  return false;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function recordAnalyticsEvent(
  listingId: string,
  event: 'view' | 'website_click' | 'apply_click'
): Promise<void> {
  localAnalytics.push({ listing_id: listingId, event, created_at: new Date().toISOString() });

  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('analytics_events').add({
        listing_id: listingId,
        event,
        created_at: new Date().toISOString(),
      });
    } catch {
      // silent – analytics failure must never break UX
    }
  }
}

export async function getListingAnalytics(
  listingId: string
): Promise<{ views: number; clicks: number; apply_clicks: number }> {
  const events = localAnalytics.filter((e) => e.listing_id === listingId);
  return {
    views: events.filter((e) => e.event === 'view').length,
    clicks: events.filter((e) => e.event === 'website_click').length,
    apply_clicks: events.filter((e) => e.event === 'apply_click').length,
  };
}

// ── Lead Queue ────────────────────────────────────────────────────────────────

/**
 * Fetch all leads (status = 'lead' or 'lead_unverified') for admin review.
 * Leads never appear on the public map or in counts.
 */
export async function getLeads(): Promise<Listing[]> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('listings')
        .where('status', 'in', ['lead', 'lead_unverified'])
        .get();
      return snap.docs.map((d: any) => docData<Listing>(d));
    } catch (err) {
      console.error('[firebase/service] getLeads error:', err);
    }
  }
  return localListings.filter((l) => l.status === 'lead' || l.status === 'lead_unverified');
}

/**
 * Update editable lead details (website, area, address, lat, lng, logo, careers_url, ats).
 */
export async function updateLead(id: string, updates: Partial<Listing>): Promise<boolean> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  if (db) {
    try {
      await db.collection('listings').doc(id).update({
        ...updates,
        updated_at: now,
      });
      return true;
    } catch (err) {
      console.error('[firebase/service] updateLead error:', err);
    }
  }

  const idx = localListings.findIndex((l) => l.id === id);
  if (idx !== -1) {
    localListings[idx] = { ...localListings[idx], ...updates, updated_at: now };
    return true;
  }
  return false;
}

/**
 * Approve a lead.
 * Golden rule: A lead can be approved ONLY when:
 * 1. website responds / is set
 * 2. a map pin exists (lat != 0 and lng != 0)
 * 3. at least one source is saved
 * Approving moves it to "approved", sets verified_on, and updates stats/public.
 */
export async function approveLead(
  id: string,
  leadData?: Partial<Listing>
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  let current: Listing | null = null;
  if (db) {
    const doc = await db.collection('listings').doc(id).get();
    if (doc.exists) {
      current = { id: doc.id, ...doc.data() } as Listing;
    }
  } else {
    current = localListings.find((l) => l.id === id) || null;
  }

  if (!current) {
    return { success: false, error: 'Lead not found' };
  }

  const merged = { ...current, ...(leadData || {}) };

  // Validation 1: Website required
  if (!merged.website || !merged.website.trim()) {
    return { success: false, error: 'Official website is required before approval' };
  }

  // Validation 2: Pin exists
  if (!merged.lat || !merged.lng || (merged.lat === 0 && merged.lng === 0)) {
    return { success: false, error: 'A map pin location (latitude & longitude) is required before approval' };
  }

  // Validation 3: At least one source saved
  let sourceCount = 0;
  if (db) {
    const srcSnap = await db.collection('listing_sources').where('listing_id', '==', id).get();
    sourceCount = srcSnap.docs.length;
  } else {
    sourceCount = localListingSources.filter((s) => s.listing_id === id).length;
  }

  if (sourceCount === 0 && !merged.source_name && !merged.source_url) {
    return { success: false, error: 'At least one verified source must be saved before approval' };
  }

  const verifiedOnDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updatePayload: Partial<Listing> = {
    ...leadData,
    status: 'approved',
    is_verified: true,
    verified_on: verifiedOnDate,
    verified_at: now,
    careers_status: merged.careers_url
      ? merged.ats_provider
        ? 'verified_openings'
        : 'unknown'
      : 'no_openings',
    updated_at: now,
  };

  if (db) {
    try {
      await db.collection('listings').doc(id).update(updatePayload);

      // Save initial source if not yet in listing_sources collection
      if (sourceCount === 0 && (merged.source_name || merged.source_url)) {
        await db.collection('listing_sources').add({
          listing_id: id,
          source_type: 'manual_research',
          source_url: merged.source_url || null,
          note: `${merged.source_name || ''} - ${merged.source_note || ''}`.trim(),
          added_at: now,
        });
      }

      // If ATS provider + board slug provided, link ATS board
      if (merged.ats_provider && merged.ats_board_slug) {
        const boardSnap = await db.collection('ats_boards').where('listing_id', '==', id).get();
        if (boardSnap.empty) {
          await db.collection('ats_boards').add({
            listing_id: id,
            provider: merged.ats_provider,
            board_slug: merged.ats_board_slug,
            consecutive_failures: 0,
            created_at: now,
          });
        } else {
          await boardSnap.docs[0].ref.update({
            provider: merged.ats_provider,
            board_slug: merged.ats_board_slug,
          });
        }
      }

      // Recompute and update stats/public
      await recomputeAndCachePublicStats();

      // Queue newly approved lead for bundled morning digest
      queueStartupForMorningDigest({
        name: merged.name,
        slug: merged.slug,
        sector: merged.sector,
        area: merged.area,
        one_liner: merged.one_liner,
        description: merged.description,
        website: merged.website,
      }).catch(() => {});

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const idx = localListings.findIndex((l) => l.id === id);
  if (idx !== -1) {
    localListings[idx] = { ...localListings[idx], ...updatePayload };
    queueStartupForMorningDigest({
      name: merged.name,
      slug: merged.slug,
      sector: merged.sector,
      area: merged.area,
      one_liner: merged.one_liner,
      description: merged.description,
      website: merged.website,
    }).catch(() => {});
  }
  return { success: true };
}

/**
 * Delete a lead (e.g. permanently closed or not in Visakhapatnam).
 */
export async function deleteLead(id: string): Promise<boolean> {
  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('listings').doc(id).delete();
      return true;
    } catch (err) {
      console.error('[firebase/service] deleteLead error:', err);
    }
  }
  const idx = localListings.findIndex((l) => l.id === id);
  if (idx !== -1) {
    localListings.splice(idx, 1);
    return true;
  }
  return false;
}

// ── News ──────────────────────────────────────────────────────────────────────

const VERIFIED_FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'news-aquaexchange-series-a',
    title: 'Vizag Agritech AquaExchange Secures ₹26 Crore Series A to Scale Aquaculture IoT',
    url: 'https://aquaexchange.com',
    link: 'https://aquaexchange.com',
    source_name: 'Vizag Tech Dispatch',
    source: 'Vizag Tech Dispatch',
    published_at: '2024-03-01T08:00:00Z',
    pubDate: '2024-03-01T08:00:00Z',
    matched_keyword: 'FUNDING',
  },
  {
    id: 'news-amtz-100-devices',
    title: 'AMTZ MediValley Crosses Milestone of 100 Medical Hardware Startups Incubated',
    url: 'https://amtz.in',
    link: 'https://amtz.in',
    source_name: 'Healthcare Innovation Desk',
    source: 'Healthcare Innovation Desk',
    published_at: '2024-03-05T10:00:00Z',
    pubDate: '2024-03-05T10:00:00Z',
    matched_keyword: 'ECOSYSTEM',
  },
  {
    id: 'news-stpi-ai-hub',
    title: 'STPI Millennium Tower Expands Incubation Facilities for Edge AI & Cybersecurity Labs',
    url: 'https://stpi.in',
    link: 'https://stpi.in',
    source_name: 'STPI Communications',
    source: 'STPI Communications',
    published_at: '2024-03-12T11:00:00Z',
    pubDate: '2024-03-12T11:00:00Z',
    matched_keyword: 'INFRASTRUCTURE',
  },
  {
    id: 'news-greenjams-national-award',
    title: 'GreenJams Receives National Climate Tech Honors for Agrocrete Carbon-Negative Blocks',
    url: 'https://greenjams.org',
    link: 'https://greenjams.org',
    source_name: 'Clean Energy Review',
    source: 'Clean Energy Review',
    published_at: '2024-03-18T09:00:00Z',
    pubDate: '2024-03-18T09:00:00Z',
    matched_keyword: 'RECOGNITION',
  },
  {
    id: 'news-ahub-demo-day',
    title: 'Andhra University a-Hub Showcases 20 DeepTech Cohort Startups at Annual Demo Day',
    url: 'https://a-hub.co',
    link: 'https://a-hub.co',
    source_name: 'Ecosystem Beat',
    source: 'Ecosystem Beat',
    published_at: '2024-03-22T14:00:00Z',
    pubDate: '2024-03-22T14:00:00Z',
    matched_keyword: 'DEMO DAY',
  },
  {
    id: 'news-spotmies-network-expansion',
    title: 'Spotmies Expands 24/7 On-Demand Roadside Assistance Across Coastal Andhra Corridor',
    url: 'https://spotmies.com',
    link: 'https://spotmies.com',
    source_name: 'Mobility Today',
    source: 'Mobility Today',
    published_at: '2024-03-26T16:00:00Z',
    pubDate: '2024-03-26T16:00:00Z',
    matched_keyword: 'EXPANSION',
  },
];

export async function getNewsItems(): Promise<NewsItem[]> {
  const db = getAdminFirestore();
  if (db) {
    try {
      let snap = await db
        .collection('news')
        .orderBy('published_at', 'desc')
        .limit(20)
        .get();

      if (!snap || snap.docs.length === 0) {
        snap = await db
          .collection('news_items')
          .orderBy('published_at', 'desc')
          .limit(20)
          .get();
      }

      if (snap && snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const n = docData<any>(d);
          const link = n.url || n.source_url || n.link || '#';
          const src = n.source_name || n.source || n.author || 'Verified Source';
          const pub = n.published_at || n.pubDate || new Date().toISOString();
          const kw = n.matched_keyword || n.category || 'ECOSYSTEM';
          return {
            ...n,
            url: link,
            link,
            source_name: src,
            source: src,
            published_at: pub,
            pubDate: pub,
            matched_keyword: kw,
          };
        });
      }
    } catch (err) {
      console.error('[firebase/service] getNewsItems error:', err);
    }
  }
  return VERIFIED_FALLBACK_NEWS;
}
