/**
 * Feature flags for Vizag Startup Map
 * Toggle optional Vizag-specific features here.
 */
export const FEATURES = {
  /**
   * "Coastal Tour" — floating button that flies the map along the Vizag coastline,
   * showing a card at each area stop with listing counts and top sectors.
   */
  coastalTour: true,

  /**
   * Landmark doodle icons at real Vizag coordinates (Kailasagiri, Dolphin's Nose, etc.)
   * Visible between zoom 11 and 14. Never block pin clicks.
   */
  landmarkDoodles: true,

  /**
   * Creator card — shown bottom-left, closeable, remembers via localStorage.
   * Fill creator details in /config/creator.ts
   */
  creatorCard: true,

  /**
   * Night mode toggle on inner pages (About, Pricing, etc.)
   */
  nightMode: false,
} as const;
