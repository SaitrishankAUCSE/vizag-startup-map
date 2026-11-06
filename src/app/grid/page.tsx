import React from 'react';
import { Metadata } from 'next';
import { getListings, getJobs } from '@/lib/data';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { BlurHeadline } from '@/components/ui/BlurHeadline';
import { GridDirectoryClient } from './GridDirectoryClient';

export const metadata: Metadata = {
  title: 'Startup Directory & Grid | Vizag Startup Map',
  description:
    'Complete catalog of startups, tech companies, venture funds, incubators, and coworking spaces across Visakhapatnam.',
};

export const revalidate = 300;

export default async function GridPage() {
  const [listings, jobs] = await Promise.all([getListings(), getJobs()]);

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-7xl w-full mx-auto">
        {/* Background Vertical Strips */}
        <Strips animate={false} />

        {/* Hero Section */}
        <div className="relative z-10 max-w-3xl mb-10">
          <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-3">
            VIZAG ECOSYSTEM DIRECTORY · GRID VIEW
          </div>

          <BlurHeadline
            lines={['Every Startup,', 'Workspace & Lab,', 'Catalogued.']}
            mixedCase={true}
          />

          <p className="mt-4 text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed max-w-xl">
            Browse, filter, and discover all {listings.length} verified startups, incubators, campuses, and coworking hubs powering Visakhapatnam&apos;s coastline.
          </p>
        </div>

        {/* Interactive Directory Grid */}
        <div className="relative z-10">
          <GridDirectoryClient initialListings={listings} jobs={jobs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
