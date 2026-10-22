import React, { Suspense } from 'react';
import { getListings, getJobs, getEcosystemStats } from '@/lib/data';
import { MapDirectoryView } from '@/components/directory/MapDirectoryView';

export const metadata = {
  title: 'Vizag Startup Map | Visakhapatnam Startup & Tech Ecosystem',
  description:
    'Every startup, investor, campus, and workspace in Visakhapatnam on one living map.',
};

export default async function HomePage() {
  const [listings, jobs, stats] = await Promise.all([
    getListings(),
    getJobs(),
    getEcosystemStats(),
  ]);

  const hasSampleData = listings.some((l) => l.name.startsWith('Sample'));

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#DDE3E8]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#3A0F34] border-t-[#EAAA00] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3A0F34]">
              Loading Vizag Startup Map...
            </p>
          </div>
        </div>
      }
    >
      <MapDirectoryView
        initialListings={listings}
        initialJobs={jobs}
        ecosystemStats={stats}
        hasSampleData={hasSampleData}
      />
    </Suspense>
  );
}
