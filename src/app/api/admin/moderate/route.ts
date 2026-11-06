import { NextRequest, NextResponse } from 'next/server';
import {
  updateListingStatus,
  updateListingPin,
  approveSubmission,
  getAdminFirestore,
} from '@/lib/firebase/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, listingId, submissionId, lat, lng, listingIds } = body;

    if (action === 'bulk_approve') {
      if (!Array.isArray(listingIds) || listingIds.length === 0) {
        return NextResponse.json({ error: 'No listing IDs provided for bulk approval' }, { status: 400 });
      }

      let count = 0;
      for (const id of listingIds) {
        const ok = await updateListingStatus(id, 'approved');
        if (ok) count++;
      }
      return NextResponse.json({ success: true, count, message: `Approved ${count} listings` });
    }

    if (action === 'update_pin') {
      if (!listingId || lat === undefined || lng === undefined) {
        return NextResponse.json({ error: 'listingId, lat, and lng are required' }, { status: 400 });
      }
      const ok = await updateListingPin(listingId, Number(lat), Number(lng));
      if (ok) {
        // Also update status to pending if it was needs_review
        await updateListingStatus(listingId, 'pending');
      }
      return NextResponse.json({ success: ok });
    }

    if (action === 'approve_submission' && submissionId) {
      const ok = await approveSubmission(submissionId);
      return NextResponse.json({ success: ok, message: 'Submission approved and published' });
    }

    if (action === 'approve' && listingId) {
      const ok = await updateListingStatus(listingId, 'approved');
      return NextResponse.json({ success: ok, message: 'Listing approved' });
    }

    if (action === 'reject' && listingId) {
      const ok = await updateListingStatus(listingId, 'rejected');
      return NextResponse.json({ success: ok, message: 'Listing rejected' });
    }

    if (action === 'mark_duplicate' && listingId) {
      const ok = await updateListingStatus(listingId, 'rejected');
      return NextResponse.json({ success: ok, message: 'Listing marked as duplicate' });
    }

    return NextResponse.json({ error: 'Unknown moderation action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Moderation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
