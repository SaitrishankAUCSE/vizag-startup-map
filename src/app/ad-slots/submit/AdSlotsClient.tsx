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
      // 4 spots per cycle matching directory strip capacity
      spotsFree: 4,
      isNextCycle: i === 0,
    });
  }

  return cycles;
}

export function AdSlotsClient() {
  const searchParams = useSearchParams();
  const initialTierParam = searchParams.get('slotType');

  // Tier selection: 'beacon' (Flash #1 Spot - ₹5,000) vs 'harbor' (Standard Slot - ₹2,500)
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

  const price = selectedTier === 'beacon' ? 5000 : 2500;
  const tierTitle = selectedTier === 'beacon' ? 'FLASH SPOTLIGHT (#1 SPOT)' : 'STANDARD SLOT';

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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-[#3A0F34] selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Directory</span>
          </Link>
        </div>

        {reservationConfirmed ? (
          /* Confirmation State */
          <div className="max-w-2xl mx-auto bg-zinc-50 border border-zinc-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 text-[10px] font-extrabold uppercase tracking-widest">
                Reservation Confirmed · {confirmedBookingId}
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-900">
                Your Showcase Slot Is Booked!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.brandName || formData.domain}</strong>! Your 7-day placement for the window{' '}
                <strong>{selectedCycle.label}</strong> has been secured on the Vizag Startup Map directory strip.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-xs">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Placement Tier:</span>
                <span className="font-bold text-zinc-900">{tierTitle}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>7-Day Cycle:</span>
                <span className="font-bold text-zinc-900">{selectedCycle.label}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Destination:</span>
                <span className="font-mono text-zinc-900 truncate max-w-[200px]">{formData.domain}</span>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center font-extrabold text-sm text-zinc-900">
                <span>Total Amount:</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
              A confirmation invoice and live telemetry link have been dispatched to <strong>{formData.email}</strong>.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-zinc-900 text-white hover:bg-black text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Return to Directory
              </Link>
            </div>
          </div>
        ) : (
          /* Main Form & Showcase Builder Layout */
          <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-900 tracking-tight">
                Reserve a slot
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed font-normal">
                Curated placement on the directory strip. 7-day windows run Monday through Monday.
              </p>
            </div>

            {/* TIER TABS matching Hyderabad screenshot */}
            <div className="flex items-center gap-10 border-b border-zinc-200/80 pb-4">
              <button
                type="button"
                onClick={() => setSelectedTier('beacon')}
                className={`text-left pb-1 transition-all cursor-pointer relative ${
                  selectedTier === 'beacon' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-extrabold tracking-wider text-amber-600 uppercase">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>FLASH SPOTLIGHT (#1 SPOT)</span>
                </div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-0.5">₹5,000</div>
                <div className="text-xs text-zinc-400">/ 7 days</div>
                {selectedTier === 'beacon' && (
                  <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('harbor')}
                className={`text-left pb-1 transition-all cursor-pointer relative ${
                  selectedTier === 'harbor' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <div className="text-[11px] font-extrabold tracking-wider text-zinc-700 uppercase">
                  STANDARD SLOT
                </div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-0.5">₹2,500</div>
                <div className="text-xs text-zinc-400">/ 7 days</div>
                {selectedTier === 'harbor' && (
                  <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>
            </div>

            {/* 2. CYCLE SELECTOR (7-Day Windows) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600">
                <span>SELECT 7-DAY CYCLE</span>
                <span className="text-zinc-400 font-normal">Mon 00:00 — Mon 00:00</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cycles.map((c) => {
                  const isSelected = c.id === selectedCycleId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCycleId(c.id)}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#18181B] text-white shadow-sm'
                          : 'bg-[#F4F4F5] text-zinc-900 hover:bg-zinc-200/70'
                      }`}
                    >
                      <div className="font-bold text-sm tracking-tight">{c.label}</div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {c.spotsFree} spots free
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. AD METADATA & LIVE PREVIEW */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                AD METADATA
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form fields */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Domain name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="swiggy.in"
                      value={formData.domain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Target URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://swiggy.in"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Swiggy"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="Order Now →"
                        value={formData.ctaLabel}
                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                        className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Headline / One-Liner (Max 80 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="Fastest food & grocery delivery in Visakhapatnam"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div className="pt-2 border-t border-zinc-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                      Billing & Invoice Contact
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-600 mb-1">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-600 mb-1">
                          Billing Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="billing@swiggy.in"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReserve}
                      disabled={submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>Reserve Slot · ₹{price.toLocaleString('en-IN')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-center text-zinc-400 mt-2">
                      Placement runs for 7 days during {selectedCycle.label} · Mon 00:00 — Mon 00:00
                    </p>
                  </div>
                </div>

                {/* Right Column: Live Interactive Card Preview */}
                <div className="lg:col-span-5 space-y-3 sticky top-24">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Live Directory Preview</span>
                    </span>
                    <span className="text-zinc-400 font-normal">Real-Time Simulation</span>
                  </div>

                  {/* Simulated Live Directory Strip Showcase Card */}
                  <div className="bg-[#FAF9F6] border-2 border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                          {formData.brandName ? formData.brandName.slice(0, 2).toUpperCase() : 'SW'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display font-extrabold text-sm text-zinc-900">
                              {formData.brandName || 'Swiggy'}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase tracking-wide">
                              {selectedTier === 'beacon' ? 'Spotlight #1' : 'Featured'}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {formData.domain || 'swiggy.in'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Live Preview
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                      {formData.headline || 'Fastest food, gourmet, and grocery deliveries in Vizag with priority support.'}
                    </p>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{selectedCycle.label}</span>
                      </span>

                      <span className="font-bold text-zinc-900 text-xs inline-flex items-center gap-1">
                        {formData.ctaLabel || 'Order Now →'}
                      </span>
                    </div>
                  </div>

                  {/* Trust & Placement Guarantee */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs space-y-1.5 text-zinc-600">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>7-Day Guaranteed Placement</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Placement is pinned directly to the directory strip and illuminated across map visitor sessions from Monday 00:00 to Monday 00:00 IST.
                    </p>
                  </div>
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

