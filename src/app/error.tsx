'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { CartoonButton } from '@/components/ui/cartoon-button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-24 px-6 flex items-center justify-center text-center">
        <Strips animate={false} />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-red-100 text-red-700 border border-red-300">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="font-sans font-bold text-xs uppercase tracking-[0.25em] text-[#3A0F34]/60">
              UNEXPECTED ROADBLOCK
            </span>
            <h1 className="font-display font-extrabold uppercase text-4xl sm:text-6xl tracking-[-0.03em] leading-none text-[#3A0F34] mt-2">
              Something went off course.
            </h1>
          </div>

          <p className="font-sans text-sm sm:text-base text-[#3A0F34]/80 max-w-md mx-auto">
            We encountered a temporary disruption loading this section of the Vizag ecosystem.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <CartoonButton
              label="Try Again"
              variant="marigold"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => reset()}
            />
            <CartoonButton
              label="Return to Map"
              variant="aubergine"
              size="md"
              href="/"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
