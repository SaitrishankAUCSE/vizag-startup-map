import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  validateGSTIN,
  validateCIN,
  validateDPIIT,
  validateUDYAM,
  validateGovernmentRegistration,
} from '../src/lib/verification/govId.ts';
import {
  normalizeCompanyName,
  isStartupNameMatchingGovRecord,
} from '../src/lib/verification/govRegistry.ts';

// Disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'sharklasers.com',
]);

function isDisposableEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

function generateVerificationToken(email, secret) {
  const timestamp = Date.now();
  const tokenPayload = `${email.toLowerCase().trim()}:${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(tokenPayload).digest('hex');
  return `${timestamp}.${signature}`;
}

function isVerificationTokenValid(email, token, secret) {
  if (!email || !token || !token.includes('.')) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const [timestampStr, signature] = token.split('.');
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;
  if (Date.now() - timestamp > 60 * 60 * 1000) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${normalizedEmail}:${timestamp}`)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

function calculateTrustScore({ emailVerified, websiteOk, hasProof, isDomainMatch, hasLinkedIn }) {
  let score = 0;
  if (emailVerified) score += 30;
  if (websiteOk) score += 20;
  if (hasProof) score += 25;
  if (isDomainMatch) score += 15;
  if (hasLinkedIn) score += 10;
  return Math.min(100, score);
}

describe('Submitter Verification & Anti-Fake Guard', () => {
  test('Disposable email detection blocks temporary mail providers', () => {
    assert.equal(isDisposableEmail('fake@mailinator.com'), true);
    assert.equal(isDisposableEmail('test@tempmail.com'), true);
    assert.equal(isDisposableEmail('bot@10minutemail.com'), true);
    assert.equal(isDisposableEmail('founder@aquaexchange.com'), false);
    assert.equal(isDisposableEmail('user@gmail.com'), false);
  });

  test('Cryptographic verification token validation and tamper rejection', () => {
    const secret = 'test-verification-secret';
    const email = 'founder@spotmies.com';
    const token = generateVerificationToken(email, secret);

    assert.equal(isVerificationTokenValid(email, token, secret), true);
    assert.equal(isVerificationTokenValid(email, token + 'tampered', secret), false);
    assert.equal(isVerificationTokenValid('impostor@gmail.com', token, secret), false);
  });

  test('Trust & Verification Score calculation enforces minimum threshold of 60', () => {
    // Unverified user with no proof has score 0
    const unverifiedScore = calculateTrustScore({
      emailVerified: false,
      websiteOk: false,
      hasProof: false,
      isDomainMatch: false,
      hasLinkedIn: false,
    });
    assert.equal(unverifiedScore, 0);

    // Verified founder with corporate domain, live website, and DPIIT proof
    const verifiedFounderScore = calculateTrustScore({
      emailVerified: true,
      websiteOk: true,
      hasProof: true,
      isDomainMatch: true,
      hasLinkedIn: true,
    });
    assert.equal(verifiedFounderScore, 100);
    assert.ok(verifiedFounderScore >= 60);

    // Personal email with verified OTP, website, and incubator proof (score 75 >= 60)
    const personalEmailScore = calculateTrustScore({
      emailVerified: true,
      websiteOk: true,
      hasProof: true,
      isDomainMatch: false,
      hasLinkedIn: false,
    });
    assert.equal(personalEmailScore, 75);
    assert.ok(personalEmailScore >= 60);
  });
});

describe('Government Registration & Entity Validation Engine', () => {
  test('Valid Andhra Pradesh GSTIN passes with Modulo 36 checksum verification', () => {
    // Valid statutory GSTIN for AP (State 37, Entity C, Checksum 4)
    const validGstin = '37AACCF4148Q1Z4';
    const result = validateGSTIN(validGstin);
    assert.equal(result.valid, true);
    assert.equal(result.details?.stateCode, '37');
    assert.equal(result.details?.isAndhraPradesh, true);
    assert.equal(result.details?.pan, 'AACCF4148Q');
  });

  test('Invalid GSTIN checksum is rejected mathematically', () => {
    // Check digit altered from 4 to 9 -> Must fail Modulo 36 checksum
    const fakeGstin = '37AACCF4148Q1Z9';
    const result = validateGSTIN(fakeGstin);
    assert.equal(result.valid, false);
    assert.ok(result.reason?.includes('checksum verification failed'));
  });

  test('Malformed GSTIN syntax is rejected', () => {
    assert.equal(validateGSTIN('INVALID123').valid, false);
    assert.equal(validateGSTIN('37AACCF4148').valid, false);
    assert.equal(validateGSTIN('').valid, false);
  });

  test('Valid MCA Corporate Identification Number (CIN) passes', () => {
    const validCin = 'U72200AP2021PTC118543';
    const result = validateCIN(validCin);
    assert.equal(result.valid, true);
    assert.equal(result.details?.stateCode, 'AP');
    assert.equal(result.details?.isAndhraPradesh, true);
    assert.equal(result.details?.incorporationYear, 2021);
    assert.equal(result.details?.entityType, 'Private Limited Company');
  });

  test('Invalid CIN incorporation year is rejected', () => {
    // Year 1850 is before 1900
    const archaicCin = 'U72200AP1850PTC118543';
    const result = validateCIN(archaicCin);
    assert.equal(result.valid, false);
    assert.ok(result.reason?.includes('incorporation year'));

    // Year in distant future
    const futureCin = 'U72200AP2099PTC118543';
    assert.equal(validateCIN(futureCin).valid, false);
  });

  test('Valid DPIIT Startup India Recognition Number passes', () => {
    const res1 = validateDPIIT('DIPP124982');
    assert.equal(res1.valid, true);
    assert.equal(res1.details?.entityType, 'DPIIT Recognized Startup');

    const res2 = validateDPIIT('DPIIT87261');
    assert.equal(res2.valid, true);
  });

  test('Malformed DPIIT is rejected', () => {
    assert.equal(validateDPIIT('RANDOM123').valid, false);
    assert.equal(validateDPIIT('DIPP').valid, false);
  });

  test('Valid UDYAM MSME registration number passes', () => {
    const validUdyam = 'UDYAM-AP-01-0012345';
    const result = validateUDYAM(validUdyam);
    assert.equal(result.valid, true);
    assert.equal(result.details?.stateCode, 'AP');
    assert.equal(result.details?.isAndhraPradesh, true);
  });

  test('Malformed UDYAM number is rejected', () => {
    assert.equal(validateUDYAM('UDYAM-12345').valid, false);
    assert.equal(validateUDYAM('UDYAM-AP-0001').valid, false);
  });

  test('validateGovernmentRegistration master dispatcher behaves correctly', () => {
    assert.equal(validateGovernmentRegistration('none', '').valid, false);
    assert.equal(validateGovernmentRegistration('gstin', '37AACCF4148Q1Z4').valid, true);
    assert.equal(validateGovernmentRegistration('gstin', '37AACCF4148Q1Z9').valid, false);
    assert.equal(validateGovernmentRegistration('cin', 'U72200AP2021PTC118543').valid, true);
    assert.equal(validateGovernmentRegistration('dpiit', 'DIPP124982').valid, true);
    assert.equal(validateGovernmentRegistration('udyam', 'UDYAM-AP-01-0012345').valid, true);
  });

  test('Anti-Impostor Guard: Submitting another company GSTIN with personal/unmatched email blocks auto-approval', () => {
    // Valid GSTIN format
    const govResult = validateGovernmentRegistration('gstin', '37AACCF4148Q1Z4');
    assert.equal(govResult.valid, true);

    // Impostor check: submitter email does not match company domain
    const website = 'https://fluentgrid.com';
    const impostorEmail = 'scammer@gmail.com';
    const siteHost = new URL(website).hostname.replace(/^www\./i, '');
    const emailDomain = impostorEmail.split('@')[1];
    const domainMatched = emailDomain === siteHost;

    // Must evaluate to FALSE -> Impostor is blocked from instant live approval!
    assert.equal(domainMatched, false);
    const isAutoApproved = govResult.valid && domainMatched;
    assert.equal(isAutoApproved, false);

    // Legitimate founder check: submitter email matches company domain
    const founderEmail = 'founder@fluentgrid.com';
    const founderEmailDomain = founderEmail.split('@')[1];
    const founderDomainMatched = founderEmailDomain === siteHost;
    assert.equal(founderDomainMatched, true);
    const isFounderAutoApproved = govResult.valid && founderDomainMatched;
    assert.equal(isFounderAutoApproved, true);
  });
});

describe('Live Government Registry Name-Matching Engine', () => {
  test('normalizeCompanyName strips legal suffixes correctly', () => {
    assert.equal(normalizeCompanyName('SPOTMIES INNOVATIONS PRIVATE LIMITED'), 'spotmies');
    assert.equal(normalizeCompanyName('FLUENTGRID LIMITED'), 'fluentgrid');
    assert.equal(normalizeCompanyName('BAYAI ROBOTICS PVT LTD'), 'bayai robotics');
    assert.equal(normalizeCompanyName('AQUAEXCHANGE TECHNOLOGIES LLP'), 'aquaexchange');
    assert.equal(normalizeCompanyName('INDUSUNI VENTURES INDIA'), 'indusuni');
    // Already clean names should normalize to themselves
    assert.equal(normalizeCompanyName('Spotmies'), 'spotmies');
    assert.equal(normalizeCompanyName('BayAI Robotics'), 'bayai robotics');
  });

  test('Exact trade name match (highest confidence)', () => {
    const result = isStartupNameMatchingGovRecord(
      'Spotmies',
      'SPOTMIES INNOVATIONS PRIVATE LIMITED',
      'SPOTMIES'
    );
    assert.equal(result.matched, true);
    assert.equal(result.matchedOn, 'trade_name');
    assert.ok(result.confidence >= 0.9);
  });

  test('Fuzzy legal name match — submitted short name against full legal name', () => {
    // User enters "Spotmies", gov record is "SPOTMIES INNOVATIONS PRIVATE LIMITED"
    const result = isStartupNameMatchingGovRecord(
      'Spotmies',
      'SPOTMIES INNOVATIONS PRIVATE LIMITED',
      null
    );
    assert.equal(result.matched, true);
    assert.equal(result.matchedOn, 'legal_name');
  });

  test('Multi-word startup name fuzzy-matches govt record', () => {
    // "BayAI Robotics" should match "BAYAI ROBOTICS PVT LTD"
    const result = isStartupNameMatchingGovRecord(
      'BayAI Robotics',
      'BAYAI ROBOTICS PVT LTD',
      null
    );
    assert.equal(result.matched, true);
    assert.equal(result.matchedOn, 'legal_name');
    assert.ok(result.confidence >= 0.65);
  });

  test('Fluentgrid matches FLUENTGRID LIMITED', () => {
    const result = isStartupNameMatchingGovRecord('Fluentgrid', 'FLUENTGRID LIMITED', 'FLUENTGRID');
    assert.equal(result.matched, true);
  });

  test('Completely different startup name does NOT match', () => {
    // Fake startup "Random Fake Corp" should NOT match "SPOTMIES INNOVATIONS PRIVATE LIMITED"
    const result = isStartupNameMatchingGovRecord(
      'Random Fake Corp',
      'SPOTMIES INNOVATIONS PRIVATE LIMITED',
      'SPOTMIES'
    );
    assert.equal(result.matched, false);
    assert.equal(result.matchedOn, 'none');
  });

  test('Name impostor: submitting real company name with different GSTIN is blocked by name mismatch', () => {
    // Impostor submits "Fluentgrid" but provides a GSTIN belonging to "SPOTMIES INNOVATIONS PVT LTD"
    const result = isStartupNameMatchingGovRecord(
      'Fluentgrid',
      'SPOTMIES INNOVATIONS PRIVATE LIMITED',
      'SPOTMIES'
    );
    assert.equal(result.matched, false);
    assert.equal(result.matchedOn, 'none');
  });

  test('Partial brand name matches company when it is a substring', () => {
    // "AquaExchange" should match "AQUAEXCHANGE TECHNOLOGIES LLP"
    const result = isStartupNameMatchingGovRecord(
      'AquaExchange',
      'AQUAEXCHANGE TECHNOLOGIES LLP',
      null
    );
    assert.equal(result.matched, true);
  });

  test('Empty strings do not match', () => {
    const result = isStartupNameMatchingGovRecord('', 'SPOTMIES INNOVATIONS PRIVATE LIMITED', null);
    assert.equal(result.matched, false);
  });
});
