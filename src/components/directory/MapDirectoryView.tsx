'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listing, Job, FilterState } from '@/types';
import dynamic from 'next/dynamic';
import { BangaloreToolbar } from '@/components/layout/BangaloreToolbar';
import { FloatingNewsRail } from '@/components/layout/FloatingNewsRail';
import { CompanyDrawer } from './CompanyDrawer';
import { BangaloreGridView } from './BangaloreGridView';
import { JobAlertModal } from './JobAlertModal';
import { ProLockModal } from './ProLockModal';
import { Mail, X } from 'lucide-react';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-[#0E4D64] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500 font-semibold tracking-wide">
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
  hasSampleData: boolean;
}

export function MapDirectoryView({
  initialListings,
  initialJobs,
  hasSampleData,
}: MapDirectoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // Floating open roles banner dismiss state
  const [rolesPillDismissed, setRolesPillDismissed] = useState(false);

  // Sample banner dismiss state
  const [sampleBannerDismissed, setSampleBannerDismissed] = useState(false);

  // Saved listings state
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    type: searchParams.get('type') || 'all',
    area: searchParams.get('area') || 'all',
    stage: searchParams.get('stage') || 'all',
    sector: searchParams.get('sector') || 'all',
    hiringOnly: searchParams.get('hiring') === 'true',
    search: searchParams.get('search') || '',
    maxBeachDistance: searchParams.get('beach')
      ? Number(searchParams.get('beach'))
      : undefined,
    foundedYearMax: searchParams.get('year')
      ? Number(searchParams.get('year'))
      : undefined,
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
      maxBeachDistance: undefined,
      foundedYearMax: undefined,
    };
    setFilters(cleared);
    syncUrlParams(cleared);
  };

  // Filter listings based on active criteria
  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      // Type
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }
      // Area
      if (filters.area !== 'all' && item.area !== filters.area) {
        return false;
      }
      // Stage
      if (filters.stage !== 'all' && item.stage !== filters.stage) {
        return false;
      }
      // Sector
      if (filters.sector !== 'all' && item.sector !== filters.sector) {
        return false;
      }
      // Hiring
      if (filters.hiringOnly && (!item.jobs_count || item.jobs_count === 0)) {
        return false;
      }
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchSector = item.sector.toLowerCase().includes(query);
        const matchArea = item.area.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSector && !matchArea) {
          return false;
        }
      }

      return true;
    });
  }, [initialListings, filters]);

  // Select listing (opens drawer and flies to pin on map)
  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setDrawerOpen(true);
  };

  const handleSaveListing = (listing: Listing) => {
    if (savedListingIds.includes(listing.id)) {
      setSavedListingIds((prev) => prev.filter((id) => id !== listing.id));
    } else {
      setProFeatureTitle('Save Favourites & Named Lists');
      setProFeatureDesc(
        'Track promising Visakhapatnam startups, create custom watchlists, and receive alerts with a Pro subscription.'
      );
      setProModalOpen(true);
    }
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-zinc-50 select-none">
      {/* 1. Main Canvas: Full Bleed Map or Grid View */}
      {viewMode === 'grid' ? (
        <BangaloreGridView
          listings={filteredListings}
          onSelectListing={handleSelectListing}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="relative h-full w-full">
          <MapContainer
            listings={filteredListings}
            selectedListing={selectedListing}
            onSelectListing={handleSelectListing}
          />
        </div>
      )}

      {/* 2. Floating Header Island Toolbar (data-map-chrome="toolbar") */}
      <BangaloreToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalResults={filteredListings.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        jobsCount={initialJobs.length}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Floating News Rail (data-map-chrome="news") */}
      <FloatingNewsRail />

      {/* 4. Center-Bottom Floating "View open roles" Pill (matching Bangalore Startup Map) */}
      {!rolesPillDismissed && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 sm:bottom-8 z-[1200] flex justify-center px-3">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-zinc-200/90 bg-white/95 py-2 pl-4 pr-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition-transform hover:-translate-y-0.5">
            <button
              type="button"
              onClick={() => handleFilterChange({ hiringOnly: !filters.hiringOnly })}
              className="flex items-center gap-2.5 whitespace-nowrap text-xs sm:text-sm font-semibold text-zinc-800 hover:text-[#0E4D64] transition-colors"
            >
              <span>{filters.hiringOnly ? 'Showing open roles' : 'View open roles'}</span>
              <span className="shrink-0 rounded-full bg-[#E04F36] px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
                {initialJobs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRolesPillDismissed(true)}
              aria-label="Hide open roles pill"
              className="grid h-5 w-5 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Bottom-Left Floating Badges (Results count, Get job alerts, Credit) */}
      <div className="pointer-events-none absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-[1200] flex flex-col items-start gap-1.5">
        <button
          type="button"
          onClick={() => setAlertModalOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-[#E04F36] hover:bg-[#c93f28] text-white px-3.5 py-1 text-xs font-semibold shadow-md backdrop-blur-md transition hover:-translate-y-0.5"
        >
          <Mail className="w-3 h-3" />
          <span>Get job alerts</span>
        </button>

        <span className="pointer-events-auto rounded-full border border-zinc-200/90 bg-white/95 px-3 py-1 text-xs shadow-sm backdrop-blur-md">
          <span className="font-bold text-zinc-900">{filteredListings.length}</span>{' '}
          <span className="text-zinc-500">results</span>
        </span>

        <span className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-0.5 text-[11px] text-zinc-500 shadow-2xs backdrop-blur-md">
          <span>Vizag Tech Ecosystem</span>
        </span>
      </div>

      {/* 6. Sample Data Warning Banner (Subtle Top-left pill below toolbar) */}
      {hasSampleData && !sampleBannerDismissed && (
        <div className="pointer-events-none absolute left-3 top-[78px] sm:top-[74px] z-[1100]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1 text-xs text-amber-800 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Previewing Vizag Ecosystem listings</span>
            <button
              onClick={() => setSampleBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-900 ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 7. Slide-over Company Detail Drawer */}
      <CompanyDrawer
        listing={selectedListing}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        jobs={initialJobs}
        onSave={handleSaveListing}
        isSaved={selectedListing ? savedListingIds.includes(selectedListing.id) : false}
      />

      {/* 8. Job Alert Modal */}
      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* 9. Pro Upgrade Modal */}
      <ProLockModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureTitle={proFeatureTitle}
        featureDescription={proFeatureDesc}
      />
    </main>
  );
}
