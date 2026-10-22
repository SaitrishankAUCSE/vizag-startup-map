'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Building,
  Info,
} from 'lucide-react';
import { LISTING_TYPES, AREAS, STAGES, SECTORS } from '@/config/constants';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker').then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 w-full rounded-xl bg-teal-50 flex items-center justify-center text-xs text-gray-500">
        Loading location picker map...
      </div>
    ),
  }
);

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'startup',
    description: '',
    sector: 'SaaS',
    stage: 'Seed',
    area: 'Rushikonda',
    address: '',
    lat: 17.7835,
    lng: 83.385,
    website: '',
    linkedin: '',
    logo_url: '',
    founder_name: '',
    contact_email: '',
    hp_website_confirm: '', // Honeypot field
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit startup proposal.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64] hover:text-[#093345] px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Map</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-teal-200/90 shadow-md p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Listing Submitted Successfully!
            </h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you for contributing to the Visakhapatnam startup directory. Our moderation team reviews all submissions to verify accuracy before publishing.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E4D64] hover:bg-[#093345] text-white shadow-sm transition-all"
              >
                Return to Directory Map
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData((prev) => ({ ...prev, name: '', description: '' }));
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-teal-100">
                <Building className="w-3.5 h-3.5" />
                <span>Community Directory</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
                Add Your Startup or Ecosystem Hub
              </h1>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                Get discovered by tech talent, angel investors, and customers in Visakhapatnam. Submissions are free and reviewed within 24 hours.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field (hidden from real users, tricks spam bots) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="hp_website_confirm"
                  tabIndex={-1}
                  value={formData.hp_website_confirm}
                  onChange={(e) =>
                    setFormData({ ...formData, hp_website_confirm: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>

              {/* Company Basics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BayTech AI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Listing Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  >
                    {LISTING_TYPES.filter((t) => t.id !== 'all').map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  One-Line Description *
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  placeholder="Describe what your company builds or provides in 1-2 clear sentences..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900 resize-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {formData.description.length}/500 characters
                </span>
              </div>

              {/* Sector, Stage, Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Sector *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  >
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Stage *
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Area *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  >
                    {AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Street Address in Visakhapatnam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hill No. 2, IT SEZ, Rushikonda, Visakhapatnam 530045"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                />
              </div>

              {/* Interactive Location Pin-Drop */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Map Pin Coordinates (Pin-Drop Picker)
                </label>
                <LocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onChange={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                />
              </div>

              {/* Links & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                  />
                </div>
              </div>

              {/* Founder & Private Contact Information */}
              <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64]">
                  <Info className="w-4 h-4 text-teal-700" />
                  <span>Founder Contact Information</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Your contact email is stored securely for verification and moderation purposes. It is strictly never shown publicly on the map.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Founder Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sai Kumar"
                      value={formData.founder_name}
                      onChange={(e) =>
                        setFormData({ ...formData, founder_name: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Private Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="founder@company.com"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_email: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D64]/20 focus:border-[#0E4D64] text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0E4D64] hover:bg-[#093345] text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting Proposal...' : 'Submit for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
