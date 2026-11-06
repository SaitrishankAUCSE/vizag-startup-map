'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';

export default function BoostSuccessPage() {
  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-16 px-4 md:px-8 max-w-2xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 bg-[#3A0F34] text-[#DDE3E8] rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          {/* Animated Badge */}
          <div className="relative inline-flex items-center justify-center">
            <span className="absolute w-20 h-20 rounded-full border-2 border-[#EAAA00]/40 animate-ping pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 fill-current" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EAAA00] bg-white/10 px-3 py-1 rounded-full">
              7-Day Spotlight Activated
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#DDE3E8]">
              Your Startup is Now Boosted!
            </h1>
            <p className="text-xs sm:text-sm text-[#DDE3E8]/80 max-w-md mx-auto leading-relaxed">
              Your company has received elevated priority prominence across the Vizag Startup Map with radar illumination, 2x pin dimensions, and unclustered visibility.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 text-left pt-2 pb-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EAAA00] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2x Marker Dimensions</span>
              </div>
              <p className="text-[11px] text-[#DDE3E8]/70">
                Stands out prominently across all city zoom levels.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EAAA00] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Unclustered Priority</span>
              </div>
              <p className="text-[11px] text-[#DDE3E8]/70">
                Remains an individual marker; never collapsed into clusters.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#EAAA00] text-[#3A0F34] hover:bg-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <span>View Live on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-[#DDE3E8]/25 text-[#DDE3E8] hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Founder Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

