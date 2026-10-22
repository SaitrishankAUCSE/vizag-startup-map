import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Tag, Building2 } from 'lucide-react';
import { getListings } from '@/lib/supabase/service';
import { SECTORS } from '@/config/constants';
import { SECTOR_DESCRIPTIONS } from '@/config/sectorDescriptions';
import { ListingCard } from '@/components/directory/ListingCard';
import { generateBreadcrumbJsonLd } from '@/lib/utils/seo';

import { MiniMap } from '@/components/map/MiniMap';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sectorKey = normalizeSlug(slug);
  const sectorInfo = SECTOR_DESCRIPTIONS[sectorKey];

  if (!sectorInfo) {
    return { title: 'Sector Not Found | Vizag Startup Map' };
  }

  return {
    title: `${sectorInfo.title} | Vizag Startup Map`,
    description: sectorInfo.paragraph,
  };
}


export default async function SectorPage({ params }: PageProps) {
  const { slug } = await params;
  const sectorKey = normalizeSlug(slug);
  const sectorInfo = SECTOR_DESCRIPTIONS[sectorKey];

  if (!sectorInfo) {
    notFound();
  }

  const allListings = await getListings();
  const listingsInSector = allListings.filter(
    (l) => normalizeSlug(l.sector) === sectorKey
  );

  const center: [number, number] =
    listingsInSector.length > 0
      ? [listingsInSector[0].lng, listingsInSector[0].lat]
      : [83.32, 17.72];

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://vizagstartupmap.com' },
    { name: 'Sectors', url: 'https://vizagstartupmap.com' },
    { name: sectorInfo.title, url: `https://vizagstartupmap.com/sector/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Navigation */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64] hover:text-[#093345] px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Interactive Map</span>
            </Link>
          </div>

          {/* Sector Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md w-fit mb-3 border border-amber-200">
              <Tag className="w-3.5 h-3.5" />
              <span>Industry Sector</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight mb-2">
              {sectorInfo.title}
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed mb-4">
              {sectorInfo.paragraph}
            </p>
            <div className="text-xs font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-200/60">
              {listingsInSector.length} startup{listingsInSector.length !== 1 ? 's' : ''} in this sector
            </div>
          </div>

          {/* Sector Map */}
          {listingsInSector.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Geographic Map Overview
              </h2>
              <MiniMap
                center={center}
                zoom={12.5}
                pins={listingsInSector.map((l) => ({
                  lat: l.lat,
                  lng: l.lng,
                  type: l.type,
                  name: l.name,
                }))}
                className="h-72 w-full rounded-xl"
              />
            </div>
          )}

          {/* Listings Grid */}
          <div>
            <h2 className="text-base font-bold text-gray-950 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0E4D64]" />
              <span>Startups in {sectorInfo.title.split(' ')[0]}</span>
            </h2>

            {listingsInSector.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listingsInSector.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
                No active listings currently registered in this sector.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
