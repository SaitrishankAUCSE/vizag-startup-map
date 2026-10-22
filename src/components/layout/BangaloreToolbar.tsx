'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FilterState } from '@/types';
import { LISTING_TYPES, AREAS, STAGES, SECTORS } from '@/config/constants';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

interface BangaloreToolbarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  totalResults: number;
  viewMode: 'map' | 'grid';
  onViewModeChange: (mode: 'map' | 'grid') => void;
  jobsCount: number;
  onResetFilters: () => void;
}

export function BangaloreToolbar({
  filters,
  onFilterChange,
  totalResults,
  viewMode,
  onViewModeChange,
  jobsCount,
  onResetFilters,
}: BangaloreToolbarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Compute active filters count
  const activeFiltersCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.area !== 'all' ? 1 : 0) +
    (filters.stage !== 'all' ? 1 : 0) +
    (filters.sector !== 'all' ? 1 : 0) +
    (filters.hiringOnly ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <>
      <header
        data-map-chrome="toolbar"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1210] p-2 sm:p-3"
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1440px] flex-col gap-2 rounded-2xl sm:rounded-full border border-zinc-200/90 bg-white/95 p-2 sm:p-2.5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          {/* 1. Brand Logo */}
          <div className="flex items-center justify-between sm:contents">
            <Link
              href="/"
              onClick={() => onResetFilters()}
              className="mr-auto flex min-w-0 items-center gap-1.5 pl-1.5 sm:mr-0 sm:order-1 group"
            >
              <span aria-hidden="true" className="text-base sm:text-lg">
                📍
              </span>
              <span className="truncate text-sm font-bold tracking-tight text-zinc-900 sm:text-base group-hover:text-[#0E4D64] transition-colors">
                Vizag Startup Map
              </span>
            </Link>

            {/* Mobile Submit & Toggle */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <Link
                href="/submit"
                className="rounded-full bg-[#E04F36] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition"
              >
                Submit
              </Link>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                aria-label="Open Filters"
                className="relative grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04F36] text-[9px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Search Input */}
          <div className="flex items-center gap-2 sm:contents">
            <div className="relative min-w-0 flex-1 sm:order-2 sm:min-w-[160px] sm:max-w-[240px]">
              <input
                type="search"
                placeholder="Search startups, sectors, founders…"
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="w-full rounded-full border border-zinc-200 bg-white px-3 py-1.5 pl-8 pr-7 text-xs text-zinc-800 shadow-2xs focus:border-zinc-400 focus:outline-none transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ search: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 3. Dropdowns (Desktop) */}
            <div className="hidden items-center gap-1.5 sm:order-3 sm:flex">
              {/* Type */}
              <select
                value={filters.type}
                onChange={(e) => onFilterChange({ type: e.target.value })}
                aria-label="Filter by type"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs focus:border-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-300 transition-colors"
              >
                <option value="all">All types</option>
                {LISTING_TYPES.filter((t) => t.id !== 'all').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Area */}
              <select
                value={filters.area}
                onChange={(e) => onFilterChange({ area: e.target.value })}
                aria-label="Filter by area"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs focus:border-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-300 transition-colors"
              >
                <option value="all">All areas</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {/* Stage */}
              <select
                value={filters.stage}
                onChange={(e) => onFilterChange({ stage: e.target.value })}
                aria-label="Filter by stage"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs focus:border-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-300 transition-colors"
              >
                <option value="all">All stages</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Sector */}
              <select
                value={filters.sector}
                onChange={(e) => onFilterChange({ sector: e.target.value })}
                aria-label="Filter by sector"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs focus:border-zinc-400 focus:outline-none cursor-pointer hover:border-zinc-300 transition-colors"
              >
                <option value="all">All sectors</option>
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Map / Grid Switcher */}
            <div className="flex shrink-0 rounded-full border border-zinc-200 bg-zinc-100/90 p-0.5 text-xs font-semibold sm:order-4">
              <button
                type="button"
                onClick={() => onViewModeChange('map')}
                className={`rounded-full px-3 py-1 capitalize transition-all ${
                  viewMode === 'map'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`rounded-full px-3 py-1 capitalize transition-all ${
                  viewMode === 'grid'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Grid
              </button>
            </div>

            {/* 5. Jobs Pill Button */}
            <button
              type="button"
              onClick={() => onFilterChange({ hiringOnly: !filters.hiringOnly })}
              aria-pressed={filters.hiringOnly}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:order-4 border flex items-center gap-1.5 ${
                filters.hiringOnly
                  ? 'border-[#E04F36] bg-[#E04F36] text-white shadow-xs'
                  : 'border-[#E04F36] bg-white text-[#E04F36] hover:bg-orange-50/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E04F36] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E04F36]" />
              </span>
              <span>💼 {jobsCount} jobs</span>
            </button>

            {/* 6. Desktop Actions: Submit & Sign in */}
            <div className="hidden shrink-0 items-center gap-1.5 sm:order-5 sm:flex">
              <Link
                href="/submit"
                className="shrink-0 rounded-full bg-[#E04F36] hover:bg-[#c93f28] px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-xs"
              >
                Submit
              </Link>
              <Link
                href="/login"
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Filter Modal Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[1300] flex flex-col justify-end bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl border-t border-zinc-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-700" />
                <h3 className="font-bold text-sm text-zinc-900">Filter Listings</h3>
                <span className="text-xs text-zinc-500">({totalResults} results)</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilterChange({ type: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-800"
                >
                  <option value="all">All types</option>
                  {LISTING_TYPES.filter((t) => t.id !== 'all').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Neighborhood / Area
                </label>
                <select
                  value={filters.area}
                  onChange={(e) => onFilterChange({ area: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-800"
                >
                  <option value="all">All areas</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Funding Stage
                </label>
                <select
                  value={filters.stage}
                  onChange={(e) => onFilterChange({ stage: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-800"
                >
                  <option value="all">All stages</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Tech Sector
                </label>
                <select
                  value={filters.sector}
                  onChange={(e) => onFilterChange({ sector: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-800"
                >
                  <option value="all">All sectors</option>
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-xs font-semibold text-white shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
