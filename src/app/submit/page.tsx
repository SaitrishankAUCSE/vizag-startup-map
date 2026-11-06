'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  MapPin,
  Sparkles,
  Briefcase,
  User,
  Mail,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { LISTING_TYPES, AREAS, STAGES, SECTORS } from '@/config/constants';

// Approximate neighborhood center coordinates for Vizag
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Rushikonda: { lat: 17.7835, lng: 83.385 },
  Madhurawada: { lat: 17.801, lng: 83.355 },
  'MVP Colony': { lat: 17.742, lng: 83.341 },
  Siripuram: { lat: 17.722, lng: 83.315 },
  'Dwaraka Nagar': { lat: 17.726, lng: 83.303 },
  Seethammadhara: { lat: 17.741, lng: 83.318 },
  'Beach Road': { lat: 17.715, lng: 83.325 },
  Gajuwaka: { lat: 17.69, lng: 83.21 },
  Pendurthi: { lat: 17.825, lng: 83.2 },
  Other: { lat: 17.73, lng: 83.31 },
};

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'startup' as 'startup' | 'investor' | 'incubator' | 'campus' | 'coworking',
    description: '',
    sector: 'SaaS',
    stage: 'Seed',
    area: 'Rushikonda',
    address: '',
    pincode: '530045',
    lat: 17.7835,
    lng: 83.385,
    website: '',
    linkedin: '',
    logo_url: '',
    is_hiring: false,
    careers_url: '',
    founder_name: '',
    founder_role: 'Founder',
    founder_linkedin: '',
    contact_email: '',
    hp_website_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAreaChange = (area: string) => {
    const coords = AREA_COORDINATES[area] || AREA_COORDINATES.Other;
    setFormData((prev) => ({
      ...prev,
      area,
      lat: coords.lat,
      lng: coords.lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.website.trim() || !formData.contact_email.trim()) {
      setError('Please provide your company name, website URL, and official contact email.');
      return;
    }

    // Format website with https:// if omitted
    let formattedWebsite = formData.website.trim();
    if (!formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || `${formData.name} is a tech venture operating in Visakhapatnam.`,
        sector: formData.sector,
        stage: formData.stage,
        area: formData.area,
        address: formData.address.trim() || `${formData.area}, Visakhapatnam`,
        pincode: formData.pincode,
        lat: formData.lat,
        lng: formData.lng,
        website: formattedWebsite,
        linkedin: formData.linkedin.trim() || '',
        logo_url: formData.logo_url.trim() || '',
        careers_url: formData.careers_url.trim() || '',
        founder_name: formData.founder_name.trim() || 'Founder',
        founder_role: formData.founder_role.trim() || 'Founder',
        founder_linkedin: formData.founder_linkedin.trim() || '',
        contact_email: formData.contact_email.trim().toLowerCase(),
        hp_website_confirm: formData.hp_website_confirm,
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission could not be completed.');
      }

      setSubmissionId(data.id || `VSM-${Date.now().toString(36).toUpperCase()}`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Submission could not be processed. Please check your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-[#3A0F34] selection:text-white">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Map</span>
          </Link>
        </div>

        {submitted ? (
          /* Confirmation Screen */
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest">
                Listing Submitted · ID {submissionId}
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-900">
                Startup Submitted for Review!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.founder_name || 'Founder'}</strong>! <strong>{formData.name}</strong> has been submitted to the Vizag Startup Map directory.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto shadow-xs">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Organization:</span>
                <span className="font-bold text-zinc-900">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Sector & Stage:</span>
                <span className="font-bold text-zinc-900">
                  {formData.sector} · {formData.stage}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Vizag Area:</span>
                <span className="font-bold text-zinc-900">{formData.area}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Confirmation Sent To:</span>
                <span className="font-mono text-zinc-900">{formData.contact_email}</span>
              </div>
            </div>

            {/* Optional Ad Slot Upsell */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Want Instant #1 Visibility?</span>
              </div>
              <p className="text-[11.5px] text-amber-800/90 leading-relaxed">
                Pin your company atop the directory strip for 7 days with a curated Showcase slot.
              </p>
              <Link
                href="/ad-slots/submit"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline"
              >
                Reserve a 7-Day Showcase Slot →
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
              >
                Return to Live Map
              </Link>
            </div>
          </div>
        ) : (
          /* Streamlined Submission Form */
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-extrabold uppercase tracking-widest text-zinc-700">
                <Building2 className="w-3 h-3 text-[#3A0F34]" />
                <span>Free Community Directory Listing</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-900 tracking-tight">
                Submit your startup
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Add your company to the Vizag Startup Map. Takes less than a minute. Free placement across the interactive map and directory.
              </p>
            </div>

            {/* Showcase Banner link callout */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">Looking for guaranteed #1 spotlight placement?</div>
                  <div className="text-zinc-500 text-[11px]">Reserve a 7-day curated banner spot on the directory strip.</div>
                </div>
              </div>
              <Link
                href="/ad-slots/submit"
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:border-zinc-900 font-bold text-zinc-900 text-[11px] whitespace-nowrap transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Reserve Ad Slot</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bot Honeypot */}
              <input
                type="text"
                name="hp_website_confirm"
                value={formData.hp_website_confirm}
                onChange={(e) => setFormData({ ...formData, hp_website_confirm: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* SECTION 1: Company Profile */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-2">
                  1. Company Profile
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fluentgrid"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Entity Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 cursor-pointer"
                    >
                      <option value="startup">Startup / Tech Venture</option>
                      <option value="incubator">Incubator / Accelerator</option>
                      <option value="investor">Angel / Venture Capital</option>
                      <option value="campus">Campus / R&D Lab</option>
                      <option value="coworking">Coworking Space</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Website URL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="fluentgrid.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Company LinkedIn (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/fluentgrid"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Primary Sector *
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 cursor-pointer"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 cursor-pointer"
                    >
                      {STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    One-Line Pitch / Description (Max 140 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={140}
                    placeholder="e.g. Next-gen clean energy software & smart utility automation from Visakhapatnam."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 2: Visakhapatnam Location */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-2">
                  2. Visakhapatnam Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Neighborhood in Vizag *
                    </label>
                    <select
                      value={formData.area}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-400 cursor-pointer"
                    >
                      {AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Office / Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hill No. 3, IT SEZ, Rushikonda"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Hiring Status */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-2">
                  3. Hiring Status & Talent
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hiringToggle"
                    checked={formData.is_hiring}
                    onChange={(e) => setFormData({ ...formData, is_hiring: e.target.checked })}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                  />
                  <label htmlFor="hiringToggle" className="text-sm font-semibold text-zinc-800 cursor-pointer">
                    We are actively hiring in Visakhapatnam
                  </label>
                </div>

                {formData.is_hiring && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Careers / Job Openings Page URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://fluentgrid.com/careers"
                      value={formData.careers_url}
                      onChange={(e) => setFormData({ ...formData, careers_url: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 4: Submitter & Contact */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-2">
                  4. Submitter & Verification Contact
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sai Trishank"
                      value={formData.founder_name}
                      onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Official Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="founder@fluentgrid.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Your LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.founder_linkedin}
                    onChange={(e) => setFormData({ ...formData, founder_linkedin: e.target.value })}
                    className="w-full bg-[#F4F4F5] border border-transparent rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Startup to Directory (Free)'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-zinc-400 mt-2">
                  Submissions are reviewed and pinned to the live map within 24 hours.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
