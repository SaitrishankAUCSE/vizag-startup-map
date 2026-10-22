import { NextResponse } from 'next/server';
import { NewsItem } from '@/types';

// Fallback curated news items when offline or external RSS is slow
const FALLBACK_NEWS: NewsItem[] = [
  {
    title: 'Andhra Pradesh MedTech Zone (AMTZ) in Vizag expands global medical manufacturing corridor',
    link: 'https://news.google.com/search?q=AMTZ+Visakhapatnam',
    pubDate: 'Today',
    source: 'The Hindu',
  },
  {
    title: 'Rushikonda IT SEZ sees surge in tech exports and AI development hubs',
    link: 'https://news.google.com/search?q=Rushikonda+IT+Vizag',
    pubDate: 'Yesterday',
    source: 'Times of India',
  },
  {
    title: 'Visakhapatnam Port automation and maritime logistics tech startups gain venture momentum',
    link: 'https://news.google.com/search?q=Visakhapatnam+port+startups',
    pubDate: '2 days ago',
    source: 'Economic Times',
  },
  {
    title: 'GITAM Venture Development Centre launches coastal entrepreneurship cohort for student founders',
    link: 'https://news.google.com/search?q=GITAM+venture+development',
    pubDate: '3 days ago',
    source: 'Deccan Chronicle',
  },
];

export async function GET() {
  try {
    const rssUrl =
      'https://news.google.com/rss/search?q=Visakhapatnam+startup+OR+Vizag+tech+OR+Andhra+Pradesh+innovation&hl=en-IN&gl=IN&ceid=IN:en';

    const res = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // 1-hour cache as specified
      headers: {
        'User-Agent': 'VizagStartupMap/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { news: FALLBACK_NEWS },
        { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
      );
    }

    const xmlText = await res.text();

    // Simple robust regex extraction of items from XML without bulky external XML parsers
    const items: NewsItem[] = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/gi;
    const matches = xmlText.match(itemRegex) || [];

    for (const match of matches.slice(0, 6)) {
      const titleMatch = match.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = match.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = match.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const sourceMatch = match.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (titleMatch && linkMatch) {
        let title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const link = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'News';
        const pubDateRaw = pubDateMatch ? pubDateMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';

        // Clean trailing source from Google News title (e.g., "Title - Source")
        if (title.includes(' - ')) {
          title = title.split(' - ').slice(0, -1).join(' - ');
        }

        const date = pubDateRaw ? new Date(pubDateRaw).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent';

        items.push({
          title,
          link,
          pubDate: date,
          source,
        });
      }
    }

    const finalNews = items.length > 0 ? items : FALLBACK_NEWS;

    return NextResponse.json(
      { news: finalNews },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch {
    return NextResponse.json(
      { news: FALLBACK_NEWS },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  }
}
