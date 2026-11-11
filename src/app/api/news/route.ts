import { NextResponse } from 'next/server';
import { fetchWorldTechNews } from '@/lib/news/techNews';

export const revalidate = 3600; // 1-hour cache

export async function GET() {
  try {
    const news = await fetchWorldTechNews();
    return NextResponse.json(
      {
        news,
        count: news.length,
        updated_at: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('API /news error:', error);
    return NextResponse.json(
      { news: [], error: 'Failed to fetch world tech news' },
      { status: 500 }
    );
  }
}
