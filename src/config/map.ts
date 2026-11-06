// Map Configuration for Vizag Startup Map
// =========================================================================
// TILE / STYLE PROVIDERS
// -------------------------------------------------------------------------
// DEFAULT: OpenFreeMap "Positron" — free, no API key, quiet light vector style
//   that lets logo pins stand out clearly.
//
// HOW TO SWITCH:
//   Set NEXT_PUBLIC_MAP_STYLE_URL in your .env.local.
//   Examples:
//     MapTiler Basic Light:  https://api.maptiler.com/maps/basic-v2/style.json?key=YOUR_KEY
//     Protomaps PMTiles:     https://api.protomaps.com/styles/v4/light/en.json?key=YOUR_KEY
//     OpenFreeMap Bright:    https://tiles.openfreemap.org/styles/bright
//
// =========================================================================

// Official CARTO Voyager GL style URL (native vector, zero watermark)
export const CARTO_VOYAGER_STYLE_URL = '/voyager-style.json';

export const MAP_CONFIG = {
  // Map style: Official CARTO Voyager GL style matching Hyderabad & Bangalore Startup Maps
  style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || CARTO_VOYAGER_STYLE_URL,
  styleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL || CARTO_VOYAGER_STYLE_URL,

  // CARTO / OSM attribution
  attribution:
    'Leaflet | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',

  // Tile URL for raster tile fallback
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

  // Visakhapatnam City Center [lng, lat] — MapLibre uses [longitude, latitude]
  center: [83.3200, 17.7300] as [number, number],

  // Default zoom — whole city visible from Gajuwaka to Rushikonda/Madhurawada
  defaultZoom: 11.5,
  minZoom: 9.5,
  maxZoom: 18,

  // Zoom threshold below which we collapse pins into cluster tiles
  clusterZoomThreshold: 13.2,

  // Max individual logo tiles rendered in the viewport (performance cap)
  maxVisiblePins: 150,

  // Bounding box [[minLng, minLat], [maxLng, maxLat]]
  bounds: [
    [83.0500, 17.5500],
    [83.5000, 17.9500],
  ] as [[number, number], [number, number]],

  // Coastal Tour stops [lng, lat] with display metadata
  coastalTourStops: [
    { lng: 83.2100, lat: 17.6820, name: 'Gajuwaka & Auto Nagar', area: 'Gajuwaka', color: '#3A0F34' },
    { lng: 83.3180, lat: 17.7120, name: 'RK Beach & Coastal Hub', area: 'Beach Road', color: '#3A0F34' },
    { lng: 83.3320, lat: 17.7420, name: 'MVP Colony Tech Hub', area: 'MVP Colony', color: '#3A0F34' },
    { lng: 83.3760, lat: 17.7820, name: 'Rushikonda IT SEZ', area: 'Rushikonda', color: '#3A0F34' },
    { lng: 83.3530, lat: 17.8050, name: 'Madhurawada IT Park', area: 'Madhurawada', color: '#3A0F34' },
  ] as Array<{ lng: number; lat: number; name: string; area: string; color: string }>,

  // Vizag landmark doodle positions [lng, lat, name]
  landmarks: [
    { lng: 83.3415, lat: 17.7490, name: 'Kailasagiri', icon: 'mountain' },
    { lng: 83.2983, lat: 17.6833, name: "Dolphin's Nose", icon: 'lighthouse' },
    { lng: 83.3235, lat: 17.7155, name: 'Submarine Museum', icon: 'anchor' },
    { lng: 83.2464, lat: 17.7681, name: 'Simhachalam Temple', icon: 'temple' },
    { lng: 83.1723, lat: 17.6180, name: 'Vizag Steel Plant', icon: 'factory' },
    { lng: 83.3760, lat: 17.7834, name: 'Rushikonda Beach', icon: 'wave' },
  ] as Array<{ lng: number; lat: number; name: string; icon: string }>,
};
