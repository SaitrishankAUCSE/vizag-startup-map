import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, User, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { AccountClient } from './AccountClient';

export const metadata: Metadata = {
  title: 'My Account & Subscriptions | Vizag Startup Map',
  description:
    'Manage your Vizag Startup Map account, subscription plan, billing details, and active directory listings.',
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-[#0E4D64] text-white px-4 md:px-8 flex items-center justify-between border-b border-[#093345] shadow-xs">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-teal-100 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Interactive Map</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-teal-100 hover:text-white transition-colors"
          >
            Founder Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-10">
        <AccountClient />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#E6E0D4] bg-white text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Vizag Startup Map. Built for the Andhra Pradesh tech ecosystem.</p>
      </footer>
    </div>
  );
}
