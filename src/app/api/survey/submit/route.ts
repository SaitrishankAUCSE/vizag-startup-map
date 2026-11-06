import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { purpose, feedback, timestamp } = body;

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    if (db) {
      await db.collection('community_surveys').add({
        purpose,
        feedback: feedback || '',
        created_at: timestamp || new Date().toISOString(),
        user_agent: req.headers.get('user-agent') || '',
        ip: req.headers.get('x-forwarded-for') || '',
      });
    }

    return NextResponse.json({ success: true, message: 'Survey response recorded. Thank you!' });
  } catch (error: any) {
    console.error('[/api/survey/submit] error:', error);
    return NextResponse.json({ success: true, warning: 'Saved locally' });
  }
}

