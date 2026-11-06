import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Tag, ArrowRight } from 'lucide-react';
import { getListings } from '@/lib/data';
import { SECTORS } from '@/config/constants';
import { SECTOR_DESCRIPTIONS } from '@/config/sectorDescriptions';
import { generateBreadcrumbJsonLd } from '@/lib/utils/seo';
import { MiniMap } from '@/components/map/MiniMap';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Strips } from '@/components/ui/Strips';

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
    title: `${sectorInfo.title} Startups in Vizag | Vizag Startup Map`,
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
    (l) => l.sector && normalizeSlug(l.sector) === sectorKey
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

      <div className="min-h-screen bg-[#DDE3E8] text-[#3A0F34] flex flex-col font-sans relative selection:bg-[#3A0F34] selection:text-[#EAAA00]">
        <Header />

        <main className="flex-1 relative overflow-hidden py-10 lg:py-16 px-4 md:px-8 max-w-5xl w-full mx-auto">
          <Strips animate={false} />

          <div className="relative z-10 space-y-6">
            {/* Back Navigation */}
            <div>
              <Link
                href="/grid"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Directory</span>
              </Link>
            </div>

            {/* Sector Hero Card */}
            <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 sm:p-8 shadow-sm">
              <div className="inline-block px-3 py-1 rounded-full border border-[#3A0F34]/25 bg-[#DDE3E8] text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A0F34] mb-3">
                <Tag className="w-3 h-3 inline mr-1 text-[#EAAA00]" />
                INDUSTRY VERTICAL
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#3A0F34] tracking-tight mb-2">
                {sectorInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#3A0F34]/80 max-w-3xl leading-relaxed mb-4">
                {sectorInfo.paragraph}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#3A0F34] bg-[#3A0F34]/10 px-3.5 py-1.5 rounded-full">
                  {listingsInSector.filter((l) => l.type === 'startup').length} startups
                </span>
                <span className="text-xs font-bold text-[#3A0F34] bg-[#3A0F34]/10 px-3.5 py-1.5 rounded-full">
                  {listingsInSector.length} total organizations
                </span>
                <span className="text-xs font-bold text-[#3A0F34] bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 px-3.5 py-1.5 rounded-full">
                  {listingsInSector.reduce((sum, l) => sum + (l.jobs_count || 0), 0)} open roles
                </span>
              </div>
            </div>

            {/* Sector Map */}
            {listingsInSector.length > 0 && (
              <div className="bg-[#DDE3E8] rounded-2xl border border-[#3A0F34]/25 p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#3A0F34]/70 mb-3">
                  Geographic Map Overview
                </h2>
                <div className="rounded-xl overflow-hidden border border-[#3A0F34]/20">
                  <MiniMap
                    center={center}
                    zoom={12.5}
                    pins={listingsInSector.map((l) => ({
                      lat: l.lat,
                      lng: l.lng,
                      type: l.type,
                      name: l.name,
                    }))}
                    className="h-72 w-full"
                  />
                </div>
              </div>
            )}

            {/* Listings Grid */}
            <div className="space-y-4">
              <h2 className="font-display font-extrabold text-xl text-[#3A0F34]">
                {sectorInfo.title} Companies in Visakhapatnam
              </h2>

              {listingsInSector.length === 0 ? (
                <div className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-8 text-center text-xs text-[#3A0F34]/70">
                  No startups registered in this sector yet.{' '}
                  <Link href="/submit" className="font-bold underline hover:text-[#3A0F34]">
                    Add yours here
                  </Link>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listingsInSector.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-[#DDE3E8] border border-[#3A0F34]/20 rounded-2xl p-5 shadow-xs hover:border-[#3A0F34]/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="font-display font-bold text-base text-[#3A0F34]">
                            {listing.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#3A0F34]/10 text-[#3A0F34] px-2 py-0.5 rounded-full">
                            {listing.stage || listing.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#3A0F34]/75 line-clamp-2 mb-3">
                          {listing.description}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-[#3A0F34]/15 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#3A0F34]/60">
                          {listing.area}
                        </span>
                        <Link
                          href={`/startup/${listing.slug}`}
                          className="text-xs font-bold text-[#3A0F34] hover:text-[#EAAA00] inline-flex items-center gap-1 transition-colors"
                        >
                          View profile <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
