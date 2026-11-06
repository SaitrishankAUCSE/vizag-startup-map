import { VIZAG_BOUNDS, PLACES_BUDGET, SEARCH_KEYWORDS, VIZAG_AREAS, USER_AGENT } from './config.js';

let searchRequestsUsed = 0;
let detailRequestsUsed = 0;

export function getPlacesApiStats() {
  return {
    searchRequestsUsed,
    detailRequestsUsed,
    maxSearchAllowed: PLACES_BUDGET.maxSearchRequests,
    maxDetailAllowed: PLACES_BUDGET.maxDetailRequests,
  };
}

/**
 * Perform a single Text Search (New) request
 */
async function searchPlacesText(apiKey, query, pageToken = null) {
  if (searchRequestsUsed >= PLACES_BUDGET.maxSearchRequests) {
    console.warn(`[Places API] Search budget limit reached (${PLACES_BUDGET.maxSearchRequests} requests).`);
    return { places: [], nextPageToken: null };
  }

  searchRequestsUsed++;
  console.log(`[Places API] Search #${searchRequestsUsed}/${PLACES_BUDGET.maxSearchRequests}: "${query}"`);

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.businessStatus,nextPageToken',
    'User-Agent': USER_AGENT,
  };

  const body = {
    textQuery: query,
    regionCode: 'IN',
    pageSize: 20,
    locationRestriction: {
      rectangle: {
        low: { latitude: VIZAG_BOUNDS.minLat, longitude: VIZAG_BOUNDS.minLng },
        high: { latitude: VIZAG_BOUNDS.maxLat, longitude: VIZAG_BOUNDS.maxLng },
      },
    },
  };

  if (pageToken) {
    body.pageToken = pageToken;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[Places API] Search returned HTTP ${res.status}: ${res.statusText}`);
      return { places: [], nextPageToken: null };
    }

    const data = await res.json();
    return {
      places: data.places || [],
      nextPageToken: data.nextPageToken || null,
    };
  } catch (err) {
    console.warn(`[Places API] Search error: ${err.message}`);
    return { places: [], nextPageToken: null };
  }
}

/**
 * Fetch Place Details (New) with field mask websiteUri only
 */
export async function getPlaceWebsite(apiKey, placeId) {
  if (!apiKey || !placeId) return null;

  if (detailRequestsUsed >= PLACES_BUDGET.maxDetailRequests) {
    console.warn(`[Places API] Detail budget limit reached (${PLACES_BUDGET.maxDetailRequests} requests).`);
    return null;
  }

  detailRequestsUsed++;
  if (detailRequestsUsed % 10 === 0 || detailRequestsUsed === 1) {
    console.log(`[Places API] Place Details #${detailRequestsUsed}/${PLACES_BUDGET.maxDetailRequests} for ${placeId}`);
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const headers = {
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'websiteUri',
    'User-Agent': USER_AGENT,
  };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data.websiteUri || null;
  } catch {
    return null;
  }
}

/**
 * Run full Google Places candidate discovery
 */
export async function discoverGooglePlacesCandidates() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.log('[Places API] GOOGLE_PLACES_API_KEY is not configured in environment. Skipping Google Places API.');
    return [];
  }

  console.log('[Places API] Starting Google Places (New) Text Search with area-bounded queries...');
  const candidatesById = new Map();

  // 1. City-wide queries: keyword + "Visakhapatnam"
  for (const keyword of SEARCH_KEYWORDS) {
    if (searchRequestsUsed >= PLACES_BUDGET.maxSearchRequests) break;
    const query = `${keyword} Visakhapatnam`;
    let pageToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      const res = await searchPlacesText(apiKey, query, pageToken);
      for (const place of res.places) {
        if (place.id && !candidatesById.has(place.id)) {
          candidatesById.set(place.id, place);
        }
      }
      pageToken = res.nextPageToken;
      if (pageToken) {
        // Sleep briefly before requesting next page per Google guidelines
        await new Promise((r) => setTimeout(r, 2000));
      }
    } while (pageToken && pageCount < 3 && searchRequestsUsed < PLACES_BUDGET.maxSearchRequests);
  }

  // 2. Focused area queries: top 10 keywords x 14 areas
  const top10Keywords = SEARCH_KEYWORDS.slice(0, 10);
  for (const area of VIZAG_AREAS) {
    if (searchRequestsUsed >= PLACES_BUDGET.maxSearchRequests) break;
    for (const kw of top10Keywords) {
      if (searchRequestsUsed >= PLACES_BUDGET.maxSearchRequests) break;
      const query = `${kw} in ${area} Visakhapatnam`;
      const res = await searchPlacesText(apiKey, query);
      for (const place of res.places) {
        if (place.id && !candidatesById.has(place.id)) {
          candidatesById.set(place.id, place);
        }
      }
    }
  }

  console.log(`[Places API] Total unique Google Places candidates gathered: ${candidatesById.size}`);
  return Array.from(candidatesById.values());
}

