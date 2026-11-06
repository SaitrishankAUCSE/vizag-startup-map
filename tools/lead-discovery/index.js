import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, OUTPUT_DIR } from './config.js';
import { loadExistingListings, normalizeDomain } from './dedup.js';
import { harvestCandidateLeads } from './harvester.js';
import { verifyCandidate } from './verifier.js';
import { generateReports, pickRandomApprovedSample, getFormattedDateString } from './reporter.js';
import { commitDiscoveredLeads, rollbackCommit } from './db.js';
import { getPlacesApiStats } from './places.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'dry-run',
    rollbackFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--commit') {
      options.mode = 'commit';
    } else if (arg === '--dry-run') {
      options.mode = 'dry-run';
    } else if (arg === '--rollback') {
      options.mode = 'rollback';
      options.rollbackFile = args[i + 1] || null;
      i++;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  console.log('====================================================');
  console.log(` Vizag Startup Discovery & Verification Engine`);
  console.log(` Mode: ${options.mode.toUpperCase()}`);
  console.log('====================================================\n');

  if (options.mode === 'rollback') {
    if (!options.rollbackFile) {
      console.error('Error: --rollback requires a path to a commit-log JSON file.');
      process.exit(1);
    }
    console.log(`Initiating rollback using log file: ${options.rollbackFile}`);
    await rollbackCommit(options.rollbackFile);
    return;
  }

  // Step 1: Load existing mapped listings to enforce zero duplicate creation
  console.log('[Step 1/5] Loading existing mapped listings from database & local data...');
  const dedup = await loadExistingListings();
  console.log(`[Dedup] Loaded ${dedup.existingDomains.size} existing domains, ${dedup.existingPlaceIds.size} place IDs.`);

  // Step 2: Harvest candidates across allowed sources
  console.log('\n[Step 2/5] Harvesting candidate companies from allowed sources...');
  const allHarvested = await harvestCandidateLeads();
  console.log(`[Harvester] Total candidates collected: ${allHarvested.length}`);

  // Step 3: Filter duplicates and partition verifiable vs unverified
  console.log('\n[Step 3/5] Checking duplicates against existing ecosystem database...');
  const verifiableCandidates = [];
  const unverifiedOrBlocked = [];
  let duplicateCount = 0;

  for (const cand of allHarvested) {
    if (dedup.isDuplicate(cand)) {
      duplicateCount++;
      continue;
    }

    if (cand.website || cand.google_place_id) {
      verifiableCandidates.push(cand);
    } else {
      unverifiedOrBlocked.push({
        name: cand.name,
        source_urls: cand.source_urls,
        number_of_sources: cand.number_of_sources,
        reason: 'no_official_website_found_for_candidate',
      });
    }
  }

  console.log(`[Dedup] Filtered out ${duplicateCount} duplicate candidates already in database.`);
  console.log(`[Pipeline] Candidates with official site / place_id for verification: ${verifiableCandidates.length}`);
  console.log(`[Pipeline] Candidates lacking official site (sent to unverified list): ${unverifiedOrBlocked.length}`);

  // Step 4: Run Verification Pipeline (Checks A through F)
  console.log('\n[Step 4/5] Executing Verification Pipeline (Checks A -> F)...');
  const verifiedResults = [];
  let processed = 0;

  for (const cand of verifiableCandidates) {
    processed++;
    process.stdout.write(`\r[Verifier] Verifying candidate ${processed}/${verifiableCandidates.length}: ${cand.name.slice(0, 30).padEnd(30)}`);
    try {
      const result = await verifyCandidate(cand);
      verifiedResults.push({
        ...result,
        lead_source_urls: cand.source_urls,
        number_of_sources: cand.number_of_sources,
      });
    } catch (err) {
      verifiedResults.push({
        name: cand.name,
        website: cand.website,
        decision: 'rejected',
        checksPassed: [],
        reason_if_not_approved: `verification_error: ${err.message}`,
        lead_source_urls: cand.source_urls,
        number_of_sources: cand.number_of_sources,
        notes: [err.message],
      });
    }
  }
  process.stdout.write('\n');

  // Step 5: Generate Dry-Run Reports
  console.log('\n[Step 5/5] Generating reports in data/discovery-output/...');
  const placesStats = getPlacesApiStats();
  const reports = generateReports(verifiedResults, unverifiedOrBlocked, placesStats);

  // Calculate Metrics
  const approved = verifiedResults.filter((r) => r.decision === 'approved');
  const leads = verifiedResults.filter((r) => r.decision === 'lead');
  const rejected = verifiedResults.filter((r) => r.decision === 'rejected');

  console.log('\n====================================================');
  console.log(' DISCOVERY & VERIFICATION METRICS');
  console.log('====================================================');
  console.log(`Total Candidates Harvested:          ${allHarvested.length}`);
  console.log(`Skipped Existing Database Matches:   ${duplicateCount}`);
  console.log(`Unverified (No official site found): ${unverifiedOrBlocked.length}`);
  console.log(`Verified Pipeline Evaluated:         ${verifiedResults.length}`);
  console.log(`  - APPROVED (Passed A through F):   ${approved.length}`);
  console.log(`  - LEAD (Valid site/Vizag proof):   ${leads.length}`);
  console.log(`  - REJECTED (Failed core checks):   ${rejected.length}`);
  console.log(`Google Places Search Requests Used:  ${placesStats.searchRequestsUsed}/${placesStats.maxSearchAllowed}`);
  console.log(`Google Places Detail Requests Used:  ${placesStats.detailRequestsUsed}/${placesStats.maxDetailAllowed}`);
  console.log('====================================================\n');

  // Spot-check: 10 random approved companies
  const sample = pickRandomApprovedSample(verifiedResults, 10);
  console.log('--- SPOT CHECK: 10 Approved Candidates ---');
  if (sample.length === 0) {
    console.log('No approved candidates found in this run.');
  } else {
    for (let i = 0; i < sample.length; i++) {
      const s = sample[i];
      console.log(`\n[#${i + 1}] ${s.name}`);
      console.log(`    Website:       ${s.website}`);
      console.log(`    Area:          ${s.area}`);
      console.log(`    Checks Passed: ${s.checksPassed.join(', ')}`);
      console.log(`    Vizag Proof:   ${s.evidence_url_vizag_proof}`);
      console.log(`    Activity Proof:${s.evidence_url_activity || 'N/A'}`);
      console.log(`    Pin (Lat,Lng): ${s.lat}, ${s.lng}`);
    }
  }

  // Handle Commit vs Dry-Run
  if (options.mode === 'commit') {
    console.log('\n>>> PROCEEDING TO COMMIT (User Flag --commit specified) <<<');
    const toCommit = verifiedResults.filter((r) => r.decision === 'approved' || r.decision === 'lead');
    const log = await commitDiscoveredLeads(toCommit);
    console.log(`\nCommit complete: ${log.totalListingsCreated} listings, ${log.totalSourcesCreated} sources created.`);
  } else {
    console.log('\n====================================================');
    console.log(' DRY-RUN FINISHED (DEFAULT MODE)');
    console.log(' NO WRITES WERE MADE TO FIRESTORE.');
    console.log(` Reports saved to:\n  - ${reports.reportPath}\n  - ${reports.unverifiedPath}`);
    console.log(' Awaiting your written approval before any database write.');
    console.log('====================================================');
  }
}

main().catch((err) => {
  console.error('\nFatal error in lead discovery process:', err);
  process.exit(1);
});

