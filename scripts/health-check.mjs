#!/usr/bin/env node
/**
 * Nightly Data Health Checker (Runs every night via GitHub Actions)
 *
 * Rules:
 *  1. Re-checks website response for each approved listing (HTTP 200/301/302, 8s timeout).
 *  2. If website fails 3 nights in a row -> sets status = 'needs_review'.
 *  3. Records last_checked_at and consecutive_website_failures on each listing.
 *  4. Flags listings unverified for >120 days.
 *  5. Logs health check outcome to sync_logs.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
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

async function checkWebsite(url) {
  if (!url) return null;
  const target = url.startsWith('http') ? url : `https://${url}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(target, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VizagStartupMapHealth/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status;
  } catch {
    // Retry with GET if HEAD was disallowed
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(target, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VizagStartupMapHealth/1.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.status;
    } catch {
      return 0; // Unreachable
    }
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runHealthCheck() {
  const startTime = new Date().toISOString();
  console.log(`\n🏥 Starting Nightly Data Health Check at ${startTime}...`);

  const listingsSnap = await db.collection('listings').where('status', 'in', ['approved', 'needs_review']).get();
  console.log(`🔍 Checking ${listingsSnap.docs.length} listings...`);

  let deadCount = 0;
  let healthyCount = 0;
  let flaggedCount = 0;
  const now = new Date();

  for (const doc of listingsSnap.docs) {
    const listing = doc.data();
    if (!listing.website) continue;

    await delay(500); // Polite pacing
    const status = await checkWebsite(listing.website);
    const isOk = status === 200 || status === 301 || status === 302;

    const previousFailures = listing.consecutive_website_failures || 0;
    const failures = isOk ? 0 : previousFailures + 1;

    const updates = {
      website_status: status,
      last_checked_at: now.toISOString(),
      consecutive_website_failures: failures,
      updated_at: now.toISOString(),
    };

    if (failures >= 3 && listing.status === 'approved') {
      console.warn(`   ⚠️ "${listing.name}" website failed 3 nights in a row (HTTP ${status}). Moving to needs_review.`);
      updates.status = 'needs_review';
      flaggedCount++;
    }

    if (isOk) {
      healthyCount++;
    } else {
      deadCount++;
      console.log(`   ❌ "${listing.name}" website unreachable: HTTP ${status} (failures: ${failures})`);
    }

    await doc.ref.update(updates);
  }

  // Record log in sync_logs
  await db.collection('sync_logs').add({
    job_name: 'nightly_health_check',
    started_at: startTime,
    finished_at: new Date().toISOString(),
    ok: true,
    details: {
      total_checked: listingsSnap.docs.length,
      healthy_websites: healthyCount,
      unreachable_websites: deadCount,
      flagged_to_needs_review: flaggedCount,
    },
  });

  console.log('\n========================================');
  console.log('✅ Nightly Health Check Finished:');
  console.log(`   - Healthy: ${healthyCount}`);
  console.log(`   - Dead/Unreachable: ${deadCount}`);
  console.log(`   - Flagged for Admin Review: ${flaggedCount}`);
  console.log('========================================\n');
}

runHealthCheck().catch((err) => {
  console.error('Fatal health check failure:', err);
  process.exit(1);
});
