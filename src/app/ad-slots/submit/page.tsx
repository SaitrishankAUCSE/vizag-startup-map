import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdSlotsClient } from './AdSlotsClient';

export const metadata: Metadata = {
  title: 'Reserve a Coastal Showcase | Vizag Startup Map',
  description:
    'Curated 7-day prominent placement on the interactive directory and live map. 7-day windows run Monday through Monday.',
};

export default function AdSlotsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#DDE3E8] flex items-center justify-center font-sans text-xs text-[#3A0F34]">
          Loading Coastal Showcase...
        </div>
      }
    >
      <AdSlotsClient />
    </Suspense>
  );
}
