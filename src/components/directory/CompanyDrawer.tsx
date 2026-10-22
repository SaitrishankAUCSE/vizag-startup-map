'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing, Job } from '@/types';
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Share2,
  Check,
  Building,
  ShieldCheck,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface CompanyDrawerProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  jobs?: Job[];
  onSave?: (listing: Listing) => void;
  isSaved?: boolean;
}

export function CompanyDrawer({
  listing,
  isOpen,
  onClose,
  jobs = [],
  onSave,
  isSaved = false,
}: CompanyDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !listing) return null;

  // Extract clean domain for high-res favicon
  let domain = '';
  try {
    if (listing.website) {
      domain = new URL(
        listing.website.startsWith('http')
          ? listing.website
          : `https://${listing.website}`
      ).hostname;
    }
  } catch {
    domain = '';
  }

  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;

  // Filter open jobs for this specific company
  const companyJobs = jobs.filter(
    (j) =>
      j.listing_id === listing.id ||
      j.company_slug === listing.slug ||
      j.company_name?.toLowerCase() === listing.name.toLowerCase()
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/startup/${listing.slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[1300] transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Panel */}
      <aside
        aria-label="Company Details"
        className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[520px] bg-white shadow-2xl z-[1310] flex flex-col border-l border-zinc-200 transition-transform duration-300 ease-out animate-in slide-in-from-right"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {listing.type}
            </span>
            {listing.is_featured && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Featured
              </span>
            )}
            {listing.is_verified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Hero Section */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {faviconUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={faviconUrl}
                  alt={listing.name}
                  className="w-11 h-11 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full rounded-xl bg-gradient-to-br from-[#0E4D64] to-[#093345] text-white flex items-center justify-center font-bold text-xl uppercase ${
                  faviconUrl ? 'hidden' : 'flex'
                }`}
              >
                {listing.name.charAt(0)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-zinc-900 leading-snug">
                {listing.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {listing.stage}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {listing.sector}
                </span>
                <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 px-2.5 py-0.5 text-xs font-medium">
                  {listing.area}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {listing.website && (
              <a
                href={
                  listing.website.startsWith('http')
                    ? listing.website
                    : `https://${listing.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#0E4D64] hover:bg-[#093345] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            {onSave && (
              <button
                onClick={() => onSave(listing)}
                className={`flex items-center gap-1.5 border px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSaved
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isSaved ? 'text-amber-600 fill-amber-600' : 'text-zinc-500'
                  }`}
                />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <Link
              href={`/dashboard?claim=${listing.id}`}
              className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 px-3 py-2 rounded-xl text-xs font-medium ml-auto transition-colors"
              title="Claim this organization listing"
            >
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              <span>Claim</span>
            </Link>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              About
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50/80 p-4 rounded-xl border border-zinc-100">
              {listing.description}
            </p>
          </div>

          {/* Key Facts Grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Organization Info
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                <span className="text-zinc-400 block mb-1">Stage</span>
                <span className="font-semibold text-zinc-800">{listing.stage}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                <span className="text-zinc-400 block mb-1">Sector</span>
                <span className="font-semibold text-zinc-800">{listing.sector}</span>
              </div>
              {listing.founded_year && (
                <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <span className="text-zinc-400 block mb-1">Founded</span>
                  <span className="font-semibold text-zinc-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {listing.founded_year}
                  </span>
                </div>
              )}
              {listing.team_size && (
                <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <span className="text-zinc-400 block mb-1">Team Size</span>
                  <span className="font-semibold text-zinc-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    {listing.team_size}
                  </span>
                </div>
              )}
              {listing.funding_range && (
                <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <span className="text-zinc-400 block mb-1">Funding</span>
                  <span className="font-semibold text-zinc-800">{listing.funding_range}</span>
                </div>
              )}
              {listing.distance_to_beach_km !== undefined && (
                <div className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <span className="text-zinc-400 block mb-1">Coast Proximity</span>
                  <span className="font-semibold text-teal-800">
                    {listing.distance_to_beach_km.toFixed(1)} km to coast
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address & Neighborhood */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Location in Vizag
            </h3>
            <div className="flex items-start gap-2 text-xs text-zinc-700 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/70">
              <MapPin className="w-4 h-4 text-[#E04F36] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-zinc-800">{listing.address}</p>
                <p className="text-zinc-500 mt-0.5">{listing.area}, Visakhapatnam, AP</p>
              </div>
            </div>
          </div>

          {/* Open Roles Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#E04F36]" />
                <span>Open Roles ({companyJobs.length})</span>
              </h3>
              {companyJobs.length > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Hiring Now
                </span>
              )}
            </div>

            {companyJobs.length > 0 ? (
              <div className="space-y-2">
                {companyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-[#0E4D64]/40 transition-colors shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-900 truncate">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {job.location}
                      </p>
                    </div>
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-[#E04F36] hover:bg-[#c93f28] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Apply ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-zinc-50 rounded-xl border border-zinc-200/60 text-xs text-zinc-500">
                <Briefcase className="w-6 h-6 text-zinc-300 mx-auto mb-1.5" />
                <p className="font-medium">No open positions right now</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Are you the founder? Add roles from your dashboard.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-200 px-5 py-3.5 flex items-center justify-between text-xs">
          <Link
            href={`/startup/${listing.slug}`}
            className="text-[#0E4D64] hover:text-[#093345] font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Open dedicated profile page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <span className="text-zinc-400 text-[11px]">
            Vizag Startup Map
          </span>
        </div>
      </aside>
    </>
  );
}
