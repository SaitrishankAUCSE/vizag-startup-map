import { Listing } from '@/types';

/**
 * Generates Schema.org JSON-LD for a startup listing
 */
export function generateStartupJsonLd(listing: Listing, appUrl: string = 'https://vizagstartupmap.com') {
  return {
    '@context': 'https://schema.org',
    '@type': listing.type === 'campus' ? 'EducationalOrganization' : 'Organization',
    name: listing.name,
    description: listing.description,
    url: listing.website || `${appUrl}/startup/${listing.slug}`,
    sameAs: listing.linkedin ? [listing.linkedin] : [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: 'Visakhapatnam',
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.lat,
      longitude: listing.lng,
    },
    foundingDate: listing.founded_year ? String(listing.founded_year) : undefined,
  };
}

/**
 * Generates BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
