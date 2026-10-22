'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listing, Job, FilterState } from '@/types';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { HeroPanel } from '@/components/directory/HeroPanel';
import { CompanyDrawer } from './CompanyDrawer';
import { BangaloreGridView } from './BangaloreGridView';
import { JobAlertModal } from './JobAlertModal';
import { ProLockModal } from './ProLockModal';
import { AnimatePresence, motion } from 'framer-motion';
import { FilterChip, SegmentedToggle } from '@/components/ui/Button';
import { Search, RotateCcw, Map as MapIcon, LayoutGrid, Briefcase } from 'lucide-react';
import { COPY } from '@/content/copy';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#DDE3E8]">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-[#3A0F34] border-t-[#EAAA00] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#3A0F34] font-semibold tracking-wider uppercase">
            Loading Vizag Map...
          </p>
        </div>
      </div>
    ),
  }
);

interface MapDirectoryViewProps {
  initialListings: Listing[];
  initialJobs: Job[];
  ecosystemStats: {
    startups: number;
    investors: number;
    incubators: number;
    campuses: number;
    coworking: number;
    jobs: number;
    total: number;
  };
  hasSampleData: boolean;
}

export function MapDirectoryView({
  initialListings,
  initialJobs,
  ecosystemStats,
  hasSampleData,
}: MapDirectoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State A (Hero state) vs State B (Explore state)
  // If URL has filters or search active, start directly in State B
  const hasActiveUrlParams = Boolean(
    searchParams.get('type') ||
      searchParams.get('area') ||
      searchParams.get('stage') ||
      searchParams.get('sector') ||
      searchParams.get('hiring') ||
      searchParams.get('search')
  );

  const [isHeroState, setIsHeroState] = useState(!hasActiveUrlParams);

  // View mode: map vs grid (default: map)
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  // Selected listing for slide-over drawer and map flyTo
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Job alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Pro modal state
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureTitle, setProFeatureTitle] = useState('Pro Feature');
  const [proFeatureDesc, setProFeatureDesc] = useState('');

  // Active quick search input
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    type: searchParams.get('type') || 'all',
    area: searchParams.get('area') || 'all',
    stage: searchParams.get('stage') || 'all',
    sector: searchParams.get('sector') || 'all',
    hiringOnly: searchParams.get('hiring') === 'true',
    search: searchParams.get('search') || '',
  }));

  // Sync state to URL search parameters without page refresh
  const syncUrlParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.type !== 'all') params.set('type', newFilters.type);
      if (newFilters.area !== 'all') params.set('area', newFilters.area);
      if (newFilters.stage !== 'all') params.set('stage', newFilters.stage);
      if (newFilters.sector !== 'all') params.set('sector', newFilters.sector);
      if (newFilters.hiringOnly) params.set('hiring', 'true');
      if (newFilters.search) params.set('search', newFilters.search);

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setIsHeroState(false); // Any filter interaction smoothly opens Explore State B
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      syncUrlParams(next);
      return next;
    });
  };

  const handleResetFilters = () => {
    const cleared: FilterState = {
      type: 'all',
      area: 'all',
      stage: 'all',
      sector: 'all',
      hiringOnly: false,
      search: '',
    };
    setFilters(cleared);
    syncUrlParams(cleared);
  };

  const hasActiveFilters = Boolean(
    filters.type !== 'all' ||
      filters.area !== 'all' ||
      filters.stage !== 'all' ||
      filters.sector !== 'all' ||
      filters.hiringOnly ||
      filters.search.trim()
  );

  // Filter listings based on active criteria
  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.area !== 'all' && item.area !== filters.area) return false;
      if (filters.stage !== 'all' && item.stage !== filters.stage) return false;
      if (filters.sector !== 'all' && item.sector !== filters.sector) return false;
      if (filters.hiringOnly && (!item.jobs_count || item.jobs_count === 0)) return false;

      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchSector = item.sector.toLowerCase().includes(query);
        const matchArea = item.area.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSector && !matchArea) return false;
      }

      return true;
    });
  }, [initialListings, filters]);

  // Select listing (opens drawer and flies to pin on map)
  const handleSelectListing = (listing: Listing) => {
    setIsHeroState(false);
    setSelectedListing(listing);
    setDrawerOpen(true);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#DDE3E8] flex flex-col font-sans text-[#3A0F34]">
      {/* 1. Thin Editorial Top Bar */}
      <Header
        onSearchClick={() => {
          setIsHeroState(false);
          setShowSearchInput(!showSearchInput);
        }}
        onExploreClick={() => {
          setIsHeroState(false);
          setViewMode('map');
        }}
        onGridClick={() => {
          setIsHeroState(false);
          setViewMode('grid');
        }}
        onJobsClick={() => {
          setIsHeroState(false);
          handleFilterChange({ hiringOnly: true });
        }}
      />

      {/* 2. Main Visual Canvas */}
      <div className="relative flex-1 w-full h-[calc(100%-3.5rem)] overflow-hidden">
        {viewMode === 'grid' ? (
          <BangaloreGridView
            listings={filteredListings}
            onSelectListing={handleSelectListing}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <div className="relative w-full h-full">
            <MapContainer
              listings={filteredListings}
              selectedListing={selectedListing}
              onSelectListing={handleSelectListing}
              onMapInteraction={() => {
                if (isHeroState) setIsHeroState(false);
              }}
              showLegend={!isHeroState}
            />
          </div>
        )}

        {/* 3. State A: Landing Page Hero Panel */}
        <AnimatePresence>
          {isHeroState && (
            <HeroPanel
              onExplore={() => setIsHeroState(false)}
              stats={ecosystemStats}
            />
          )}
        </AnimatePresence>

        {/* 4. State B: Floating Filter Bar under Header */}
        {!isHeroState && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none"
          >
            {/* Pill chips row */}
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-[#DDE3E8]/95 backdrop-blur-md border border-[#3A0F34]/20 p-2 rounded-full shadow-[0_8px_24px_rgba(58,15,52,0.12)]">
              {/* Type Chip */}
              <select
                aria-label="Filter by type"
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value })}
                className="bg-transparent text-[11px] font-semibold uppercase tracking-wider text-[#3A0F34] px-3 py-1 rounded-full border border-[#3A0F34]/30 hover:border-[#3A0F34] cursor-pointer outline-none"
              >
                <option value="all">ALL ENTITIES</option>
                <option value="startup">STARTUPS</option>
                <option value="investor">INVESTORS</option>
                <option value="incubator">INCUBATORS</option>
                <option value="campus">CAMPUSES</option>
                <option value="coworking">COWORKING</option>
              </select>

              {/* Area Chip */}
              <select
                aria-label="Filter by area"
                value={filters.area}
                onChange={(e) => handleFilterChange({ area: e.target.value })}
                className="bg-transparent text-[11px] font-semibold uppercase tracking-wider text-[#3A0F34] px-3 py-1 rounded-full border border-[#3A0F34]/30 hover:border-[#3A0F34] cursor-pointer outline-none"
              >
                <option value="all">ALL AREAS</option>
                <option value="Rushikonda">RUSHIKONDA</option>
                <option value="Madhurawada">MADHURAWADA</option>
                <option value="MVP Colony">MVP COLONY</option>
                <option value="Siripuram">SIRIPURAM</option>
                <option value="Dwaraka Nagar">DWARAKA NAGAR</option>
                <option value="Seethammadhara">SEETHAMMADHARA</option>
                <option value="Beach Road">BEACH ROAD</option>
                <option value="Gajuwaka">GAJUWAKA</option>
              </select>

              {/* Sector Chip */}
              <select
                aria-label="Filter by sector"
                value={filters.sector}
                onChange={(e) => handleFilterChange({ sector: e.target.value })}
                className="hidden sm:block bg-transparent text-[11px] font-semibold uppercase tracking-wider text-[#3A0F34] px-3 py-1 rounded-full border border-[#3A0F34]/30 hover:border-[#3A0F34] cursor-pointer outline-none"
              >
                <option value="all">ALL SECTORS</option>
                <option value="SaaS">SAAS</option>
                <option value="AI">AI</option>
                <option value="Fintech">FINTECH</option>
                <option value="Healthtech">HEALTHTECH</option>
                <option value="Deeptech">DEEPTECH</option>
                <option value="Logistics and Port">LOGISTICS & PORT</option>
                <option value="Edtech">EDTECH</option>
              </select>

              {/* Hiring Now Toggle */}
              <button
                type="button"
                onClick={() => handleFilterChange({ hiringOnly: !filters.hiringOnly })}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filters.hiringOnly
                    ? 'bg-[#EAAA00] text-[#3A0F34] border-[#3A0F34]'
                    : 'bg-transparent text-[#3A0F34] border-[#3A0F34]/30 hover:border-[#3A0F34]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EAAA00] border border-[#3A0F34]" />
                <span>HIRING NOW</span>
              </button>

              {/* Results Count */}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-[#3A0F34]/70">
                {filteredListings.length} RESULTS
              </span>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#3A0F34] hover:opacity-70 px-2 py-1 rounded-full bg-[#3A0F34]/10 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>

            {/* Right: Map / Grid Toggle */}
            <div className="pointer-events-auto bg-[#DDE3E8]/95 backdrop-blur-md rounded-full shadow-[0_8px_24px_rgba(58,15,52,0.12)]">
              <SegmentedToggle
                value={viewMode}
                onChange={(val) => setViewMode(val as 'map' | 'grid')}
                options={[
                  {
                    value: 'map',
                    label: 'MAP',
                    icon: <MapIcon className="w-3.5 h-3.5" />,
                  },
                  {
                    value: 'grid',
                    label: 'GRID',
                    icon: <LayoutGrid className="w-3.5 h-3.5" />,
                  },
                ]}
              />
            </div>
          </motion.div>
        )}

        {/* Quick Search bar if opened */}
        {showSearchInput && !isHeroState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-4 z-30 max-w-md w-full bg-[#DDE3E8] border border-[#3A0F34] rounded-full p-1.5 shadow-xl flex items-center gap-2"
          >
            <Search className="w-4 h-4 ml-3 text-[#3A0F34]" />
            <input
              type="text"
              autoFocus
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder={COPY.explore.searchPlaceholder}
              className="w-full bg-transparent text-xs text-[#3A0F34] placeholder-[#3A0F34]/50 outline-none pr-3"
            />
          </motion.div>
        )}

        {/* Floating Job Alerts Pro Prompt (Bottom-Right, above controls) */}
        {!isHeroState && (
          <div className="absolute bottom-6 left-6 z-10 hidden md:block">
            <button
              type="button"
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAAA00] text-[#3A0F34] border border-[#3A0F34] font-sans font-bold text-[11px] uppercase tracking-wider shadow-lg hover:bg-[#3A0F34] hover:text-[#EAAA00] transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>GET JOB ALERTS</span>
            </button>
          </div>
        )}
      </div>

      {/* Company Detail Drawer */}
      <CompanyDrawer
        listing={selectedListing}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Job Alert Modal */}
      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* Pro Lock Modal */}
      <ProLockModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureTitle={proFeatureTitle}
        featureDescription={proFeatureDesc}
      />
    </div>
  );
}
