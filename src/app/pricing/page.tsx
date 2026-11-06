import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { Flower } from '@/components/ui/Flower';
import { PricingClient } from './PricingClient';
import { COPY } from '@/content/copy';

export const metadata: Metadata = {
  title: 'Pricing & Passes | Vizag Startup Map',
  description:
    'Free Community Access, Pro for Researchers & Talent (₹199/mo), and Featured Listing for Startups in Visakhapatnam.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-14 lg:py-20 px-4 md:px-8 max-w-6xl w-full mx-auto">
        <Strips animate={false} />

        {/* Botanical Lily in corner */}
        <div className="absolute right-[-40px] top-[40px] w-[260px] lg:w-[360px] h-[340px] lg:h-[460px] pointer-events-none z-0 opacity-35">
          <Flower />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-4">
            ECOSYSTEM ACCESS & PLANS
          </div>
          <h1 className="font-display font-extrabold uppercase text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-none text-[#3A0F34]">
            {COPY.pricing.headline}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed">
            {COPY.pricing.subheadline} The interactive directory and map will always remain 100% free for everyone.
          </p>
        </div>

        <div className="relative z-10">
          <PricingClient />
        </div>
      </main>

      <Footer />
    </div>
  );
}
