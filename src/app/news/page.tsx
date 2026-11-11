import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { fetchWorldTechNews } from '@/lib/news/techNews';
import { NewsDirectoryClient } from './NewsDirectoryClient';

export const metadata: Metadata = {
  title: 'Global Tech & Software News | Vizag Startup Map',
  description:
    'Live hourly news from around the world covering software development, AI, cloud infrastructure, cybersecurity, and tech innovations.',
};

export const revalidate = 3600; // Hourly cache

export default async function NewsPage() {
  const newsItems = await fetchWorldTechNews();

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative py-10 lg:py-16 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <Strips animate={false} />

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-3">
              LIVE HOURLY TECH DISPATCHES
            </div>

            <h1 className="font-display font-extrabold uppercase text-3xl sm:text-4xl lg:text-5xl tracking-[-0.03em] leading-tight text-[#3A0F34]">
              World Tech & Software News
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#3A0F34]/80 mt-2 max-w-2xl leading-relaxed">
              Curated everyday, updated every hour. Global reporting on AI breakthroughs, developer tools, cloud infrastructure, cybersecurity, and modern software engineering.
            </p>
          </div>

          <NewsDirectoryClient initialNews={newsItems} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
