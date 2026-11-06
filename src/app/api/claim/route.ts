import { NextRequest, NextResponse } from 'next/server';
import { createClaim, getClaims, getAdminFirestore } from '@/lib/firebase/service';
import { z } from 'zod';

const claimSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  founderName: z.string().min(2, 'Founder name must be at least 2 characters'),
  workEmail: z.string().email('Please enter a valid company work email'),
  proofUrl: z.string().min(3, 'Proof URL or description is required'),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const claims = await getClaims();
    return NextResponse.json({ claims });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch claims';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = claimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid claim submission' },
        { status: 400 }
      );
    }

    const { listingId, workEmail } = parsed.data;

    // Fetch listing to verify domain match
    const { getListingById } = await import('@/lib/firebase/service');
    const listing = await getListingById(listingId);
    let method: 'domain_match' | 'admin_verification' = 'admin_verification';

    if (listing && listing.website) {
      try {
        const listingHost = new URL(
          listing.website.startsWith('http') ? listing.website : `https://${listing.website}`
        ).hostname.replace(/^www\./i, '').toLowerCase();
        const emailDomain = workEmail.split('@')[1]?.toLowerCase().trim();

        if (emailDomain && (emailDomain === listingHost || listingHost.endsWith(`.${emailDomain}`) || emailDomain.endsWith(`.${listingHost}`))) {
          method = 'domain_match';
        }
      } catch {}
    }

    const result = await createClaim(listingId, 'claimed_user', workEmail, method);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to submit claim' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        autoApproved: method === 'domain_match',
        message:
          method === 'domain_match'
            ? 'Work email verified against company domain! Listing ownership confirmed.'
            : 'Claim submitted for admin verification.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimId } = body;

    if (!claimId) {
      return NextResponse.json({ error: 'claimId is required' }, { status: 400 });
    }

    // Approve claim: update status to approved in Firestore
    const db = getAdminFirestore();
    if (db) {
      await db.collection('claims').doc(claimId).update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve claim';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
