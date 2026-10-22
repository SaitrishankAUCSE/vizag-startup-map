'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Listing } from '@/types';
import { TYPE_COLORS } from '@/config/constants';

interface ListingCardProps {
  listing: Listing;
  isSelected?: boolean;
  onSelect?: (listing: Listing) => void;
  onSave?: (listing: Listing) => void;
  isSaved?: boolean;
}

export function ListingCard({
  listing,
  isSelected,
  onSelect,
  onSave,
  isSaved,
}: ListingCardProps) {
  const typeStyle = TYPE_COLORS[listing.type] || TYPE_COLORS.startup;

  return (
    <div
      onClick={() => onSelect && onSelect(listing)}
      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
        isSelected
          ? 'border-[#0E4D64] ring-2 ring-[#0E4D64]/20 shadow-md bg-teal-50/20'
          : listing.is_featured
          ? 'border-amber-300/80 shadow-xs hover:border-amber-400 hover:shadow-md'
          : 'border-gray-200/90 shadow-2xs hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Logo/Initials, Name, Badges, and Save */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Logo / Initial */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              listing.is_featured
                ? 'bg-amber-500/10 text-amber-900 border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-gray-100 text-[#0E4D64] border-gray-200'
            }`}
          >
            {listing.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.logo_url}
                alt={listing.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              listing.name.slice(0, 2).toUpperCase()
            )}
          </div>

          {/* Titles & Meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#0E4D64] transition-colors leading-snug truncate">
                {listing.name}
              </h3>
              {listing.is_verified && (
                <span title="Verified Listing" className="inline-flex">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {/* Type Badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${typeStyle.bg} ${typeStyle.text}`}
              >
                {listing.type}
              </span>

              {/* Stage Badge */}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {listing.stage}
              </span>

              {/* Featured Badge */}
              {listing.is_featured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-0.5 border border-amber-300">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Featured
                </span>
              )}

              {/* Hiring Badge */}
              {Boolean(listing.jobs_count && listing.jobs_count > 0) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-0.5 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5 shrink-0" />
                  Hiring ({listing.jobs_count})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save to Favourites Button (Pro feature prompt) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave && onSave(listing);
          }}
          className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
            isSaved
              ? 'text-rose-600 bg-rose-50 border-rose-200'
              : 'text-gray-400 hover:text-rose-600 hover:bg-gray-50 border-transparent'
          }`}
          title="Save to Favourites (Pro)"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
        {listing.description}
      </p>

      {/* Footer Info: Area, Distance to Coast, Links */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {listing.area}
          </span>
          {typeof listing.distance_to_beach_km === 'number' && (
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
              {listing.distance_to_beach_km} km to beach
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-[#0E4D64] p-1 rounded hover:bg-gray-100 transition-colors"
              title="Visit Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            href={`/startup/${listing.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-semibold text-[#0E4D64] hover:text-[#093345] flex items-center gap-0.5 hover:underline"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
