import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { COPY } from '@/content/copy';
import { getNewsItems } from '@/lib/firebase/service';
import { Newspaper, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News & Dispatches | Vizag Startup Map',
  description: 'Verified headlines, venture rounds, and ecosystem announcements in Visakhapatnam.',
};

export const revalidate = 300; // Cache 5 min

export default async function NewsPage() {
  const newsItems = await getNewsItems();

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-14 lg:py-20 px-6 lg:px-12">
        <Strips animate={false} />

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34]/70">
              DISPATCHES & ANNOUNCEMENTS
            </span>
            <h1 className="font-display font-extrabold uppercase text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-tight text-[#3A0F34] mt-2">
              {COPY.news.title}
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#3A0F34]/80 mt-2">
              Verified news from YourStory, Inc42, and Entrackr mentioning Visakhapatnam, Andhra Pradesh, and approved startups.
            </p>
          </div>

          {newsItems.length === 0 ? (
            <div className="rounded-2xl border border-[#3A0F34]/15 bg-white/40 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#3A0F34]/10 text-[#3A0F34] flex items-center justify-center mx-auto">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#3A0F34]">
                No News Dispatches Yet
              </h3>
              <p className="text-xs text-[#3A0F34]/70 max-w-sm mx-auto">
                Our hourly news workflow automatically scans official tech RSS feeds for Visakhapatnam ecosystem announcements. Check back soon!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#3A0F34]/15 border-y border-[#3A0F34]/15">
              {newsItems.map((article, idx) => {
                const dateStr = article.published_at || article.pubDate;
                const formattedDate = dateStr
                  ? new Date(dateStr).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <article key={article.id || idx} className="py-6 group transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-[0.14em] text-[#EAAA00] bg-[#3A0F34] px-2 py-0.5 rounded-full uppercase">
                          {article.matched_keyword || 'ECOSYSTEM'}
                        </span>
                        <span className="text-xs font-semibold text-[#3A0F34]/60">
                          {formattedDate}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#3A0F34]/60">
                        {article.source_name || article.source || 'Verified Source'}
                      </span>
                    </div>

                    <a
                      href={article.url || article.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display font-bold text-xl sm:text-2xl text-[#3A0F34] group-hover:text-[#3A0F34]/75 transition-colors flex items-center gap-2 leading-snug"
                    >
                      <span>{article.title}</span>
                      <ExternalLink className="w-4 h-4 opacity-50 shrink-0 group-hover:opacity-100" />
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
