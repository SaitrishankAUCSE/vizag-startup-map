import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getActiveJobs, getListings } from '@/lib/supabase/service';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Building,
  ArrowLeft,
  PlusCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { JobsDirectoryClient } from './JobsDirectoryClient';

export const metadata: Metadata = {
  title: 'Startup Jobs in Visakhapatnam (Vizag) | Tech Careers & Open Roles',
  description:
    'Discover open engineering, product, marketing, and design jobs at high-growth startups, AI labs, and tech companies across Visakhapatnam, Andhra Pradesh.',
  openGraph: {
    title: 'Startup Jobs in Visakhapatnam (Vizag) | Tech Careers',
    description:
      'Explore tech, SaaS, AI, and robotics jobs in Visakhapatnam. Direct apply links to top Vizag startups.',
    url: 'https://vizagstartupmap.com/jobs',
  },
};

export default async function JobsPage() {
  const [jobs, listings] = await Promise.all([
    getActiveJobs(),
    getListings(),
  ]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-gray-900 flex flex-col">
      {/* Top Navigation */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-300" />
            <span>Post a Job</span>
          </Link>
          <Link
            href="/submit"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E04F36] hover:bg-[#c93e27] text-white transition-all shadow-xs"
          >
            <span>Add Your Startup</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-[#0E4D64] to-[#0A394B] text-white py-10 px-4 md:px-8 border-b border-teal-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Vizag Tech Hiring Board</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Startup Jobs in Visakhapatnam
          </h1>
          <p className="mt-2 text-sm md:text-base text-teal-100/90 max-w-2xl leading-relaxed">
            Join innovative tech teams shaping AI, SaaS, deeptech, healthtech, and maritime logistics
            by the Bay of Bengal.
          </p>
        </div>
      </div>

      {/* Main Interactive Jobs Directory Client */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8">
        <JobsDirectoryClient initialJobs={jobs} totalListingsCount={listings.length} />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#E6E0D4] bg-white text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Vizag Startup Map. Built for the Andhra Pradesh tech ecosystem.</p>
      </footer>
    </div>
  );
}
