/**
 * OpenStreetMap Nominatim Geocoding Client
 * Respects Nominatim Usage Policy:
 *  - Rate limit: strictly maximum 1 request per second
 *  - Custom, identifying User-Agent
 *  - Scoped to Visakhapatnam / Andhra Pradesh bounding box
 *  - Provides required OpenStreetMap attribution
 */

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';

// Coordinates for Visakhapatnam center
export const VIZAG_DEFAULT_CENTER = {
  lat: 17.72,
  lng: 83.32,
};

// Rate limit helper: ensures at least 1000ms between calls
let lastCallTime = 0;

async function rateLimitDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  if (timeSinceLastCall < 1100) {
    const delay = 1100 - timeSinceLastCall;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastCallTime = Date.now();
}

export interface GeocodeResult {
  success: boolean;
  lat: number;
  lng: number;
  displayName?: string;
  needsPin: boolean;
  attribution: string;
}

/**
 * Geocode an address in Visakhapatnam.
 * If geocoding fails or is low confidence, returns needsPin = true.
 */
export async function geocodeVizagAddress(address: string, area?: string): Promise<GeocodeResult> {
  if (!address || address.trim().length < 3) {
    return {
      success: false,
      lat: VIZAG_DEFAULT_CENTER.lat,
      lng: VIZAG_DEFAULT_CENTER.lng,
      needsPin: true,
      attribution: OSM_ATTRIBUTION,
    };
  }

  await rateLimitDelay();

  try {
    const queryParts = [address.trim()];
    if (area && !address.toLowerCase().includes(area.toLowerCase())) {
      queryParts.push(area);
    }
    if (!address.toLowerCase().includes('visakhapatnam') && !address.toLowerCase().includes('vizag')) {
      queryParts.push('Visakhapatnam, Andhra Pradesh, India');
    }

    const q = encodeURIComponent(queryParts.join(', '));
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=in&viewbox=83.1,17.9,83.5,17.5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VizagStartupMap/1.0 (https://vizagstartupmap.com; contact@vizagstartupmap.com)',
        'Accept-Language': 'en',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        lat: VIZAG_DEFAULT_CENTER.lat,
        lng: VIZAG_DEFAULT_CENTER.lng,
        needsPin: true,
        attribution: OSM_ATTRIBUTION,
      };
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      // Verify coordinate lies roughly in greater Visakhapatnam area (17.5 to 18.0 N, 83.0 to 83.6 E)
      if (lat >= 17.5 && lat <= 18.1 && lng >= 83.0 && lng <= 83.6) {
        return {
          success: true,
          lat,
          lng,
          displayName: data[0].display_name,
          needsPin: false,
          attribution: OSM_ATTRIBUTION,
        };
      }
    }

    return {
      success: false,
      lat: VIZAG_DEFAULT_CENTER.lat,
      lng: VIZAG_DEFAULT_CENTER.lng,
      needsPin: true,
      attribution: OSM_ATTRIBUTION,
    };
  } catch (err) {
    console.warn('[geocode] Nominatim error or timeout:', (err as Error).message);
    return {
      success: false,
      lat: VIZAG_DEFAULT_CENTER.lat,
      lng: VIZAG_DEFAULT_CENTER.lng,
      needsPin: true,
      attribution: OSM_ATTRIBUTION,
    };
  }
}
