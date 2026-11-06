'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function AccountClient() {
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('pro');
  const [cancelling, setCancelling] = useState(false);
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);

  const nextBillingDate = new Date(Date.now() + 27 * 86400000).toLocaleDateString(
    'en-IN',
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  const handleCancelSubscription = () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You will continue to have Pro access until the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    setTimeout(() => {
      setCancelling(false);
      setCancelledMessage(
        `Subscription canceled. You will retain Pro access until ${nextBillingDate}, after which your account will quietly return to the Free tier.`
      );
    }, 600);
  };

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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAAA00] text-[#3A0F34]">
                Verified Pro
              </span>
            </div>
            <p className="text-xs text-[#3A0F34]/70 mt-0.5">founder@vizagstartupmap.com</p>
          </div>
        </div>

        {/* Current Plan Block */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-xl p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#EAAA00]">
                Active Pass
              </div>
              <div className="font-display font-extrabold text-2xl text-[#DDE3E8] mt-0.5">
                Pro Talent & Researcher Pass
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-2xl text-[#EAAA00]">₹199</div>
              <div className="text-[10px] text-[#DDE3E8]/60 uppercase tracking-wider">billed monthly</div>
            </div>
          </div>

          <p className="text-xs text-[#DDE3E8]/80 leading-relaxed">
            Full API and CSV exports, instant Telegram and WhatsApp hiring alerts, and verified contributor badge across Visakhapatnam ecosystem discussions.
          </p>

          <div className="pt-3 border-t border-[#DDE3E8]/15 flex items-center justify-between text-xs text-[#DDE3E8]/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#EAAA00]" />
              Renews on {nextBillingDate}
            </span>
            <span className="font-semibold text-[#EAAA00]">Auto-renew active</span>
          </div>
        </div>

        {cancelledMessage && (
          <div className="mb-6 p-4 rounded-xl border-2 border-[#3A0F34] bg-[#3A0F34]/10 text-[#3A0F34] text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#EAAA00] shrink-0" />
            <span>{cancelledMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/pricing"
            className="px-5 py-2.5 rounded-full bg-[#EAAA00] text-[#3A0F34] font-display font-extrabold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors"
          >
            Upgrade / Change Tier
          </Link>
          <button
            type="button"
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="px-5 py-2.5 rounded-full border border-[#3A0F34]/40 text-[#3A0F34] text-xs font-bold uppercase tracking-wider hover:bg-[#3A0F34]/10 transition-colors cursor-pointer"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
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
