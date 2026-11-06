import fs from 'node:fs';
import path from 'node:path';
import { OUTPUT_DIR } from './config.js';

export function getFormattedDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateReports(verifiedResults, unverifiedLeads, stats) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const dateStr = getFormattedDateString();
  const reportPath = path.join(OUTPUT_DIR, `report-${dateStr}.csv`);
  const unverifiedPath = path.join(OUTPUT_DIR, `unverified-or-blocked-${dateStr}.csv`);

  // 1. Main CSV Report
  const reportHeaders = [
    'name',
    'website',
    'area',
    'decision',
    'checks_passed',
    'reason_if_not_approved',
    'evidence_url_vizag_proof',
    'evidence_url_activity',
    'careers_url',
    'ats_provider',
    'google_place_id',
    'lead_source_urls',
    'number_of_sources',
    'official_site_found',
    'notes',
  ];

  const reportRows = [reportHeaders.join(',')];
  for (const r of verifiedResults) {
    const row = [
      escapeCsv(r.name),
      escapeCsv(r.website),
      escapeCsv(r.area),
      escapeCsv(r.decision),
      escapeCsv(r.checksPassed?.join(';') || ''),
      escapeCsv(r.reason_if_not_approved || ''),
      escapeCsv(r.evidence_url_vizag_proof || ''),
      escapeCsv(r.evidence_url_activity || ''),
      escapeCsv(r.careers_url || ''),
      escapeCsv(r.ats_provider || ''),
      escapeCsv(r.google_place_id || ''),
      escapeCsv(r.lead_source_urls?.join(';') || ''),
      escapeCsv(r.number_of_sources || 1),
      escapeCsv(r.website ? 'yes' : 'no'),
      escapeCsv(r.notes?.join('; ') || ''),
    ];
    reportRows.push(row.join(','));
  }
  fs.writeFileSync(reportPath, reportRows.join('\n'));
  console.log(`[Reporter] Main dry-run report written: ${reportPath}`);

  // 2. Unverified or Blocked CSV
  const unverifiedHeaders = ['name', 'lead_source_urls', 'number_of_sources', 'status_reason'];
  const unverifiedRows = [unverifiedHeaders.join(',')];
  for (const u of unverifiedLeads) {
    const row = [
      escapeCsv(u.name),
      escapeCsv(u.source_urls?.join(';') || ''),
      escapeCsv(u.number_of_sources || 1),
      escapeCsv(u.reason || 'no_official_site'),
    ];
    unverifiedRows.push(row.join(','));
  }
  fs.writeFileSync(unverifiedPath, unverifiedRows.join('\n'));
  console.log(`[Reporter] Unverified/blocked leads written: ${unverifiedPath}`);

  return {
    reportPath,
    unverifiedPath,
  };
}

/**
 * Randomly pick 10 approved rows for user spot-check
 */
export function pickRandomApprovedSample(verifiedResults, count = 10) {
  const approved = verifiedResults.filter((r) => r.decision === 'approved');
  if (approved.length <= count) return approved;

  const shuffled = [...approved].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

