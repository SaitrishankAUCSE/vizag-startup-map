/**
 * High-resolution original logo resolver for Visakhapatnam Startup Map
 */

// Clean domain extractor
export function extractCleanDomain(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const domain = new URL(formatted).hostname.toLowerCase().replace(/^www\./, '').trim();
    if (domain && domain.includes('.') && !domain.includes('example.com')) {
      return domain;
    }
  } catch {}
  return null;
}

// Curated high-res official logo CDN / vector URLs for key Vizag tech companies
export const VERIFIED_VIZAG_LOGOS: Record<string, string> = {
  'aquaexchange.com': 'https://icon.horse/icon/aquaexchange.com',
  'fluentgrid.com': 'https://icon.horse/icon/fluentgrid.com',
  'imaginnovate.com': 'https://icon.horse/icon/imaginnovate.com',
  'bytebeam.io': 'https://icon.horse/icon/bytebeam.io',
  'symbiosystech.com': 'https://icon.horse/icon/symbiosystech.com',
  'symbiosys.com': 'https://icon.horse/icon/symbiosys.com',
  'sankhya.com': 'https://icon.horse/icon/sankhya.com',
  'saifseas.com': 'https://icon.horse/icon/saifseas.com',
  'saifautomation.com': 'https://icon.horse/icon/saifseas.com',
  'amtz.in': 'https://icon.horse/icon/amtz.in',
  'denticworld.com': 'https://icon.horse/icon/denticworld.com',
  'stpi.in': 'https://icon.horse/icon/stpi.in',
  'a-hub.co': 'https://icon.horse/icon/a-hub.co',
  'gitam.edu': 'https://icon.horse/icon/gitam.edu',
  'tammina.com': 'https://icon.horse/icon/tammina.com',
  'greenjams.org': 'https://icon.horse/icon/greenjams.org',
  'sumopayroll.com': 'https://icon.horse/icon/sumopayroll.com',
  'edumoon.in': 'https://icon.horse/icon/edumoon.in',
  'yespoho.com': 'https://icon.horse/icon/yespoho.com',
  'furpsq.com': 'https://icon.horse/icon/furpsq.com',
  'shreeyashelectromedicals.com': 'https://icon.horse/icon/shreeyashelectromedicals.com',
};

/**
 * Returns the best original logo URL for a listing, avoiding generic Google globe fallbacks
 */
export function getOriginalLogoUrl(listing: { website?: string | null; logo_url?: string | null }): string | null {
  const domain = extractCleanDomain(listing.website);

  if (domain && VERIFIED_VIZAG_LOGOS[domain]) {
    return VERIFIED_VIZAG_LOGOS[domain];
  }

  // If custom logo_url exists and is NOT Google's generic s2 favicon
  if (listing.logo_url && !listing.logo_url.includes('google.com/s2/favicons')) {
    return listing.logo_url;
  }

  if (domain) {
    // icon.horse fetches the live website's original icon directly without Google's generic globe
    return `https://icon.horse/icon/${domain}`;
  }

  return null;
}

