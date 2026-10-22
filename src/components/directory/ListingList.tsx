'use client';

import React from 'react';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import { EmptyState } from './EmptyState';

interface ListingListProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
  onSaveListing: (listing: Listing) => void;
  savedListingIds: string[];
  onResetFilters: () => void;
}

export function ListingList({
  listings,
  selectedListing,
  onSelectListing,
  onSaveListing,
  savedListingIds,
  onResetFilters,
}: ListingListProps) {
  if (listings.length === 0) {
    return (
      <div className="p-4">
        <EmptyState onResetFilters={onResetFilters} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 p-3 space-y-2.5 overflow-y-auto h-full">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isSelected={selectedListing?.id === listing.id}
          onSelect={onSelectListing}
          onSave={onSaveListing}
          isSaved={savedListingIds.includes(listing.id)}
        />
      ))}
    </div>
  );
}
