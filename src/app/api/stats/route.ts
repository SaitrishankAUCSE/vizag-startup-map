import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/firebase/service';

// Cache for 5 minutes (300 seconds) with stale-while-revalidate
export const revalidate = 300;

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch public stats' },
      { status: 500 }
    );
  }
}
