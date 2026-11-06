'use client';

import React from 'react';
import { X, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface BoostModalProps {
  onClose: () => void;
}

const PLANS = [
  {
    name: 'Basic Listing',
    price: 'Free',
    features: ['Listed on the map', 'Company profile page', 'Searchable in directory'],
    cta: 'Current',
    ctaHref: null,
    highlighted: false,
  },
  {
    name: '7-Day Spotlight Boost',
    price: '₹499',
    period: '/ 7 days',
    features: [
      '2x larger pin (dominant on map)',
      'Radar amber pulse animation',
      'Never grouped into clusters',
      'Top-of-list search priority',
      'Live in 5–10 minutes',
    ],
    cta: 'Boost now',
    ctaHref: '/boost',
    highlighted: true,
  },
  {
    name: 'Featured Partner',
    price: '₹499',
    period: '/ month',
    features: [
      'Permanent 54px highlighted pin',
      'Analytics dashboard (views & clicks)',
      'Up to 5 active job listings',
      'Featured badge across all views',
      'Direct pitch deck & careers link',
    ],
    cta: 'View Plan',
    ctaHref: '/pricing',
    highlighted: false,
  },
];

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
      <div className="relative bg-[#DDE3E8] rounded-2xl shadow-[0_24px_64px_rgba(58,15,52,0.3)] w-full max-w-2xl overflow-hidden fade-in">
        {/* Header */}
        <div className="bg-[#3A0F34] px-6 py-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-[#EAAA00]" />
              <span className="font-display font-extrabold text-xl text-[#DDE3E8]">Boost your listing</span>
            </div>
            <p className="text-sm text-[#DDE3E8]/70">Stand out on the Vizag Startup Map. Plans that match your ambition.</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#DDE3E8]/15 text-[#DDE3E8]/70 hover:text-[#DDE3E8] cursor-pointer mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-5 grid sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-4 border flex flex-col ${
                plan.highlighted
                  ? 'bg-[#3A0F34] border-[#3A0F34]'
                  : 'bg-[#DDE3E8] border-[#3A0F34]/15'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-[#EAAA00] text-[#3A0F34] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-3 self-start">
                  Most popular
                </div>
              )}

              <div className={`font-display font-extrabold text-base mb-0.5 ${plan.highlighted ? 'text-[#DDE3E8]' : 'text-[#3A0F34]'}`}>
                {plan.name}
              </div>

              <div className="flex items-baseline gap-0.5 mb-3">
                <span className={`font-display font-extrabold text-2xl ${plan.highlighted ? 'text-[#EAAA00]' : 'text-[#3A0F34]'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-xs ${plan.highlighted ? 'text-[#DDE3E8]/60' : 'text-[#3A0F34]/60'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.highlighted ? 'text-[#EAAA00]' : 'text-[#3A0F34]/50'}`} />
                    <span className={`text-xs ${plan.highlighted ? 'text-[#DDE3E8]/85' : 'text-[#3A0F34]/80'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {plan.ctaHref ? (
                  <Link href={plan.ctaHref}
                    className={`w-full flex items-center justify-center rounded-full py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
                      plan.highlighted
                        ? 'bg-[#EAAA00] text-[#3A0F34] hover:bg-[#DDE3E8]'
                        : 'bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34]'
                    }`}>
                    {plan.cta}
                  </Link>
                ) : (
                  <div className="w-full flex items-center justify-center rounded-full py-2 text-[11px] font-bold uppercase tracking-[0.1em] bg-[#3A0F34]/10 text-[#3A0F34]/50 cursor-default">
                    {plan.cta}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-4 text-center text-xs text-[#3A0F34]/50">
          Questions? <a href="mailto:hello@vizagstartupmap.com" className="underline underline-offset-2 hover:text-[#3A0F34]">Contact us</a>
        </div>
      </div>
    </div>
  );
};
