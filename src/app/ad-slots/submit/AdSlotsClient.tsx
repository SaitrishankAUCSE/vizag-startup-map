'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Building,
  Mail,
  User,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Helper to compute upcoming Monday-to-Monday 7-day cycles dynamically
function generateUpcomingCycles(count: number = 6) {
  const cycles = [];
  const now = new Date();
  
  // Find upcoming Monday
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7;
  
  const startMonday = new Date(now);
  startMonday.setDate(now.getDate() + daysUntilNextMonday);
  startMonday.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const cycleStart = new Date(startMonday);
    cycleStart.setDate(startMonday.getDate() + i * 7);

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + 7);

    const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const label = `${cycleStart.toLocaleDateString('en-IN', formatOpts)} — ${cycleEnd.toLocaleDateString('en-IN', formatOpts)}`;

    cycles.push({
      id: `cycle_${cycleStart.toISOString().slice(0, 10)}`,
      label,
      startDate: cycleStart.toISOString().slice(0, 10),
      endDate: cycleEnd.toISOString().slice(0, 10),
      // Realistic remaining spots simulation
      spotsFree: i === 0 ? 2 : i === 1 ? 3 : 4,
      isNextCycle: i === 0,
    });
  }

  return cycles;
}

export function AdSlotsClient() {
  const searchParams = useSearchParams();
  const initialTierParam = searchParams.get('slotType');

  // Tier selection: 'beacon' (Flash #1) vs 'harbor' (Standard)
  const [selectedTier, setSelectedTier] = useState<'beacon' | 'harbor'>(
    initialTierParam?.includes('FLASH') || initialTierParam?.includes('SPOTLIGHT') ? 'beacon' : 'harbor'
  );

  const cycles = useMemo(() => generateUpcomingCycles(6), []);
  const [selectedCycleId, setSelectedCycleId] = useState<string>(cycles[0]?.id || '');

  // Form State
  const [formData, setFormData] = useState({
    brandName: '',
    domain: '',
    targetUrl: '',
    headline: '',
    pitch: '',
    ctaLabel: 'Visit Website →',
    contactName: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];

  const price = selectedTier === 'beacon' ? 4999 : 2499;
  const tierTitle = selectedTier === 'beacon' ? 'Coastal Beacon (#1 Spotlight)' : 'Harbor Standard Directory Slot';

  const handleDomainChange = (val: string) => {
    let clean = val.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setFormData((prev) => ({
      ...prev,
      domain: clean,
      targetUrl: prev.targetUrl || (clean ? `https://${clean}` : ''),
      brandName: prev.brandName || (clean ? clean.split('.')[0].toUpperCase() : ''),
    }));
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.email || !formData.domain) {
      setErrorMessage('Please fill in your company brand name, domain, and contact email.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        orgName: formData.brandName,
        website: formData.domain.startsWith('http') ? formData.domain : `https://${formData.domain}`,
        targetUrl: formData.targetUrl || `https://${formData.domain}`,
        headline: formData.headline || `${formData.brandName} on Vizag Startup Map`,
        pitch: formData.pitch,
        ctaLabel: formData.ctaLabel,
        contactName: formData.contactName,
        email: formData.email,
        slotType: selectedTier === 'beacon' ? 'FLASH_SPOTLIGHT_7D' : 'STANDARD_7D',
        cycleWindow: selectedCycle.label,
        cycleDates: { start: selectedCycle.startDate, end: selectedCycle.endDate },
        amount: price,
      };

      const res = await fetch('/api/ad-slots/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setConfirmedBookingId(data.bookingId || `VSM-${Date.now().toString(36).toUpperCase()}`);
        setReservationConfirmed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to complete reservation. Please try again.');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Map Directory</span>
          </Link>
        </div>

        {reservationConfirmed ? (
          /* Confirmation State */
          <div className="max-w-2xl mx-auto bg-[#FAF9F6] border border-[#3A0F34]/15 rounded-3xl p-8 sm:p-12 shadow-[0_16px_50px_rgba(58,15,52,0.15)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EAAA00]/20 text-[#3A0F34] text-[10px] font-extrabold uppercase tracking-widest">
                Reservation Confirmed · {confirmedBookingId}
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#3A0F34]">
                Your Showcase Slot Is Booked!
              </h1>
              <p className="text-xs sm:text-sm text-[#3A0F34]/75 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.brandName}</strong>! Your 7-day placement for the window{' '}
                <strong>{selectedCycle.label}</strong> has been secured on the Vizag Startup Map.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#DDE3E8]/50 border border-[#3A0F34]/10 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between items-center text-[#3A0F34]/70">
                <span>Placement Tier:</span>
                <span className="font-bold text-[#3A0F34]">{tierTitle}</span>
              </div>
              <div className="flex justify-between items-center text-[#3A0F34]/70">
                <span>7-Day Cycle:</span>
                <span className="font-bold text-[#3A0F34]">{selectedCycle.label}</span>
              </div>
              <div className="flex justify-between items-center text-[#3A0F34]/70">
                <span>Destination:</span>
                <span className="font-mono text-[#3A0F34] truncate max-w-[200px]">{formData.domain}</span>
              </div>
              <div className="pt-2 border-t border-[#3A0F34]/10 flex justify-between items-center font-extrabold text-sm text-[#3A0F34]">
                <span>Total Amount:</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#3A0F34]/60 max-w-md mx-auto">
              A confirmation invoice and live telemetry link have been dispatched to <strong>{formData.email}</strong>.
              Our curation team reviews asset alignment within 4 hours.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Return to Live Map
              </Link>
            </div>
          </div>
        ) : (
          /* Main Form & Showcase Builder Layout */
          <div className="space-y-12">
            {/* Header Section */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#3A0F34]/15 text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]">
                <Radio className="w-3 h-3 text-[#EAAA00] animate-pulse" />
                <span>Weekly Ecosystem Showcase · 7-Day Windows</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#3A0F34] tracking-tight">
                Reserve a Coastal Showcase
              </h1>

              <p className="text-xs sm:text-sm text-[#3A0F34]/80 leading-relaxed font-normal">
                Curated placement on the primary directory strip and live interactive map. 7-day windows run Monday 00:00 through Monday 00:00 IST.
              </p>
            </div>

            {/* 1. TIER SELECTOR */}
            <div className="space-y-3">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                1. Select Showcase Prominence Tier
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coastal Beacon (#1 Spotlight) */}
                <div
                  onClick={() => setSelectedTier('beacon')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
                    selectedTier === 'beacon'
                      ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-[0_12px_36px_rgba(58,15,52,0.25)]'
                      : 'bg-[#FAF9F6]/90 text-[#3A0F34] border-[#3A0F34]/15 hover:border-[#3A0F34]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#EAAA00]">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Coastal Beacon (#1 Spot)</span>
                    </div>
                    {selectedTier === 'beacon' && (
                      <span className="w-5 h-5 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <span className="font-display font-extrabold text-3xl">₹4,999</span>
                    <span className="text-xs opacity-75 ml-1.5">/ 7 days</span>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">
                    Guaranteed #1 sticky spotlight card atop directory & map + featured section in the daily 8:00 AM morning email briefing to all subscribers.
                  </p>
                </div>

                {/* Harbor Standard */}
                <div
                  onClick={() => setSelectedTier('harbor')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
                    selectedTier === 'harbor'
                      ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-[0_12px_36px_rgba(58,15,52,0.25)]'
                      : 'bg-[#FAF9F6]/90 text-[#3A0F34] border-[#3A0F34]/15 hover:border-[#3A0F34]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#EAAA00]">
                      <span>Harbor Standard Slot</span>
                    </div>
                    {selectedTier === 'harbor' && (
                      <span className="w-5 h-5 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <span className="font-display font-extrabold text-3xl">₹2,499</span>
                    <span className="text-xs opacity-75 ml-1.5">/ 7 days</span>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">
                    Curated rotating placement on the primary directory banner with unclustered map pin illumination across your neighborhood corridor.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. CYCLE SELECTOR (7-Day Windows) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                <span>2. Select 7-Day Cycle</span>
                <span className="text-[#3A0F34]/50 font-medium">Mon 00:00 — Mon 00:00 IST</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cycles.map((c) => {
                  const isSelected = c.id === selectedCycleId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCycleId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative select-none ${
                        isSelected
                          ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-md ring-2 ring-[#EAAA00]'
                          : 'bg-[#FAF9F6] text-[#3A0F34] border-[#3A0F34]/15 hover:border-[#3A0F34]/40 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs font-display">{c.label}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10.5px]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.spotsFree > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className={isSelected ? 'text-[#DDE3E8]/80' : 'text-[#3A0F34]/60'}>
                          {c.spotsFree} spots remaining
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. SHOWCASE METADATA + LIVE PREVIEW GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#3A0F34]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-[#3A0F34]/10 pb-4">
                  <Building className="w-4 h-4 text-[#EAAA00]" />
                  <h3 className="font-display font-bold text-base text-[#3A0F34]">
                    Showcase Details & Metadata
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1.5">
                      Domain Name (e.g. yourcompany.in) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="fluentgrid.com"
                      value={formData.domain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1.5">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Fluentgrid"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1.5">
                        Button Call-to-Action
                      </label>
                      <input
                        type="text"
                        placeholder="Visit Website →"
                        value={formData.ctaLabel}
                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                        className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1.5">
                      Destination Target URL (Where clicks lead)
                    </label>
                    <input
                      type="url"
                      placeholder="https://fluentgrid.com/products"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1.5">
                      Headline / One-Liner (Max 80 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="Next-gen smart utility & clean energy grid software from Vizag"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none focus:border-[#3A0F34] transition-colors"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#3A0F34]/10">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#3A0F34]/70 mb-3">
                      Billing Contact Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60 mb-1">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="Praveen Kumar"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A0F34]/60 mb-1">
                          Invoice Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="growth@fluentgrid.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#DDE3E8]/50 border border-[#3A0F34]/20 rounded-xl px-3 py-2 text-xs text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="pt-4 border-t border-[#3A0F34]/10">
                  <button
                    type="button"
                    onClick={handleReserve}
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>Reserve Showcase for ₹{price.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-[#3A0F34]/60 mt-2">
                    7-day live placement during {selectedCycle.label} · Tax invoice delivered upon confirmation
                  </p>
                </div>
              </div>

              {/* Right Column: Live Interactive Card Preview */}
              <div className="lg:col-span-5 space-y-4 sticky top-24">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#3A0F34]/70">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#EAAA00]" />
                    <span>Live Map Preview</span>
                  </span>
                  <span className="text-[#3A0F34]/50">Real-Time Simulation</span>
                </div>

                {/* Simulated Live Map Showcase Card */}
                <div className="bg-[#FAF9F6] border-2 border-[#3A0F34]/20 rounded-3xl p-5 shadow-[0_12px_40px_rgba(58,15,52,0.14)] space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-sm shrink-0 border border-[#EAAA00]/30 shadow-xs">
                        {formData.brandName ? formData.brandName.slice(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display font-extrabold text-sm text-[#3A0F34]">
                            {formData.brandName || 'Your Brand Name'}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[8.5px] font-extrabold uppercase tracking-wide">
                            {selectedTier === 'beacon' ? 'Spotlight #1' : 'Featured'}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-[#3A0F34]/60">
                          {formData.domain || 'yourdomain.in'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-[#3A0F34]/85 leading-relaxed font-medium">
                    {formData.headline || 'Your compelling product or company elevator pitch will appear here for all map visitors.'}
                  </p>

                  <div className="pt-2 border-t border-[#3A0F34]/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#3A0F34]/60 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#EAAA00]" />
                      <span>{selectedCycle.label}</span>
                    </span>

                    <span className="font-bold text-[#3A0F34] hover:text-[#EAAA00] text-[11px] inline-flex items-center gap-1">
                      {formData.ctaLabel || 'Visit Website →'}
                    </span>
                  </div>
                </div>

                {/* Trust & Guarantee Box */}
                <div className="bg-white/60 border border-[#3A0F34]/10 rounded-2xl p-4 text-xs space-y-2 text-[#3A0F34]/80">
                  <div className="flex items-center gap-1.5 font-bold text-[#3A0F34]">
                    <ShieldCheck className="w-4 h-4 text-[#EAAA00]" />
                    <span>Ecosystem Integrity Policy</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Showcase slots are limited to maximum 4 standard sponsors and 1 exclusive spotlight per week to ensure maximum prestige, visitor engagement, and click-through value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
