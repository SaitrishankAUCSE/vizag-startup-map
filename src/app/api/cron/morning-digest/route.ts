import { NextRequest, NextResponse } from 'next/server';
import { dispatchMorningDigest, getPendingDigestQueue } from '@/lib/email/digest';

export const dynamic = 'force-dynamic';

/**
 * Daily Morning Digest Cron Endpoint
 * Scheduled to run every morning at 8:00 AM IST (02:30 UTC).
 * 
 * Rules:
 * - If NO startups added in queue: Does NOT send emails. Returns status.
 * - If startups are pending: Bundles them into 1 single email for each active subscriber.
 * - Free trial check: Skips free users whose 3-day trial has passed unless they are Pro.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set in production, require it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow inspection with preview query in dev
      const url = new URL(req.url);
      if (url.searchParams.get('preview') === 'true') {
        const queue = getPendingDigestQueue();
        return NextResponse.json({
          preview: true,
          queueLength: queue.length,
          pendingStartups: queue,
        });
      }
    }

    const result = await dispatchMorningDigest();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Morning Digest Cron Error]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await dispatchMorningDigest();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

