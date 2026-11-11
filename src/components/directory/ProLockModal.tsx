'use client';

import React from 'react';
import { Sparkles, X, Check, ShieldCheck } from 'lucide-react';

interface ProLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export function ProLockModal({
  isOpen,
  onClose,
  featureTitle = 'Free Community Access',
  featureDescription = 'All features on Vizag Startup Map are 100% free and open for the ecosystem.',
}: ProLockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#DDE3E8] rounded-2xl max-w-md w-full shadow-2xl border border-[#3A0F34]/20 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 text-[#3A0F34]/50 hover:text-[#3A0F34] p-1.5 rounded-lg hover:bg-[#3A0F34]/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-[#3A0F34] text-[#DDE3E8] p-6 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-[#EAAA00]" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EAAA00] text-[#3A0F34] uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> 100% Free & Open
          </span>
          <h3 className="text-lg font-bold text-white mb-1">{featureTitle}</h3>
          <p className="text-xs text-[#DDE3E8]/80 max-w-xs mx-auto">
            {featureDescription}
          </p>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-4">
          <ul className="space-y-2 text-xs text-[#3A0F34]/80">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Full CSV & JSON directory exports — completely free</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Instant email alerts for tech roles and venture rounds</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Direct access to all verified founders and leadership handles</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] transition-all shadow-sm cursor-pointer"
          >
            Got it, continue exploring
          </button>
        </div>
      </div>
    </div>
  );
}
