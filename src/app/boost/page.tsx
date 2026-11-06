import React from 'react';
import { Metadata } from 'next';
import { getListings } from '@/lib/data';
import { BoostClient } from './BoostClient';

export const metadata: Metadata = {
  title: 'Boost Your Startup – Priority Placement | Vizag Startup Map',
  description:
    'Acquire elevated prominence on the interactive Vizag Startup Map. 7-Day priority listing with radar illumination and unclustered pin presence.',
};

export default async function BoostPage() {
  const listings = await getListings();

  return (
    <main className="min-h-screen w-full bg-[#DDE3E8] text-[#3A0F34] font-sans px-6 flex flex-col justify-between selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <BoostClient listings={listings} />
    </main>
  );
}
