'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Zap,
  TrendingUp,
  Sparkles,
  Clock,
  Search,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';
import { Listing } from '@/types';

interface BoostClientProps {
  listings: Listing[];
}

export const BoostClient: React.FC<BoostClientProps> = ({ listings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<Listing | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredStartups = searchQuery.trim()
    ? listings
        .filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        .slice(0, 5)
    : [];

  const handleSelectStartup = (startup: Listing) => {
    setSelectedStartup(startup);
    setSearchQuery(startup.name);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup || !email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = '/boost/success';
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto pt-16 pb-28 w-full font-sans">
      {/* Top back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs tracking-wide text-[#3A0F34]/60 hover:text-[#3A0F34] transition-colors mb-12 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Directory
      </Link>

      {/* Page Header */}
      <header className="space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-[#3A0F34]/15 text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]">
          <Zap className="w-3 h-3 text-[#EAAA00] fill-current" />
          <span>Priority Pin Illumination</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3A0F34] font-display">
          Boost listing
        </h1>
        <p className="text-sm text-[#3A0F34]/70 font-light leading-relaxed">
          Acquire elevated prominence on the Vizag Startup Map. Runs for 7 full days from confirmation.
        </p>

        {/* Link to Coastal Showcase Weekly Slots */}
        <div className="pt-2">
          <Link
            href="/ad-slots/submit"
            className="inline-flex items-center gap-2 p-3 bg-white/80 hover:bg-white border border-[#3A0F34]/15 hover:border-[#EAAA00] rounded-xl text-xs font-bold text-[#3A0F34] transition-all shadow-xs group"
          >
            <span className="w-2 h-2 rounded-full bg-[#EAAA00] animate-pulse" />
            <span>Looking for full directory banner placement? <strong>Explore Weekly Showcase Windows →</strong></span>
          </Link>
        </div>
      </header>

      {isSuccess ? (
        <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-2xl p-8 text-center space-y-4 animate-in fade-in shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display">Boost Activated!</h2>
          <p className="text-xs text-[#DDE3E8]/80 max-w-md mx-auto leading-relaxed">
            Thank you! <strong>{selectedStartup?.name}</strong> has been granted 7-Day Priority Placement with radar illumination and unclustered visibility on the Vizag Startup Map.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#EAAA00] text-[#3A0F34] font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full hover:bg-white transition-colors"
            >
              Return to Map
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-12">
          {/* Plan tier */}
          <div className="flex gap-8 border-b border-[#3A0F34]/15 pb-3">
            <div className="text-left pb-1 relative">
              <span className="text-xs uppercase tracking-wider font-bold block mb-1 text-[#3A0F34]">
                7-Day Priority
              </span>
              <span className="text-2xl font-light text-[#3A0F34]">₹499</span>
              <div className="absolute left-0 -bottom-3 w-full h-[2.5px] bg-[#3A0F34]" />
            </div>
          </div>

          {/* Marker Comparison */}
          <section className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3A0F34]/60 block">
              Marker Comparison
            </span>
            <div className="rounded-2xl bg-[#DDE3E8] border border-[#3A0F34]/15 p-8 shadow-sm">
              <div className="flex items-center justify-around">
                {/* Standard */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-[#3A0F34]/15 flex items-center justify-center shadow-sm">
                    <Building2 className="w-5 h-5 text-[#3A0F34]/50" />
                  </div>
                  <span className="text-xs font-medium text-[#3A0F34]/60">Standard</span>
                </div>

                <div className="h-12 w-px bg-[#3A0F34]/15" />

                {/* Boosted */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-16 h-16 rounded-2xl border-2 border-[#EAAA00]/40 animate-ping pointer-events-none" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white border-2 border-[#EAAA00] p-1 shadow-md flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#EAAA00]" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EAAA00] text-[#3A0F34] shadow-sm">
                      <Zap className="w-3 h-3 fill-current" />
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#3A0F34]">Boosted</span>
                </div>
              </div>
            </div>
          </section>

          {/* Included Enhancements */}
          <section className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3A0F34]/60 block">
              Included Enhancements
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 border border-[#3A0F34]/12 p-4 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-[#3A0F34] font-bold text-xs">
                  <TrendingUp className="w-4 h-4 text-[#EAAA00] shrink-0" />
                  <span>2x pin dimensions</span>
                </div>
                <p className="text-[11px] text-[#3A0F34]/70 font-light leading-relaxed">
                  Dominant visual presence across all city map zoom levels.
                </p>
              </div>

              <div className="rounded-xl bg-white/70 border border-[#3A0F34]/12 p-4 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-[#3A0F34] font-bold text-xs">
                  <Zap className="w-4 h-4 text-[#EAAA00] shrink-0" />
                  <span>Unclustered priority</span>
                </div>
                <p className="text-[11px] text-[#3A0F34]/70 font-light leading-relaxed">
                  Remains an individual marker; never grouped into coordinate clusters.
                </p>
              </div>

              <div className="rounded-xl bg-white/70 border border-[#3A0F34]/12 p-4 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-[#3A0F34] font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#EAAA00] shrink-0" />
                  <span>Radar illumination</span>
                </div>
                <p className="text-[11px] text-[#3A0F34]/70 font-light leading-relaxed">
                  Subtle amber pulse ring directing active founder and talent discovery.
                </p>
              </div>

              <div className="rounded-xl bg-white/70 border border-[#3A0F34]/12 p-4 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-[#3A0F34] font-bold text-xs">
                  <Clock className="w-4 h-4 text-[#EAAA00] shrink-0" />
                  <span>Live in 5–10 minutes</span>
                </div>
                <p className="text-[11px] text-[#3A0F34]/70 font-light leading-relaxed">
                  Instant programmatic edge propagation immediately following payment.
                </p>
              </div>
            </div>
          </section>

          {/* Startup Selection */}
          <section className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3A0F34]/60 block">
              Startup Selection
            </span>
            <div className="relative space-y-1.5">
              <label className="text-xs text-[#3A0F34]/80 font-medium">Target venture</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A0F34]/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search directory for your startup…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedStartup && e.target.value !== selectedStartup.name) {
                      setSelectedStartup(null);
                    }
                  }}
                  className="w-full h-11 px-4 pl-10 text-sm bg-white/80 border border-[#3A0F34]/15 rounded-xl focus:outline-none focus:border-[#3A0F34] text-[#3A0F34] transition-all"
                />
              </div>

              {/* Suggestions dropdown */}
              {searchQuery && !selectedStartup && filteredStartups.length > 0 && (
                <div className="bg-white border border-[#3A0F34]/15 rounded-xl shadow-lg mt-1 overflow-hidden z-20 relative">
                  {filteredStartups.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStartup(s)}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#3A0F34] hover:bg-[#3A0F34]/8 flex items-center justify-between cursor-pointer border-b border-[#3A0F34]/5 last:border-b-0"
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-xs text-[#3A0F34]/60">{s.area} · {s.sector}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedStartup && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-[#EAAA00]/20 border border-[#EAAA00]/50 rounded-lg text-xs text-[#3A0F34]">
                  <CheckCircle className="w-4 h-4 text-[#3A0F34] shrink-0" />
                  <span>Selected: <strong>{selectedStartup.name}</strong> ({selectedStartup.area})</span>
                </div>
              )}
            </div>
          </section>

          {/* Billing Contact */}
          <section className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3A0F34]/60 block">
              Billing Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#3A0F34]/80 font-medium">Receipt email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-white/80 border border-[#3A0F34]/15 rounded-xl focus:outline-none focus:border-[#3A0F34] text-[#3A0F34] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#3A0F34]/80 font-medium">Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Founder Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-white/80 border border-[#3A0F34]/15 rounded-xl focus:outline-none focus:border-[#3A0F34] text-[#3A0F34] transition-all"
                />
              </div>
            </div>
          </section>

          <p className="text-xs text-[#3A0F34]/60 font-light leading-relaxed">
            Boost activations run for a fixed 7-day duration and cannot be reassigned once live. Full receipts are dispatched automatically to your billing email.
          </p>

          <button
            type="submit"
            disabled={!selectedStartup || !email || isSubmitting}
            className="w-full h-12 rounded-xl text-sm font-bold transition-all bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>{isSubmitting ? 'Processing…' : 'Continue to checkout'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-[#3A0F34]/15 pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/">Home</Link>
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/boost">Boost</Link>
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/terms">Terms</Link>
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/refund">Refund Policy</Link>
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-xs text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors" href="/changelog">Change Log</Link>
          </nav>
          <div className="text-xs text-[#3A0F34]/60">
            © 2026 Vizag Startup Map. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
