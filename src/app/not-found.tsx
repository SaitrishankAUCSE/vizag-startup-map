import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { Button } from '@/components/ui/Button';
import { COPY } from '@/content/copy';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-24 px-6 flex items-center justify-center text-center">
        <Strips animate={false} />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <span className="font-sans font-bold text-xs uppercase tracking-[0.25em] text-[#3A0F34]/60">
            ERROR 404 • UNCHARTED TERRITORY
          </span>

          <h1 className="font-display font-extrabold uppercase text-5xl sm:text-7xl tracking-[-0.03em] leading-none text-[#3A0F34]">
            {COPY.notFound.headline}
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#3A0F34]/80 max-w-md mx-auto">
            {COPY.notFound.subtext}
          </p>

          <div className="pt-4">
            <Link href="/">
              <Button variant="primary">{COPY.notFound.button}</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
