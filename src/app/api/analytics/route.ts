import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent, getListingAnalytics } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const stats = await getListingAnalytics(listingId);
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, event } = body;

    if (!listingId || (event !== 'view' && event !== 'website_click')) {
      return NextResponse.json(
        { error: 'Valid listingId and event ("view" | "website_click") required' },
        { status: 400 }
      );
    }

    await recordAnalyticsEvent(listingId, event);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
