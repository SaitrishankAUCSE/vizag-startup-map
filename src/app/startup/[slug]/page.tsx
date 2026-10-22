import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Calendar,
  Users,
  Banknote,
  CheckCircle2,
  Sparkles,
  Briefcase,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { getListings, getListingBySlug } from '@/lib/supabase/service';
import { generateStartupJsonLd, generateBreadcrumbJsonLd } from '@/lib/utils/seo';
import { TYPE_COLORS } from '@/config/constants';
import { MiniMap } from '@/components/map/MiniMap';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: 'Listing Not Found | Vizag Startup Map',
    };
  }

  return {
    title: `${listing.name} - ${listing.sector} in ${listing.area} | Vizag Startup Map`,
    description: listing.description,
    openGraph: {
      title: `${listing.name} | Vizag Startup Map`,
      description: listing.description,
      type: 'article',
    },
  };
}


export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const typeStyle = TYPE_COLORS[listing.type] || TYPE_COLORS.startup;
  const jsonLd = generateStartupJsonLd(listing);
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://vizagstartupmap.com' },
    { name: listing.area, url: `https://vizagstartupmap.com/area/${listing.area.toLowerCase().replace(/\s+/g, '-')}` },
    { name: listing.name, url: `https://vizagstartupmap.com/startup/${listing.slug}` },
  ]);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64] hover:text-[#093345] px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Map</span>
            </Link>

            <Link
              href={`/dashboard?claim=${listing.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Claim this listing</span>
            </Link>
          </div>

          {/* Company Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo / Monogram */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold border shrink-0 ${
                  listing.is_featured
                    ? 'bg-amber-500/10 text-amber-900 border-amber-300 ring-4 ring-amber-400/30'
                    : 'bg-gray-100 text-[#0E4D64] border-gray-200'
                }`}
              >
                {listing.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.logo_url}
                    alt={listing.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  listing.name.slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Header Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
                    {listing.name}
                  </h1>
                  {listing.is_verified && (
                    <span title="Verified Listing" className="inline-flex">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    </span>
                  )}
                  {listing.is_featured && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-md capitalize ${typeStyle.bg} ${typeStyle.text}`}
                  >
                    {listing.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                    {listing.stage}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium border border-teal-100">
                    {listing.sector}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {listing.area}
                  </span>
                </div>

                {/* External links */}
                <div className="flex items-center gap-3">
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D64] hover:text-[#093345] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  )}
                  {listing.linkedin && (
                    <a
                      href={listing.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0077B5] hover:underline"
                    >
                      <svg className="w-3.5 h-3.5 fill-[#0077B5]" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {/* Claim this listing button */}
                  <Link
                    href={`/dashboard?claim=${listing.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-[#0E4D64] border border-teal-200 transition-colors ml-auto sm:ml-0"
                    title="Are you the founder or team member? Claim this listing to manage details and post jobs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>Claim listing</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                About
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1 font-medium">
                  <Calendar className="w-3 h-3" /> Founded
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {listing.founded_year || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1 font-medium">
                  <Users className="w-3 h-3" /> Team Size
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {listing.team_size || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1 font-medium">
                  <Banknote className="w-3 h-3" /> Funding
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {listing.funding_range || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1 font-medium">
                  <MapPin className="w-3 h-3" /> Coast Distance
                </span>
                <span className="text-xs font-bold text-teal-800">
                  {listing.distance_to_beach_km !== undefined
                    ? `${listing.distance_to_beach_km} km`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Open Jobs Section */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#E04F36]" />
                <span>Open Roles</span>
                <span className="text-xs font-normal text-gray-500">
                  ({listing.open_jobs?.length || 0})
                </span>
              </h2>
            </div>

            {listing.open_jobs && listing.open_jobs.length > 0 ? (
              <div className="space-y-3">
                {listing.open_jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-colors flex items-center justify-between gap-4 bg-gray-50/40"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.location}</p>
                    </div>
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0E4D64] hover:bg-[#093345] text-white transition-all shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">
                No active openings listed right now. Check back soon or visit their website.
              </div>
            )}
          </div>

          {/* Location & Mini Map Section */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0E4D64]" />
              <span>Location in Visakhapatnam</span>
            </h2>
            <p className="text-xs text-gray-600">{listing.address}</p>

            <MiniMap
              center={[listing.lng, listing.lat]}
              zoom={14}
              pins={[
                {
                  lat: listing.lat,
                  lng: listing.lng,
                  type: listing.type,
                  name: listing.name,
                },
              ]}
              className="h-72 w-full rounded-xl"
            />
          </div>
        </div>
      </div>
    </>
  );
}
