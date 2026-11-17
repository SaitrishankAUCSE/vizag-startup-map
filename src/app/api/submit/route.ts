import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubmission, getListings, approveSubmission } from '@/lib/firebase/service';
import { detectAtsFromUrl } from '@/lib/ats/detect';
import { isDisposableEmail, isVerificationTokenValid } from '@/lib/verification/otp';
import { validateGovernmentRegistration, GovIdType } from '@/lib/verification/govId';
import { lookupGSTINFromRegistry, isStartupNameMatchingGovRecord } from '@/lib/verification/govRegistry';

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
  founder_role: z.string().optional().or(z.literal('')),
  founder_linkedin: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('Valid official contact email is required'),
  email_verification_token: z.string().optional(),
  // Startup authenticity proof (Government ID: GSTIN, CIN, DPIIT, UDYAM)
  verification_proof_type: z.enum(['dpiit', 'cin', 'gstin', 'udyam', 'none']).optional().or(z.literal('')),
  verification_proof_value: z.string().optional().or(z.literal('')),
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

    // 4. Submitter Identity Verification: Validate Cryptographic Email OTP Token if provided
    if (validated.email_verification_token) {
      const isTokenValid = isVerificationTokenValid(
        validated.contact_email,
        validated.email_verification_token
      );
      if (!isTokenValid) {
        return NextResponse.json(
          { error: 'Email verification token is invalid or has expired. Please verify your email again.' },
          { status: 403 }
        );
      }
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

    // 7. Government Registration ID Verification (GSTIN, CIN, DPIIT, UDYAM)
    // If a government ID is provided: validate authenticity. If real -> auto-approve; if fake/invalid -> reject!
    let isGovIdAutoApproved = false;
    let govIdValidationResult: ReturnType<typeof validateGovernmentRegistration> | null = null;
    let govIdVerifiedLegalName: string | null = null;

    if (
      validated.verification_proof_type &&
      validated.verification_proof_type !== 'none' &&
      validated.verification_proof_value &&
      validated.verification_proof_value.trim() !== ''
    ) {
      govIdValidationResult = validateGovernmentRegistration(
        validated.verification_proof_type as GovIdType,
        validated.verification_proof_value
      );

      // If invalid/fake Government ID: REJECT submission immediately!
      if (!govIdValidationResult.valid) {
        return NextResponse.json(
          {
            error: `Government Registration Verification Failed: ${govIdValidationResult.reason} Please check your registration number or select 'None' to submit for manual review.`,
            rejected: true,
            gov_id_type: validated.verification_proof_type,
          },
          { status: 400 }
        );
      }

      // Anti-Theft Guard 1: Prevent duplicate reuse of an already-charted company's Government ID
      const duplicateGovId = existingListings.find(
        (l) => l.verification_proof_value && l.verification_proof_value.toUpperCase() === govIdValidationResult?.normalized
      );
      if (duplicateGovId) {
        return NextResponse.json(
          {
            error: `This ${validated.verification_proof_type.toUpperCase()} (${govIdValidationResult.normalized}) is already registered to "${duplicateGovId.name}" on the Vizag Startup Map. A Government ID cannot be reused across different organizations.`,
          },
          { status: 409 }
        );
      }

      // Anti-Theft Guard 2: Domain-Bound Ownership Check
      // If someone enters a fake startup name but pastes a legitimate company's GSTIN/CIN:
      // Real founders use their company email (e.g. founder@fluentgrid.com for fluentgrid.com).
      // An impostor will use @gmail.com or an unrelated website domain.
      // Auto-approval is granted ONLY if the email domain matches the official corporate website.
      // Otherwise, the submission is routed to Admin Review Queue with an identity flag.
      if (domainMatched) {
        isGovIdAutoApproved = true;
      }

      // 7b. Live Government Registry Name-Matching (GSTIN only, when API key is configured)
      // This checks the actual registered legal/trade name against the submitted company name.
      // If the name does NOT match the government record → reject immediately (name theft prevention).
      // If the GSTIN is not found (quota exceeded / API down) → graceful degradation, proceed.
      if (isGovIdAutoApproved && validated.verification_proof_type === 'gstin' && process.env.GSTIN_API_KEY) {
        const registryResult = await lookupGSTINFromRegistry(govIdValidationResult.normalized);

        if (registryResult) {
          // Check if the GSTIN is Active in government records
          const statusLower = registryResult.status?.toLowerCase() ?? '';
          if (statusLower !== 'active' && statusLower !== 'act') {
            return NextResponse.json(
              {
                error: `This GSTIN has status "${registryResult.status}" in government records. Only active GST registrations are eligible for instant approval. Please use an active GSTIN or select "None" for manual review.`,
                rejected: true,
                gov_registry_status: registryResult.status,
              },
              { status: 400 }
            );
          }

          // Compare submitted company name against government-registered names
          const nameMatch = isStartupNameMatchingGovRecord(
            validated.name,
            registryResult.legal_name,
            registryResult.trade_name
          );

          if (!nameMatch.matched) {
            return NextResponse.json(
              {
                error: `Company name mismatch: "${validated.name}" does not match the government-registered name "${registryResult.legal_name}"${registryResult.trade_name ? ` (trade name: "${registryResult.trade_name}")` : ''} for this GSTIN. Please submit with the exact registered company name, or select "None" to submit for manual review.`,
                rejected: true,
                gov_legal_name: registryResult.legal_name,
                gov_trade_name: registryResult.trade_name,
              },
              { status: 400 }
            );
          }

          // Store verified legal name for the response
          govIdVerifiedLegalName = registryResult.legal_name;
        }
        // If registryResult is null (API unavailable / quota exhausted), proceed with
        // algorithmic-only approval (graceful degradation — better than blocking real founders)
      }
    }

    // Calculate Trust & Verification Score (0 to 100) for Admin insight
    let verificationScore = isGovIdAutoApproved ? 100 : (govIdValidationResult?.valid ? 75 : 20);
    if (!isGovIdAutoApproved) {
      if (validated.email_verification_token) {
        verificationScore += 30;
      }
      if (validated.website_verified) {
        verificationScore += 15;
      }
      if (domainMatched) {
        verificationScore += 15;
      }
      if (validated.founder_linkedin && validated.founder_linkedin.includes('linkedin.com')) {
        verificationScore += 10;
      }
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
        verification_proof_type: (validated.verification_proof_type as 'dpiit' | 'cin' | 'gstin' | 'udyam') || null,
        verification_proof_value: govIdValidationResult ? govIdValidationResult.normalized : (validated.verification_proof_value || null),
        verification_details: {
          ip,
          verified_at: new Date().toISOString(),
          pincode: validated.pincode,
          domain_matched: domainMatched,
          is_gov_id_verified: isGovIdAutoApproved,
          is_gov_id_format_valid: !!govIdValidationResult?.valid,
          gov_id_details: govIdValidationResult?.details || null,
          domain_mismatch_flag: !!(govIdValidationResult?.valid && !domainMatched),
        },
      }
    );

    // Auto-approve if government registration is verified AND submitter owns the corporate domain!
    if (isGovIdAutoApproved) {
      await approveSubmission(result.id);
      return NextResponse.json({
        success: true,
        auto_approved: true,
        message: `Government Registration (${(validated.verification_proof_type || '').toUpperCase()}) & Corporate Domain verified! Your startup has been auto-approved and published to the live map.`,
        id: result.id,
        slug: listingData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        verification_score: 100,
        domain_matched: domainMatched,
        gov_id_type: validated.verification_proof_type,
        gov_id_number: govIdValidationResult?.normalized,
        gov_legal_name: govIdVerifiedLegalName || null,
      });
    }

    const isGovIdFlaggedForReview = !!(govIdValidationResult?.valid && !domainMatched);

    return NextResponse.json({
      success: true,
      auto_approved: false,
      message: isGovIdFlaggedForReview
        ? `Government ID format verified. Because your contact email does not match the company's official domain, your submission is routed to the Admin Review Queue to prevent unauthorized ID usage.`
        : `Verified submission received! Verification Trust Score: ${verificationScore}/100. Pending review in Admin queue.`,
      id: result.id,
      verification_score: verificationScore,
      domain_matched: domainMatched,
      gov_id_flagged_for_review: isGovIdFlaggedForReview,
    });
  } catch (err: unknown) {
    console.error('[submit error]:', err);
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: firstIssue, details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (err as Error)?.message || 'An unexpected error occurred while processing your submission.' },
      { status: 500 }
    );
  }
}
