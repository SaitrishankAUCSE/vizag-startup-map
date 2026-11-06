#!/usr/bin/env node
/**
 * CLI Script: Import Vizag Startup Leads
 * Usage: node scripts/import-leads.mjs [path-to-leads-csv]
 *
 * Golden Rules:
 *  - Imports into Firestore as listings with status = "lead" (NOT public).
 *  - Preserves source_name, source_url, source_note.
 *  - Leads never appear on the map or in public stats counts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
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

const csvFile = process.argv[2] || 'data/vizag-startup-leads.csv';
const resolvedPath = path.resolve(process.cwd(), csvFile);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Leads CSV file not found: ${resolvedPath}`);
  process.exit(1);
}

// Initialize Firebase Admin
let db = null;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = getFirestore();
  }
} catch (err) {
  console.error('❌ Firebase Admin initialization error:', err.message);
}

if (!db) {
  console.error('❌ Could not connect to Firestore. Check Firebase Admin environment variables.');
  process.exit(1);
}

// Simple RFC-compliant CSV parser
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let cur = '';
    let inQuote = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    values.push(cur.trim());

    const row = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      row[h] = val;
    });
    rows.push(row);
  }
  return rows;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  console.log(`\n📥 Reading startup leads from: ${resolvedPath}...`);
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const rows = parseCsv(content);
  console.log(`📋 Found ${rows.length} rows in CSV.`);

  let imported = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const slug = slugify(name);

    // Check if listing already exists with this slug or name
    const existingSnap = await db.collection('listings')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      console.log(`⚠️ Listing or lead already exists for "${name}" (slug: ${slug}). Skipping.`);
      skipped++;
      continue;
    }

    // Prepare lead listing document
    const leadData = {
      slug,
      name,
      type: row.type || 'startup',
      one_liner: row.sector_hint ? `${row.sector_hint} company in Visakhapatnam` : null,
      description: row.source_note ? `Source note: ${row.source_note}` : '',
      sector: row.sector_hint || 'Other',
      stage: null,
      area: row.area || 'Other',
      address: row.address || null,
      lat: row.lat ? parseFloat(row.lat) : 0,
      lng: row.lng ? parseFloat(row.lng) : 0,
      website: row.website || null,
      careers_url: row.careers_url || null,
      careers_status: 'unknown',
      ats_provider: row.ats_provider || null,
      ats_board_slug: row.ats_board_slug || null,
      source_name: row.source_name || null,
      source_url: row.source_url || null,
      source_note: row.source_note || null,
      status: 'lead',
      is_verified: false,
      is_boosted: false,
      created_at: now,
      updated_at: now,
    };

    const docRef = await db.collection('listings').add(leadData);

    // Record source in listing_sources
    if (row.source_name || row.source_url || row.source_note) {
      await db.collection('listing_sources').add({
        listing_id: docRef.id,
        source_type: 'manual_research',
        source_url: row.source_url || null,
        note: `${row.source_name || ''} - ${row.source_note || ''}`.trim(),
        added_at: now,
      });
    }

    console.log(`✅ Imported lead: "${name}" [ID: ${docRef.id}] (status: lead)`);
    imported++;
  }

  console.log(`\n🎉 Lead import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Total:    ${rows.length}`);
  console.log(`\n🔒 All imported leads are stored with status = "lead" and will NEVER appear on the public map or in counts until approved by an admin in the Lead Queue.`);
}

run().catch((err) => {
  console.error('Fatal error importing leads:', err);
  process.exit(1);
});
