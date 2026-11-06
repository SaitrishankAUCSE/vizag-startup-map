import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './config.js';

export function normalizeDomain(urlStr) {
  if (!urlStr) return null;
  try {
    const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const parsed = new URL(formatted);
    let host = parsed.hostname.toLowerCase().trim();
    if (host.startsWith('www.')) host = host.slice(4);
    if (!host || host.includes('example.com') || !host.includes('.')) return null;
    return host;
  } catch {
    return null;
  }
}

export function normalizeCompanyName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(private|pvt|limited|ltd|llp|inc|corporation|corp|technologies|technology|tech|solutions|software|systems|services|enterprises|india)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

/**
 * Load existing mapped listings to prevent any duplicate insertion
 */
export async function loadExistingListings() {
  const existingDomains = new Set();
  const existingPlaceIds = new Set();
  const existingNames = new Set();

  const localPath = path.join(ROOT_DIR, 'data', 'listings.json');
  if (fs.existsSync(localPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      for (const item of items) {
        if (item.website) {
          const dom = normalizeDomain(item.website);
          if (dom) existingDomains.add(dom);
        }
        if (item.google_place_id) {
          existingPlaceIds.add(item.google_place_id);
        }
        if (item.name) {
          existingNames.add(normalizeCompanyName(item.name));
        }
      }
    } catch (err) {
      console.warn('[Dedup] Failed to read local listings.json:', err.message);
    }
  }

  return {
    existingDomains,
    existingPlaceIds,
    existingNames,
    isDuplicate: (candidate) => {
      if (candidate.google_place_id && existingPlaceIds.has(candidate.google_place_id)) {
        return true;
      }
      if (candidate.website) {
        const dom = normalizeDomain(candidate.website);
        if (dom && existingDomains.has(dom)) {
          return true;
        }
      }
      return false;
    },
  };
}

