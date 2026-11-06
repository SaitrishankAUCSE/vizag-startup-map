import { VIZAG_BOUNDS, USER_AGENT } from './config.js';

/**
 * Query OpenStreetMap Overpass API for incubators, coworking, and tech offices in Vizag
 */
export async function discoverOverpassCandidates() {
  console.log('[OSM Overpass] Querying Overpass API for coworking, incubators, and tech hubs in Visakhapatnam...');

  const query = `[out:json][timeout:30];
(
  node["amenity"="coworking_space"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
  way["amenity"="coworking_space"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
  node["office"~"it|company|software|technology|research|telecommunication"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
  way["office"~"it|company|software|technology|research|telecommunication"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
  node["amenity"="incubator"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
  way["amenity"="incubator"](${VIZAG_BOUNDS.minLat},${VIZAG_BOUNDS.minLng},${VIZAG_BOUNDS.maxLat},${VIZAG_BOUNDS.maxLng});
);
out center;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: query,
    });

    if (!res.ok) {
      console.warn(`[OSM Overpass] Overpass returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const elements = data.elements || [];
    console.log(`[OSM Overpass] Received ${elements.length} elements from OpenStreetMap`);

    const candidates = [];
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || null;
      if (!name) continue;

      const lat = el.lat || el.center?.lat;
      const lng = el.lon || el.center?.lon;
      const website = tags.website || tags['contact:website'] || null;
      const type = tags.amenity === 'coworking_space' ? 'coworking' : tags.amenity === 'incubator' ? 'incubator' : 'startup';

      candidates.push({
        name: name.trim(),
        osm_id: String(el.id),
        osm_type: el.type,
        type,
        lat,
        lng,
        website,
        source_url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        lead_source: 'OpenStreetMap Overpass API (ODbL)',
      });
    }

    return candidates;
  } catch (err) {
    console.warn(`[OSM Overpass] Query failed: ${err.message}`);
    return [];
  }
}

