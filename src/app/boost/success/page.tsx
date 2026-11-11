'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Briefcase,
  Share2,
  CheckCircle2,
  Compass,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';

function BoostSuccessContent() {
  const searchParams = useSearchParams();
  const startupParam = searchParams.get('startup') || 'Your Startup';
  const areaParam = searchParams.get('area') || 'Visakhapatnam';
  const refParam = searchParams.get('ref') || 'VSM-SPOTLIGHT';

  return (
    <div className="w-full space-y-8">
      {/* ── Top Status Pill & Hero Header ── */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#3A0F34]/15 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EAAA00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAAA00]/20 border border-[#EAAA00]/40 text-[#3A0F34] text-[11px] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#3A0F34] fill-current" />
              <span>7-Day Priority Spotlight Confirmed</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#3A0F34] tracking-tight leading-[1.08]">
              {startupParam} is Now Spotlighted on the Map!
            </h1>
            <p className="text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed font-medium">
              Your venture has received elevated priority prominence across the Vizag Startup Map with radar illumination, 2× pin dimensions, and unclustered visibility for founders, talent, and investors.
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#3A0F34]/10">
            <div className="text-left md:text-right">
              <span className="block text-[10px] font-bold text-[#3A0F34]/60 uppercase tracking-wider">Reference Code</span>
              <span className="font-mono text-xs font-extrabold text-[#3A0F34] bg-white border border-[#3A0F34]/15 px-2.5 py-1 rounded-md shadow-2xs">
                {refParam}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Free Community Tier
            </span>
          </div>
        </div>
      </div>

      {/* ── 3-Column Feature Matrix: What is Active Right Now ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#3A0F34]/30 transition-colors">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h2 className="font-display font-bold text-base text-[#3A0F34]">
              Radar Illumination & 2× Dimensions
            </h2>
            <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
              An animated amber pulse ring continuously illuminates your company’s pin, distinguishing it from surrounding standard markers across both desktop and mobile views.
            </p>
          </div>
          <div className="pt-2 border-t border-[#3A0F34]/10 text-[11px] font-bold text-[#3A0F34]/60 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active for 7 full days</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#3A0F34]/30 transition-colors">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <h2 className="font-display font-bold text-base text-[#3A0F34]">
              Unclustered Map Priority
            </h2>
            <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
              When users zoom out to view the entire coastline from Rushikonda to Gajuwaka, your pin remains rendered independently instead of being grouped into numeric cluster bubbles.
            </p>
          </div>
          <div className="pt-2 border-t border-[#3A0F34]/10 text-[11px] font-bold text-[#3A0F34]/60 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Permanent individual marker</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#3A0F34]/30 transition-colors">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3A0F34] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-base text-[#3A0F34]">
              Top Search & Filter Placement
            </h2>
            <p className="text-xs text-[#3A0F34]/75 leading-relaxed">
              When candidates search for tech opportunities or filter by sector, your venture is pinned at the top of the search dropdown with a verified spotlight badge.
            </p>
          </div>
          <div className="pt-2 border-t border-[#3A0F34]/10 text-[11px] font-bold text-[#3A0F34]/60 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Search algorithm priority</span>
          </div>
        </div>
      </div>

      {/* ── What Happens Next & Community Pledge ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Next Steps (7 cols) */}
        <div className="lg:col-span-7 bg-[#3A0F34] text-[#DDE3E8] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EAAA00]">
              Lifecycle & Next Milestones
            </span>
            <h2 className="font-display font-extrabold text-2xl text-[#DDE3E8]">
              What happens next?
            </h2>
            <p className="text-xs sm:text-sm text-[#DDE3E8]/80 leading-relaxed">
              Your spotlight activation has been propagated instantly to our edge cache. Here is how your company is shared with the community:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EAAA00] text-[#3A0F34] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Live Edge Propagation</h3>
                <p className="text-[11px] text-[#DDE3E8]/70">Your boosted pin is now visible to all live visitors browsing the interactive city map.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EAAA00] text-[#3A0F34] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Morning Digest Feature</h3>
                <p className="text-[11px] text-[#DDE3E8]/70">Your venture will be included in the daily community dispatch sent to subscribed founders, engineers, and tech executives.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EAAA00] text-[#3A0F34] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Direct Open Role Routing</h3>
                <p className="text-[11px] text-[#DDE3E8]/70">Any job openings linked to your startup receive direct routing on the Vizag Tech Careers board.</p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#EAAA00] text-[#3A0F34] font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md"
            >
              <Compass className="w-4 h-4" />
              <span>Explore On Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 text-[#DDE3E8] hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Briefcase className="w-4 h-4 text-[#EAAA00]" />
              <span>View Tech Careers</span>
            </Link>
          </div>
        </div>

        {/* Community Good & Pledge (5 cols) */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-md border border-[#3A0F34]/15 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A0F34]/8 text-[#3A0F34] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-[#3A0F34]" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#3A0F34]">
              100% Free Public Good
            </h2>
            <p className="text-xs text-[#3A0F34]/80 leading-relaxed">
              Vizag Startup Map is built without paywalls, subscriptions, or merchant fees. Every feature—from listing your venture to activating priority spotlights—is completely free for our city’s founders.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Selected Area</span>
              <strong className="text-zinc-900">{areaParam}</strong>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Spotlight Duration</span>
              <strong className="text-zinc-900">7 Days</strong>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Platform Fee</span>
              <strong className="text-emerald-700 font-extrabold">₹0 (Free Forever)</strong>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#3A0F34]/25 text-[#3A0F34] hover:bg-[#3A0F34]/10 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Submit Another Listing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoostSuccessPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative py-8 sm:py-12 lg:py-16 px-4 md:px-8 max-w-6xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="w-full py-20 text-center text-sm font-bold text-[#3A0F34]/60">
                Loading spotlight confirmation...
              </div>
            }
          >
            <BoostSuccessContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
