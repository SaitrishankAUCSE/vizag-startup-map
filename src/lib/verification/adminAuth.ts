import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vizag-startup-map-admin-secret-seed-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Bannusai1311@';

/**
 * Verify if the submitted password matches the admin master password.
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input) return false;
  return input === ADMIN_PASSWORD;
}

/**
 * Generate a cryptographically signed 30-day admin token.
 */
export function createAdminToken(): string {
  const timestamp = Date.now();
  const payload = `vizag-admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `${timestamp}.${hmac}`;
}

/**
 * Verify whether an admin token is valid and not expired (valid for 30 days).
 */
export function isTokenValid(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [timestampStr, signature] = token.split('.');
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // 30 days validity
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > THIRTY_DAYS_MS || timestamp > Date.now() + 60000) {
    return false;
  }

  const payload = `vizag-admin:${timestamp}`;
  const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Check admin authorization from an incoming Next.js request.
 * Checks header `x-admin-token` or Authorization Bearer header or cookie `vsm_admin_token`.
 */
export function verifyAdminRequest(req: NextRequest): boolean {
  const headerToken =
    req.headers.get('x-admin-token') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (headerToken && isTokenValid(headerToken)) {
    return true;
  }

  const cookieToken = req.cookies.get('vsm_admin_token')?.value;
  if (cookieToken && isTokenValid(cookieToken)) {
    return true;
  }

  return false;
}
