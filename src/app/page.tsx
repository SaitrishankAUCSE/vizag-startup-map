import React, { Suspense } from 'react';
import { getListings, getActiveJobs } from '@/lib/supabase/service';
import { MapDirectoryView } from '@/components/directory/MapDirectoryView';


export default async function HomePage() {
  const [listings, jobs] = await Promise.all([
    getListings(),
    getActiveJobs(),
  ]);

  const hasSampleData = listings.some((l) => l.name.startsWith('Sample'));

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#FBF9F5]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0E4D64] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#0E4D64] tracking-wide">
              Loading Vizag Startup Map...
            </p>
          </div>
        </div>
      }
    >
      <MapDirectoryView
        initialListings={listings}
        initialJobs={jobs}
        hasSampleData={hasSampleData}
      />
    </Suspense>
  );
}
