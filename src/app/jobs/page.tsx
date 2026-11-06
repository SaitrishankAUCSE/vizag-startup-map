import React from 'react';
import { Metadata } from 'next';
import { getJobs, getListings } from '@/lib/data';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { BlurHeadline } from '@/components/ui/BlurHeadline';
import { JobsDirectoryClient } from './JobsDirectoryClient';

export const metadata: Metadata = {
  title: 'Startup Jobs in Visakhapatnam | Tech Careers & Open Roles',
  description:
    'Discover open engineering, product, marketing, and design roles at high-growth startups and tech labs across Visakhapatnam.',
};

export const revalidate = 300;

export default async function JobsPage() {
  const [jobs, listings] = await Promise.all([getJobs(), getListings()]);

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-7xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 max-w-3xl mb-10">
          <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-3">
            VIZAG TECH TALENT & CAREERS
          </div>

          <BlurHeadline
            lines={['Startup Roles,', 'By the Bay.']}
            mixedCase={true}
          />

          <p className="mt-4 text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed max-w-xl">
            {jobs.length} active opportunities across engineering, product, design, and growth at Visakhapatnam ventures.
          </p>
        </div>

        <div className="relative z-10">
          <JobsDirectoryClient initialJobs={jobs} totalListingsCount={listings.length} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
