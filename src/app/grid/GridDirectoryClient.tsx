'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Listing, Job, FilterState } from '@/types';
import { LISTING_TYPES, AREAS, STAGES, SECTORS } from '@/config/constants';
import { Search, ExternalLink, Briefcase, MapPin, ArrowRight, Sparkles, Download } from 'lucide-react';
import { getOriginalLogoUrl } from '@/lib/logos';
import { ShowcaseSpotlightBanner } from '@/components/ui/ShowcaseSpotlightBanner';

interface GridDirectoryClientProps {
  initialListings: Listing[];
  jobs: Job[];
}

// Fallback initial tiles
function getPinVariant(name?: string | null): { bg: string; text: string } {
  const safeName = name || 'Vizag';
  const charCode = safeName.charCodeAt(0) + (safeName.charCodeAt(1) || 0);
  return charCode % 2 === 0
    ? { bg: '#EAAA00', text: '#3A0F34' }
    : { bg: '#3A0F34', text: '#DDE3E8' };
}

function getInitials(name?: string | null): string {
  if (!name) return 'VS';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w ? w.charAt(0).toUpperCase() : ''))
    .join('') || 'VS';
}

export const GridDirectoryClient: React.FC<GridDirectoryClientProps> = ({
  initialListings,
  jobs,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [hiringOnly, setHiringOnly] = useState(false);

  const filteredListings = useMemo(() => {
    return initialListings.filter((l) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          (l.sector && l.sector.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedType !== 'all' && l.type !== selectedType) return false;
      if (selectedArea !== 'all' && l.area !== selectedArea) return false;
      if (selectedSector !== 'all' && l.sector !== selectedSector) return false;
      if (selectedStage !== 'all' && l.stage !== selectedStage) return false;
      if (hiringOnly && (!l.jobs_count || l.jobs_count <= 0)) return false;
      return true;
    });
  }, [initialListings, search, selectedType, selectedArea, selectedSector, selectedStage, hiringOnly]);

  const hiringCompaniesCount = useMemo(() => {
    return initialListings.filter((l) => (l.jobs_count || 0) > 0).length;
  }, [initialListings]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedArea('all');
    setSelectedSector('all');
    setSelectedStage('all');
    setHiringOnly(false);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedType !== 'all' ||
    selectedArea !== 'all' ||
    selectedSector !== 'all' ||
    selectedStage !== 'all' ||
    hiringOnly;

  return (
    <div className="space-y-8 relative">
      {/* Floating Return to Map Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl border border-[#EAAA00]/40 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span>🗺️ Return to Map</span>
        </Link>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Search input + Hiring switch */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A0F34]/50 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search startups, founders, sectors, or areas..."
              className="w-full bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-[#3A0F34] placeholder:text-[#3A0F34]/50 focus:border-[#3A0F34] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              href="/api/listings/export"
              download
              className="flex items-center gap-1.5 bg-[#EAAA00] hover:bg-[#3A0F34] text-[#3A0F34] hover:text-[#EAAA00] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download verified 60+ Vizag startups, founders, and stages in CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              type="button"
              onClick={() => setHiringOnly(!hiringOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                hiringOnly
                  ? 'bg-[#3A0F34] text-[#DDE3E8] shadow-sm'
                  : 'bg-[#DDE3E8] border border-[#3A0F34]/25 text-[#3A0F34] hover:border-[#3A0F34]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Hiring only ({hiringCompaniesCount})</span>
              <span
                className={`w-2 h-2 rounded-full ${hiringOnly ? 'bg-[#EAAA00]' : 'bg-[#3A0F34]/30'}`}
              />
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#3A0F34] hover:underline cursor-pointer px-2"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#3A0F34]/15">
          {LISTING_TYPES.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#3A0F34] text-[#DDE3E8]'
                    : 'bg-[#DDE3E8] border border-[#3A0F34]/20 text-[#3A0F34] hover:bg-[#3A0F34]/10'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Area */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A0F34]/60 mb-1">
              Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-lg px-3 py-2 text-xs font-semibold text-[#3A0F34] cursor-pointer"
            >
              <option value="all">All Areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A0F34]/60 mb-1">
              Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-lg px-3 py-2 text-xs font-semibold text-[#3A0F34] cursor-pointer"
            >
              <option value="all">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A0F34]/60 mb-1">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-[#DDE3E8] border border-[#3A0F34]/25 rounded-lg px-3 py-2 text-xs font-semibold text-[#3A0F34] cursor-pointer"
            >
              <option value="all">All Stages</option>
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Active Weekly Showcase Spotlight Strip ── */}
      <ShowcaseSpotlightBanner />

      {/* ── Results Bar ── */}
      <div className="flex items-center justify-between text-xs font-bold text-[#3A0F34]/70">
        <div>
          Showing <span className="text-[#3A0F34] font-extrabold">{filteredListings.length}</span>{' '}
          {filteredListings.length === 1 ? 'organization' : 'organizations'}
        </div>
        <Link
          href="/"
          className="text-[#3A0F34] hover:text-[#EAAA00] font-bold uppercase tracking-[0.12em] flex items-center gap-1.5 transition-colors"
        >
          View on Map →
        </Link>
      </div>

      {/* ── Listings Grid ── */}
      {initialListings.length === 0 ? (
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-12 text-center space-y-4">
          <p className="font-display font-bold text-xl text-[#3A0F34]">
            No startups on the map yet.
          </p>
          <p className="text-xs text-[#3A0F34]/70 max-w-sm mx-auto">
            Be the first to add yours and put your company on the Visakhapatnam tech map.
          </p>
          <Link
            href="/submit"
            className="inline-block px-6 py-2.5 rounded-full bg-[#3A0F34] text-[#DDE3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors"
          >
            + Submit Startup
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-12 text-center space-y-4">
          <p className="font-display font-bold text-xl text-[#3A0F34]">
            No organizations match these filters.
          </p>
          <p className="text-xs text-[#3A0F34]/70 max-w-sm mx-auto">
            Try adjusting your search query, or clear active filters to discover the entire Vizag directory.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-block px-5 py-2 rounded-full bg-[#EAAA00] text-[#3A0F34] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => {
            const variant = getPinVariant(listing.name);
            const initials = getInitials(listing.name);
            const jobsCount = listing.jobs_count || 0;

            return (
              <div
                key={listing.id}
                className={`bg-[#DDE3E8] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 border ${
                  listing.is_featured
                    ? 'border-[#EAAA00] ring-2 ring-[#EAAA00]/30 shadow-md'
                    : 'border-[#3A0F34]/20 hover:border-[#3A0F34]/40 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top row: Logo tile + Name + Type/Stage */}
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Logo Tile */}
                    <div
                      className="w-12 h-12 rounded-xl border border-[#3A0F34]/20 shrink-0 flex items-center justify-center overflow-hidden shadow-xs bg-white"
                      style={{ background: variant.bg }}
                    >
                      {getOriginalLogoUrl(listing) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={getOriginalLogoUrl(listing)!}
                          alt={listing.name}
                          className="w-full h-full object-contain p-1.5 bg-white"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                              img.style.display = 'none';
                            }
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span
                          className="font-display font-extrabold text-base"
                          style={{ color: variant.text }}
                        >
                          {initials}
                        </span>
                      )}
                    </div>

                    {/* Title + Area */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-display font-extrabold text-lg text-[#3A0F34] leading-tight truncate">
                          {listing.name}
                        </h2>
                        {listing.is_featured && (
                          <span className="bg-[#EAAA00] text-[#3A0F34] text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Boosted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3A0F34]/60 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#3A0F34]/50" />
                        <span>{listing.area}</span>
                        {listing.stage && (
                          <>
                            <span>·</span>
                            <span>{listing.stage}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#3A0F34]/80 leading-relaxed line-clamp-2 mb-4">
                    {listing.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {listing.sector && (
                      <span className="bg-[#3A0F34]/10 text-[#3A0F34] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {listing.sector}
                      </span>
                    )}
                    <span className="bg-[#3A0F34]/8 text-[#3A0F34] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {listing.type}
                    </span>
                    {jobsCount > 0 && (
                      <span className="bg-[#3A0F34] text-[#DDE3E8] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EAAA00]" />
                        {jobsCount} JOB{jobsCount > 1 ? 'S' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[#3A0F34]/15 flex items-center justify-between gap-2">
                  {listing.website ? (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3A0F34]/70 hover:text-[#3A0F34] flex items-center gap-1 transition-colors"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#3A0F34]/40 font-semibold">
                      Vizag Ecosystem
                    </span>
                  )}

                  <Link
                    href={`/startup/${listing.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
                  >
                    Profile <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
