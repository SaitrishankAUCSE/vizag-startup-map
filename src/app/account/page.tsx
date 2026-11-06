import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { AccountClient } from './AccountClient';

export const metadata: Metadata = {
  title: 'My Account & Subscriptions | Vizag Startup Map',
  description:
    'Manage your Vizag Startup Map account, subscription plan, billing details, and active directory listings.',
};

export const dynamic = 'force-static';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-4xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8] text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34]">
              ECOSYSTEM PASS
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#3A0F34]">
              Account & Subscription
            </h1>
            <p className="text-xs sm:text-sm text-[#3A0F34]/75 max-w-xl">
              Manage your Pro Researcher pass, boosted company listings, and account preferences.
            </p>
          </div>

          <AccountClient />
        </div>
      </main>

      <Footer />
    </div>
  );
}
