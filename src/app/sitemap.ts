import { MetadataRoute } from 'next';
import { getListings } from '@/lib/supabase/service';
import { AREAS, SECTORS } from '@/config/constants';

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vizagstartupmap.com';
  const listings = await getListings();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Startup detail pages
  const startupRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${baseUrl}/startup/${l.slug}`,
    lastModified: new Date(l.updated_at || l.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Area pages
  const areaRoutes: MetadataRoute.Sitemap = AREAS.map((area) => ({
    url: `${baseUrl}/area/${normalizeSlug(area)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Sector pages
  const sectorRoutes: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
    url: `${baseUrl}/sector/${normalizeSlug(sector)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...startupRoutes, ...areaRoutes, ...sectorRoutes];
}
