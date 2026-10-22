'use client';

import React from 'react';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import { EmptyState } from './EmptyState';

interface ListingGridProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onSaveListing: (listing: Listing) => void;
  savedListingIds: string[];
  onResetFilters: () => void;
}

export function ListingGrid({
  listings,
  onSelectListing,
  onSaveListing,
  savedListingIds,
  onResetFilters,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <EmptyState onResetFilters={onResetFilters} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSelect={onSelectListing}
            onSave={onSaveListing}
            isSaved={savedListingIds.includes(listing.id)}
          />
        ))}
      </div>
    </div>
  );
}
