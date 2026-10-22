// Map Configuration for Vizag Startup Map
// =========================================================================
// NOTE ON TILE PROVIDERS:
// Currently configured with OpenStreetMap raster tiles (free tier, no API key).
// Attribution is required and rendered by MapLibre attribution control.
// 
// IF TRAFFIC GROWS:
// Switch to Protomaps (serverless PMTiles on Cloudflare R2 / AWS S3) 
// or MapTiler free tier (100,000 monthly vector tile requests free)
// by updating NEXT_PUBLIC_MAP_TILE_URL in your .env.local file or editing below.
// =========================================================================

export const MAP_CONFIG = {
  // Tile URL: Put in ONE place as requested so providers can be swapped effortlessly.
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

  // OpenStreetMap Attribution
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',

  // Visakhapatnam City Center Coordinates [lng, lat] (MapLibre uses [longitude, latitude])
  center: [83.3200, 17.7300] as [number, number],

  // Optimal zoom level showing the entire city from Gajuwaka/Port to Rushikonda/Madhurawada
  defaultZoom: 11.5,
  minZoom: 9.5,
  maxZoom: 18,

  // Bounding box for Visakhapatnam region [[minLng, minLat], [maxLng, maxLat]]
  bounds: [
    [83.0500, 17.5500],
    [83.5000, 17.9500],
  ] as [[number, number], [number, number]],
};
