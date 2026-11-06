'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  Zap,
  Plus,
  X,
  Briefcase,
} from 'lucide-react';
import { Listing, Job, FilterState } from '@/types';

interface FloatingTopBarProps {
  listings: Listing[];
  jobs: Job[];
  filters: FilterState;
  activeFilterCount: number;
  viewMode: 'map' | 'grid';
  hasSampleData?: boolean;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onViewModeChange: (mode: 'map' | 'grid') => void;
  onFilterPanelOpen: () => void;
  onBoostClick: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenJobsPanel?: () => void;
}

export const FloatingTopBar: React.FC<FloatingTopBarProps> = ({
  listings,
  jobs,
  filters,
  activeFilterCount,
  viewMode,
  hasSampleData = false,
  onFilterChange,
  onViewModeChange,
  onFilterPanelOpen,
  onBoostClick,
  onSelectListing,
  onOpenJobsPanel,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hiringOnly, setHiringOnly] = useState(filters.hiringOnly || false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Build live suggestions grouped by category
  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();

    const startups = listings
      .filter((l) => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
      .slice(0, 4);

    const areas = ['Rushikonda', 'Madhurawada', 'MVP Colony', 'Siripuram', 'Dwaraka Nagar', 'Beach Road', 'Gajuwaka']
      .filter((a) => a.toLowerCase().includes(q))
      .slice(0, 3);

    const sectors = ['AI', 'SaaS', 'Fintech', 'Edtech', 'Healthtech', 'Deeptech', 'Logistics and Port']
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 3);

    const roles = jobs
      .filter((j) => j.title.toLowerCase().includes(q))
      .slice(0, 3);

    if (!startups.length && !areas.length && !sectors.length && !roles.length) return null;
    return { startups, areas, sectors, roles };
  }, [searchQuery, listings, jobs]);

  const hiringCount = listings.filter((l) => (l.jobs_count || 0) > 0).length;
  const totalJobs = jobs.length;

  const handleHiringToggle = () => {
    const next = !hiringOnly;
    setHiringOnly(next);
    onFilterChange({ hiringOnly: next });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ search: value });
    setShowSuggestions(value.length >= 2);
  };

  const handleSelectSuggestion = (listing: Listing) => {
    setSearchQuery(listing.name);
    setShowSuggestions(false);
    onSelectListing(listing);
  };

  const handleAreaSuggestion = (area: string) => {
    setSearchQuery(area);
    setShowSuggestions(false);
    onFilterChange({ area, search: '' });
  };

  const handleSectorSuggestion = (sector: string) => {
    setSearchQuery(sector);
    setShowSuggestions(false);
    onFilterChange({ sector, search: '' });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center gap-2 w-full max-w-[calc(100%-120px)] sm:max-w-[640px] px-2 sm:px-3 pointer-events-none">
      {/* ── Main pill ── */}
      <div className="pointer-events-auto w-full bg-[#DDE3E8] border border-[#3A0F34]/15 rounded-full shadow-[0_4px_24px_rgba(58,15,52,0.15)] flex items-center gap-2 px-3 py-2">
        {/* Logo mark + short name */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 select-none group">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 61C32 61 10 40 10 24a22 22 0 0 1 44 0C54 40 32 61 32 61Z" fill="#3A0F34"/>
            <path d="M23 29a9 9 0 0 1 18 0Z" fill="#EAAA00"/>
            <path d="M20 34q3-3 6 0t6 0t6 0t6 0" stroke="#DDE3E8" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M24 39q2.5-2.5 5 0t5 0t5 0" stroke="#DDE3E8" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <span className="font-display font-extrabold text-sm text-[#3A0F34] tracking-[-0.02em] hidden sm:inline">
            Vizag Startups
          </span>
        </Link>

        <div className="w-px h-5 bg-[#3A0F34]/15 shrink-0" />

        {/* Search field */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3A0F34]/50 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setShowSuggestions(false); inputRef.current?.blur(); }
            }}
            placeholder="Search startups or roles..."
            className="w-full bg-transparent pl-7 pr-2 py-1 text-sm text-[#3A0F34] placeholder-[#3A0F34]/40 outline-none"
            aria-label="Search startups, areas, sectors, or roles"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); onFilterChange({ search: '' }); setShowSuggestions(false); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-[#3A0F34]/40 hover:text-[#3A0F34] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Live suggestions dropdown */}
          {showSuggestions && suggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#DDE3E8] border border-[#3A0F34]/15 rounded-2xl shadow-[0_8px_32px_rgba(58,15,52,0.18)] overflow-hidden z-50 fade-in">
              {suggestions.startups.length > 0 && (
                <div>
                  <div className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/50">Startups</div>
                  {suggestions.startups.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(l)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#3A0F34]/6 text-left cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center text-xs font-bold shrink-0">
                        {l.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#3A0F34] truncate">{l.name}</div>
                        <div className="text-[10px] text-[#3A0F34]/60 truncate">{l.area} · {l.sector}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.areas.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/50">Areas</div>
                  {suggestions.areas.map((a) => (
                    <button key={a} type="button" onMouseDown={() => handleAreaSuggestion(a)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#3A0F34]/6 text-sm text-[#3A0F34] cursor-pointer">
                      📍 {a}
                    </button>
                  ))}
                </div>
              )}
              {suggestions.sectors.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/50">Sectors</div>
                  {suggestions.sectors.map((s) => (
                    <button key={s} type="button" onMouseDown={() => handleSectorSuggestion(s)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#3A0F34]/6 text-sm text-[#3A0F34] cursor-pointer">
                      🏷 {s}
                    </button>
                  ))}
                </div>
              )}
              {suggestions.roles.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3A0F34]/50">Roles</div>
                  {suggestions.roles.map((j) => (
                    <div key={j.id} className="flex items-center gap-2 px-3 py-2 text-sm text-[#3A0F34]">
                      💼 {j.title} <span className="text-[#3A0F34]/50 text-xs">· {j.company_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter button with count badge */}
        <button
          type="button"
          onClick={onFilterPanelOpen}
          className="relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#3A0F34] hover:bg-[#3A0F34]/8 transition-colors cursor-pointer"
          aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[8px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="w-px h-5 bg-[#3A0F34]/15 shrink-0" />

        {/* Map / Grid toggle */}
        <div className="shrink-0 flex items-center bg-[#3A0F34]/8 rounded-full p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === 'map' ? 'bg-[#3A0F34] text-[#DDE3E8]' : 'text-[#3A0F34] hover:bg-[#3A0F34]/10'
            }`}
            aria-label="Map view"
          >
            <MapIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#3A0F34] text-[#DDE3E8]' : 'text-[#3A0F34] hover:bg-[#3A0F34]/10'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-[#3A0F34]/15 shrink-0 hidden sm:block" />

        {/* Boost button */}
        <Link
          href="/boost"
          className="hidden sm:flex shrink-0 items-center gap-1.5 bg-[#EAAA00] text-[#3A0F34] rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors cursor-pointer"
          aria-label="Boost your startup listing"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Boost</span>
        </Link>
      </div>

      {/* ── Hiring sub-pill ── */}
      <div className="pointer-events-auto flex items-center gap-3 bg-[#DDE3E8]/95 border border-[#3A0F34]/12 rounded-full px-4 py-1.5 shadow-[0_2px_12px_rgba(58,15,52,0.10)] text-xs text-[#3A0F34]">
        <button
          type="button"
          onClick={onOpenJobsPanel}
          className="flex items-center gap-1.5 hover:text-[#3A0F34] hover:opacity-80 transition-opacity cursor-pointer font-semibold"
          aria-label="View all hiring companies"
        >
          <Briefcase className="w-3.5 h-3.5 text-[#3A0F34]/70 shrink-0" />
          <span>
            <span className="font-bold">{hiringCount}</span> companies hiring
            {' · '}
            <span className="font-bold">{totalJobs}</span> openings
          </span>
        </button>

        <span className="h-3 w-px bg-[#3A0F34]/20" />

        {/* Hiring-only switch */}
        <button
          type="button"
          role="switch"
          aria-checked={hiringOnly}
          onClick={handleHiringToggle}
          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#EAAA00] ${
            hiringOnly ? 'bg-[#3A0F34]' : 'bg-[#3A0F34]/20'
          }`}
          aria-label="Toggle hiring-only view"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#DDE3E8] shadow transition-transform ${
              hiringOnly ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3A0F34]/60">
          Hiring only
        </span>
      </div>
    </div>
  );
};
