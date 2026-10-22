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
  Download,
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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-[#0E4D64] flex items-center justify-center font-bold text-xl">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-950">Ecosystem Member</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                Verified User
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">user@vizagstartupmap.com</p>
          </div>
        </div>

        {/* Current Plan Block */}
        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-medium">Current Subscription:</span>
              <span className="text-xs font-bold text-[#0E4D64] bg-white px-2 py-0.5 rounded-md border border-gray-200 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {userPlan === 'pro' ? 'Pro Plan (₹199 / mo)' : 'Free Tier'}
              </span>
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Next billing date: <strong>{nextBillingDate}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {userPlan === 'pro' && !cancelledMessage && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0E4D64] bg-white hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Change Plan
            </Link>
          </div>
        </div>

        {cancelledMessage && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{cancelledMessage}</span>
          </div>
        )}
      </div>

      {/* Pro Features Active Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-4">
          Your Pro Privileges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="font-medium">CSV Dataset Export</span>
            <a
              href="/api/listings/export?plan=pro"
              download
              className="text-xs font-bold text-[#0E4D64] hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="font-medium">Founder Dashboard</span>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#0E4D64] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Invoices & Receipts */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
            Invoices & Payment Receipts
          </h2>
          <span className="text-[11px] text-gray-400">Processed via Razorpay</span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Pro Subscription (Monthly)</p>
              <p className="text-[11px] text-gray-400">
                {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • Invoice #RZP-2026-1042
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900">₹199.00</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
