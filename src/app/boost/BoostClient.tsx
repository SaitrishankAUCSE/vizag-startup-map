'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Zap,
  TrendingUp,
  Sparkles,
  Clock,
  Search,
  ArrowRight,
  CheckCircle2,
  Check,
  ShieldCheck,
  Eye,
  Radio,
  ExternalLink,
  Layers,
  Flame,
  Globe,
  MapPin,
  Tag,
  PlusCircle,
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  Receipt,
  Download,
} from 'lucide-react';
import { Listing } from '@/types';
import { AREAS, SECTORS } from '@/config/constants';
import { CartoonButton } from '@/components/ui/cartoon-button';

interface BoostClientProps {
  listings: Listing[];
}

export const BoostClient: React.FC<BoostClientProps> = ({ listings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Selected startup state (existing listed vs new unlisted startup)
  const [isNewStartup, setIsNewStartup] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Listing | null>(listings[0] || null);

  // New unlisted startup fields
  const [customStartupName, setCustomStartupName] = useState('');
  const [customWebsite, setCustomWebsite] = useState('');
  const [customArea, setCustomArea] = useState('Rushikonda');
  const [customSector, setCustomSector] = useState('Deeptech');

  // Billing Contact
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  // Map preview mode
  const [simulationMode, setSimulationMode] = useState<'boosted' | 'standard'>('boosted');

  // Filter listings based on user search query
  const matchingListings = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return listings
      .filter((l) => l.name.toLowerCase().includes(q) || (l.area && l.area.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [searchQuery, listings]);

  const handleSelectExistingStartup = (startup: Listing) => {
    setSelectedStartup(startup);
    setIsNewStartup(false);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSelectNewStartup = (startupName: string) => {
    const cleanName = startupName.trim();
    if (!cleanName) return;
    setIsNewStartup(true);
    setSelectedStartup(null);
    setCustomStartupName(cleanName);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedStartup(null);
    setIsNewStartup(false);
    setCustomStartupName('');
    setSearchQuery('');
  };

  // Open the real Checkout / Payment Gateway Modal
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedStartup && !customStartupName.trim()) || !email) return;
    setShowCheckoutModal(true);
  };

  // Handle actual payment execution inside the gateway modal
  const handleExecutePayment = () => {
    setPaymentProcessing(true);
    setProcessingStep('Connecting to Razorpay Secure Gateway…');

    setTimeout(() => {
      setProcessingStep('Authorizing payment with bank / UPI network…');
    }, 800);

    setTimeout(() => {
      const txn = `RZP_VSM_${Date.now().toString(36).toUpperCase()}`;
      setTransactionRef(txn);
      setPaymentProcessing(false);
      setShowCheckoutModal(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  // Derive display values
  const activeStartupName = isNewStartup
    ? customStartupName || 'Your Startup'
    : selectedStartup?.name || 'Your Startup';

  const activeStartupArea = isNewStartup
    ? customArea
    : selectedStartup?.area || 'Rushikonda IT SEZ';

  return (
    <div className="w-full font-sans">
      {/* Top back navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#3A0F34]/70 hover:text-[#3A0F34] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Live Map</span>
        </Link>
      </div>

      {isSuccess ? (
        /* Confirmed Activation Screen */
        <div className="max-w-2xl mx-auto bg-white border border-[#3A0F34]/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest">
              Payment Confirmed · ID {transactionRef}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#3A0F34]">
              {activeStartupName} is Now Boosted!
            </h1>
            <p className="text-xs sm:text-sm text-[#3A0F34]/75 max-w-md mx-auto leading-relaxed">
              {isNewStartup
                ? `We have registered ${activeStartupName} in ${activeStartupArea} and enabled 7-Day Priority Pin Illumination across the Vizag Startup Map.`
                : `7-Day priority pin illumination, unclustered presence, and spotlight search placement are now active on the map.`}
            </p>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-left max-w-sm mx-auto space-y-2.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Promoted Venture</span>
              <strong className="text-zinc-900">{activeStartupName}</strong>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Neighborhood</span>
              <strong className="text-zinc-900">{activeStartupArea}</strong>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Duration</span>
              <strong className="text-zinc-900">7 Full Days</strong>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Amount Paid</span>
              <strong className="text-emerald-700 font-extrabold">₹499.00 (Paid via Razorpay)</strong>
            </div>
            <div className="flex justify-between text-zinc-600 border-t border-zinc-200 pt-2">
              <span>Tax Invoice</span>
              <strong className="text-zinc-900 truncate max-w-[180px]">{email}</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-all shadow-md cursor-pointer"
            >
              <span>View On Live Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Full-Screen Two-Column Experience */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN (7 COLS): Headline, Live Map Simulation & Value Proposition ── */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#3A0F34]/15 text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34] shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#EAAA00] fill-current" />
                <span>Map Prominence Engine · 7-Day Priority Placement</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-[#3A0F34] leading-[1.08]">
                Put Your Startup On The Map. <span className="text-[#3A0F34]/65">Literally.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed max-w-2xl font-medium">
                When visiting venture capitalists, delegates, and top engineering talent explore Visakhapatnam’s coastal innovation corridor, make sure your company commands instant visual attention.
              </p>
            </div>

            {/* ── INTERACTIVE LIVE MAP SIMULATOR CARD ── */}
            <div className="bg-white/90 backdrop-blur-xl border border-[#3A0F34]/15 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]/60 block">
                    Interactive Preview
                  </span>
                  <h3 className="font-display font-extrabold text-base text-[#3A0F34]">
                    Map Canvas Marker Simulation
                  </h3>
                </div>

                <div className="flex items-center bg-zinc-100 p-1 rounded-xl self-start sm:self-auto border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setSimulationMode('standard')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      simulationMode === 'standard'
                        ? 'bg-white text-zinc-900 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Standard Pin
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationMode('boosted')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      simulationMode === 'boosted'
                        ? 'bg-[#3A0F34] text-[#EAAA00] shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Boosted (₹499)</span>
                  </button>
                </div>
              </div>

              {/* Simulated Map Canvas */}
              <div className="relative h-64 sm:h-72 rounded-2xl bg-[#E8ECEF] border border-[#3A0F34]/15 overflow-hidden flex items-center justify-center p-6 select-none shadow-inner">
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3A0F34" strokeWidth="0.5" opacity="0.15" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    <path d="M 280 0 Q 340 120 400 280 L 500 280 L 500 0 Z" fill="#D0E2EC" opacity="0.7" />
                  </svg>
                </div>

                <span className="absolute right-4 top-4 text-[10px] font-bold text-[#3A0F34]/40 uppercase tracking-widest">
                  Bay of Bengal Coast
                </span>

                <div className="absolute left-8 top-12 flex flex-col items-center opacity-60">
                  <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center font-extrabold text-xs shadow-xs border border-white">
                    14
                  </div>
                  <span className="text-[9px] font-semibold text-zinc-600 mt-1">Siripuram</span>
                </div>

                <div className="absolute right-12 bottom-10 flex flex-col items-center opacity-60">
                  <div className="w-9 h-9 rounded-xl bg-white border border-zinc-300 flex items-center justify-center text-zinc-700 font-extrabold text-xs shadow-2xs">
                    FT
                  </div>
                  <span className="text-[9px] font-semibold text-zinc-600 mt-1">Fluentgrid</span>
                </div>

                {/* THE HERO PIN */}
                <div className="relative z-10 flex flex-col items-center">
                  {simulationMode === 'boosted' ? (
                    <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-200">
                      <span className="absolute -inset-3 rounded-2xl border-2 border-[#EAAA00] opacity-75 animate-ping pointer-events-none" />
                      <span className="absolute -inset-1.5 rounded-2xl bg-[#EAAA00]/25 blur-xs pointer-events-none" />

                      <div className="relative w-14 h-14 rounded-2xl bg-white border-2 border-[#EAAA00] shadow-[0_8px_25px_rgba(234,170,0,0.35)] flex items-center justify-center p-1">
                        <div className="w-full h-full rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-display font-extrabold text-lg">
                          {activeStartupName.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center shadow-xs">
                          <Zap className="w-3 h-3 fill-current" />
                        </span>
                      </div>

                      <div className="mt-2 px-3 py-1 rounded-xl bg-[#3A0F34] text-white text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00] animate-pulse" />
                        <span>{activeStartupName}</span>
                        <span className="text-[#EAAA00] text-[9.5px]">· {activeStartupArea}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center animate-in fade-in duration-200 opacity-75">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#3A0F34]/20 flex items-center justify-center shadow-xs">
                        <Building2 className="w-5 h-5 text-[#3A0F34]/60" />
                      </div>
                      <span className="mt-1 text-[10.5px] font-bold text-[#3A0F34]">
                        {activeStartupName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#3A0F34]/70 leading-relaxed italic">
                {simulationMode === 'boosted'
                  ? '⚡ Boosted: 54px golden illuminated frame, radar pulse halo, and unclustered pin presence across all city map zoom levels.'
                  : '⚪ Standard: 44px grey marker, collapses into coordinate clusters when users zoom out.'}
              </p>
            </div>

            {/* ── 4 CORE ENHANCEMENT PILLARS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-4.5 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#3A0F34]/8 text-[#3A0F34] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#3A0F34]" />
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#3A0F34]">
                  Always Unclustered
                </h4>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed font-medium">
                  While neighbors collapse into numeric cluster bubbles at zoom level 13, your venture remains an individual, clickable pin.
                </p>
              </div>

              <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-4.5 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#EAAA00]/20 text-[#3A0F34] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#3A0F34]" />
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#3A0F34]">
                  Illuminated Gold Halo
                </h4>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed font-medium">
                  An ambient Marigold radar wave pulses around your logo tile, catching the eye of visitors exploring the coast.
                </p>
              </div>

              <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-4.5 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#3A0F34]/8 text-[#3A0F34] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#3A0F34]" />
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#3A0F34]">
                  Top of Search & Directory
                </h4>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed font-medium">
                  Boosted listings are anchored at the top of sector directory lists and priority search suggestions across the platform.
                </p>
              </div>

              <div className="bg-white/80 border border-[#3A0F34]/15 rounded-2xl p-4.5 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#3A0F34]">
                  Live in &lt; 5 Minutes
                </h4>
                <p className="text-xs text-[#3A0F34]/75 leading-relaxed font-medium">
                  Programmatic edge propagation activates your priority marker instantly across desktop and mobile devices upon checkout.
                </p>
              </div>
            </div>

            {/* ── CROSS-SELL BANNER TO WEEKLY SHOWCASE STRIP ── */}
            <div className="bg-[#3A0F34] text-[#DDE3E8] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#EAAA00]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Looking For Even Greater Scale?</span>
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  Reserve a 7-Day Directory Billboard Slot
                </h4>
                <p className="text-xs text-[#DDE3E8]/80 leading-relaxed max-w-lg">
                  Place your banner directly on top of the directory grid with verified clicks and live target URL routing.
                </p>
              </div>
              <Link
                href="/ad-slots/submit"
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#EAAA00] hover:bg-white text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Explore Slots →
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 COLS): Pre-Checkout Setup Form ── */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white border border-[#3A0F34]/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Card Header & Price */}
              <div className="space-y-1 pb-4 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3A0F34]/60">
                    Priority Package
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    7 Days Guaranteed
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold text-[#3A0F34]">
                    ₹499
                  </span>
                  <span className="text-xs text-zinc-500 font-semibold">
                    all-inclusive (₹71 / day)
                  </span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleProceedToPayment} className="space-y-5">
                {/* ── STEP 1: STARTUP TO PROMOTE ── */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#3A0F34] flex items-center justify-between">
                    <span>1. Startup / Company to Promote</span>
                    <span className="text-[10px] text-[#3A0F34]/60 font-semibold">
                      Listed or Brand New
                    </span>
                  </label>

                  {/* If an Existing or Custom Startup is Selected */}
                  {(selectedStartup || isNewStartup) ? (
                    <div className="p-3.5 rounded-2xl bg-[#3A0F34]/5 border border-[#3A0F34]/15 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-extrabold text-xs shrink-0">
                            {activeStartupName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs font-bold text-[#3A0F34] block truncate">
                              {activeStartupName}
                            </strong>
                            <span className="text-[10.5px] text-[#3A0F34]/65">
                              {activeStartupArea}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isNewStartup ? (
                            <span className="text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              ✦ New Venture
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-extrabold bg-[#EAAA00] text-[#3A0F34] px-2 py-0.5 rounded-md">
                              Listed
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                            title="Change startup"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* If NEW unlisted startup, display the 3 quick setup fields */}
                      {isNewStartup && (
                        <div className="pt-2 border-t border-[#3A0F34]/10 space-y-2.5 animate-in fade-in">
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-bold text-[#3A0F34] flex items-center gap-1">
                              <Globe className="w-3 h-3 text-[#EAAA00]" />
                              <span>Official Website or LinkedIn URL *</span>
                            </label>
                            <input
                              type="url"
                              required
                              placeholder="https://myventure.in"
                              value={customWebsite}
                              onChange={(e) => setCustomWebsite(e.target.value)}
                              className="w-full bg-white border border-[#3A0F34]/20 focus:border-[#3A0F34] rounded-xl px-3 py-1.5 text-xs text-zinc-900 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-[#3A0F34] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#EAAA00]" />
                                <span>Neighborhood</span>
                              </label>
                              <select
                                value={customArea}
                                onChange={(e) => setCustomArea(e.target.value)}
                                className="w-full bg-white border border-[#3A0F34]/20 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none cursor-pointer"
                              >
                                {AREAS.map((a) => (
                                  <option key={a} value={a}>
                                    {a}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-[#3A0F34] flex items-center gap-1">
                                <Tag className="w-3 h-3 text-[#EAAA00]" />
                                <span>Primary Sector</span>
                              </label>
                              <select
                                value={customSector}
                                onChange={(e) => setCustomSector(e.target.value)}
                                className="w-full bg-white border border-[#3A0F34]/20 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none cursor-pointer"
                              >
                                {SECTORS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Search Input when no startup is selected yet */
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Type startup name (e.g. AquaExchange or your brand)..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-[#3A0F34] rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors"
                      />

                      {/* Dropdown with matches OR "+ Add as new startup" button */}
                      {isDropdownOpen && searchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                          {matchingListings.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectExistingStartup(s)}
                              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#3A0F34]/8 flex items-center justify-between border-b border-zinc-100 last:border-b-0 cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-[#3A0F34]">{s.name}</span>
                                <span className="text-[10px] text-zinc-500 ml-1.5">
                                  ({s.area})
                                </span>
                              </div>
                              <span className="text-[9.5px] font-bold text-zinc-400">
                                Listed ↗
                              </span>
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleSelectNewStartup(searchQuery)}
                            className="w-full px-3.5 py-3 text-left text-xs bg-[#EAAA00]/15 hover:bg-[#EAAA00]/25 text-[#3A0F34] flex items-center gap-2 cursor-pointer font-bold transition-colors border-t border-[#EAAA00]/30"
                          >
                            <PlusCircle className="w-4 h-4 text-[#3A0F34] shrink-0" />
                            <span>
                              Promote &quot;<strong>{searchQuery.trim()}</strong>&quot; as an unlisted new venture
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── STEP 2: BILLING CONTACT ── */}
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <label className="text-xs font-bold text-[#3A0F34] block">
                    2. Receipt & Contact Information
                  </label>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-600 font-medium">Work / Receipt Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-[#3A0F34] rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-600 font-medium">Contact Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Founder / Marketing Lead"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-[#3A0F34] rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Priority Duration</span>
                    <strong className="text-zinc-900">7 Full Days</strong>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Applicable Taxes & GST</span>
                    <span className="text-emerald-700 font-bold">Included</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Auto-Debit / Recurring</span>
                    <span className="text-zinc-900 font-bold">None (One-time)</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-extrabold text-[#3A0F34]">
                    <span>Total Payable</span>
                    <span>₹499.00</span>
                  </div>
                </div>

                {/* Submit Action: Opens Gateway Modal */}
                <CartoonButton
                  type="submit"
                  disabled={(!selectedStartup && !customStartupName.trim()) || !email}
                  label="Continue to Secure Payment (₹499) →"
                  variant="marigold"
                  size="lg"
                  className="w-full"
                  icon={<Lock className="w-3.5 h-3.5" />}
                  iconPosition="left"
                />
              </form>

              {/* Guarantees */}
              <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[10.5px] text-zinc-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Razorpay 256-Bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant Activation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REAL INTERACTIVE PAYMENT GATEWAY CHECKOUT MODAL ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#3A0F34]/40 backdrop-blur-sm cursor-pointer"
            onClick={() => !paymentProcessing && setShowCheckoutModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white border border-[#3A0F34]/20 rounded-3xl shadow-[0_24px_70px_rgba(58,15,52,0.35)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Payment Gateway Identity */}
            <div className="bg-[#3A0F34] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#EAAA00]" />
                  <span className="font-display font-extrabold text-base text-white">
                    Razorpay Secure Checkout
                  </span>
                </div>
                <p className="text-xs text-[#DDE3E8]/70 mt-0.5">
                  Vizag Startup Map · Priority Placement (7 Days)
                </p>
              </div>

              <div className="text-right">
                <div className="text-xl font-display font-extrabold text-[#EAAA00]">
                  ₹499.00
                </div>
                <span className="text-[10px] text-[#DDE3E8]/60">One-time payment</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Target Venture Summary Banner */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Venture Being Boosted
                  </span>
                  <strong className="text-zinc-900 text-sm font-extrabold">
                    {activeStartupName}
                  </strong>
                  <span className="text-zinc-500 ml-1">({activeStartupArea})</span>
                </div>
                <div className="text-right text-[11px] text-zinc-500">
                  <span>Billing to:</span>
                  <strong className="block text-zinc-800 truncate max-w-[140px]">{email}</strong>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-800 block">
                  Select Payment Option:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'upi'
                        ? 'bg-[#3A0F34] text-white border-[#3A0F34] shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-bold">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-[#3A0F34] text-white border-[#3A0F34] shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs font-bold">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#3A0F34] text-white border-[#3A0F34] shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Netbanking</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Method Panels */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  {/* Scan QR Code */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-28 h-28 rounded-xl bg-white p-2 border border-zinc-200 flex items-center justify-center shrink-0 shadow-xs">
                      {/* Stylized QR SVG */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900 fill-current">
                        <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                        <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                        <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                        <rect x="40" y="10" width="8" height="8" />
                        <rect x="52" y="10" width="8" height="8" />
                        <rect x="40" y="24" width="8" height="8" />
                        <rect x="40" y="40" width="20" height="20" />
                        <rect x="70" y="40" width="8" height="8" />
                        <rect x="85" y="40" width="8" height="8" />
                        <rect x="70" y="55" width="8" height="8" />
                        <rect x="85" y="55" width="8" height="8" />
                        <rect x="40" y="70" width="8" height="8" />
                        <rect x="55" y="70" width="8" height="8" />
                        <rect x="70" y="70" width="20" height="20" />
                        <rect x="40" y="85" width="8" height="8" />
                        <rect x="55" y="85" width="8" height="8" />
                      </svg>
                    </div>

                    <div className="space-y-1 text-xs">
                      <strong className="text-zinc-900 block font-bold">
                        Scan to Pay with Any UPI App
                      </strong>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        Open Google Pay, PhonePe, Paytm, or CRED to scan and authorize ₹499.00 instantly.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10.5px] font-bold text-zinc-600">
                        <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">GPay</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">PhonePe</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-zinc-200">Paytm</span>
                      </div>
                    </div>
                  </div>

                  {/* Or Enter UPI VPA */}
                  <div className="pt-3 border-t border-zinc-200 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Or Enter Your UPI ID / VPA:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourname@oksbi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none focus:border-[#3A0F34]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8921"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="08/28"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                  <label className="text-[11px] font-bold text-zinc-700 block">Popular Banks:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className="p-2.5 rounded-xl border border-zinc-200 bg-white text-left font-bold text-xs text-zinc-800 hover:border-[#3A0F34]"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 flex flex-col items-center">
                <CartoonButton
                  onClick={handleExecutePayment}
                  disabled={paymentProcessing}
                  loading={paymentProcessing}
                  label={paymentProcessing ? processingStep : "Authorize & Pay ₹499.00"}
                  variant="marigold"
                  size="lg"
                  className="w-full"
                  icon={<Lock className="w-3.5 h-3.5" />}
                  iconPosition="left"
                />

                {!paymentProcessing && (
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="w-full py-2 text-center text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    Cancel & Return
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
