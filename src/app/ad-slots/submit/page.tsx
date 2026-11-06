'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Building, Megaphone, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';

const SLOTS = [
  {
    id: 'map_banner',
    title: 'Map Banner Spotlight',
    description: 'Prominent featured card rendered directly on the interactive map canvas and header.',
    audience: 'Founders, investors, and local tech community',
    pricing: 'Starts at ₹4,999 / month',
    badge: 'High Reach',
  },
  {
    id: 'sector_exclusive',
    title: 'Sector Category Takeover',
    description: 'Exclusive partner branding at the top of sector directories (e.g. SaaS, Agritech, Maritime Tech).',
    audience: 'Niche domain buyers & specialized talent',
    pricing: 'Starts at ₹2,999 / month',
    badge: 'Targeted',
  },
  {
    id: 'hiring_partner',
    title: 'Ecosystem Talent & Job Partner',
    description: 'Pinned placement across all job board listings and talent digest notifications.',
    audience: 'Engineers, product designers, and senior operators',
    pricing: 'Starts at ₹3,499 / month',
    badge: 'Recruitment',
  },
];

export default function AdSlotsPage() {
  const [formData, setFormData] = useState({
    orgName: '',
    website: '',
    contactName: '',
    email: '',
    slotType: 'map_banner',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orgName || !formData.email) {
      setError('Please fill in your company name and contact email.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/ad-slots/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-4xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 space-y-10">
          {/* Top navigation */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Map</span>
            </Link>
          </div>

          {/* Headline */}
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34]">
              SPONSORSHIP & PARTNERSHIPS
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] tracking-tight">
              Put Your Brand in Front of Vizag&apos;s Tech Decision Makers
            </h1>
            <p className="text-sm text-[#3A0F34]/80 leading-relaxed">
              Vizag Startup Map is visited monthly by founders, venture capitalists, senior software architects, and government ecosystem enablers across Andhra Pradesh.
            </p>
          </div>

          {/* Slot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SLOTS.map((slot) => (
              <div
                key={slot.id}
                onClick={() => setFormData((prev) => ({ ...prev, slotType: slot.id }))}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  formData.slotType === slot.id
                    ? 'bg-[#3A0F34] text-[#DDE3E8] border-[#3A0F34] shadow-lg -translate-y-1'
                    : 'bg-white/60 hover:bg-white text-[#3A0F34] border-[#3A0F34]/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${
                        formData.slotType === slot.id
                          ? 'bg-[#EAAA00] text-[#3A0F34]'
                          : 'bg-[#3A0F34]/10 text-[#3A0F34]'
                      }`}
                    >
                      {slot.badge}
                    </span>
                    {formData.slotType === slot.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#EAAA00]" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base mt-1">{slot.title}</h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      formData.slotType === slot.id ? 'text-[#DDE3E8]/80' : 'text-[#3A0F34]/70'
                    }`}
                  >
                    {slot.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-current/15 text-xs font-bold">
                  {slot.pricing}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white/70 border border-[#3A0F34]/20 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#3A0F34]">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-[#3A0F34]/75 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We will review your brand details and reply with availability, impressions metrics, and onboarding details within 24 hours.
                </p>
                <div className="pt-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] text-xs font-bold transition-colors"
                  >
                    Return to Map
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display font-bold text-xl text-[#3A0F34]">
                  Book an Ad Slot or Partner Placement
                </h2>

                {error && (
                  <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                      Organization / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Startup Hub, Awfis Vizag"
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:border-[#3A0F34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:border-[#3A0F34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:border-[#3A0F34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="partners@yourbrand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:border-[#3A0F34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A0F34]/70 mb-1">
                    Campaign Goals & Specific Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the launch date, target audience (founders vs developers), or custom banner designs you'd like to run."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#3A0F34]/20 outline-none focus:border-[#3A0F34]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Sponsorship Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

