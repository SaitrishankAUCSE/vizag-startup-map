'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Share2, Plus, Clock } from 'lucide-react';
import { Listing, Job, FilterState, PublicStats } from '@/types';
import { FloatingTopBar } from '@/components/ui/FloatingTopBar';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { StartupDetailCard } from '@/components/ui/StartupDetailCard';
import { BottomJobsPill, JobsPanel } from '@/components/ui/JobsPanel';
import { FloatingCreatorCard } from '@/components/ui/FloatingCreatorCard';
import { BoostModal } from '@/components/ui/BoostModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { CommunitySurveyWidget } from '@/components/ui/CommunitySurveyWidget';
import { NewsletterSubscribeCard } from '@/components/ui/NewsletterSubscribeCard';
import { FEATURES } from '@/config/features';
import { MAP_CONFIG } from '@/config/map';

// SSR-disabled map (MapLibre requires browser APIs)
const FullScreenMap = dynamic(
  () => import('@/components/map/FullScreenMap').then((m) => m.FullScreenMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#DDE3E8]" /> }
);

interface LandingMapViewProps {
  initialListings: Listing[];
  initialJobs: Job[];
  initialStats?: PublicStats;
}

const DEFAULT_FILTERS: FilterState = {
  type: 'all',
  area: 'all',
  stage: 'all',
  sector: 'all',
  hiringOnly: false,
  search: '',
};

function applyFilters(listings: Listing[], filters: FilterState): Listing[] {
  let result = listings;

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.one_liner && l.one_liner.toLowerCase().includes(q)) ||
        l.area.toLowerCase().includes(q) ||
        (l.sector && l.sector.toLowerCase().includes(q))
    );
  }
  if (filters.type && filters.type !== 'all') {
    result = result.filter((l) => l.type === filters.type);
  }
  if (filters.area && filters.area !== 'all') {
    result = result.filter((l) => l.area === filters.area);
  }
  if (filters.sector && filters.sector !== 'all') {
    result = result.filter((l) => l.sector === filters.sector);
  }
  if (filters.stage && filters.stage !== 'all') {
    result = result.filter((l) => l.stage === filters.stage);
  }
  if (filters.hiringOnly) {
    result = result.filter((l) => (l.jobs_count || 0) > 0);
  }
  return result;
}

function countActiveFilters(filters: FilterState): number {
  let n = 0;
  if (filters.type && filters.type !== 'all') n++;
  if (filters.area && filters.area !== 'all') n++;
  if (filters.sector && filters.sector !== 'all') n++;
  if (filters.stage && filters.stage !== 'all') n++;
  if (filters.hiringOnly) n++;
  if (filters.search?.trim()) n++;
  return n;
}

export const LandingMapView: React.FC<LandingMapViewProps> = ({
  initialListings,
  initialJobs,
  initialStats,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    searchParams.get('startup') || null
  );
  const [showJobsPanel, setShowJobsPanel] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coastalTourActive, setCoastalTourActive] = useState(false);
  const [coastalStopIndex, setCoastalStopIndex] = useState(0);

  const filteredListings = applyFilters(initialListings, filters);
  const activeFilterCount = countActiveFilters(filters);
  const selectedListing = selectedSlug
    ? initialListings.find((l) => l.slug === selectedSlug) || null
    : null;

  // Real-time dynamic counts from database/stats
  const hiringCount =
    initialStats?.companies_hiring ??
    initialListings.filter((l) => (l.jobs_count || 0) > 0).length;

  const currentStop = MAP_CONFIG.coastalTourStops[coastalStopIndex];
  const stopListings = initialListings.filter((l) => l.area === currentStop?.area);
  const stopSectors = Array.from(
    new Set(stopListings.map((l) => l.sector).filter(Boolean))
  ).slice(0, 2);

  const handleStartCoastalTour = useCallback(() => {
    setCoastalStopIndex(0);
    setCoastalTourActive(true);
    setSelectedSlug(null);
    setShowJobsPanel(false);
  }, []);

  const handleNextCoastalStop = useCallback(() => {
    if (coastalStopIndex < MAP_CONFIG.coastalTourStops.length - 1) {
      setCoastalStopIndex((i) => i + 1);
    } else {
      setCoastalTourActive(false);
    }
  }, [coastalStopIndex]);

  const handleExitCoastalTour = useCallback(() => {
    setCoastalTourActive(false);
  }, []);

  // Sync URL when selection changes

  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleSelectListing = useCallback((listing: Listing) => {
    setSelectedSlug(listing.slug);
    setShowJobsPanel(false);
    setShowFilterPanel(false);
  }, []);

  const handleDeselectListing = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  const handleViewModeChange = useCallback(
    (mode: 'map' | 'grid') => {
      if (mode === 'grid') {
        router.push('/grid');
      }
    },
    [router]
  );

  const handleSharePage = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Format "Data updated X minutes ago"
  const minutesAgo = (() => {
    if (!initialStats?.last_updated_at) return null;
    const diffMs = Date.now() - new Date(initialStats.last_updated_at).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  })();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" role="main">
      {/* ── Full-screen map ── */}
      <FullScreenMap
        listings={filteredListings}
        selectedSlug={selectedSlug}
        onSelectListing={handleSelectListing}
        onDeselectListing={handleDeselectListing}
        coastalTourActive={coastalTourActive}
        coastalStopIndex={coastalStopIndex}
      />

      {/* ── Floating top bar (search + filters + toggle + boost) ── */}
      <FloatingTopBar
        listings={initialListings}
        jobs={initialJobs}
        filters={filters}
        activeFilterCount={activeFilterCount}
        viewMode="map"
        hasSampleData={false}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        onFilterPanelOpen={() => setShowFilterPanel((v) => !v)}
        onBoostClick={() => setShowBoostModal(true)}
        onSelectListing={handleSelectListing}
        onOpenJobsPanel={() => setShowJobsPanel(true)}
      />

      {/* ── Filter panel (appears below top bar) ── */}
      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilterPanel(false)}
          onClearAll={handleClearFilters}
          totalResults={filteredListings.length}
        />
      )}

      {/* ── Top-Right Dedicated Action: Submit Startup ── */}
      <div className="absolute top-4 right-4 z-[1100] flex items-center gap-2 pointer-events-auto">
        <Link
          href="/submit"
          className="group flex items-center gap-2 bg-[#3A0F34] hover:bg-[#EAAA00] text-[#DDE3E8] hover:text-[#3A0F34] pl-3.5 pr-4 py-2.5 rounded-full shadow-[0_4px_20px_rgba(58,15,52,0.22)] border border-[#EAAA00]/40 transition-all duration-300 hover:scale-[1.04] active:scale-95 text-xs font-bold uppercase tracking-wider backdrop-blur-md cursor-pointer"
          aria-label="Submit your startup to Vizag Startup Map"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EAAA00] opacity-75 group-hover:bg-[#3A0F34]"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EAAA00] group-hover:bg-[#3A0F34]"></span>
          </span>
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Submit Startup</span>
          <span className="sm:hidden">Submit</span>
        </Link>
      </div>

      {/* ── Non-intrusive empty filter toast ── */}
      {filteredListings.length === 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1150] pointer-events-auto bg-[#DDE3E8]/95 border border-[#3A0F34]/20 rounded-full px-5 py-2.5 shadow-lg backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-xs text-[#3A0F34] font-medium">
            No startups match this filter.
          </span>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-[#3A0F34] underline hover:text-[#EAAA00] cursor-pointer"
          >
            Clear filters
          </button>
          <span className="text-[#3A0F34]/30">|</span>
          <Link
            href="/submit"
            className="text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            Submit one
          </Link>
        </div>
      )}

      {/* ── Startup detail card ── */}
      {selectedListing && (
        <StartupDetailCard
          listing={selectedListing}
          jobs={initialJobs}
          onClose={handleDeselectListing}
        />
      )}

      {/* ── Coastal Tour Stop Card ── */}
      {coastalTourActive && currentStop && (
        <div className="absolute top-24 right-4 z-[1200] max-w-[280px] bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-4 shadow-xl text-[#3A0F34] animate-in fade-in">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#EAAA00] bg-[#3A0F34] px-2 py-0.5 rounded-full inline-block mb-1.5">
            Coastal Tour · Stop {coastalStopIndex + 1} of {MAP_CONFIG.coastalTourStops.length}
          </div>
          <h3 className="font-display font-extrabold text-base leading-tight">
            {currentStop.name}
          </h3>
          <p className="text-xs text-[#3A0F34]/70 mt-1">
            <strong>{stopListings.length}</strong> listings in this area.
          </p>
          {Array.isArray(stopSectors) && stopSectors.length > 0 && (
            <p className="text-[11px] text-[#3A0F34]/80 mt-0.5">
              Top sectors: <span className="font-semibold">{stopSectors.join(', ')}</span>
            </p>
          )}
          <div className="flex gap-2 mt-3 pt-2 border-t border-[#3A0F34]/15">
            <button
              type="button"
              onClick={handleNextCoastalStop}
              className="flex-1 bg-[#EAAA00] text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#EAAA00] font-bold text-xs py-1.5 px-3 rounded-full transition-colors cursor-pointer"
            >
              {coastalStopIndex < MAP_CONFIG.coastalTourStops.length - 1 ? 'Next stop →' : 'Finish tour ✓'}
            </button>
            <button
              type="button"
              onClick={handleExitCoastalTour}
              className="border border-[#3A0F34]/25 text-[#3A0F34] hover:bg-[#3A0F34]/10 text-xs font-semibold py-1.5 px-2.5 rounded-full transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom center: jobs pill ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100] pointer-events-auto">
        <BottomJobsPill jobs={initialJobs} onOpenJobsPanel={() => setShowJobsPanel(true)} />
      </div>

      {/* ── Bottom left: stats / creator card ── */}
      <div className="absolute bottom-6 left-4 z-[1100] space-y-2 max-w-[420px]">
        {FEATURES.creatorCard && initialListings.length > 0 && (
          <FloatingCreatorCard
            totalListings={initialListings.length}
            hiringCount={hiringCount}
          />
        )}
        {/* Link row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="bg-[#FAF9F6]/95 border border-[#3A0F34]/15 backdrop-blur-sm text-[#3A0F34] rounded-full px-3 py-1 text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>{initialListings.length} startups</span>
          </div>
          {[
            { href: '/about', label: 'About' },
            { href: '/news', label: 'News' },
            { href: '/submit', label: 'List yours' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-[#DDE3E8]/90 border border-[#3A0F34]/15 backdrop-blur-sm text-[#3A0F34] rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors shadow-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom right: Data freshness + Coastal tour & Share button ── */}
      <div className="absolute bottom-6 right-4 z-[1100] flex items-center gap-2">
        {minutesAgo && (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#DDE3E8]/90 border border-[#3A0F34]/15 backdrop-blur-sm text-[#3A0F34]/70 rounded-full px-3 py-1.5 text-[10px] font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
            <span>Data updated {minutesAgo}</span>
          </div>
        )}
        {FEATURES.coastalTour && !coastalTourActive && (
          <button
            type="button"
            onClick={handleStartCoastalTour}
            className="flex items-center gap-1.5 bg-[#DDE3E8]/90 border border-[#3A0F34]/15 backdrop-blur-sm text-[#3A0F34] rounded-full px-3 py-2 text-xs font-bold hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors shadow-sm cursor-pointer"
            aria-label="Start coastal tour"
          >
            <span>🌊</span> Coastal tour
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 bg-[#DDE3E8]/90 border border-[#3A0F34]/15 backdrop-blur-sm text-[#3A0F34] rounded-full px-3 py-2 text-xs font-bold hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors shadow-sm cursor-pointer"
          aria-label="Share this map"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* ── Jobs panel ── */}
      {showJobsPanel && (
        <JobsPanel jobs={initialJobs} onClose={() => setShowJobsPanel(false)} />
      )}

      {/* ── Boost modal ── */}
      {showBoostModal && (
        <BoostModal onClose={() => setShowBoostModal(false)} />
      )}

      {/* ── Multi-Platform Share Modal ── */}
      {showShareModal && (
        <ShareModal
          title="Vizag Startup Map — Visakhapatnam Tech Ecosystem"
          url={typeof window !== 'undefined' ? window.location.href : 'https://vizagstartupmap.com'}
          description="Explore startups, tech labs, investors, and active jobs across Visakhapatnam."
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* ── 30-Second Timed Newsletter Subscribe Prompt ── */}
      <NewsletterSubscribeCard />

      {/* ── Community Pulse Survey Widget ── */}
      <CommunitySurveyWidget />
    </div>
  );
};
