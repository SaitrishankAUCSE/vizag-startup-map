import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getListings, getJobs, getEcosystemStats } from '@/lib/data';
import { LandingMapView } from '@/components/map/LandingMapView';

export const metadata: Metadata = {
  title: 'Vizag Startup Map | Visakhapatnam Startup Ecosystem',
  description:
    'Discover every startup, investor, incubator, campus, and coworking space in Visakhapatnam on one interactive living map.',
  openGraph: {
    title: 'Vizag Startup Map — An Ecosystem Mapped',
    description:
      'Every startup, investor, campus, and workspace in Visakhapatnam on one living map.',
    url: 'https://vizagstartupmap.com',
    siteName: 'Vizag Startup Map',
    locale: 'en_IN',
    type: 'website',
  },
};

// Revalidate every 5 minutes (300 seconds) for real-time live counts
export const revalidate = 300;

export default async function HomePage() {
  const [listings, jobs, stats] = await Promise.all([
    getListings(),
    getJobs(),
    getEcosystemStats(),
  ]);

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#DDE3E8]" />}>
      <LandingMapView initialListings={listings} initialJobs={jobs} initialStats={stats} />
    </Suspense>
  );
}
