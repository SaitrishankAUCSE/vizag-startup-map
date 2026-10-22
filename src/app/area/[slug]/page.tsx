import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import { getListings } from '@/lib/supabase/service';
import { AREAS } from '@/config/constants';
import { AREA_DESCRIPTIONS } from '@/config/areaDescriptions';
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
  const areaKey = normalizeSlug(slug);
  const areaInfo = AREA_DESCRIPTIONS[areaKey];

  if (!areaInfo) {
    return { title: 'Area Not Found | Vizag Startup Map' };
  }

  return {
    title: `${areaInfo.title} | Vizag Startup Map`,
    description: areaInfo.paragraph,
  };
}


export default async function AreaPage({ params }: PageProps) {
  const { slug } = await params;
  const areaKey = normalizeSlug(slug);
  const areaInfo = AREA_DESCRIPTIONS[areaKey];

  if (!areaInfo) {
    notFound();
  }

  const allListings = await getListings();
  const listingsInArea = allListings.filter(
    (l) => normalizeSlug(l.area) === areaKey
  );

  const center: [number, number] =
    listingsInArea.length > 0
      ? [listingsInArea[0].lng, listingsInArea[0].lat]
      : [83.32, 17.72];

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://vizagstartupmap.com' },
    { name: 'Areas', url: 'https://vizagstartupmap.com' },
    { name: areaInfo.title, url: `https://vizagstartupmap.com/area/${slug}` },
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

          {/* Area Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md w-fit mb-3 border border-teal-100">
              <MapPin className="w-3.5 h-3.5" />
              <span>Visakhapatnam Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight mb-2">
              {areaInfo.title}
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed mb-4">
              {areaInfo.paragraph}
            </p>
            <div className="text-xs font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-200/60">
              {listingsInArea.length} ecosystem listing{listingsInArea.length !== 1 ? 's' : ''} in this area
            </div>
          </div>

          {/* Area Map */}
          {listingsInArea.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Geographic Map Overview
              </h2>
              <MiniMap
                center={center}
                zoom={13}
                pins={listingsInArea.map((l) => ({
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
              <span>Listings in this Area</span>
            </h2>

            {listingsInArea.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listingsInArea.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
                No active listings currently registered in this area.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
