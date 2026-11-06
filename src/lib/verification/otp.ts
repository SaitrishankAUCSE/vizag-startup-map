import crypto from 'node:crypto';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { sendEmailAlert } from '@/lib/email/resend';

const OTP_SECRET = process.env.VERIFICATION_SECRET || 'vizag-startup-map-secure-verification-secret-key-2026';
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// In-memory fallback store for OTPs
interface StoredOtp {
  code: string;
  expiresAt: number;
  verified: boolean;
  startupName?: string;
}

const memoryOtpStore = new Map<string, StoredOtp>();

// Known disposable email domains to block
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
  'fakemailgenerator.com',
  'temp-mail.org',
  'crazymailing.com',
  'burnermail.io',
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Generate a 6-digit OTP code and send to the contact email.
 */
export async function createAndSendOtp(
  email: string,
  startupName: string = 'your startup'
): Promise<{ success: boolean; message: string; dev_code?: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isDisposableEmail(normalizedEmail)) {
    return {
      success: false,
      error: 'Disposable email addresses are not permitted. Please use an official work or personal email.',
      message: 'Disposable email domain detected',
    };
  }

  // Generate 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  // Store in memory
  memoryOtpStore.set(normalizedEmail, {
    code,
    expiresAt,
    verified: false,
    startupName,
  });

  // Store in Firestore if available
  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('verification_otps').doc(normalizedEmail).set({
        code,
        expires_at: new Date(expiresAt).toISOString(),
        verified: false,
        startup_name: startupName,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[otp] Firestore otp save warning:', err);
    }
  }

  // Send email via Resend
  const subject = `Your Vizag Startup Map Verification Code: ${code}`;
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #DDE3E8; padding: 40px 20px; color: #3A0F34;">
      <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px 32px; border: 1px solid rgba(58,15,52,0.15); box-shadow: 0 10px 30px rgba(58,15,52,0.08);">
        <div style="display: inline-block; background: #3A0F34; color: #EAAA00; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 6px 14px; rounded-full; border-radius: 999px; margin-bottom: 20px;">
          Identity Verification
        </div>
        <h2 style="font-size: 24px; font-weight: 800; color: #3A0F34; margin: 0 0 12px; letter-spacing: -0.02em;">
          Verify Your Startup Submission
        </h2>
        <p style="font-size: 14px; color: rgba(58,15,52,0.8); line-height: 1.6; margin: 0 0 24px;">
          You requested an authentication code to submit <strong>${startupName}</strong> to the Visakhapatnam Tech Ecosystem Map.
        </p>
        
        <div style="background: #3A0F34; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 34px; font-weight: 800; color: #EAAA00; letter-spacing: 8px; font-family: monospace;">
            ${code}
          </div>
          <div style="font-size: 11px; color: #DDE3E8; opacity: 0.7; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.1em;">
            Expires in 10 minutes
          </div>
        </div>

        <p style="font-size: 12px; color: rgba(58,15,52,0.6); line-height: 1.5; margin: 0;">
          If you did not request this code, no action is needed. Your email will not be added to the directory without verification.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: rgba(58,15,52,0.5);">
        Vizag Startup Map • Visakhapatnam, Andhra Pradesh
      </div>
    </div>
  `;

  await sendEmailAlert({
    to: normalizedEmail,
    subject,
    htmlContent,
  });

  console.log(`[OTP] Sent verification code to ${normalizedEmail}: ${code}`);

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    // Return dev_code in development or test for seamless localhost testing
    dev_code: process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY ? code : undefined,
  };
}

/**
 * Verify a 6-digit OTP code and issue a signed verification token.
 */
export async function verifyOtp(
  email: string,
  code: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const inputCode = code.trim();

  let stored = memoryOtpStore.get(normalizedEmail);

  // Check Firestore if not in memory or expired
  if (!stored) {
    const db = getAdminFirestore();
    if (db) {
      try {
        const doc = await db.collection('verification_otps').doc(normalizedEmail).get();
        if (doc.exists) {
          const d = doc.data();
          stored = {
            code: d?.code,
            expiresAt: new Date(d?.expires_at).getTime(),
            verified: d?.verified || false,
            startupName: d?.startup_name,
          };
        }
      } catch (err) {
        console.warn('[otp] Firestore otp read warning:', err);
      }
    }
  }

  if (!stored) {
    return { success: false, error: 'No verification code was requested for this email. Please click "Send Code".' };
  }

  if (Date.now() > stored.expiresAt) {
    memoryOtpStore.delete(normalizedEmail);
    return { success: false, error: 'This verification code has expired. Please request a new code.' };
  }

  if (stored.code !== inputCode) {
    return { success: false, error: 'Invalid verification code. Please check your inbox and try again.' };
  }

  // Mark as verified
  stored.verified = true;
  memoryOtpStore.set(normalizedEmail, stored);

  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('verification_otps').doc(normalizedEmail).update({
        verified: true,
        verified_at: new Date().toISOString(),
      });
    } catch {}
  }

  // Generate cryptographically signed verification token
  const timestamp = Date.now();
  const tokenPayload = `${normalizedEmail}:${timestamp}`;
  const signature = crypto.createHmac('sha256', OTP_SECRET).update(tokenPayload).digest('hex');
  const verificationToken = `${timestamp}.${signature}`;

  return {
    success: true,
    token: verificationToken,
  };
}

/**
 * Validate that a verification token matches the email and hasn't expired (valid for 1 hour).
 */
export function isVerificationTokenValid(email: string, token: string): boolean {
  if (!email || !token || !token.includes('.')) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const [timestampStr, signature] = token.split('.');
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;
  // Token valid for 1 hour from verification
  if (Date.now() - timestamp > 60 * 60 * 1000) return false;

  const expectedSignature = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${normalizedEmail}:${timestamp}`)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}
