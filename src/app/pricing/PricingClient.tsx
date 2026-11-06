'use client';

import React, { useState } from 'react';
import { PRICING_CONFIG } from '@/config/pricing';
import { Check, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const proPrice =
    billingCycle === 'monthly'
      ? PRICING_CONFIG.pro.monthly.displayPrice
      : PRICING_CONFIG.pro.yearly.displayPrice;

  const featuredPrice =
    billingCycle === 'monthly'
      ? PRICING_CONFIG.featured.monthly.displayPrice
      : PRICING_CONFIG.featured.yearly.displayPrice;

  return (
    <div className="space-y-16">
      {/* Monthly / Yearly Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1 rounded-full border border-[#3A0F34] bg-[#DDE3E8]">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-[#3A0F34] text-[#DDE3E8]'
                : 'text-[#3A0F34] hover:opacity-75'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-[#3A0F34] text-[#DDE3E8]'
                : 'text-[#3A0F34] hover:opacity-75'
            }`}
          >
            <span>Yearly</span>
            <span className="text-[9px] font-bold bg-[#EAAA00] text-[#3A0F34] px-1.5 py-0.5 rounded-full">
              Save ~35%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Tall Columns like vertical strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* 1. Free Community Plan */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
              COMMUNITY
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mt-1">
              Free Access
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Complete access to browse, search, and navigate the Visakhapatnam startup atlas.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">₹0</span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">/ forever</span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#3A0F34]/15 text-xs text-[#3A0F34]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Browse full interactive map & pins</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Filter by area, sector, stage, and hiring</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>View startup details, website & contacts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Submit free community listing</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full border-[1.5px] border-[#3A0F34] text-xs font-semibold uppercase tracking-[0.14em] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors"
            >
              START WITH FREE
            </Link>
          </div>
        </div>

        {/* 2. Pro Plan (Aubergine Column with Silver Text & Marigold Button) */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] border border-[#3A0F34] p-8 rounded-2xl flex flex-col justify-between shadow-xl relative transform md:-translate-y-2">
          {/* Top Marigold Tag */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[9.5px] font-bold uppercase tracking-[0.18em] shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3A0F34]" />
            <span>MOST POPULAR</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#EAAA00]">
              RESEARCHERS & TALENT
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#DDE3E8] mt-1">
              Pro Member
            </h3>
            <p className="text-xs text-[#DDE3E8]/80 mt-2 min-h-[36px]">
              Ecosystem intelligence, CSV downloads, saved lists, and instant job alerts.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#EAAA00]">
                {proPrice}
              </span>
              <span className="text-xs text-[#DDE3E8]/70 ml-1">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#DDE3E8]/20 text-xs text-[#DDE3E8]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>1-Click CSV & JSON directory export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Direct founder & leadership LinkedIn handles</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Instant job alerts when tracked startups hire</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Save favorites, private notes & custom lists</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Advanced filters: founding year, team size, funding</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#EAAA00] shrink-0" />
                <span>Monthly Vizag Ecosystem Intelligence Report</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => {
                alert(`Pro Plan (${billingCycle}) selected! Demo checkout state.`);
              }}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#EAAA00] text-[#3A0F34] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#DDE3E8] hover:text-[#3A0F34] transition-colors cursor-pointer"
            >
              GO PRO
            </button>
          </div>
        </div>

        {/* 3. Featured Listing Plan */}
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/25 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/70">
              FOUNDERS & VENTURES
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mt-1">
              Featured Listing
            </h3>
            <p className="text-xs text-[#3A0F34]/75 mt-2 min-h-[36px]">
              Top-tier visibility on the map, featured badges, and talent recruitment tools.
            </p>

            <div className="mt-6 mb-6">
              <span className="font-display font-extrabold text-4xl text-[#3A0F34]">
                {featuredPrice}
              </span>
              <span className="text-xs text-[#3A0F34]/60 ml-1">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            <ul className="space-y-3 pt-6 border-t border-[#3A0F34]/15 text-xs text-[#3A0F34]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Highlighted pin with double ring on map</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Top placement in search and directory lists</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Post up to 5 active open job listings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Extended profile & photo showcase</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#3A0F34] shrink-0" />
                <span>Monthly viewer traffic analytics</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => {
                alert(`Featured Listing (${billingCycle}) selected! Demo checkout state.`);
              }}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full border-[1.5px] border-[#3A0F34] text-xs font-semibold uppercase tracking-[0.14em] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors cursor-pointer"
            >
              FEATURE MY STARTUP
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table Below */}
      <div className="pt-12 border-t border-[#3A0F34]/15">
        <h4 className="font-display font-bold text-2xl uppercase tracking-tight text-[#3A0F34] mb-6 text-center">
          Feature Comparison
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#3A0F34]/20 text-[#3A0F34]/60 uppercase tracking-[0.14em]">
                <th className="py-3 px-4 font-semibold">Capability</th>
                <th className="py-3 px-4 font-semibold text-center">Free</th>
                <th className="py-3 px-4 font-semibold text-center text-[#3A0F34] bg-[#3A0F34]/10 rounded-t-lg">
                  Pro
                </th>
                <th className="py-3 px-4 font-semibold text-center">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A0F34]/10 text-[#3A0F34]">
              <tr>
                <td className="py-3 px-4 font-medium">Interactive Map & Clusters</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Area & Sector Filters</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">CSV Data Export</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#EAAA00]">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Instant Email Job Alerts</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#EAAA00]">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Top Placement & Highlighted Pin</td>
                <td className="py-3 px-4 text-center text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold text-[#3A0F34]/30">—</td>
                <td className="py-3 px-4 text-center font-bold text-[#EAAA00]">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Job Postings Included</td>
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 text-center bg-[#3A0F34]/10 font-bold">1</td>
                <td className="py-3 px-4 text-center font-bold">5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
