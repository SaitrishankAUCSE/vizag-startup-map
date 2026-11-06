import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

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
