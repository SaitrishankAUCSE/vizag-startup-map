'use client';

import React from 'react';
import { Listing } from '@/types';
import { EmptyState } from './EmptyState';

interface BangaloreGridViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onResetFilters: () => void;
}

export function BangaloreGridView({
  listings,
  onSelectListing,
  onResetFilters,
}: BangaloreGridViewProps) {
  if (listings.length === 0) {
    return (
      <div className="pt-24 px-4 max-w-2xl mx-auto">
        <EmptyState onResetFilters={onResetFilters} />
      </div>
    );
  }

  // Curated color palette for fallback initial badges
  const AVATAR_BG_COLORS = [
    'bg-[#0E4D64]',
    'bg-[#E04F36]',
    'bg-[#059669]',
    'bg-[#7C3AED]',
    'bg-[#D97706]',
    'bg-[#DB2777]',
    'bg-[#2563EB]',
    'bg-[#4F46E5]',
  ];

  return (
    <div className="pt-[84px] sm:pt-[76px] px-3 sm:px-6 pb-24 h-screen overflow-y-auto bg-zinc-50/60">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
          {listings.map((item, index) => {
            // Extract clean domain for high-res favicon
            let domain = '';
            try {
              if (item.website) {
                domain = new URL(
                  item.website.startsWith('http')
                    ? item.website
                    : `https://${item.website}`
                ).hostname;
              }
            } catch {
              domain = '';
            }

            const faviconUrl = domain
              ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
              : null;

            const bgClass =
              AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length];

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="bg-white rounded-2xl border border-zinc-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Top: Logo + Name + Stage */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                      {faviconUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display =
                                'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full rounded-lg ${bgClass} text-white flex items-center justify-center font-bold text-sm uppercase ${
                          faviconUrl ? 'hidden' : 'flex'
                        }`}
                      >
                        {item.name.charAt(0)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 group-hover:text-[#0E4D64] transition-colors truncate">
                          {item.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                          {item.stage}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Sector, Area, Year & Hiring Badge */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                  <span className="rounded-full bg-zinc-50 border border-zinc-200/80 px-2.5 py-0.5 font-medium text-zinc-600">
                    {item.sector}
                  </span>
                  <span className="rounded-full bg-zinc-50 border border-zinc-200/80 px-2.5 py-0.5 font-medium text-zinc-600">
                    {item.area}
                  </span>
                  {item.founded_year && (
                    <span className="text-zinc-400">· {item.founded_year}</span>
                  )}
                  {item.jobs_count && item.jobs_count > 0 ? (
                    <span className="ml-auto rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 font-semibold text-[#E04F36]">
                      💼 {item.jobs_count} open role{item.jobs_count > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
