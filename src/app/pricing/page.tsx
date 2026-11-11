import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { Flower } from '@/components/ui/Flower';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = {
  title: 'Free Community Access | Vizag Startup Map',
  description:
    'Vizag Startup Map is completely free and open for founders, talent, and investors in Visakhapatnam. Zero paywalls, zero subscription fees.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative py-14 lg:py-20 px-4 md:px-8 max-w-6xl w-full mx-auto">
        <Strips animate={false} />

        {/* Botanical Lily in corner */}
        <div className="absolute right-[-40px] top-[40px] w-[260px] lg:w-[360px] h-[340px] lg:h-[460px] pointer-events-none z-0 opacity-35">
          <Flower />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-4">
            100% FREE COMMUNITY PLATFORM
          </div>
          <h1 className="font-display font-extrabold uppercase text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-none text-[#3A0F34]">
            Every Feature. Zero Fees. Built For Vizag.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed">
            The interactive directory, tech job board, and spatial map are 100% free and open for everyone. No credit card or subscription required.
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
