'use client';

import React from 'react';
import { X, Zap, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BoostModalProps {
  onClose: () => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1500] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-[#3A0F34]/30 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative bg-[#DDE3E8] rounded-2xl shadow-[0_24px_64px_rgba(58,15,52,0.3)] w-full max-w-lg overflow-hidden fade-in border border-[#3A0F34]/20">
        {/* Header */}
        <div className="bg-[#3A0F34] px-6 py-5 flex items-start justify-between text-[#DDE3E8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-[#EAAA00]" />
              <span className="font-display font-extrabold text-xl text-[#DDE3E8]">
                Boost Your Startup
              </span>
            </div>
            <p className="text-xs text-[#DDE3E8]/80">
              100% Free 7-Day Spotlight for Visakhapatnam founders & tech companies.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#DDE3E8]/15 text-[#DDE3E8]/70 hover:text-[#DDE3E8] cursor-pointer mt-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-white/70 border border-[#3A0F34]/15 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]/60">
                Community Priority Illumination
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                100% Free
              </span>
            </div>

            <ul className="space-y-2 text-xs text-[#3A0F34]/85">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>54px Illuminated Pin</strong> · Dominant visibility across all city map zoom levels</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Always Unclustered</strong> · Never collapses into numeric cluster bubbles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Radar Amber Halo</strong> · Ambient pulse wave catches coastal visitors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Priority Search Placement</strong> · Anchored top-of-list in neighborhood corridors</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/boost"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-xs font-display font-extrabold uppercase tracking-wider bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] transition-all shadow-md cursor-pointer"
            >
              <span>Activate Free 7-Day Spotlight</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="px-6 pb-4 text-center text-[11px] text-[#3A0F34]/60">
          No credit card, payment gateway, or subscription required.
        </div>
      </div>
    </div>
  );
};
