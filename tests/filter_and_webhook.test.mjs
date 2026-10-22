// Unit tests for Vizag Startup Map filter logic & Razorpay webhook HMAC signature verification
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// 1. Re-implement or test HMAC-SHA256 verification function directly
function verifyRazorpayWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret || !rawBody) {
    return false;
  }
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

// 2. Haversine distance calculator
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 3. Filter runner
function filterListings(listings, filters) {
  return listings.filter((item) => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
      return false;
    }
    if (filters.area && filters.area !== 'all' && item.area !== filters.area) {
      return false;
    }
    if (filters.stage && filters.stage !== 'all' && item.stage !== filters.stage) {
      return false;
    }
    if (filters.sector && filters.sector !== 'all' && item.sector !== filters.sector) {
      return false;
    }
    if (filters.hiringOnly && (!item.jobs_count || item.jobs_count <= 0)) {
      return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// Test Sample Data
const sampleListings = [
  {
    id: '1',
    name: 'Sample BaySaaS Analytics',
    type: 'startup',
    sector: 'SaaS',
    stage: 'Seed',
    area: 'Rushikonda',
    description: 'Cloud analytics for maritime logistics',
    jobs_count: 2,
    lat: 17.7812,
    lng: 83.3792,
  },
  {
    id: '2',
    name: 'Andhra University',
    type: 'campus',
    sector: 'Deeptech',
    stage: 'Public',
    area: 'Siripuram',
    description: 'Premier university and incubation centre',
    jobs_count: 0,
    lat: 17.7245,
    lng: 83.3245,
  },
  {
    id: '3',
    name: 'Sample Vizag Angels',
    type: 'investor',
    sector: 'Fintech',
    stage: 'Seed',
    area: 'Dwaraka Nagar',
    description: 'Angel syndicate investing in coastal Andhra founders',
    jobs_count: 0,
    lat: 17.7265,
    lng: 83.3082,
  },
];

describe('Razorpay Webhook HMAC Signature Verification', () => {
  const secret = 'my_test_webhook_secret_123';
  const body = JSON.stringify({
    event: 'subscription.activated',
    payload: {
      subscription: {
        entity: { id: 'sub_test_123', status: 'active' },
      },
    },
  });

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  test('Valid HMAC-SHA256 signature passes verification', () => {
    assert.strictEqual(verifyRazorpayWebhookSignature(body, validSignature, secret), true);
  });

  test('Tampered webhook payload fails verification', () => {
    const tamperedBody = body.replace('sub_test_123', 'sub_hacked_999');
    assert.strictEqual(verifyRazorpayWebhookSignature(tamperedBody, validSignature, secret), false);
  });

  test('Wrong secret fails verification', () => {
    assert.strictEqual(verifyRazorpayWebhookSignature(body, validSignature, 'wrong_secret'), false);
  });

  test('Empty or null signature returns false safely without throwing', () => {
    assert.strictEqual(verifyRazorpayWebhookSignature(body, '', secret), false);
    assert.strictEqual(verifyRazorpayWebhookSignature('', validSignature, secret), false);
  });
});

describe('Ecosystem Directory Filter Logic', () => {
  test('Filter by type: returns only matching entity type', () => {
    const startups = filterListings(sampleListings, { type: 'startup' });
    assert.strictEqual(startups.length, 1);
    assert.strictEqual(startups[0].name, 'Sample BaySaaS Analytics');

    const campuses = filterListings(sampleListings, { type: 'campus' });
    assert.strictEqual(campuses.length, 1);
    assert.strictEqual(campuses[0].name, 'Andhra University');
  });

  test('Filter by area: returns only entities in selected neighborhood', () => {
    const rushikonda = filterListings(sampleListings, { area: 'Rushikonda' });
    assert.strictEqual(rushikonda.length, 1);
    assert.strictEqual(rushikonda[0].area, 'Rushikonda');

    const empty = filterListings(sampleListings, { area: 'Gajuwaka' });
    assert.strictEqual(empty.length, 0);
  });

  test('Hiring Now toggle: returns only entities with active open jobs', () => {
    const hiringOnly = filterListings(sampleListings, { hiringOnly: true });
    assert.strictEqual(hiringOnly.length, 1);
    assert.strictEqual(hiringOnly[0].jobs_count, 2);
  });

  test('Case-insensitive search: matches name, description, area, and sector', () => {
    const byName = filterListings(sampleListings, { search: 'baysaas' });
    assert.strictEqual(byName.length, 1);

    const bySector = filterListings(sampleListings, { search: 'fintech' });
    assert.strictEqual(bySector.length, 1);

    const byDescription = filterListings(sampleListings, { search: 'incubation' });
    assert.strictEqual(byDescription.length, 1);
    assert.strictEqual(byDescription[0].name, 'Andhra University');
  });

  test('Haversine distance calculates accurate coastline proximity', () => {
    // RK Beach: ~17.7126, 83.3228
    // Siripuram (near coast): ~17.7245, 83.3245
    const distNear = haversineDistanceKm(17.7126, 83.3228, 17.7245, 83.3245);
    assert.ok(distNear < 2.0, 'Siripuram should be within 2km of RK Beach coast');

    // Pendurthi (inland): ~17.8340, 83.1970
    const distFar = haversineDistanceKm(17.7126, 83.3228, 17.8340, 83.1970);
    assert.ok(distFar > 10.0, 'Pendurthi should be over 10km from RK Beach coast');
  });
});
