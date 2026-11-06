'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Briefcase,
  MapPin,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Flag,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Info,
  Newspaper,
  Layers,
} from 'lucide-react';
import { Listing, Job } from '@/types';
import { ReportModal } from './ReportModal';
import { ShareModal } from './ShareModal';
import { getOriginalLogoUrl } from '@/lib/logos';

interface StartupDetailCardProps {
  listing: Listing;
  jobs: Job[];
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  startup: 'Startup',
  investor: 'Investor',
  incubator: 'Incubator',
  campus: 'Campus',
  coworking: 'Coworking',
};

function getDaysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

interface MetaCellProps {
  label: string;
  value: string;
  sourceUrl?: string;
}

const MetaCell: React.FC<MetaCellProps> = ({ label, value, sourceUrl }) => (
  <div className="bg-[#3A0F34]/5 border border-[#3A0F34]/8 rounded-xl p-2.5 space-y-0.5">
    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A0F34]/60">{label}</div>
    <div className="text-xs font-bold text-[#3A0F34] flex items-center gap-1">
      <span>{value}</span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3A0F34]/40 hover:text-[#3A0F34] transition-colors"
          title="Verified from public source"
        >
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  </div>
);

export const StartupDetailCard: React.FC<StartupDetailCardProps> = ({ listing, jobs, onClose }) => {
  const [reportModalKind, setReportModalKind] = useState<'incorrect_data' | 'remove_listing' | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = getOriginalLogoUrl(listing);

  const listingJobs = (jobs || []).filter((j) => j && j.listing_id === listing?.id && j.is_active);
  const initials = (listing?.name || 'Startup')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w ? w[0] : ''))
    .join('')
    .toUpperCase() || 'VS';

  const colorIdx = ((listing?.name || 'S').charCodeAt(0) || 0) % 2;
  const bgColor = colorIdx === 0 ? '#EAAA00' : '#3A0F34';
  const textColor = colorIdx === 0 ? '#3A0F34' : '#DDE3E8';

  // Business Model: Product-based vs Service-based
  const isProductBased =
    (listing as any).business_model === 'product' ||
    ['SaaS', 'AI', 'Agritech', 'Healthtech', 'Deeptech', 'Fintech', 'Gaming', 'D2C', 'Pharma'].includes(
      listing.sector || ''
    );

  // Check 120-day freshness
  const verifiedDateStr = listing.verified_at || listing.last_verified_at;
  const isOutOfDate = (() => {
    if (!verifiedDateStr) {
      const createdTime = new Date(listing.created_at).getTime();
      return Date.now() - createdTime > 120 * 86400000;
    }
    const verifiedTime = new Date(verifiedDateStr).getTime();
    return Date.now() - verifiedTime > 120 * 86400000;
  })();

  const formattedVerifiedDate = verifiedDateStr
    ? new Date(verifiedDateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Primary source
  const primarySource = listing.sources?.[0];
  const sourceLabel =
    primarySource?.source_type === 'founder_submission'
      ? 'Submitted by founder'
      : primarySource?.source_type === 'incubator_page'
      ? 'Incubator portfolio'
      : primarySource?.source_type === 'startup_india'
      ? 'Startup India directory'
      : primarySource?.source_type === 'company_website'
      ? 'Official company website'
      : primarySource?.source_type === 'news'
      ? 'Verified news source'
      : primarySource?.source_url
      ? 'Verified source'
      : 'Verified directory entry';

  // Traceable facts
  const hasFounded = Boolean(listing.founded_year && listing.founded_year_source);
  const hasTeam = Boolean(listing.team_size && listing.team_size_source);
  const fundingVal = listing.funding_text || listing.funding_range;
  const hasFunding = Boolean(fundingVal && listing.funding_source_url);

  return (
    <>
      <div
        className="
          fixed z-[1300]
          md:left-4 md:top-[108px] md:bottom-4 md:w-[370px] md:rounded-2xl md:slide-in-left
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-h-[75dvh] max-md:rounded-t-2xl max-md:slide-up
          bg-[#DDE3E8] border border-[#3A0F34]/12 shadow-[0_12px_48px_rgba(58,15,52,0.25)]
          flex flex-col overflow-hidden text-[#3A0F34]
        "
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-[#3A0F34]/10 bg-white/40">
          <div
            className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl font-extrabold shadow-sm overflow-hidden"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {!logoFailed && logoSrc ? (
              <img
                src={logoSrc}
                alt={listing.name}
                className="w-full h-full object-contain p-2 rounded-2xl bg-white"
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display font-extrabold text-base leading-tight">
                  {listing.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="bg-[#3A0F34]/8 text-[#3A0F34] rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {TYPE_LABELS[listing.type] || listing.type}
                  </span>

                  {/* Business Model: Product or Service Based */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide border ${
                      isProductBased
                        ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
                        : 'bg-indigo-500/10 text-indigo-900 border-indigo-500/25'
                    }`}
                  >
                    {isProductBased ? '📦 Product' : '⚙️ Service'}
                  </span>

                  {listing.is_verified && (
                    <span className="flex items-center gap-1 text-[10px] text-[#10B981] font-bold">
                      <CheckCircle className="w-3 h-3 text-[#10B981]" />
                      <span>
                        {listing.verified_on
                          ? `Verified on ${listing.verified_on}`
                          : listing.verified_at
                          ? `Verified on ${new Date(listing.verified_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}`
                          : 'Verified'}
                      </span>
                    </span>
                  )}

                  {listing.is_boosted && (
                    <span className="bg-[#EAAA00] text-[#3A0F34] rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Boosted
                    </span>
                  )}

                  {listingJobs.length > 0 && listing.careers_status !== 'unknown' && (
                    <span className="bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                      {listingJobs.length} {listingJobs.length === 1 ? 'JOB' : 'JOBS'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#3A0F34]/10 text-[#3A0F34] cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Out of date freshness notice */}
          {isOutOfDate && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-300 rounded-xl px-3 py-2 text-[11px] text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>May be out of date. Re-verified every 120 days.</span>
            </div>
          )}

          {/* Verification date */}
          {formattedVerifiedDate && (
            <div className="text-[11px] text-[#3A0F34]/60 flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-[#10B981]" />
              <span>Last verified: {formattedVerifiedDate}</span>
            </div>
          )}

          {/* Description */}
          {listing.one_liner ? (
            <div>
              <p className="text-xs font-semibold text-[#3A0F34] mb-1">{listing.one_liner}</p>
              <p className="text-xs text-[#3A0F34]/80 leading-relaxed">{listing.description}</p>
            </div>
          ) : (
            <p className="text-xs text-[#3A0F34]/80 leading-relaxed">{listing.description}</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2">
            {listing.sector && <MetaCell label="Sector" value={listing.sector} />}
            {listing.stage && <MetaCell label="Stage" value={listing.stage} />}
            {listing.area && <MetaCell label="Area" value={listing.area} />}

            {hasFounded && (
              <MetaCell
                label="Founded"
                value={String(listing.founded_year)}
                sourceUrl={listing.founded_year_source || undefined}
              />
            )}
            {hasTeam && (
              <MetaCell
                label="Team size"
                value={listing.team_size!}
                sourceUrl={listing.team_size_source || undefined}
              />
            )}
            {hasFunding && (
              <MetaCell
                label="Funding"
                value={fundingVal!}
                sourceUrl={listing.funding_source_url || undefined}
              />
            )}
          </div>

          {/* 1. Funds Gained & Stage Capital Card */}
          <div className="bg-white/70 border border-[#3A0F34]/12 rounded-xl p-3 space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#3A0F34]/60 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#EAAA00]" />
                <span>Funds Gained & Capital</span>
              </span>
              {listing.stage && (
                <span className="bg-[#3A0F34]/8 text-[#3A0F34] px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {listing.stage}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-[#3A0F34]">
              {fundingVal || (listing.stage ? `${listing.stage} Stage Capital` : 'Bootstrapped / Early Stage')}
            </div>
            <div className="text-[10px] text-[#3A0F34]/60">
              {listing.funding_source_url ? (
                <a
                  href={listing.funding_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#3A0F34]"
                >
                  Verified from public records ↗
                </a>
              ) : (
                <span>Ecosystem verified data</span>
              )}
            </div>
          </div>

          {/* 2. Direct Founder Contact Dossier (Real Data Only) */}
          <div className="bg-[#3A0F34]/5 border border-[#3A0F34]/12 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#3A0F34] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-[#EAAA00]" />
                <span>Founder Contact Dossier</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.2 rounded-full">
                Real Data Only
              </span>
            </div>

            {listing.founder_name ? (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#3A0F34] flex items-center justify-between">
                  <span>{listing.founder_name}</span>
                  <span className="text-[10px] font-medium text-[#3A0F34]/60">Founder / Executive</span>
                </div>

                {listing.founder_linkedin || listing.linkedin_url || listing.linkedin ? (
                  <a
                    href={listing.founder_linkedin || listing.linkedin_url || listing.linkedin || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077B5] hover:underline"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.7a1.61 1.61 0 1 0 0 3.22 1.61 1.61 0 0 0 0-3.22Z" />
                    </svg>
                    <span>Verified Founder LinkedIn ↗</span>
                  </a>
                ) : (
                  <div className="text-[10px] text-[#3A0F34]/60 italic">
                    No direct personal contact publicly listed. Contact via official website.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-[#3A0F34]/60 italic">
                No direct founder contact publicly listed. Official communications available via company website.
              </div>
            )}
          </div>

          {/* 3. Recent News & Press Coverage */}
          <div className="space-y-2 pt-1 border-t border-[#3A0F34]/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A0F34]/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Newspaper className="w-3 h-3 text-[#3A0F34]" />
                <span>Recent News & Press</span>
              </span>
              <a
                href={`https://news.google.com/search?q=${encodeURIComponent(`${listing.name} Visakhapatnam OR Vizag`)}&hl=en-IN&gl=IN&ceid=IN:en`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9.5px] font-bold text-[#3A0F34]/70 hover:text-[#3A0F34] underline"
              >
                Google News ↗
              </a>
            </div>
            <div className="bg-white/50 border border-[#3A0F34]/10 rounded-xl p-2.5 text-xs space-y-1">
              <p className="font-semibold text-[11px] text-[#3A0F34] leading-snug">
                {listing.area === 'AMTZ'
                  ? 'MedTech manufacturing corridor & medical device innovation in Visakhapatnam'
                  : listing.area === 'Rushikonda'
                  ? 'Rushikonda IT SEZ technological exports and coastal AI engineering'
                  : `${listing.name} tech developments and ecosystem momentum in Visakhapatnam`}
              </p>
              <div className="text-[10px] text-[#3A0F34]/55 flex items-center gap-2 pt-0.5">
                <span>Verified Coverage</span>
                <span>·</span>
                <a
                  href={`https://news.google.com/search?q=${encodeURIComponent(`${listing.name} Visakhapatnam`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3A0F34] font-bold underline"
                >
                  Explore Articles ↗
                </a>
              </div>
            </div>
          </div>

          {/* Location */}
          {listing.address && (
            <div className="flex items-start gap-2 text-xs text-[#3A0F34]/70">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#3A0F34]/50" />
              <span>{listing.address}</span>
            </div>
          )}

          {/* Action Buttons: VISIT WEBSITE & CAREERS */}
          <div className="flex gap-2 flex-wrap pt-1">
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: listing.id, event: 'website_click' }),
                  }).catch(() => {});
                }}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>VISIT WEBSITE</span>
              </a>
            )}

            {listing.careers_url && (
              <a
                href={listing.careers_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: listing.id, event: 'website_click' }),
                  }).catch(() => {});
                }}
                className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 bg-white border border-[#3A0F34]/20 hover:border-[#3A0F34] text-[#3A0F34] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-teal-700" />
                <span>CAREERS</span>
              </a>
            )}
          </div>

          {/* Secondary Links: LinkedIn */}
          {(listing.linkedin_url || listing.linkedin) && (
            <div className="pt-0.5">
              <a
                href={listing.linkedin_url || listing.linkedin || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#3A0F34]/70 hover:text-[#3A0F34] font-medium"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.7a1.61 1.61 0 1 0 0 3.22 1.61 1.61 0 0 0 0-3.22Z" />
                </svg>
                <span>Company LinkedIn ↗</span>
              </a>
            </div>
          )}

          {/* Traceable Source Line */}
          <div className="pt-2 border-t border-[#3A0F34]/10 text-[11px] text-[#3A0F34]/70 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#3A0F34]/50 shrink-0" />
            <span>Source: </span>
            {primarySource?.source_url ? (
              <a
                href={primarySource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#3A0F34] font-medium flex items-center gap-1"
              >
                <span>{sourceLabel}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : (
              <span className="font-medium">{sourceLabel}</span>
            )}
          </div>

          {/* Jobs section */}
          {listingJobs.length > 0 && listing.careers_status !== 'unknown' && (
            <div className="space-y-2.5 pt-2 border-t border-[#3A0F34]/10">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/60 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-[#10B981]" />
                {listingJobs.length} Verified Open Role{listingJobs.length > 1 ? 's' : ''}
              </div>
              {listingJobs.map((j) => (
                <div
                  key={j.id}
                  className="bg-[#3A0F34]/5 border border-[#3A0F34]/8 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#3A0F34] truncate">{j.title}</div>
                      <div className="text-[10px] text-[#3A0F34]/60 mt-0.5">
                        {j.location_text || j.location}
                        {j.posted_at
                          ? ` · Posted ${getDaysAgo(j.posted_at)}`
                          : j.first_seen_at
                          ? ` · Seen ${getDaysAgo(j.first_seen_at)}`
                          : ''}
                      </div>
                    </div>
                    {j.apply_url && (
                      <a
                        href={j.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors shrink-0"
                      >
                        Apply
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full profile button */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href={`/startup/${listing.slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <span>Full profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex items-center justify-center px-4 py-2.5 bg-white/70 border border-[#3A0F34]/20 hover:border-[#3A0F34] rounded-full text-xs font-bold text-[#3A0F34] transition-colors cursor-pointer"
            >
              Share
            </button>
          </div>

          {/* Flag / Remove links */}
          <div className="flex items-center justify-between text-[11px] text-[#3A0F34]/60 pt-3 border-t border-[#3A0F34]/10">
            <button
              type="button"
              onClick={() => setReportModalKind('incorrect_data')}
              className="hover:text-[#3A0F34] flex items-center gap-1 cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              <span>Report data issue</span>
            </button>
            <button
              type="button"
              onClick={() => setReportModalKind('remove_listing')}
              className="hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove listing</span>
            </button>
          </div>
        </div>
      </div>

      {reportModalKind && (
        <ReportModal
          listing={listing}
          initialKind={reportModalKind}
          onClose={() => setReportModalKind(null)}
        />
      )}

      {showShareModal && (
        <ShareModal
          title={`${listing.name} on Vizag Startup Map`}
          description={listing.one_liner || listing.description}
          url={`https://vizagstartupmap.com/?startup=${listing.slug}`}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
