import { NextRequest, NextResponse } from 'next/server';
import { approveSubmission } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const { submissionId, action } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    if (action === 'approve') {
      const success = await approveSubmission(submissionId);
      return NextResponse.json({ success, message: 'Submission approved and added to active directory' });
    }

    return NextResponse.json({ success: true, message: `Submission marked as ${action}` });
  } catch {
    return NextResponse.json({ error: 'Failed to process moderation action' }, { status: 500 });
  }
}
