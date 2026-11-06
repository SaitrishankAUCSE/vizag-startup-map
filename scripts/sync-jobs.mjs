#!/usr/bin/env node
/**
 * Scheduled ATS Job Synchronizer (Runs every 6 hours via GitHub Actions)
 *
 * Rules:
 *  1. Only syncs approved listings with valid ATS boards (Greenhouse, Lever, Ashby).
 *  2. Polite polling with delays between companies.
 *  3. Upsert by (listing_id, source, external_id).
 *  4. Missing in 2 consecutive syncs -> set is_active = false (never delete history).
 *  5. Board failures >= 5 -> flag board, hide after 3 days.
 *  6. Auto-expire founder-posted jobs older than 60 days.
 *  7. Updates stats/public document for instant caching.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── 1. Initialize Firebase Admin ──
if (getApps().length === 0) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    console.error('❌ Missing Firebase Admin environment credentials.');
    process.exit(1);
  }
}

const db = getFirestore();

// ── 2. ATS Adapters ──
async function fetchGreenhouse(slug) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`, {
    headers: { 'User-Agent': 'VizagStartupMapSync/1.0 (+https://vizagstartupmap.com)' },
  });
  if (!res.ok) throw new Error(`Greenhouse HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    externalId: String(j.id),
    title: j.title || 'Untitled Role',
    locationText: j.location?.name || 'Visakhapatnam, Andhra Pradesh',
    department: j.departments?.[0]?.name || null,
    applyUrl: j.absolute_url || `https://boards.greenhouse.io/${slug}/jobs/${j.id}`,
    postedAt: j.updated_at || null,
  }));
}

async function fetchLever(slug) {
  const res = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`, {
    headers: { 'User-Agent': 'VizagStartupMapSync/1.0 (+https://vizagstartupmap.com)' },
  });
  if (!res.ok) throw new Error(`Lever HTTP ${res.status}`);
  const data = await res.json();
  return (data || []).map((j) => ({
    externalId: String(j.id),
    title: j.text || 'Untitled Role',
    locationText: j.categories?.location || 'Visakhapatnam, Andhra Pradesh',
    department: j.categories?.department || null,
    employmentType: j.categories?.commitment || null,
    applyUrl: j.hostedUrl || `https://jobs.lever.co/${slug}/${j.id}`,
    postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
  }));
}

async function fetchAshby(slug) {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`, {
    headers: { 'User-Agent': 'VizagStartupMapSync/1.0 (+https://vizagstartupmap.com)' },
  });
  if (!res.ok) throw new Error(`Ashby HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    externalId: String(j.id),
    title: j.title || 'Untitled Role',
    locationText: j.location || 'Visakhapatnam, Andhra Pradesh',
    department: j.department || null,
    applyUrl: j.jobUrl || `https://jobs.ashbyhq.com/${slug}/${j.id}`,
    postedAt: j.publishedAt || null,
  }));
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── 3. Main Sync Loop ──
async function runSync() {
  const startTime = new Date().toISOString();
  console.log(`\n🚀 Starting ATS Job Sync at ${startTime}...`);

  // A. Fetch approved listings
  const listingsSnap = await db.collection('listings').where('status', '==', 'approved').get();
  const approvedMap = new Map();
  listingsSnap.docs.forEach((doc) => {
    approvedMap.set(doc.id, { id: doc.id, ...doc.data() });
  });
  console.log(`📋 Found ${approvedMap.size} approved listings.`);

  // B. Auto-expire founder-posted jobs older than 60 days
  const now = new Date();
  const founderJobsSnap = await db
    .collection('jobs')
    .where('source', '==', 'founder')
    .where('is_active', '==', true)
    .get();

  let expiredFounderJobs = 0;
  for (const doc of founderJobsSnap.docs) {
    const job = doc.data();
    if (job.expires_at && new Date(job.expires_at) < now) {
      await doc.ref.update({ is_active: false, updated_at: now.toISOString() });
      expiredFounderJobs++;
    }
  }
  if (expiredFounderJobs > 0) {
    console.log(`⏳ Expired ${expiredFounderJobs} founder jobs (>60 days).`);
  }

  // C. Fetch ATS boards
  const boardsSnap = await db.collection('ats_boards').get();
  console.log(`🏢 Found ${boardsSnap.docs.length} ATS boards configured.`);

  let totalUpserted = 0;
  let totalDeactivated = 0;

  for (const boardDoc of boardsSnap.docs) {
    const board = boardDoc.data();
    const listing = approvedMap.get(board.listing_id);

    if (!listing) {
      console.log(`⏩ Skipping board for non-approved listing: ${board.listing_id}`);
      continue;
    }

    console.log(`\n🔍 Polling ${board.provider} for "${listing.name}" (${board.board_slug})...`);
    await delay(1200); // Polite delay between requests

    try {
      let fetchedJobs = [];
      if (board.provider === 'greenhouse') {
        fetchedJobs = await fetchGreenhouse(board.board_slug);
      } else if (board.provider === 'lever') {
        fetchedJobs = await fetchLever(board.board_slug);
      } else if (board.provider === 'ashby') {
        fetchedJobs = await fetchAshby(board.board_slug);
      }

      console.log(`   Found ${fetchedJobs.length} active jobs.`);

      // Load existing active jobs for this listing + provider
      const existingJobsSnap = await db
        .collection('jobs')
        .where('listing_id', '==', listing.id)
        .where('source', '==', 'ats')
        .get();

      const existingJobsMap = new Map();
      existingJobsSnap.docs.forEach((d) => {
        const jd = d.data();
        if (jd.external_id) existingJobsMap.set(String(jd.external_id), { ref: d.ref, ...jd });
      });

      const seenExternalIds = new Set();

      for (const job of fetchedJobs) {
        seenExternalIds.add(job.externalId);
        const existing = existingJobsMap.get(job.externalId);

        if (existing) {
          // Update last seen
          await existing.ref.update({
            title: job.title,
            location_text: job.locationText,
            location: job.locationText,
            department: job.department,
            apply_url: job.applyUrl,
            is_active: true,
            missing_checks: 0,
            last_seen_at: now.toISOString(),
            updated_at: now.toISOString(),
          });
        } else {
          // Create new job (store only title, location, type, dates, apply_url - NEVER descriptions)
          await db.collection('jobs').add({
            listing_id: listing.id,
            title: job.title,
            location_text: job.locationText,
            location: job.locationText,
            department: job.department,
            employment_type: job.employmentType || null,
            apply_url: job.applyUrl,
            source: 'ats',
            external_id: job.externalId,
            missing_checks: 0,
            posted_at: job.postedAt || now.toISOString(),
            first_seen_at: now.toISOString(),
            last_seen_at: now.toISOString(),
            is_active: true,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          });
          totalUpserted++;
        }
      }

      // Check for missing jobs in 2 consecutive syncs
      for (const [extId, existing] of existingJobsMap.entries()) {
        if (!seenExternalIds.has(extId) && existing.is_active) {
          const missingChecks = (existing.missing_checks || 0) + 1;
          if (missingChecks >= 2) {
            // Missing in 2 consecutive checks: deactivate
            await existing.ref.update({
              is_active: false,
              missing_checks: missingChecks,
              updated_at: now.toISOString(),
            });
            totalDeactivated++;
          } else {
            // First time missing, record check
            await existing.ref.update({
              missing_checks: missingChecks,
              updated_at: now.toISOString(),
            });
          }
        }
      }

      // Update listing careers_status based on active verified openings
      const activeJobsSnap = await db
        .collection('jobs')
        .where('listing_id', '==', listing.id)
        .where('is_active', '==', true)
        .get();

      const newCareersStatus = activeJobsSnap.docs.length > 0 ? 'verified_openings' : 'no_openings';
      await db.collection('listings').doc(listing.id).update({
        careers_status: newCareersStatus,
        updated_at: now.toISOString(),
      });

      // Update board status as healthy
      await boardDoc.ref.update({
        last_synced_at: now.toISOString(),
        last_status: 'ok',
        consecutive_failures: 0,
      });
    } catch (err) {
      console.error(`   ❌ Failed polling ${listing.name}: ${err.message}`);
      const failures = (board.consecutive_failures || 0) + 1;
      await boardDoc.ref.update({
        last_status: `error: ${err.message}`,
        consecutive_failures: failures,
      });

      // If failed 5 times in a row, hide jobs older than 3 days
      if (failures >= 5) {
        console.warn(`   ⚠️ Board failed 5 consecutive times. Checking 3-day stale threshold...`);
        const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
        const staleJobs = await db
          .collection('jobs')
          .where('listing_id', '==', listing.id)
          .where('source', '==', 'ats')
          .where('is_active', '==', true)
          .get();

        for (const sj of staleJobs.docs) {
          if (sj.data().last_seen_at < threeDaysAgo) {
            await sj.ref.update({ is_active: false, updated_at: now.toISOString() });
          }
        }
      }
    }
  }

  // D. Recompute public stats document
  console.log('\n📊 Recomputing public stats document...');
  const [allListingsSnap, allJobsSnap] = await Promise.all([
    db.collection('listings').where('status', '==', 'approved').get(),
    db.collection('jobs').where('is_active', '==', true).get(),
  ]);

  const listingsList = allListingsSnap.docs.map((d) => d.data());
  const jobsList = allJobsSnap.docs.map((d) => d.data());
  const hiringCompanyIds = new Set(jobsList.map((j) => j.listing_id));

  const stats = {
    total_startups: listingsList.filter((l) => l.type === 'startup').length,
    total_investors: listingsList.filter((l) => l.type === 'investor').length,
    total_incubators: listingsList.filter((l) => l.type === 'incubator').length,
    total_campuses: listingsList.filter((l) => l.type === 'campus').length,
    total_coworking: listingsList.filter((l) => l.type === 'coworking').length,
    companies_hiring: hiringCompanyIds.size,
    open_roles: jobsList.length,
    jobs_posted_last_7_days: jobsList.filter((j) => {
      const p = j.posted_at || j.first_seen_at || j.created_at;
      return p && Date.now() - new Date(p).getTime() <= 7 * 86400000;
    }).length,
    new_listings_last_30_days: listingsList.filter((l) => {
      return l.created_at && Date.now() - new Date(l.created_at).getTime() <= 30 * 86400000;
    }).length,
    last_updated_at: new Date().toISOString(),
  };

  await db.collection('stats').doc('public').set(stats);

  // E. Record sync log
  await db.collection('sync_logs').add({
    job_name: 'ats_jobs_sync',
    started_at: startTime,
    finished_at: new Date().toISOString(),
    ok: true,
    details: {
      total_upserted: totalUpserted,
      total_deactivated: totalDeactivated,
      expired_founder_jobs: expiredFounderJobs,
      active_jobs_total: jobsList.length,
    },
  });

  console.log(`\n✨ Job sync finished successfully!`);
  console.log(`   - New jobs added: ${totalUpserted}`);
  console.log(`   - Inactive jobs closed: ${totalDeactivated}`);
  console.log(`   - Total active roles now: ${jobsList.length}`);
}

runSync().catch((err) => {
  console.error('Fatal sync failure:', err);
  process.exit(1);
});
