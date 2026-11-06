import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getListingBySlug } from '@/lib/firebase/service';
import { generateStartupJsonLd, generateBreadcrumbJsonLd } from '@/lib/utils/seo';
import { StartupDetailClient } from './StartupDetailClient';

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
    description: listing.description || listing.one_liner || undefined,
    openGraph: {
      title: `${listing.name} | Vizag Startup Map`,
      description: listing.description || listing.one_liner || undefined,
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

  const jsonLd = generateStartupJsonLd(listing);
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://vizagstartupmap.com' },
    { name: listing.area, url: `https://vizagstartupmap.com/area/${listing.area.toLowerCase().replace(/\s+/g, '-')}` },
    { name: listing.name, url: `https://vizagstartupmap.com/startup/${listing.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <StartupDetailClient listing={listing} />
    </>
  );
}
