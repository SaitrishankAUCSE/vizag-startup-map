'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Listing, Job, FilterState } from '@/types';
import { TopNav } from '@/components/layout/TopNav';
import { SampleDataBanner } from '@/components/layout/SampleDataBanner';
import { NewsStrip } from '@/components/layout/NewsStrip';
import { FilterBar } from '@/components/layout/FilterBar';
import dynamic from 'next/dynamic';
import { ListingList } from './ListingList';
import { ListingGrid } from './ListingGrid';
import { ProLockModal } from './ProLockModal';
import { Download, ListFilter, Map as MapIcon } from 'lucide-react';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-teal-50/30">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0E4D64] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading interactive map...</p>
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

  // View mode: map vs grid
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  // Mobile sheet view: map vs list
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Selected listing for map flyTo & highlight
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Pro lock modal state
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proFeatureTitle, setProFeatureTitle] = useState('Pro Feature');
  const [proFeatureDesc, setProFeatureDesc] = useState('');

  // Favourites state (mock local for now)
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
      if (newFilters.maxBeachDistance)
        params.set('beach', String(newFilters.maxBeachDistance));
      if (newFilters.foundedYearMax)
        params.set('year', String(newFilters.foundedYearMax));

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
      // Beach Distance
      if (
        filters.maxBeachDistance &&
        item.distance_to_beach_km !== undefined &&
        item.distance_to_beach_km > filters.maxBeachDistance
      ) {
        return false;
      }
      // Founded Year
      if (
        filters.foundedYearMax &&
        item.founded_year &&
        item.founded_year > filters.foundedYearMax
      ) {
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

  // Handlers for selection & Pro triggers
  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    // On mobile, if in list tab, switch to map to reveal pin
    if (window.innerWidth < 768) {
      setMobileTab('map');
    }
  };

  const handleSaveListing = (listing: Listing) => {
    // Pro feature trigger
    setProFeatureTitle('Save Favourites & Named Lists');
    setProFeatureDesc(
      'Track promising Visakhapatnam startups, create custom watchlists, and receive alerts with a Pro subscription.'
    );
    setProModalOpen(true);
  };

  const handleExportCSV = () => {
    // Pro feature trigger
    setProFeatureTitle('Export Directory to CSV');
    setProFeatureDesc(
      'Download comprehensive ecosystem datasets with founder contacts, locations, and sector tags with a Pro subscription.'
    );
    setProModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBF9F5]">
      {/* 1. Slim Top Navigation Bar */}
      <TopNav
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        jobsCount={initialJobs.length}
      />

      {/* 2. Sample Data Warning Banner */}
      <SampleDataBanner hasSampleData={hasSampleData} />

      {/* 2.5 Ecosystem RSS News Ticker */}
      <NewsStrip />

      {/* 3. Comprehensive Filter Row */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={filteredListings.length}
      />

      {/* 4. Main Body: Map/List Split or Grid View */}
      {viewMode === 'grid' ? (
        <div className="flex-1 overflow-y-auto">
          <ListingGrid
            listings={filteredListings}
            onSelectListing={handleSelectListing}
            onSaveListing={handleSaveListing}
            savedListingIds={savedListingIds}
            onResetFilters={handleResetFilters}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
          {/* Left Panel: Scrollable Results (Desktop: 420px; Mobile: Toggleable/Sheet) */}
          <div
            className={`w-full md:w-[420px] lg:w-[460px] flex-col border-r border-[#E6E0D4] bg-[#FBF9F5] z-10 shrink-0 ${
              mobileTab === 'list' ? 'flex h-full' : 'hidden md:flex h-full'
            }`}
          >
            {/* Directory Header Bar */}
            <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-200/70 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-800">
                {filteredListings.length} ecosystem listing{filteredListings.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 font-semibold text-[#0E4D64] hover:text-[#093345] px-2 py-1 rounded hover:bg-white transition-colors"
                title="Export filtered listings to CSV (Pro)"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              <ListingList
                listings={filteredListings}
                selectedListing={selectedListing}
                onSelectListing={handleSelectListing}
                onSaveListing={handleSaveListing}
                savedListingIds={savedListingIds}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>

          {/* Right Side: Full-Height Interactive Map */}
          <div
            className={`flex-1 relative h-full w-full ${
              mobileTab === 'map' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <MapContainer
              listings={filteredListings}
              selectedListing={selectedListing}
              onSelectListing={handleSelectListing}
            />
          </div>

          {/* Mobile Bottom Float Bar (Toggle between Map and List) */}
          <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
            <div className="bg-[#0E4D64] text-white px-2 py-1.5 rounded-lg shadow-lg border border-white/20 flex items-center gap-1">
              <button
                onClick={() => setMobileTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mobileTab === 'map'
                    ? 'bg-white text-[#0E4D64] shadow-xs'
                    : 'text-white/80'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setMobileTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mobileTab === 'list'
                    ? 'bg-white text-[#0E4D64] shadow-xs'
                    : 'text-white/80'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List ({filteredListings.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pro Feature Upgrade Lock Modal */}
      <ProLockModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureTitle={proFeatureTitle}
        featureDescription={proFeatureDesc}
      />
    </div>
  );
}
