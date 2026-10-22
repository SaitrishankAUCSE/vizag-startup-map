'use client';

import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Send } from 'lucide-react';
import { SECTORS } from '@/config/constants';

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JobAlertModal({ isOpen, onClose }: JobAlertModalProps) {
  const [email, setEmail] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sector: selectedSector }),
      });
    } catch {
      // Graceful fallback
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">You’re on the list!</h3>
            <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
              We’ll send you curated alerts whenever new startups or high-growth engineering jobs launch in Visakhapatnam.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#E04F36] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Get Vizag Startup & Job Alerts
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Never miss a new tech company founding, seed funding round, or senior engineering role in Visakhapatnam.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-800 focus:border-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  Sector Preference
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-800 focus:border-zinc-400 focus:outline-none"
                >
                  <option value="all">All Sectors (AI, SaaS, Maritime, Fintech, etc.)</option>
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E04F36] hover:bg-[#c93f28] py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Subscribing...' : 'Subscribe to Alerts'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
