import { NextRequest, NextResponse } from 'next/server';
import { createClaim, getClaims, approveClaim } from '@/lib/supabase/service';
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

    const { listingId, founderName, workEmail, proofUrl, notes } = parsed.data;
    const result = await createClaim(listingId, founderName, workEmail, proofUrl, notes);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to submit claim' }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
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

    const ok = await approveClaim(claimId);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve claim';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
