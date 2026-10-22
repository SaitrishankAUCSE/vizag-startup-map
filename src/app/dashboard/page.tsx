import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getListings, getActiveJobs } from '@/lib/supabase/service';
import { ArrowLeft, Sparkles, Building, Briefcase, BarChart3, CheckCircle2 } from 'lucide-react';
import { FounderDashboardClient } from './FounderDashboardClient';

export const metadata: Metadata = {
  title: 'Founder Dashboard | Vizag Startup Map',
  description:
    'Manage your Visakhapatnam startup profile, post open engineering roles, view profile analytics, and claim your organization.',
};

export default async function DashboardPage() {
  const [listings, jobs] = await Promise.all([
    getListings(),
    getActiveJobs(),
  ]);

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
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-gray-950 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span>Featured Listing (₹999/mo)</span>
          </Link>
        </div>
      </header>

      {/* Main Dashboard Client */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        <FounderDashboardClient listings={listings} initialJobs={jobs} />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#E6E0D4] bg-white text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Vizag Startup Map. Built for the Andhra Pradesh tech ecosystem.</p>
      </footer>
    </div>
  );
}
