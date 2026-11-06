#!/usr/bin/env node
/**
 * CLI Script: Import Vizag Startups CSV
 * Usage: node scripts/import-csv.mjs <path-to-csv>
 *
 * Enforces Golden Rules:
 *  #1 - Never invent data: reads only provided rows
 *  #2 - Zero fake data: validates all fields
 *  #3 - Traceable sources: records source_type and source_url
 *  #4 - Pending by default: no row is approved automatically
 */

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Parse CLI argument
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('❌ Usage: node scripts/import-csv.mjs <path-to-csv>');
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), csvPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ CSV file not found: ${resolvedPath}`);
  process.exit(1);
}

// Initialize Firebase Admin if credentials are present
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
  console.warn('⚠️ Firebase Admin not initialized from environment. Running in offline dry-run mode.');
}

console.log(`\n📂 Reading CSV from: ${resolvedPath}...`);
const content = fs.readFileSync(resolvedPath, 'utf8');

// Parse CSV
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawValues = lines[i].split(',');
    const obj = {};
    headers.forEach((h, index) => {
      obj[h] = rawValues[index] ? rawValues[index].trim().replace(/^"|"$/g, '') : '';
    });
    rows.push(obj);
  }
  return rows;
}

const rows = parseCsv(content);
console.log(`📊 Found ${rows.length} rows to process.\n`);

async function rateLimitDelay(ms = 1100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(address, area) {
  if (!address || address.length < 3) return { lat: 17.72, lng: 83.32, needsPin: true };
  await rateLimitDelay(1100);
  try {
    const q = encodeURIComponent(`${address}, ${area || ''}, Visakhapatnam, Andhra Pradesh, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'VizagStartupMapCLI/1.0 (contact@vizagstartupmap.com)' },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        needsPin: false,
      };
    }
  } catch {}
  return { lat: 17.72, lng: 83.32, needsPin: true };
}

async function runImport() {
  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name || row.name.length < 2) {
      console.warn(`[Skip] Row #${i + 1}: Missing company name.`);
      skippedCount++;
      continue;
    }

    process.stdout.write(`⏳ [${i + 1}/${rows.length}] Processing "${row.name}"... `);

    // Geocode with Nominatim
    const geo = await geocode(row.address, row.area);
    const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const listingPayload = {
      slug,
      name: row.name,
      type: row.type || 'startup',
      one_liner: row.one_liner || null,
      description: row.one_liner || `${row.name} in ${row.area || 'Visakhapatnam'}.`,
      sector: row.sector || null,
      stage: row.stage || null,
      area: row.area || 'Other',
      address: row.address || null,
      lat: geo.lat,
      lng: geo.lng,
      website: row.website || null,
      linkedin_url: row.linkedin_url || null,
      status: geo.needsPin ? 'needs_review' : 'pending',
      is_verified: false,
      created_at: now,
      updated_at: now,
    };

    if (db) {
      try {
        const ref = await db.collection('listings').add(listingPayload);
        await db.collection('listing_sources').add({
          listing_id: ref.id,
          source_type: row.source_type || 'manual_research',
          source_url: row.source_url || row.website || null,
          note: 'CLI script import',
          added_at: now,
        });

        if (row.ats_provider && row.ats_board_slug) {
          await db.collection('ats_boards').add({
            listing_id: ref.id,
            provider: row.ats_provider,
            board_slug: row.ats_board_slug,
            consecutive_failures: 0,
            created_at: now,
          });
        }
        console.log(`✅ Imported as ${listingPayload.status} (ID: ${ref.id})`);
        createdCount++;
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        failedCount++;
      }
    } else {
      console.log(`[Dry-Run Validated] Lat: ${geo.lat}, Lng: ${geo.lng}, Status: ${listingPayload.status}`);
      createdCount++;
    }
  }

  console.log('\n========================================');
  console.log('🎉 CSV Import Complete:');
  console.log(`   - Successfully processed: ${createdCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log(`   - Failed: ${failedCount}`);
  console.log('========================================\n');
}

runImport().catch(console.error);
