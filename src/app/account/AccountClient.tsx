'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Briefcase,
  Zap,
} from 'lucide-react';

export function AccountClient() {
  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-2xl">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-[#3A0F34]">Ecosystem Member</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Free Unlocked Access
              </span>
            </div>
            <p className="text-xs text-[#3A0F34]/70 mt-0.5">founder@vizagstartupmap.com</p>
          </div>
        </div>

        {/* Community Pass Block */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-xl p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#EAAA00]">
                Ecosystem Tier
              </div>
              <div className="font-display font-extrabold text-2xl text-[#DDE3E8] mt-0.5">
                Community Access Pass
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-2xl text-[#EAAA00]">₹0</div>
              <div className="text-[10px] text-[#DDE3E8]/60 uppercase tracking-wider">Free Forever</div>
            </div>
          </div>

          <p className="text-xs text-[#DDE3E8]/80 leading-relaxed">
            All features on Vizag Startup Map are completely unlocked: full CSV directory exports, instant job alerts, verified founder handles, and open community access for everyone.
          </p>

          <div className="pt-3 border-t border-[#DDE3E8]/15 flex items-center justify-between text-xs text-[#DDE3E8]/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#EAAA00]" />
              No credit card, paywalls, or subscriptions
            </span>
            <span className="font-semibold text-[#EAAA00]">Active</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/submit"
            className="px-5 py-2.5 rounded-full bg-[#EAAA00] text-[#3A0F34] font-display font-extrabold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors"
          >
            + Add Your Startup
          </Link>
          <Link
            href="/grid"
            className="px-5 py-2.5 rounded-full border border-[#3A0F34]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider hover:bg-[#3A0F34]/10 transition-colors"
          >
            Explore Directory Grid
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/submit"
          className="bg-[#DDE3E8] border border-[#3A0F34]/25 hover:border-[#3A0F34]/50 rounded-2xl p-5 block transition-colors group shadow-xs"
        >
          <div className="font-display font-bold text-base text-[#3A0F34] group-hover:text-[#EAAA00] transition-colors flex items-center justify-between">
            <span>List a New Startup</span>
            <ExternalLink className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#3A0F34]/70 mt-1">
            Submit an incubator, lab, or company to the interactive map.
          </p>
        </Link>

        <Link
          href="/grid"
          className="bg-[#DDE3E8] border border-[#3A0F34]/25 hover:border-[#3A0F34]/50 rounded-2xl p-5 block transition-colors group shadow-xs"
        >
          <div className="font-display font-bold text-base text-[#3A0F34] group-hover:text-[#EAAA00] transition-colors flex items-center justify-between">
            <span>Browse Directory Grid</span>
            <ExternalLink className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#3A0F34]/70 mt-1">
            Explore all catalogued organizations with custom filters.
          </p>
        </Link>
      </div>
    </div>
  );
}
