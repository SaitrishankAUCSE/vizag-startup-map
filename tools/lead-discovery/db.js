import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ROOT_DIR, OUTPUT_DIR } from './config.js';
import { normalizeDomain } from './dedup.js';

function getAdminFirestoreInstance() {
  if (getApps().length === 0) {
    const envPath = path.join(ROOT_DIR, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Firebase Admin environment variables missing in environment or .env.local');
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return getFirestore();
}

/**
 * Recalculate and update the stats/public document
 */
export async function recalculatePublicStats(db) {
  const listingsSnap = await db.collection('listings').where('status', '==', 'approved').get();
  const jobsSnap = await db.collection('jobs').where('is_active', '==', true).get();

  let startupsCount = 0;
  let investorsCount = 0;
  let incubatorsCount = 0;
  let campusesCount = 0;
  let coworkingCount = 0;
  let hiringCount = 0;

  for (const doc of listingsSnap.docs) {
    const data = doc.data();
    if (data.type === 'startup') startupsCount++;
    else if (data.type === 'investor') investorsCount++;
    else if (data.type === 'incubator') incubatorsCount++;
    else if (data.type === 'campus') campusesCount++;
    else if (data.type === 'coworking') coworkingCount++;
    if (data.jobs_count && data.jobs_count > 0) hiringCount++;
  }

  const updatedStats = {
    total_listings: listingsSnap.docs.length,
    total_startups: startupsCount,
    total_investors: investorsCount,
    total_incubators: incubatorsCount,
    total_campuses: campusesCount,
    total_coworking: coworkingCount,
    total_jobs: jobsSnap.docs.length,
    open_roles: jobsSnap.docs.length,
    companies_hiring: hiringCount,
    last_updated: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
  };

  await db.collection('stats').doc('public').set(updatedStats, { merge: true });
  console.log('[DB] Updated stats/public document:', updatedStats);
}

/**
 * Commit approved and lead documents to Firestore
 */
export async function commitDiscoveredLeads(candidatesToCommit) {
  const db = getAdminFirestoreInstance();
  const now = new Date().toISOString();

  // Load current listings from DB to double-check idempotency
  const existingSnap = await db.collection('listings').get();
  const existingDomains = new Set();
  const existingPlaceIds = new Set();

  for (const doc of existingSnap.docs) {
    const data = doc.data();
    if (data.website) {
      const dom = normalizeDomain(data.website);
      if (dom) existingDomains.add(dom);
    }
    if (data.google_place_id) {
      existingPlaceIds.add(data.google_place_id);
    }
  }

  const createdListingIds = [];
  const createdSourceIds = [];

  for (const item of candidatesToCommit) {
    const dom = normalizeDomain(item.website);
    if (dom && existingDomains.has(dom)) {
      console.log(`[DB Commit] Skipping ${item.name} (${dom}) - domain already exists in Firestore`);
      continue;
    }
    if (item.google_place_id && existingPlaceIds.has(item.google_place_id)) {
      console.log(`[DB Commit] Skipping ${item.name} - place_id already exists in Firestore`);
      continue;
    }

    const slug = (item.name || 'startup')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const oneLiner = `${item.name} is a ${item.area}-based technology company in Visakhapatnam.`.slice(0, 138);

    const listingRef = db.collection('listings').doc();
    const listingDoc = {
      slug,
      name: item.name,
      type: item.type || 'startup',
      website: item.website,
      one_liner: oneLiner,
      sector: item.sector || 'SaaS',
      sector_confidence: 'guess',
      area: item.area || 'Visakhapatnam',
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      careers_url: item.careers_url || null,
      ats_provider: item.ats_provider || null,
      ats_board_slug: item.ats_board_slug || null,
      google_place_id: item.google_place_id || null,
      founded_year: item.founded_year || null,
      status: item.decision === 'approved' ? 'approved' : 'lead',
      last_checked_at: now,
      website_status: 200,
      is_verified: false,
      owner_id: null,
      created_at: now,
      updated_at: now,
    };

    await listingRef.set(listingDoc);
    createdListingIds.push(listingRef.id);
    if (dom) existingDomains.add(dom);
    if (item.google_place_id) existingPlaceIds.add(item.google_place_id);

    // Save evidence source URLs
    if (item.evidence_url_vizag_proof) {
      const sourceRef = db.collection('listing_sources').doc();
      await sourceRef.set({
        listing_id: listingRef.id,
        source_type: 'company_website',
        source_url: item.evidence_url_vizag_proof,
        note: `Verified Visakhapatnam office mention on company official website`,
        added_by: 'lead_discovery_tool',
        added_at: now,
      });
      createdSourceIds.push(sourceRef.id);
    }
  }

  // Recalculate public stats
  await recalculatePublicStats(db);

  // Write commit log file
  const commitLog = {
    timestamp: now,
    createdListingIds,
    createdSourceIds,
    totalListingsCreated: createdListingIds.length,
    totalSourcesCreated: createdSourceIds.length,
  };

  const commitLogPath = path.join(OUTPUT_DIR, `commit-log-${Date.now()}.json`);
  fs.writeFileSync(commitLogPath, JSON.stringify(commitLog, null, 2));
  console.log(`[DB Commit] Successfully committed ${createdListingIds.length} listings. Log saved to: ${commitLogPath}`);

  return commitLog;
}

/**
 * Rollback documents created by a previous commit
 */
export async function rollbackCommit(logFilePath) {
  if (!fs.existsSync(logFilePath)) {
    throw new Error(`Commit log file not found: ${logFilePath}`);
  }

  const log = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const db = getAdminFirestoreInstance();

  console.log(`[Rollback] Rolling back ${log.createdListingIds.length} listings and ${log.createdSourceIds.length} sources...`);

  for (const id of log.createdListingIds) {
    await db.collection('listings').doc(id).delete();
  }
  for (const id of log.createdSourceIds) {
    await db.collection('listing_sources').doc(id).delete();
  }

  await recalculatePublicStats(db);
  console.log(`[Rollback] Rollback completed successfully.`);
}

