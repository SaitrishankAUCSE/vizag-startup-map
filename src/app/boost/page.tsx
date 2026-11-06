import React from 'react';
import { Metadata } from 'next';
import { getListings } from '@/lib/data';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { BoostClient } from './BoostClient';

export const metadata: Metadata = {
  title: 'Boost Your Startup – 7-Day Priority Placement | Vizag Startup Map',
  description:
    'Elevate your venture on the interactive Vizag Startup Map. 7-Day priority listing with illuminated radar halo, unclustered presence, and top-of-list search visibility.',
};

export default async function BoostPage() {
  const listings = await getListings();

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <Strips animate={false} />
        <div className="relative z-10">
          <BoostClient listings={listings} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
