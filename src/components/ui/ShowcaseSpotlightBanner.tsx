'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Zap, Clock, ShieldCheck, X } from 'lucide-react';

export function ShowcaseSpotlightBanner() {
  const [showcase, setShowcase] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function loadActive() {
      try {
        const res = await fetch('/api/ad-slots/active');
        if (res.ok) {
          const data = await res.json();
          if (data.activeShowcase) {
            setShowcase(data.activeShowcase);
          }
        }
      } catch {}
    }
    loadActive();
  }, []);

  if (!showcase || dismissed) return null;

  const isBeacon = showcase.slot_type?.includes('FLASH') || showcase.slot_type?.includes('SPOTLIGHT');

  return (
    <div className="relative w-full bg-[#3A0F34] text-[#DDE3E8] border border-[#EAAA00]/40 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(58,15,52,0.22)] overflow-hidden my-4">
      {/* Background ambient lighting */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#EAAA00]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Brand & Pitch */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-display font-extrabold text-base shrink-0 shadow-sm border border-[#EAAA00]/40">
            {showcase.org_name ? showcase.org_name.slice(0, 2).toUpperCase() : 'CO'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="inline-flex items-center gap-1 bg-[#EAAA00] text-[#3A0F34] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>Weekly Spotlight</span>
              </span>
              <h4 className="font-display font-extrabold text-sm text-white truncate">
                {showcase.org_name}
              </h4>
              <span className="text-[10px] text-[#DDE3E8]/60">· {showcase.cycle_window}</span>
            </div>

            <p className="text-xs text-[#DDE3E8]/90 font-medium leading-relaxed max-w-xl truncate sm:whitespace-normal">
              {showcase.headline || showcase.pitch}
            </p>
          </div>
        </div>

        {/* Right: CTA & Book Slot Link */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <Link
            href="/ad-slots/submit"
            className="text-[10px] text-[#EAAA00] hover:underline font-bold tracking-wider uppercase"
          >
            Reserve Slot ↗
          </Link>

          <a
            href={showcase.target_url || showcase.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAAA00] hover:bg-white text-[#3A0F34] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <span>{showcase.cta_label || 'Visit Website'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

