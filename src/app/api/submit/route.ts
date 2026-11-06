import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubmission, getListings } from '@/lib/firebase/service';
import { detectAtsFromUrl } from '@/lib/ats/detect';
import { isDisposableEmail, isVerificationTokenValid } from '@/lib/verification/otp';

// In-memory rate limiting map: ip -> timestamps
const rateLimitMap = new Map<string, number[]>();

const submissionSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  type: z.enum(['startup', 'investor', 'incubator', 'campus', 'coworking']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  sector: z.string().min(2, 'Please select a sector'),
  stage: z.string().min(2, 'Please select a stage'),
  area: z.string().min(2, 'Please select a neighborhood in Vizag'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  pincode: z.string().regex(/^53[0-9]{4}$/, 'Must be a valid Visakhapatnam PIN code (starting with 530xxx or 531xxx)').optional().or(z.literal('')),
  lat: z.number().min(17.40, 'Latitude must be within Visakhapatnam metropolitan area').max(18.20),
  lng: z.number().min(83.00, 'Longitude must be within Visakhapatnam metropolitan area').max(83.60),
  website: z.string().url('A valid live website URL is required for startup verification'),
  linkedin: z.string().url().optional().or(z.literal('')),
  logo_url: z.string().optional().or(z.literal('')),
  careers_url: z.string().url().optional().or(z.literal('')),
  ats_url: z.string().optional().or(z.literal('')),
  // Submitter identity & verification
  founder_name: z.string().min(2, 'Submitter name is required'),
  founder_role: z.string().min(2, 'Submitter role/designation is required'),
  founder_linkedin: z.string().url('Personal LinkedIn profile URL is required to verify submitter identity').optional().or(z.literal('')),
  contact_email: z.string().email('Valid official contact email is required'),
  email_verification_token: z.string().min(10, 'Email verification is mandatory. Please verify your email via 6-digit code before submitting.'),
  // Startup authenticity proof
  verification_proof_type: z.enum(['dpiit', 'cin', 'gstin', 'incubator', 'media']),
  verification_proof_value: z.string().min(3, 'Official verification proof ID, registration, or reference is required to prevent fake listings'),
  website_verified: z.boolean().optional(),
  // Honeypot field for bot spam protection
  hp_website_confirm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];

    // Rate limiting: 5 submissions per minute per IP
    const recent = timestamps.filter((t) => now - t < 60000);
    if (recent.length >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before submitting again.' },
        { status: 429 }
      );
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);

    const body = await req.json();

    // 1. Bot honeypot guard
    if (body.hp_website_confirm && body.hp_website_confirm.trim() !== '') {
      return NextResponse.json({ success: true, message: 'Submission received' });
    }

    // 2. Validate payload schema
    const validated = submissionSchema.parse(body);

    // 3. Submitter Identity Verification: Reject disposable emails
    if (isDisposableEmail(validated.contact_email)) {
      return NextResponse.json(
        { error: 'Disposable or temporary email services are blocked. Please use your official corporate or personal email.' },
        { status: 400 }
      );
    }

    // 4. Submitter Identity Verification: Validate Cryptographic Email OTP Token
    const isTokenValid = isVerificationTokenValid(
      validated.contact_email,
      validated.email_verification_token
    );
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Email verification token is invalid or has expired. Please verify your email again using the 6-digit code.' },
        { status: 403 }
      );
    }

    // 5. Anti-Fake & Duplicate Guard: Check against existing listings
    const existingListings = await getListings();
    const normalizedName = validated.name.toLowerCase().trim();
    const duplicate = existingListings.find(
      (l) => l.name.toLowerCase().trim() === normalizedName || l.slug === normalizedName.replace(/[^a-z0-9]+/g, '-')
    );

    if (duplicate) {
      return NextResponse.json(
        {
          error: `An organization named "${duplicate.name}" is already charted on the Visakhapatnam map. If you are the founder or owner, please use the "Claim Listing" feature instead of re-submitting.`,
        },
        { status: 409 }
      );
    }

    // 6. Domain Matching Verification (check if email domain matches website domain)
    let domainMatched = false;
    try {
      const siteHost = new URL(validated.website).hostname.replace(/^www\./i, '').toLowerCase();
      const emailDomain = validated.contact_email.split('@')[1]?.toLowerCase().trim();
      if (emailDomain && (emailDomain === siteHost || siteHost.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${siteHost}`))) {
        domainMatched = true;
      }
    } catch {}

    // 7. Calculate Trust & Verification Score (0 to 100)
    let verificationScore = 0;
    // Email verified via OTP: +30 pts
    verificationScore += 30;
    // Official Business / Incubation proof provided: +25 pts
    if (validated.verification_proof_value && validated.verification_proof_value.length >= 4) {
      verificationScore += 25;
    }
    // Website verified reachable: +20 pts
    if (validated.website_verified) {
      verificationScore += 20;
    }
    // Company domain match (e.g. founder@company.com): +15 pts
    if (domainMatched) {
      verificationScore += 15;
    }
    // Founder LinkedIn identity: +10 pts
    if (validated.founder_linkedin && validated.founder_linkedin.includes('linkedin.com')) {
      verificationScore += 10;
    }

    // Minimum verification threshold
    if (verificationScore < 50) {
      return NextResponse.json(
        { error: 'Verification requirements not met. Please complete email verification, provide a valid live website, and submit corporate or incubator proof.' },
        { status: 400 }
      );
    }

    // Auto-detect ATS provider & slug
    const atsDetection =
      detectAtsFromUrl(validated.ats_url) || detectAtsFromUrl(validated.careers_url);

    const listingData = {
      name: validated.name,
      type: validated.type,
      description: validated.description,
      sector: validated.sector,
      stage: validated.stage,
      area: validated.area,
      address: validated.pincode ? `${validated.address}, Visakhapatnam - ${validated.pincode}` : validated.address,
      lat: validated.lat,
      lng: validated.lng,
      website: validated.website,
      linkedin_url: validated.linkedin || null,
      logo_url: validated.logo_url || null,
      careers_url: validated.careers_url || null,
      ats_provider: atsDetection?.provider || null,
      ats_board_slug: atsDetection?.boardSlug || null,
    };

    const result = await createSubmission(
      listingData,
      validated.founder_name,
      validated.contact_email,
      {
        founder_role: validated.founder_role,
        founder_linkedin: validated.founder_linkedin || null,
        is_email_verified: true,
        domain_matched: domainMatched,
        website_verified: !!validated.website_verified,
        verification_score: verificationScore,
        verification_proof_type: validated.verification_proof_type,
        verification_proof_value: validated.verification_proof_value,
        verification_details: {
          ip,
          verified_at: new Date().toISOString(),
          pincode: validated.pincode,
          domain_matched: domainMatched,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Verified submission received! Verification Trust Score: ${verificationScore}/100. Pending fast-track review.`,
      id: result.id,
      verification_score: verificationScore,
      domain_matched: domainMatched,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: firstIssue, details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your submission.' },
      { status: 500 }
    );
  }
}
