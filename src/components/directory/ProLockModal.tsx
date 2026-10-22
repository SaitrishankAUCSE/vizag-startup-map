'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, X, Check, Lock } from 'lucide-react';
import { PRICING_CONFIG } from '@/config/pricing';

interface ProLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export function ProLockModal({
  isOpen,
  onClose,
  featureTitle = 'Pro Feature',
  featureDescription = 'Upgrade to Vizag Startup Map Pro to unlock CSV export, saved lists, and real-time alerts.',
}: ProLockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0E4D64] to-[#0A3747] text-white p-6 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> Vizag Pro
          </span>
          <h3 className="text-lg font-bold text-white mb-1">{featureTitle}</h3>
          <p className="text-xs text-teal-100/90 max-w-xs mx-auto">
            {featureDescription}
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
            What Pro includes:
          </h4>
          <ul className="space-y-2 mb-6">
            {PRICING_CONFIG.pro.features.slice(0, 5).map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100 flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-gray-900">
                ₹199 <span className="text-xs font-normal text-gray-500">/ month</span>
              </div>
              <div className="text-[11px] text-teal-700 font-medium">
                Or ₹1,499 / year (Save ~37%)
              </div>
            </div>
            <Link
              href="/pricing"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E4D64] hover:bg-[#093345] text-white transition-all shadow-sm"
            >
              Upgrade Now
            </Link>
          </div>

          <p className="text-[11px] text-center text-gray-400">
            Cancel anytime • Verified Razorpay Checkout
          </p>
        </div>
      </div>
    </div>
  );
}
