'use client';

import React from 'react';
import {
  Check,
  Sparkles,
  MapPin,
  Briefcase,
  Compass,
  ArrowRight,
  ShieldCheck,
  Download,
  Bell,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';
import { CartoonButton } from '@/components/ui/cartoon-button';

export function PricingClient() {
  const comparisonRows = [
    { feature: 'Interactive Map & Corridor Geocoding', status: '100% Free' },
    { feature: 'Complete Startup & Ecosystem Directory', status: '100% Free' },
    { feature: 'Tech Job Board & Direct ATS Application Links', status: '100% Free' },
    { feature: 'Full CSV & JSON Directory Export', status: '100% Free' },
    { feature: 'Neighborhood & Corridor Filtering (Rushikonda, AMTZ, etc.)', status: '100% Free' },
    { feature: 'Instant Email Alerts for New Tech Roles', status: '100% Free' },
    { feature: 'Verified Founder Profiles & Official Sources', status: '100% Free' },
    { feature: 'Community Showcase Billboard Slots', status: '100% Free' },
  ];

  return (
    <div className="space-y-16">
      {/* ── Community Banner ── */}
      <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAAA00]/30 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#EAAA00] text-[10px] font-extrabold uppercase tracking-widest">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Community Pledge</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          No Paywalls. No Subscriptions. No Fees.
        </h2>
        <p className="text-xs sm:text-sm text-[#DDE3E8]/80 leading-relaxed max-w-xl mx-auto">
          Vizag Startup Map was conceived to accelerate Visakhapatnam’s technology ecosystem. Every startup founder, job seeker, and researcher has complete, unrestricted access to the entire platform.
        </p>
      </div>

      {/* ── 3 Free Persona Columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* 1. Founders & Startups */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-7 rounded-3xl flex flex-col justify-between shadow-sm relative group hover:border-[#3A0F34] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
                FOR FOUNDERS
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Free Forever
              </span>
            </div>

            <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#3A0F34]">
              Startups & Labs
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Put your company on the living map and connect with talent and visiting delegates.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">₹0</span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">/ no fees ever</span>
            </div>

            <ul className="space-y-3 text-xs text-[#3A0F34]/85 border-t border-[#3A0F34]/15 pt-5">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Permanent map pin & dedicated startup profile page</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Post open roles synced directly to official career pages</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verified community badge and founder dossier</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <CartoonButton
              label="LIST YOUR STARTUP (FREE)"
              variant="marigold"
              size="md"
              className="w-full"
              href="/submit"
            />
          </div>
        </div>

        {/* 2. Engineers & Talent */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] p-7 rounded-3xl flex flex-col justify-between shadow-xl relative border-2 border-[#EAAA00]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#EAAA00] text-[#3A0F34] text-[10px] font-extrabold uppercase tracking-[0.16em] px-3.5 py-1 rounded-full shadow-sm">
            Talent & Careers
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#EAAA00]">
                FOR JOB SEEKERS
              </span>
              <span className="bg-[#EAAA00] text-[#3A0F34] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                100% Free
              </span>
            </div>

            <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#DDE3E8]">
              Engineers & Talent
            </h3>
            <p className="text-xs text-[#DDE3E8]/75 mt-2 min-h-[36px]">
              Discover active tech opportunities in Rushikonda, MVP Colony, and Siripuram.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#EAAA00]">₹0</span>
              <span className="text-xs text-[#DDE3E8]/60 ml-1">/ no fees ever</span>
            </div>

            <ul className="space-y-3 text-xs text-[#DDE3E8]/85 border-t border-white/10 pt-5">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0 mt-0.5" />
                <span>Direct application links to verified official careers boards</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0 mt-0.5" />
                <span>Instant email alerts when new engineering roles are posted</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0 mt-0.5" />
                <span>Filter by department, experience, and neighborhood corridor</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0 mt-0.5" />
                <span>Direct contact handles for technical recruiters & founders</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <CartoonButton
              label="BROWSE OPEN ROLES"
              variant="marigold"
              size="md"
              className="w-full"
              href="/jobs"
            />
          </div>
        </div>

        {/* 3. Researchers & Investors */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-7 rounded-3xl flex flex-col justify-between shadow-sm relative group hover:border-[#3A0F34] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
                FOR RESEARCHERS
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Free Forever
              </span>
            </div>

            <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#3A0F34]">
              Delegates & VCs
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Explore sector intelligence, geographic clusters, and innovation corridors.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">₹0</span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">/ no fees ever</span>
            </div>

            <ul className="space-y-3 text-xs text-[#3A0F34]/85 border-t border-[#3A0F34]/15 pt-5">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete directory export in CSV and JSON formats</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Live spatial analytics, landlocked coordinates & coastal tour</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deeptech, Biotech (AMTZ), and Maritime sector breakdowns</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Historical timeline & verified secondary sources</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <CartoonButton
              label="EXPLORE LIVE MAP →"
              variant="aubergine"
              size="md"
              className="w-full"
              href="/"
            />
          </div>
        </div>
      </div>

      {/* ── All Features Comparison Table ── */}
      <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-3xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#3A0F34]/60">
            TRANSPARENT ECOSYSTEM DIRECTORY
          </span>
          <h3 className="font-display font-extrabold text-2xl text-[#3A0F34]">
            Feature Availability Matrix
          </h3>
          <p className="text-xs text-[#3A0F34]/70">
            Every capability on this platform is completely unlocked for everyone.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#3A0F34]/20 text-[#3A0F34]/70 font-display font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Feature / Tool</th>
                <th className="py-3 px-4 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A0F34]/10">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#3A0F34] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{row.feature}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
