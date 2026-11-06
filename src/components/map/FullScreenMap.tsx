'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Listing } from '@/types';
import { MAP_CONFIG } from '@/config/map';
import { FEATURES } from '@/config/features';
import { getOriginalLogoUrl, extractCleanDomain } from '@/lib/logos';

if (typeof window !== 'undefined') {
  setWorkerUrl('/maplibre-gl-worker.mjs');
}

interface FullScreenMapProps {
  listings: Listing[];
  selectedSlug: string | null;
  onSelectListing: (listing: Listing) => void;
  onDeselectListing: () => void;
  coastalTourActive?: boolean;
  coastalStopIndex?: number;
}

// Deterministic color variant for fallback initials
function getPinVariant(name?: string | null): { bg: string; text: string } {
  const safeName = name || 'Vizag';
  const charCode = safeName.charCodeAt(0) + (safeName.charCodeAt(1) || 0);
  const variants = [
    { bg: '#EAAA00', text: '#3A0F34' }, // marigold / aubergine
    { bg: '#3A0F34', text: '#DDE3E8' }, // aubergine / silver
  ];
  return variants[charCode % 2];
}

// Get initials (2 chars max)
function getInitials(name?: string | null): string {
  if (!name) return 'VS';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w ? w.charAt(0).toUpperCase() : ''))
    .join('');
}

// Extract clean hostname for favicon lookup
function getDomainFromUrl(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const domain = new URL(formatted).hostname.replace(/^www\./, '');
    if (domain && !domain.includes('example.com') && domain.includes('.')) {
      return domain;
    }
  } catch {}
  return null;
}

// Build a logo tile DOM element matching Hyderabad Startup Map (hyderabadstartupsmap.lol)
function buildPinEl(listing: Listing, selected: boolean): HTMLDivElement {
  const featured = listing.is_featured;
  const size = featured ? 54 : 44;
  const radius = featured ? 14 : 12;

  const variant = getPinVariant(listing.name);
  const initials = getInitials(listing.name);
  const domain = extractCleanDomain(listing.website);
  const logoSrc = getOriginalLogoUrl(listing);

  // Outer wrapper: passed to MapLibre Marker (MapLibre sets translate(x, y) on this)
  const wrapper = document.createElement('div');
  wrapper.className = 'vsm-marker-root';
  wrapper.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    z-index: ${featured ? 15 : selected ? 20 : 5};
  `;
  wrapper.setAttribute('data-listing-id', listing.id);

  // Inner container: provides relative positioning context for tooltips & badges
  const container = document.createElement('div');
  container.className = 'vsm-pin-container';

  // Tile: handles hover scale via pure CSS (.vsm-marker-root:hover .vsm-pin-tile)
  const tile = document.createElement('div');
  tile.className = 'vsm-pin-tile';
  tile.style.cssText = `
    border-radius: ${radius}px;
    border: ${featured ? '2.5px solid #EAAA00' : selected ? '2.5px solid #3A0F34' : '1px solid rgba(0,0,0,0.12)'};
    box-shadow: ${featured
      ? '0 0 0 3px rgba(234,170,0,0.35), 0 4px 14px rgba(0,0,0,0.22)'
      : selected
      ? '0 0 0 3px rgba(58,15,52,0.25), 0 4px 16px rgba(0,0,0,0.25)'
      : '0 2px 8px rgba(0,0,0,0.15)'};
  `;

  const showFallback = () => {
    if (!tile.querySelector('.vsm-fallback-initials')) {
      const fallback = document.createElement('div');
      fallback.className = 'vsm-fallback-initials';
      fallback.textContent = initials;
      fallback.style.cssText = `
        font-family: var(--font-bricolage), "Bricolage Grotesque", -apple-system, sans-serif;
        font-weight: 800;
        font-size: ${featured ? '18px' : '13px'};
        color: ${variant.text};
        background: ${variant.bg};
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      tile.appendChild(fallback);
    }
  };

  if (logoSrc) {
    const img = document.createElement('img');
    img.src = logoSrc;
    img.alt = listing.name;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:5px;';
    
    img.onload = () => {
      // Reject Google's generic 16x16 fallback globe
      if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
        img.style.display = 'none';
        showFallback();
      }
    };

    img.onerror = () => {
      img.style.display = 'none';
      // If primary logo failed, try unavatar before initials
      if (domain && !img.src.includes('unavatar.io')) {
        const retryImg = document.createElement('img');
        retryImg.src = `https://unavatar.io/${domain}?fallback=false`;
        retryImg.alt = listing.name;
        retryImg.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:5px;';
        retryImg.onerror = () => {
          retryImg.style.display = 'none';
          showFallback();
        };
        tile.appendChild(retryImg);
        return;
      }
      showFallback();
    };
    tile.appendChild(img);
  } else {
    showFallback();
  }

  container.appendChild(tile);

  // Type icon badge for non-startup categories
  if (listing.type && listing.type !== 'startup') {
    const typeBadge = document.createElement('div');
    typeBadge.style.cssText = `
      position: absolute;
      top: -3px;
      right: -3px;
      width: 15px;
      height: 15px;
      border-radius: 4px;
      background: #3A0F34;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: bold;
      border: 1px solid #FFFFFF;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      pointer-events: none;
    `;
    const icons: Record<string, string> = {
      investor: '◆',
      incubator: '●',
      campus: '■',
      coworking: '▲',
    };
    typeBadge.textContent = icons[listing.type] || '•';
    container.appendChild(typeBadge);
  }

  // Tooltip with startup name on hover (pure CSS opacity transition)
  const tooltip = document.createElement('div');
  tooltip.className = 'vsm-pin-tooltip';
  tooltip.textContent = listing.name;
  container.appendChild(tooltip);

  // Open Jobs badge under pin (matches Hyderabad Startup Map • 3 JOBS)
  const jobsCount = listing.jobs_count || listing.open_jobs?.length || 0;
  if (jobsCount > 0) {
    const badge = document.createElement('div');
    badge.style.cssText = `
      position: absolute;
      bottom: -13px;
      left: 50%;
      transform: translateX(-50%);
      background: #18181B;
      color: #FFFFFF;
      border-radius: 9999px;
      padding: 1.5px 6px;
      font-family: var(--font-dmsans), "DM Sans", -apple-system, sans-serif;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 3.5px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      pointer-events: none;
      z-index: 25;
    `;
    const dot = document.createElement('span');
    dot.style.cssText = 'width:4.5px;height:4.5px;border-radius:50%;background:#10B981;flex-shrink:0;';
    badge.appendChild(dot);
    badge.appendChild(document.createTextNode(`${jobsCount} JOBS`));
    container.appendChild(badge);
  }

  wrapper.appendChild(container);
  return wrapper;
}

// Build cluster tile element (matches Hyderabad Startup Map green rounded squares)
function buildClusterEl(count: number): HTMLDivElement {
  const size = count > 20 ? 46 : count > 10 ? 42 : 38;

  // Outer wrapper container passed to MapLibre Marker
  const wrapper = document.createElement('div');
  wrapper.className = 'vsm-marker-root';
  wrapper.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Inner badge element that performs the hover scale animation safely via pure CSS
  const badge = document.createElement('div');
  badge.className = 'vsm-cluster-badge';
  badge.style.fontSize = count > 99 ? '12px' : '14px';
  badge.textContent = count > 99 ? '99+' : String(count);

  wrapper.appendChild(badge);
  return wrapper;
}

// Build subtle landmark doodle
function buildLandmarkEl(name: string, icon: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    opacity: 0.75;
  `;

  const iconMap: Record<string, string> = {
    mountain: '⛰️',
    lighthouse: '🏮',
    anchor: '⚓',
    temple: '🛕',
    factory: '🏭',
    wave: '🌊',
  };

  el.innerHTML = `
    <div style="font-size: 14px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));">
      ${iconMap[icon] || '📍'}
    </div>
    <div style="
      font-family: var(--font-dmsans), 'DM Sans', -apple-system, sans-serif;
      font-size: 9px;
      font-weight: 700;
      color: #18181B;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(0,0,0,0.15);
      padding: 1px 5px;
      border-radius: 4px;
      margin-top: 2px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    ">
      ${name}
    </div>
  `;
  return el;
}

// Simple in-browser spatial clustering
interface PointCluster {
  type: 'cluster';
  count: number;
  listings: Listing[];
  lat: number;
  lng: number;
}
interface SinglePin {
  type: 'pin';
  listing: Listing;
}
type PinOrCluster = PointCluster | SinglePin;

function clusterListings(listings: Listing[], zoom: number): PinOrCluster[] {
  const radiusDeg = zoom < 11 ? 0.04 : zoom < 12 ? 0.025 : zoom < 13 ? 0.015 : zoom < 14 ? 0.009 : -1;

  if (radiusDeg <= 0) {
    return listings.map((l) => ({ type: 'pin', listing: l }));
  }

  const visited = new Set<string>();
  const result: PinOrCluster[] = [];

  for (const l of listings) {
    if (visited.has(l.id)) continue;

    const neighbors = listings.filter(
      (m) =>
        !visited.has(m.id) &&
        Math.abs(m.lat - l.lat) < radiusDeg &&
        Math.abs(m.lng - l.lng) < radiusDeg
    );

    if (neighbors.length <= 1) {
      visited.add(l.id);
      result.push({ type: 'pin', listing: l });
    } else {
      for (const n of neighbors) visited.add(n.id);
      // Select the medoid (the real startup closest to the geometric center)
      // This ensures the cluster pin ALWAYS sits on an exact real-world startup location on solid land!
      const avgLat = neighbors.reduce((s, n) => s + n.lat, 0) / neighbors.length;
      const avgLng = neighbors.reduce((s, n) => s + n.lng, 0) / neighbors.length;
      let bestListing = neighbors[0];
      let minDistance = Infinity;
      for (const n of neighbors) {
        const dist = (n.lat - avgLat) ** 2 + (n.lng - avgLng) ** 2;
        if (dist < minDistance) {
          minDistance = dist;
          bestListing = n;
        }
      }
      result.push({
        type: 'cluster',
        count: neighbors.length,
        listings: neighbors,
        lat: bestListing.lat,
        lng: bestListing.lng,
      });
    }
  }

  return result;
}

export const FullScreenMap: React.FC<FullScreenMapProps> = ({
  listings,
  selectedSlug,
  onSelectListing,
  onDeselectListing,
  coastalTourActive,
  coastalStopIndex = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const landmarkMarkersRef = useRef<Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const renderPins = useCallback(
    (map: MapLibreMap, listingsToRender: Listing[]) => {
      clearMarkers();
      const zoom = map.getZoom();
      const clusters = clusterListings(listingsToRender, zoom);

      for (const item of clusters) {
        if (item.type === 'cluster') {
          const el = buildClusterEl(item.count);
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo({ center: [item.lng, item.lat], zoom: Math.min(zoom + 2, 16), duration: 600 });
          });
          const marker = new Marker({ element: el, anchor: 'center' })
            .setLngLat([item.lng, item.lat])
            .addTo(map);
          markersRef.current.push(marker);
        } else {
          const l = item.listing;
          const selected = l.slug === selectedSlug;
          const el = buildPinEl(l, selected);
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectListing(l);
          });
          const offset: [number, number] = [0, (l.jobs_count || 0) > 0 ? -6 : 0];
          const marker = new Marker({ element: el, anchor: 'center', offset })
            .setLngLat([l.lng, l.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    },
    [selectedSlug, onSelectListing, clearMarkers]
  );

  const updateLandmarkVisibility = useCallback((map: MapLibreMap) => {
    const zoom = map.getZoom();
    const visible = zoom >= 11 && zoom <= 14;
    landmarkMarkersRef.current.forEach((m) => {
      const el = m.getElement();
      if (el) {
        el.style.display = visible ? 'flex' : 'none';
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use CARTO Voyager raster style specification matching Hyderabad Startup Map
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      attributionControl: false,
      fadeDuration: 150,
    });

    mapRef.current = map;

    // Attribution (bottom-right: Leaflet | © OpenStreetMap © CARTO)
    map.addControl(
      new AttributionControl({ compact: true, customAttribution: MAP_CONFIG.attribution }),
      'bottom-right'
    );

    // Navigation controls (+ and - square buttons)
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('error', (e) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('MapLibre notice:', e.error?.message || e);
      }
    });

    const handleLoaded = () => {
      // Add Landmark Doodles
      if (FEATURES.landmarkDoodles && MAP_CONFIG.landmarks) {
        MAP_CONFIG.landmarks.forEach((lm) => {
          const el = buildLandmarkEl(lm.name, lm.icon);
          const marker = new Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lm.lng, lm.lat])
            .addTo(map);
          landmarkMarkersRef.current.push(marker);
        });
        updateLandmarkVisibility(map);
      }

      renderPins(map, listings);
    };

    if (map.isStyleLoaded() || map.loaded()) {
      handleLoaded();
    } else {
      map.on('load', handleLoaded);
    }

    // Re-cluster on zoom change and update landmarks
    map.on('zoomend', () => {
      renderPins(map, listings);
      if (FEATURES.landmarkDoodles) {
        updateLandmarkVisibility(map);
      }
    });

    // Click on empty map → deselect
    map.on('click', () => {
      onDeselectListing();
    });

    return () => {
      clearMarkers();
      landmarkMarkersRef.current.forEach((m) => m.remove());
      landmarkMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render pins when listings or selected slug changes
  useEffect(() => {
    if (mapRef.current && (mapRef.current.isStyleLoaded() || mapRef.current.loaded())) {
      renderPins(mapRef.current, listings);
    }
  }, [listings, selectedSlug, renderPins]);

  // Fly to selected listing
  useEffect(() => {
    if (!selectedSlug || !mapRef.current) return;
    const listing = listings.find((l) => l.slug === selectedSlug);
    if (!listing) return;
    mapRef.current.flyTo({
      center: [listing.lng, listing.lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
      offset: [160, 0], // offset for detail card on desktop
      duration: 600,
    });
  }, [selectedSlug, listings]);

  // Coastal Tour camera animation
  useEffect(() => {
    if (!coastalTourActive || !mapRef.current) return;
    const stop = MAP_CONFIG.coastalTourStops[coastalStopIndex];
    if (!stop) return;
    mapRef.current.flyTo({
      center: [stop.lng, stop.lat],
      zoom: 13.5,
      pitch: 20,
      bearing: 15,
      duration: 1500,
    });
  }, [coastalTourActive, coastalStopIndex]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-[#f4f3f0]"
      role="application"
      aria-label="Vizag Startup Map"
    />
  );
};
