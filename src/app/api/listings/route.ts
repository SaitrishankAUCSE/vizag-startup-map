import { NextRequest, NextResponse } from 'next/server';
import { getListings, getAllListings } from '@/lib/firebase/service';
import { ListingStatus } from '@/types';

// Cache approved public listings for 5 minutes (Spark plan protection)
export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    if (statusParam && (statusParam === 'all' || statusParam === 'pending' || statusParam === 'needs_review')) {
      // Admin request for moderation queue
      const listings = await getAllListings(statusParam as ListingStatus | 'all');
      return NextResponse.json({ listings });
    }

    // Default: return approved listings
    const listings = await getListings();
    return NextResponse.json(
      { listings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
