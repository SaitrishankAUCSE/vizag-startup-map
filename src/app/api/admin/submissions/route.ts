import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/firebase/service';
import { verifyAdminRequest } from '@/lib/verification/adminAuth';

export async function GET(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized: Admin passkey required' }, { status: 401 });
  }

  try {
    const submissions = await getSubmissions();
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
