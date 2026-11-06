import { politeFetch } from './http.js';
import {
  EXCLUSION_TERMS,
  BANNED_MNC_NAMES,
  VIZAG_BOUNDS,
  VIZAG_LAND_RULES,
  NOMINATIM_DELAY_MS,
  USER_AGENT,
} from './config.js';
import { normalizeDomain } from './dedup.js';
import { getPlaceWebsite } from './places.js';

let lastNominatimTime = 0;

/**
 * Polite rate limit for Nominatim geocoder (1 request / sec)
 */
export async function enforceNominatimRateLimit() {
  const now = Date.now();
  const elapsed = now - lastNominatimTime;
  if (elapsed < NOMINATIM_DELAY_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS - elapsed));
  }
  lastNominatimTime = Date.now();
}

/**
 * Geocode an address using Nominatim with bounds and User-Agent
 */
export async function geocodeWithNominatim(addressQuery) {
  if (!addressQuery || addressQuery.trim().length < 4) return null;

  await enforceNominatimRateLimit();
  const clean = addressQuery
    .replace(/[#\n\r<>]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const queryParam = clean.toLowerCase().includes('visakhapatnam') || clean.toLowerCase().includes('vizag')
    ? clean
    : `${clean}, Visakhapatnam`;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    queryParam
  )}&format=json&limit=1&viewbox=${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng},${VIZAG_BOUNDS.minLat}&bounded=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return { lat, lng, displayName: data[0].display_name };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Check if coordinate is strictly on land in Visakhapatnam
 */
export function isCoordinateOnLand(lat, lng, area = '') {
  if (!lat || !lng) return false;
  if (lat < VIZAG_BOUNDS.minLat || lat > VIZAG_BOUNDS.maxLat) return false;
  if (lng < VIZAG_BOUNDS.minLng || lng > VIZAG_BOUNDS.maxLng) return false;

  const a = (area || '').toLowerCase();
  if (a.includes('rushikonda') && lng > VIZAG_LAND_RULES.rushikondaMaxLng) return false;
  if ((a.includes('siripuram') || a.includes('dwaraka') || a.includes('beach')) && lng > VIZAG_LAND_RULES.cityCenterMaxLng) return false;
  if (a.includes('mvp') && lng > VIZAG_LAND_RULES.mvpColonyMaxLng) return false;
  if (a.includes('gajuwaka') && lng > VIZAG_LAND_RULES.gajuwakaMaxLng) return false;

  return true;
}

/**
 * Pre-Filter (Check A)
 */
export function checkPreFilter(name, types = [], primaryType = '', businessStatus = 'OPERATIONAL') {
  if (businessStatus && businessStatus !== 'OPERATIONAL') {
    return { passed: false, reason: 'business_status_not_operational' };
  }

  const lowerName = (name || '').toLowerCase();

  // Banned enterprise MNC branch
  for (const mnc of BANNED_MNC_NAMES) {
    if (lowerName === mnc || lowerName.startsWith(mnc + ' ') || lowerName.includes(' ' + mnc + ' ')) {
      return { passed: false, reason: `excluded_mnc_branch_${mnc}` };
    }
  }

  // Banned categories
  for (const term of EXCLUSION_TERMS) {
    if (lowerName.includes(term)) {
      return { passed: false, reason: `excluded_category_${term.replace(/\s+/g, '_')}` };
    }
  }

  return { passed: true, reason: null };
}

/**
 * Detect ATS board from html text or links
 */
function detectAtsBoard(html) {
  if (!html) return { provider: null, slug: null };
  const leverMatch = html.match(/jobs\.lever\.co\/([a-zA-Z0-9_-]+)/i);
  if (leverMatch) return { provider: 'lever', slug: leverMatch[1] };

  const ghMatch = html.match(/boards\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-zA-Z0-9_-]+)/i);
  if (ghMatch) return { provider: 'greenhouse', slug: ghMatch[1] };

  const ashbyMatch = html.match(/jobs\.ashbyhq\.com\/([a-zA-Z0-9_-]+)/i);
  if (ashbyMatch) return { provider: 'ashby', slug: ashbyMatch[1] };

  return { provider: null, slug: null };
}

/**
 * Verify candidate through full pipeline (A -> F)
 */
export async function verifyCandidate(candidate) {
  const name = candidate.name;
  const checksPassed = [];
  const notes = [];

  // ── Step A: Pre-Filter ──
  const preFilter = checkPreFilter(name, candidate.types, candidate.primaryType, candidate.businessStatus);
  if (!preFilter.passed) {
    return {
      name,
      website: candidate.website || null,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: preFilter.reason,
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: ['Failed Step A pre-filter: ' + preFilter.reason],
    };
  }
  checksPassed.push('A');

  // Resolve website: check Google Places Details if needed
  let website = candidate.website;
  if (!website && candidate.google_place_id && process.env.GOOGLE_PLACES_API_KEY) {
    website = await getPlaceWebsite(process.env.GOOGLE_PLACES_API_KEY, candidate.google_place_id);
  }

  if (!website) {
    return {
      name,
      website: null,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: 'no_official_site',
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: ['No official website found'],
    };
  }

  // Format website
  let formattedUrl = website.startsWith('http') ? website : `https://${website}`;
  const domain = normalizeDomain(formattedUrl);
  if (!domain) {
    return {
      name,
      website: formattedUrl,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: 'invalid_domain',
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: ['Domain normalization failed or invalid format'],
    };
  }

  // Reject social media, directory, or marketplace links as official website
  const bannedDomains = [
    'linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'justdial.com', 'indiamart.com', 'sulekha.com', 'crunchbase.com', 'tracxn.com',
    'google.com', 'youtube.com', 'medium.com', 'github.com',
  ];
  if (bannedDomains.some((bd) => domain.includes(bd))) {
    return {
      name,
      website: formattedUrl,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: 'social_or_directory_link_not_official_site',
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: [`${domain} is a directory or social page, not company's own site`],
    };
  }

  // ── Step B: Own Website (HTTP 200, HTTPS) ──
  const homeRes = await politeFetch(formattedUrl);
  if (!homeRes.ok || homeRes.status === 0) {
    return {
      name,
      website: formattedUrl,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: `site_unreachable_${homeRes.error || homeRes.status}`,
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: [`Homepage did not load: ${homeRes.error || homeRes.status}`],
    };
  }

  const homeHtml = homeRes.text || '';
  const homeLower = homeHtml.toLowerCase();

  // Check parked or for-sale page
  if (
    homeLower.includes('domain is for sale') ||
    homeLower.includes('buy this domain') ||
    homeLower.includes('parkingcrew') ||
    homeLower.includes('godaddy parked') ||
    homeLower.includes('namecheap parked')
  ) {
    return {
      name,
      website: homeRes.finalUrl,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: 'parked_domain',
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: ['Domain appears parked or for sale'],
    };
  }

  checksPassed.push('B');

  // Attempt to fetch About, Contact, and Careers pages
  const baseOrigin = new URL(homeRes.finalUrl).origin;
  const subPages = ['/about', '/about-us', '/contact', '/contact-us', '/careers'];
  const fetchedPages = [{ url: homeRes.finalUrl, html: homeHtml }];

  for (const path of subPages) {
    if (fetchedPages.length >= 4) break;
    const pageUrl = `${baseOrigin}${path}`;
    const pRes = await politeFetch(pageUrl);
    if (pRes.ok && pRes.text && pRes.text.length > 200) {
      fetchedPages.push({ url: pageUrl, html: pRes.text });
    }
  }

  // ── Step C: Vizag Proof ──
  const vizagRegex = /\b(visakhapatnam|vishakhapatnam|vizag|visakha)\b/i;
  let vizagProofUrl = null;
  let addressFound = null;

  for (const page of fetchedPages) {
    // Strip scripts and styles before checking text
    const cleanText = page.html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

    if (vizagRegex.test(cleanText)) {
      vizagProofUrl = page.url;
      // Extract clean address snippet around the mention
      const match = cleanText.match(/(?:address|office|location|contact|hq|campus|zone)?[:\s-]*([^<>\n\r]{10,120}\b(?:visakhapatnam|vishakhapatnam|vizag|visakha)\b[^<>\n\r]{0,80})/i);
      if (match && match[1]) {
        addressFound = match[1]
          .replace(/&amp;/g, '&')
          .replace(/["'<>]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }
      break;
    }
  }

  if (!vizagProofUrl) {
    return {
      name,
      website: homeRes.finalUrl,
      area: 'Visakhapatnam',
      address: null,
      lat: null,
      lng: null,
      decision: 'rejected',
      checksPassed,
      reason_if_not_approved: 'no_vizag_office_proof_on_site',
      evidence_url_vizag_proof: null,
      evidence_url_activity: null,
      careers_url: null,
      ats_provider: null,
      google_place_id: candidate.google_place_id || null,
      notes: ['No mention of Visakhapatnam/Vizag on company own website'],
    };
  }
  checksPassed.push('C');

  // ── Step D: Startup or New-Age Fit ──
  let startupFit = true;
  let foundedYear = null;

  for (const page of fetchedPages) {
    const yrMatch = page.html.match(/\b(?:founded|est\.?|established|since)\s*(?:in)?\s*[:\s-]*\b(20[0-2][0-9]|19[89][0-9])\b/i);
    if (yrMatch && yrMatch[1]) {
      foundedYear = parseInt(yrMatch[1], 10);
      break;
    }
  }

  if (foundedYear !== null && foundedYear < 2010) {
    startupFit = false;
    notes.push(`Founded year ${foundedYear} before 2010 cutoff`);
  }

  // Check if pure body shop
  const combinedHtml = fetchedPages.map((p) => p.html).join(' ').toLowerCase();
  const isPureBodyShop =
    combinedHtml.includes('staff augmentation') &&
    combinedHtml.includes('hire dedicated developers') &&
    !combinedHtml.includes('product') &&
    !combinedHtml.includes('platform');

  if (isPureBodyShop) {
    startupFit = false;
    notes.push('Appears to be pure IT staffing/body shop');
  }

  // Check if technology or product-driven
  const isIncubatorOrCoworking = candidate.type === 'incubator' || candidate.type === 'coworking';
  const techKeywords = [
    'software', 'saas', 'platform', 'app', 'ai', 'artificial intelligence', 'machine learning',
    'fintech', 'edtech', 'healthtech', 'medtech', 'medical device', 'biotech', 'robotics', 'robot',
    'drone', 'iot', 'hardware', 'embedded', 'deep tech', 'cybersecurity', 'cloud', 'blockchain',
    'automation', 'technology', 'technologies', 'digital', 'cleantech', 'aquaculture', 'agritech',
    'innovation', 'maritime', 'telecom', 'devices', 'diagnostic', 'incubator', 'startup', 'coworking'
  ];
  const hasTechFocus = isIncubatorOrCoworking || techKeywords.some((kw) => combinedHtml.includes(kw));

  if (!hasTechFocus) {
    startupFit = false;
    notes.push('Does not appear to be a technology or product-driven company');
  }

  if (startupFit) {
    checksPassed.push('D');
  }

  // ── Step E: Active (in last 18 months) ──
  let isActive = false;
  let activityProofUrl = null;

  // Check recent years (2024, 2025, 2026) in text, copyright, or updates
  if (/(2024|2025|2026)/.test(combinedHtml)) {
    isActive = true;
    activityProofUrl = homeRes.finalUrl;
  }

  // Check active careers
  let careersUrl = null;
  const careersPage = fetchedPages.find((p) => p.url.includes('/careers'));
  if (careersPage && careersPage.html.length > 500) {
    careersUrl = careersPage.url;
    isActive = true;
    if (!activityProofUrl) activityProofUrl = careersPage.url;
  }

  // Check active social links
  if (!isActive && (combinedHtml.includes('linkedin.com/company') || combinedHtml.includes('twitter.com/') || combinedHtml.includes('x.com/'))) {
    isActive = true;
    activityProofUrl = homeRes.finalUrl;
  }

  if (isActive) {
    checksPassed.push('E');
  } else {
    notes.push('No recent copyright/update (2024-2026), careers, or social links detected');
  }

  // ── Step F: Pin Geocoding ──
  let lat = candidate.lat || null;
  let lng = candidate.lng || null;
  let areaDetected = 'Visakhapatnam';

  // Area classification from text and address
  if (combinedHtml.includes('amtz') || combinedHtml.includes('medtech zone') || combinedHtml.includes('nadupuru')) {
    areaDetected = 'Nadupuru (AMTZ)';
  } else if (combinedHtml.includes('andhra university') || combinedHtml.includes('a-hub')) {
    areaDetected = 'Siripuram';
  } else {
    const areaKeywords = [
      'Rushikonda', 'Madhurawada', 'MVP Colony', 'Siripuram', 'Dwaraka Nagar',
      'Seethammadhara', 'Beach Road', 'Gajuwaka', 'Akkayyapalem', 'Maharanipeta',
      'Yendada', 'Pendurthi', 'NAD Junction', 'Autonagar', 'CBM Compound',
    ];
    for (const ak of areaKeywords) {
      if (combinedHtml.includes(ak.toLowerCase())) {
        areaDetected = ak;
        break;
      }
    }
  }

  // Geocode with Nominatim if coordinate not already verified on land
  if (!lat || !lng || !isCoordinateOnLand(lat, lng, areaDetected)) {
    if (addressFound && addressFound.length > 5 && addressFound.length < 100) {
      const geo = await geocodeWithNominatim(addressFound);
      if (geo && isCoordinateOnLand(geo.lat, geo.lng, areaDetected)) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    if (!lat && areaDetected) {
      const areaQuery = areaDetected.includes('AMTZ')
        ? 'Andhra Pradesh MedTech Zone, Visakhapatnam'
        : `${areaDetected}, Visakhapatnam`;
      const geo = await geocodeWithNominatim(areaQuery);
      if (geo && isCoordinateOnLand(geo.lat, geo.lng, areaDetected)) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }
  }

  if (lat && lng && isCoordinateOnLand(lat, lng, areaDetected)) {
    checksPassed.push('F');
  } else {
    notes.push('Pin coordinate could not be verified on land in Vizag');
  }

  // Extra signals (G)
  const hasDpiit = combinedHtml.includes('dpiit') || combinedHtml.includes('startup india');
  const ats = detectAtsBoard(combinedHtml);

  // Derive sector guess
  let sector = candidate.type === 'coworking' ? 'Coworking' : candidate.type === 'incubator' ? 'Incubator' : 'SaaS';
  if (!candidate.type || candidate.type === 'startup') {
    if (combinedHtml.includes('medtech') || combinedHtml.includes('medical device') || combinedHtml.includes('biotech') || combinedHtml.includes('dental') || combinedHtml.includes('health') || combinedHtml.includes('clinical')) {
      sector = 'HealthTech';
    } else if (combinedHtml.includes('agri') || combinedHtml.includes('farm') || combinedHtml.includes('aquaculture')) {
      sector = 'AgriTech';
    } else if (combinedHtml.includes('fintech') || combinedHtml.includes('payment') || combinedHtml.includes('banking')) {
      sector = 'FinTech';
    } else if (combinedHtml.includes('edtech') || combinedHtml.includes('learn') || combinedHtml.includes('education')) {
      sector = 'EdTech';
    } else if (combinedHtml.includes('robot') || combinedHtml.includes('drone') || combinedHtml.includes('hardware') || combinedHtml.includes('iot') || combinedHtml.includes('embedded')) {
      sector = 'Hardware & IoT';
    } else if (combinedHtml.includes('ai') || combinedHtml.includes('artificial intelligence') || combinedHtml.includes('machine learning')) {
      sector = 'AI';
    } else if (combinedHtml.includes('logistics') || combinedHtml.includes('truck') || combinedHtml.includes('freight') || combinedHtml.includes('supply chain')) {
      sector = 'Logistics';
    } else if (combinedHtml.includes('maritime') || combinedHtml.includes('marine') || combinedHtml.includes('shipping') || combinedHtml.includes('port')) {
      sector = 'Maritime Tech';
    } else if (combinedHtml.includes('green') || combinedHtml.includes('solar') || combinedHtml.includes('waste') || combinedHtml.includes('renewable') || combinedHtml.includes('environment')) {
      sector = 'CleanTech';
    }
  }

  // Generate concise one_liner under 140 chars
  let metaDesc = null;
  const metaMatch = homeHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    metaDesc = metaMatch[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  }
  const oneLiner = metaDesc && metaDesc.length > 15 && metaDesc.length < 135
    ? metaDesc
    : `${name} is a ${sector.toLowerCase()} company based in ${areaDetected}, Visakhapatnam.`.slice(0, 138);

  // Derive decision
  let decision = 'lead';
  let reason = null;

  if (checksPassed.includes('A') && checksPassed.includes('B') && checksPassed.includes('C') && checksPassed.includes('D') && checksPassed.includes('E') && checksPassed.includes('F')) {
    decision = 'approved';
  } else if (checksPassed.includes('B') && checksPassed.includes('C')) {
    decision = 'lead';
    reason = notes.join('; ') || 'Needs manual inspection for D/E/F';
  } else {
    decision = 'rejected';
    reason = notes.join('; ') || 'Failed core checks';
  }

  return {
    name,
    type: candidate.type || 'startup',
    website: homeRes.finalUrl,
    one_liner: oneLiner,
    sector,
    sector_confidence: 'guess',
    area: areaDetected,
    address: addressFound || `${areaDetected}, Visakhapatnam, Andhra Pradesh`,
    lat,
    lng,
    decision,
    checksPassed,
    reason_if_not_approved: decision === 'approved' ? null : reason,
    evidence_url_vizag_proof: vizagProofUrl,
    evidence_url_activity: activityProofUrl,
    careers_url: careersUrl,
    ats_provider: ats.provider,
    ats_board_slug: ats.slug,
    google_place_id: candidate.google_place_id || null,
    has_dpiit: hasDpiit,
    founded_year: foundedYear,
    notes,
  };
}
