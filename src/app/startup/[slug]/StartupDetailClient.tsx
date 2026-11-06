'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Calendar,
  Users,
  Banknote,
  CheckCircle2,
  Sparkles,
  Briefcase,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Listing } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';
import { MiniMap } from '@/components/map/MiniMap';
import { getOriginalLogoUrl } from '@/lib/logos';

interface StartupDetailClientProps {
  listing: Listing;
}

export function StartupDetailClient({ listing }: StartupDetailClientProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = getOriginalLogoUrl(listing);

  const initials = (listing.name || 'Startup')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w ? w.charAt(0).toUpperCase() : ''))
    .join('') || 'VS';

  const hasFounded = Boolean(listing.founded_year && listing.founded_year_source);
  const hasTeam = Boolean(listing.team_size && listing.team_size_source);
  const fundingVal = listing.funding_text || listing.funding_range;
  const hasFunding = Boolean(fundingVal && listing.funding_source_url);
  const hasCoast = listing.distance_to_beach_km !== undefined && listing.distance_to_beach_km !== null;
  const hasAnyMeta = hasFounded || hasTeam || hasFunding || hasCoast;

  return (
    <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
      <Header />

      <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-4xl w-full mx-auto">
        <Strips animate={false} />

        <div className="relative z-10 space-y-6">
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between">
            <Link
              href="/grid"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Link>

            <Link
              href={`/dashboard?claim=${listing.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#3A0F34]/30 text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Claim this listing</span>
            </Link>
          </div>

          {/* Main Company Card */}
          <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo Tile */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-display font-extrabold border shrink-0 overflow-hidden shadow-xs ${
                  listing.is_featured
                    ? 'border-[#EAAA00] ring-4 ring-[#EAAA00]/30 bg-[#3A0F34] text-[#EAAA00]'
                    : 'border-[#3A0F34]/20 bg-[#3A0F34] text-[#DDE3E8]'
                }`}
              >
                {logoSrc && !logoFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoSrc}
                    alt={listing.name}
                    className="w-full h-full object-contain p-2"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                        setLogoFailed(true);
                      }
                    }}
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#3A0F34] tracking-tight">
                    {listing.name}
                  </h1>
                  {listing.is_verified && (
                    <span
                      title="Verified Listing"
                      className="inline-flex items-center gap-1 bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>
                        {listing.verified_on
                          ? `Verified on ${listing.verified_on}`
                          : listing.verified_at
                          ? `Verified on ${new Date(listing.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : 'Verified'}
                      </span>
                    </span>
                  )}
                  {listing.is_featured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAAA00] text-[#3A0F34] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#3A0F34]/70 mb-4 font-semibold">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3A0F34]/10 text-[#3A0F34] uppercase tracking-wider text-[10px]">
                    {listing.type}
                  </span>
                  {listing.stage && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#3A0F34]/10 text-[#3A0F34]">
                      {listing.stage}
                    </span>
                  )}
                  {listing.sector && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#3A0F34]/10 text-[#3A0F34]">
                      {listing.sector}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#3A0F34]/70">
                    <MapPin className="w-3.5 h-3.5 text-[#3A0F34]/50" />
                    {listing.area}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>VISIT WEBSITE</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                  {listing.careers_url && (
                    <a
                      href={listing.careers_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#3A0F34]/20 text-[#3A0F34] hover:border-[#3A0F34] transition-colors shadow-xs"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-teal-700" />
                      <span>CAREERS</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                  {listing.linkedin && (
                    <a
                      href={listing.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors px-2 py-1"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-[#3A0F34]/15">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#3A0F34]/70 mb-2">
                About
              </h2>
              <p className="text-sm text-[#3A0F34]/85 leading-relaxed">
                {listing.description || listing.one_liner}
              </p>
            </div>

            {/* Key Metadata Grid */}
            {hasAnyMeta && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#3A0F34]/8 p-4 rounded-xl border border-[#3A0F34]/15">
                {hasFounded && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#3A0F34]/60 flex items-center gap-1 mb-1 font-bold">
                      <Calendar className="w-3 h-3 text-[#EAAA00]" /> Founded
                    </span>
                    <span className="text-xs font-extrabold text-[#3A0F34]">
                      {listing.founded_year}
                    </span>
                  </div>
                )}
                {hasTeam && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#3A0F34]/60 flex items-center gap-1 mb-1 font-bold">
                      <Users className="w-3 h-3 text-[#EAAA00]" /> Team Size
                    </span>
                    <span className="text-xs font-extrabold text-[#3A0F34]">
                      {listing.team_size}
                    </span>
                  </div>
                )}
                {hasFunding && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#3A0F34]/60 flex items-center gap-1 mb-1 font-bold">
                      <Banknote className="w-3 h-3 text-[#EAAA00]" /> Funding
                    </span>
                    <span className="text-xs font-extrabold text-[#3A0F34]">
                      {fundingVal}
                    </span>
                  </div>
                )}
                {hasCoast && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#3A0F34]/60 flex items-center gap-1 mb-1 font-bold">
                      <MapPin className="w-3 h-3 text-[#EAAA00]" /> Coast Dist.
                    </span>
                    <span className="text-xs font-extrabold text-[#3A0F34]">
                      {listing.distance_to_beach_km} km
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Source Line & Trust Footer */}
            <div className="mt-6 pt-4 border-t border-[#3A0F34]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#3A0F34]/70">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold">Source:</span>
                {listing.sources?.[0]?.source_url ? (
                  <a
                    href={listing.sources[0].source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#3A0F34] font-semibold flex items-center gap-1"
                  >
                    <span>{listing.sources[0].source_type.replace(/_/g, ' ')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>{listing.sources?.[0]?.source_type?.replace(/_/g, ' ') || 'Ecosystem verified'}</span>
                )}
                {listing.verified_at && (
                  <span className="text-[11px] text-[#3A0F34]/50">
                    · Verified on {new Date(listing.verified_at).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <Link
                  href={`/?startup=${listing.slug}`}
                  className="hover:text-[#3A0F34] font-semibold text-[#3A0F34]/80"
                >
                  Report incorrect data
                </Link>
                <span>·</span>
                <Link
                  href={`/?startup=${listing.slug}`}
                  className="text-red-700 hover:text-red-800 font-semibold"
                >
                  Remove listing
                </Link>
              </div>
            </div>
          </div>

          {/* Open Jobs Section */}
          <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-extrabold text-lg text-[#3A0F34] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#EAAA00]" />
                <span>Open Roles</span>
                <span className="text-xs font-normal text-[#3A0F34]/60">
                  ({listing.open_jobs?.length || 0})
                </span>
              </h2>
            </div>

            {listing.careers_status === 'unknown' ? (
              listing.careers_url ? (
                <div className="p-4 rounded-xl border border-[#3A0F34]/20 bg-[#DDE3E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#3A0F34]">Official Careers Page</h3>
                    <p className="text-xs text-[#3A0F34]/70 mt-0.5">
                      Explore active opportunities and submit your profile directly.
                    </p>
                  </div>
                  <a
                    href={listing.careers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors shrink-0 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <span>Careers Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#3A0F34]/65">
                  No active openings listed right now. Check back soon or visit their website.
                </div>
              )
            ) : listing.open_jobs && listing.open_jobs.length > 0 ? (
              <div className="space-y-3">
                {listing.open_jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-[#3A0F34]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#DDE3E8]"
                  >
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#3A0F34]">{job.title}</h3>
                      <p className="text-xs text-[#3A0F34]/70 mt-0.5">{job.location_text || job.location}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <a
                        href={job.apply_url || listing.careers_url || listing.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          fetch('/api/analytics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ listingId: listing.id, event: 'apply_click' }),
                          }).catch(() => {});
                        }}
                        className="px-5 py-2 rounded-full text-xs font-bold bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-xs"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-[10px] text-[#3A0F34]/55 italic text-right">
                        You will apply on {listing.name}&apos;s website.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#3A0F34]/65">
                No active openings listed right now. Check back soon or visit their website.
              </div>
            )}
          </div>

          {/* Location & Mini Map Section */}
          <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-extrabold text-lg text-[#3A0F34] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#EAAA00]" />
              <span>Location in Visakhapatnam</span>
            </h2>
            <p className="text-xs text-[#3A0F34]/75">{listing.address}</p>

            <div className="rounded-xl overflow-hidden border border-[#3A0F34]/20">
              <MiniMap
                center={[listing.lng, listing.lat]}
                zoom={14}
                pins={[
                  {
                    lat: listing.lat,
                    lng: listing.lng,
                    type: listing.type,
                    name: listing.name,
                  },
                ]}
                className="h-72 w-full"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

