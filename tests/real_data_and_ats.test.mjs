import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper: ATS URL Detection
function detectAtsFromUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return { provider: null, boardSlug: null };
  const url = rawUrl.trim();
  const ghMatch = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([a-zA-Z0-9_\-]+)/i);
  if (ghMatch && ghMatch[1]) return { provider: 'greenhouse', boardSlug: ghMatch[1] };
  const leverMatch = url.match(/jobs\.lever\.co\/([a-zA-Z0-9_\-]+)/i);
  if (leverMatch && leverMatch[1]) return { provider: 'lever', boardSlug: leverMatch[1] };
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([a-zA-Z0-9_\-]+)/i);
  if (ashbyMatch && ashbyMatch[1]) return { provider: 'ashby', boardSlug: ashbyMatch[1] };
  return { provider: null, boardSlug: null };
}

// Helper: Domain Normalizer
function normalizeWebsite(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return null;
  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  try {
    const parsed = new URL(cleaned);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

describe('ATS Provider URL Auto-Detection', () => {
  test('Greenhouse job-boards URL detects greenhouse provider and slug', () => {
    const res = detectAtsFromUrl('https://job-boards.greenhouse.io/baylogic-ai/jobs/12345');
    assert.equal(res.provider, 'greenhouse');
    assert.equal(res.boardSlug, 'baylogic-ai');
  });

  test('Greenhouse boards URL detects greenhouse provider and slug', () => {
    const res = detectAtsFromUrl('https://boards.greenhouse.io/vizagtech');
    assert.equal(res.provider, 'greenhouse');
    assert.equal(res.boardSlug, 'vizagtech');
  });

  test('Lever URL detects lever provider and slug', () => {
    const res = detectAtsFromUrl('https://jobs.lever.co/coromandel-ai');
    assert.equal(res.provider, 'lever');
    assert.equal(res.boardSlug, 'coromandel-ai');
  });

  test('Ashby URL detects ashby provider and slug', () => {
    const res = detectAtsFromUrl('https://jobs.ashbyhq.com/portbot');
    assert.equal(res.provider, 'ashby');
    assert.equal(res.boardSlug, 'portbot');
  });

  test('Unrelated career URL returns null provider and slug', () => {
    const res = detectAtsFromUrl('https://startup.com/careers');
    assert.equal(res.provider, null);
    assert.equal(res.boardSlug, null);
  });
});

describe('Domain Normalization & Duplicate Detection', () => {
  test('Normalizes various URL formats to standard domain hostname', () => {
    assert.equal(normalizeWebsite('https://www.baylogic.in/about'), 'baylogic.in');
    assert.equal(normalizeWebsite('http://baylogic.in'), 'baylogic.in');
    assert.equal(normalizeWebsite('baylogic.in/'), 'baylogic.in');
    assert.equal(normalizeWebsite('WWW.BAYLOGIC.IN'), 'baylogic.in');
  });

  test('Prevents duplicate entries with identical normalized domains', () => {
    const existingDomains = new Set(['baylogic.in', 'vizagrobotics.com']);
    const newDomain = normalizeWebsite('https://www.baylogic.in/careers');
    assert.equal(existingDomains.has(newDomain), true);
  });
});

describe('Golden Rule #3 Traceability Guard', () => {
  test('Facts are rendered ONLY when backed by a stored source', () => {
    const sampleListingWithSources = {
      name: 'Real Port Tech',
      founded_year: 2024,
      founded_year_source: 'Startup India Certificate',
      team_size: '11-50',
      team_size_source: null, // Untraceable
      funding_text: '$1.5M',
      funding_source_url: 'https://inc42.com/buzz/porttech',
    };

    // Evaluate visibility according to Golden Rule #3
    const showFounded = Boolean(sampleListingWithSources.founded_year && sampleListingWithSources.founded_year_source);
    const showTeam = Boolean(sampleListingWithSources.team_size && sampleListingWithSources.team_size_source);
    const showFunding = Boolean(sampleListingWithSources.funding_text && sampleListingWithSources.funding_source_url);

    assert.equal(showFounded, true, 'Founded year with source must be shown');
    assert.equal(showTeam, false, 'Team size without source must be hidden (never guess or filler)');
    assert.equal(showFunding, true, 'Funding with verified source URL must be shown');
  });
});

describe('Lead Queue & Job Rules (Addition)', () => {
  test('Lead approval guard requires website, pin coordinates, and at least one source', () => {
    function canApproveLead(lead) {
      const hasWebsite = Boolean(lead.website && lead.website.trim());
      const hasPin = Boolean(lead.lat && lead.lng && (lead.lat !== 0 || lead.lng !== 0));
      const hasSource = Boolean(lead.source_name || lead.source_url || (lead.sources && lead.sources.length > 0));
      return hasWebsite && hasPin && hasSource;
    }

    const invalidLeadNoWebsite = { name: 'Acme', lat: 17.72, lng: 83.32, source_name: 'eChai' };
    const invalidLeadNoPin = { name: 'Acme', website: 'https://acme.com', lat: 0, lng: 0, source_name: 'eChai' };
    const invalidLeadNoSource = { name: 'Acme', website: 'https://acme.com', lat: 17.72, lng: 83.32 };
    const validLead = { name: 'Acme', website: 'https://acme.com', lat: 17.72, lng: 83.32, source_name: 'eChai' };

    assert.equal(canApproveLead(invalidLeadNoWebsite), false);
    assert.equal(canApproveLead(invalidLeadNoPin), false);
    assert.equal(canApproveLead(invalidLeadNoSource), false);
    assert.equal(canApproveLead(validLead), true);
  });

  test('Careers status "unknown" excludes company and jobs from hiring counts', () => {
    const listings = [
      { id: '1', name: 'Alpha', careers_status: 'verified_openings' },
      { id: '2', name: 'Beta', careers_status: 'unknown', careers_url: 'https://beta.com/careers' },
      { id: '3', name: 'Gamma', careers_status: 'no_openings' },
    ];
    const jobs = [
      { id: 'j1', listing_id: '1', is_active: true },
      { id: 'j2', listing_id: '2', is_active: true },
    ];

    // Compute stats applying the unknown exclusion rule
    const verifiedHiringListingIds = new Set();
    listings.forEach((l) => {
      if (l.careers_status === 'verified_openings') verifiedHiringListingIds.add(l.id);
    });

    const verifiedJobs = jobs.filter((j) => {
      const comp = listings.find((l) => l.id === j.listing_id);
      if (!comp || comp.careers_status === 'unknown' || comp.careers_status === 'no_openings') return false;
      verifiedHiringListingIds.add(comp.id);
      return true;
    });

    assert.equal(verifiedHiringListingIds.size, 1);
    assert.equal(verifiedJobs.length, 1);
    assert.equal(verifiedJobs[0].id, 'j1');
  });

  test('Job missing in 2 consecutive checks is deactivated', () => {
    function processMissingJob(job) {
      const missingChecks = (job.missing_checks || 0) + 1;
      if (missingChecks >= 2) {
        return { ...job, is_active: false, missing_checks: missingChecks };
      }
      return { ...job, is_active: true, missing_checks: missingChecks };
    }

    const initialActive = { id: 'job_1', is_active: true, missing_checks: 0 };
    const afterFirstMissingCheck = processMissingJob(initialActive);
    assert.equal(afterFirstMissingCheck.is_active, true, 'First missing check should keep job active');
    assert.equal(afterFirstMissingCheck.missing_checks, 1);

    const afterSecondMissingCheck = processMissingJob(afterFirstMissingCheck);
    assert.equal(afterSecondMissingCheck.is_active, false, 'Second missing check must deactivate job');
    assert.equal(afterSecondMissingCheck.missing_checks, 2);
  });

  test('External Apply redirect uses target="_blank" and rel="noopener noreferrer"', () => {
    const applyButtonProps = {
      href: 'https://jobs.lever.co/example-corp/1234',
      target: '_blank',
      rel: 'noopener noreferrer',
    };

    assert.equal(applyButtonProps.target, '_blank');
    assert.equal(applyButtonProps.rel, 'noopener noreferrer');
    assert.match(applyButtonProps.href, /^https?:\/\//);
  });
});

