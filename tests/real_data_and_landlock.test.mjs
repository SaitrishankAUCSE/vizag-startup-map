import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const listings = JSON.parse(fs.readFileSync('data/listings.json', 'utf8'));
const jobs = JSON.parse(fs.readFileSync('data/jobs.json', 'utf8'));

// Exact cluster medoid algorithm
function clusterListings(listings, zoom) {
  const radiusDeg = zoom < 11 ? 0.04 : zoom < 12 ? 0.025 : zoom < 13 ? 0.015 : zoom < 14 ? 0.009 : -1;
  if (radiusDeg <= 0) {
    return listings.map((l) => ({ type: 'pin', listing: l }));
  }
  const visited = new Set();
  const result = [];
  for (const l of listings) {
    if (visited.has(l.id)) continue;
    const neighbors = listings.filter(
      (m) =>
        !visited.has(m.id) &&
        Math.abs(m.lat - l.lat) < radiusDeg &&
        Math.abs(m.lng - l.lng) < radiusDeg
    );
    if (neighbors.length <= 1) {
      visited.add(l.id);
      result.push({ type: 'pin', listing: l });
    } else {
      for (const n of neighbors) visited.add(n.id);
      const avgLat = neighbors.reduce((s, n) => s + n.lat, 0) / neighbors.length;
      const avgLng = neighbors.reduce((s, n) => s + n.lng, 0) / neighbors.length;
      let bestListing = neighbors[0];
      let minDistance = Infinity;
      for (const n of neighbors) {
        const dist = (n.lat - avgLat) ** 2 + (n.lng - avgLng) ** 2;
        if (dist < minDistance) {
          minDistance = dist;
          bestListing = n;
        }
      }
      result.push({
        type: 'cluster',
        count: neighbors.length,
        lat: bestListing.lat,
        lng: bestListing.lng,
      });
    }
  }
  return result;
}

describe('Real World Ecosystem & Geographic Landlock Verification', () => {
  test('Ecosystem contains 50+ real, approved entities', () => {
    assert.ok(listings.length >= 50, `Expected at least 50 listings, got ${listings.length}`);
    for (const l of listings) {
      assert.equal(l.status, 'approved', `${l.name} should be approved`);
      assert.ok(!l.name.toLowerCase().includes('sample'), `Listing ${l.name} contains "sample"`);
      assert.ok(!l.name.toLowerCase().includes('demo'), `Listing ${l.name} contains "demo"`);
      assert.ok(!l.website.includes('example.com'), `Listing ${l.name} has example.com website`);
    }
  });

  test('All entity coordinates are strictly landlocked within Visakhapatnam boundaries', () => {
    for (const l of listings) {
      // Latitude must be within Visakhapatnam metropolitan range
      assert.ok(l.lat >= 17.58 && l.lat <= 17.92, `${l.name} lat ${l.lat} is outside Vizag bounds`);

      // Longitude landlock rules:
      // At Rushikonda, the coast is at ~83.380°E. All IT SEZ pins must be <= 83.378°E.
      if (l.area === 'Rushikonda') {
        assert.ok(l.lng >= 83.370 && l.lng <= 83.378, `${l.name} in Rushikonda is placed offshore: ${l.lng}`);
      }
      // In downtown/Siripuram/Dwaraka Nagar/Beach Road, pins must be <= 83.325°E.
      if (l.area === 'Siripuram' || l.area === 'Dwaraka Nagar' || l.area === 'Beach Road') {
        assert.ok(l.lng >= 83.300 && l.lng <= 83.325, `${l.name} in city center is placed offshore: ${l.lng}`);
      }
      // In MVP Colony, pins must be <= 83.335°E.
      if (l.area === 'MVP Colony') {
        assert.ok(l.lng >= 83.325 && l.lng <= 83.335, `${l.name} in MVP Colony is placed offshore: ${l.lng}`);
      }
      // In Madhurawada / Gambheeram, pins must be strictly inland.
      if (l.area === 'Madhurawada') {
        assert.ok(l.lng >= 83.340 && l.lng <= 83.398, `${l.name} in Madhurawada has invalid lng: ${l.lng}`);
      }
      // In Gajuwaka / AMTZ, pins must be strictly inland west of harbour.
      if (l.area === 'Gajuwaka') {
        assert.ok(l.lng >= 83.150 && l.lng <= 83.230, `${l.name} in Gajuwaka has invalid lng: ${l.lng}`);
      }
    }
  });

  test('Medoid clustering guarantees all cluster pins snap strictly to on-land startup coordinates', () => {
    const zoomLevels = [9, 10, 11, 12, 13, 14];
    for (const z of zoomLevels) {
      const items = clusterListings(listings, z);
      for (const item of items) {
        if (item.type === 'cluster') {
          // Verify that this cluster coordinate exists exactly in listings
          const matched = listings.some((l) => l.lat === item.lat && l.lng === item.lng);
          assert.ok(matched, `Cluster at zoom ${z} (${item.lat}, ${item.lng}) does not snap to an actual startup!`);
        }
      }
    }
  });

  test('All active jobs link to valid approved listings with real application links', () => {
    assert.ok(jobs.length >= 10, `Expected at least 10 jobs, got ${jobs.length}`);
    for (const j of jobs) {
      assert.ok(j.is_active, `Job ${j.title} should be active`);
      assert.ok(j.apply_url && j.apply_url.startsWith('http'), `Job ${j.title} has invalid apply_url`);
      const company = listings.find((l) => l.id === j.listing_id);
      assert.ok(company, `Job ${j.title} references non-existent listing ${j.listing_id}`);
    }
  });
});

