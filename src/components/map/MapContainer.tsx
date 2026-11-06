'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Listing } from '@/types';
import { MAP_CONFIG } from '@/config/map';
import { MapLegend } from '@/components/ui/MapLegend';
import { getOriginalLogoUrl, extractCleanDomain } from '@/lib/logos';

interface MapContainerProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
  onMapInteraction?: () => void;
  showLegend?: boolean;
  className?: string;
}

interface ClusterGroup {
  id: string;
  name: string;
  count: number;
  lat: number;
  lng: number;
  listings: Listing[];
}

export function MapContainer({
  listings,
  selectedListing,
  onSelectListing,
  onMapInteraction,
  showLegend = true,
  className = '',
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [currentZoom, setCurrentZoom] = useState<number>(MAP_CONFIG.defaultZoom);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Group listings into clusters by geographic proximity / neighborhood
  const clusters = useMemo(() => {
    const groups: { [key: string]: Listing[] } = {};

    listings.forEach((item) => {
      const key = item.area || 'Other';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    const result: ClusterGroup[] = [];

    Object.keys(groups).forEach((key) => {
      const items = groups[key];
      const avgLat = items.reduce((sum, i) => sum + i.lat, 0) / items.length;
      const avgLng = items.reduce((sum, i) => sum + i.lng, 0) / items.length;

      result.push({
        id: key,
        name: key,
        count: items.length,
        lat: avgLat,
        lng: avgLng,
        listings: items,
      });
    });

    return result;
  }, [listings]);

  // Speech bubble popup function matching Bangalore Startup Map
  const showListingPopup = useCallback(
    (map: MapLibreMap, coordinates: [number, number], listing: Listing) => {
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 max-w-[280px] font-sans text-left bg-white text-zinc-900 rounded-xl shadow-xl';

      popupContent.innerHTML = `
        <div style="margin-bottom: 4px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #18181b; margin: 0; line-height: 1.25;">
            ${listing.name}
          </h4>
        </div>
        <p style="font-size: 11.5px; color: #52525b; margin: 5px 0 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${listing.description}
        </p>
        <div style="font-size: 10.5px; color: #71717a; margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
          <span style="font-weight: 600; color: #3A0F34;">${listing.stage || 'Startup'}</span>
          <span>·</span>
          <span>${listing.sector || listing.type}</span>
          <span>·</span>
          <span style="color: #3f3f46;">${listing.area}</span>
          ${
            listing.jobs_count && listing.jobs_count > 0
              ? `<span>·</span><span style="color: #EAAA00; font-weight: 700;">💼 ${listing.jobs_count} jobs</span>`
              : ''
          }
        </div>
        <button
          id="popup-view-btn"
          style="background: #3A0F34; color: #ffffff; border: none; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;"
        >
          View Details &rarr;
        </button>
      `;

      const viewBtn = popupContent.querySelector('#popup-view-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          if (popupRef.current) popupRef.current.remove();
          onSelectListing(listing);
        });
      }

      popupRef.current = new Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: false,
        className: 'bangalore-style-popup',
      })
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(map);
    },
    [onSelectListing]
  );

  // Render Markers and Clusters
  const updateMapVisuals = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const zoom = map.getZoom();

    // CLUSTER MODE: When zoom < 13.2, show Bangalore Startup Map cluster bubbles with exact counts
    if (zoom < 13.2) {
      clusters.forEach((cluster) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer select-none transition-transform duration-200 hover:scale-115 hover:z-50';
        el.style.transformOrigin = 'center center';

        // Size and color based on company count (matching Bangalore Startup Map)
        let haloColor = 'rgba(134, 239, 172, 0.55)'; // light green
        let discColor = '#4ade80';
        let textColor = '#064e3b';
        let haloSize = 48;
        let discSize = 34;

        if (cluster.count >= 4) {
          haloColor = 'rgba(253, 224, 71, 0.55)'; // warm amber/yellow
          discColor = '#facc15';
          textColor = '#713f12';
          haloSize = 54;
          discSize = 38;
        }
        if (cluster.count >= 7) {
          haloColor = 'rgba(251, 146, 60, 0.55)'; // warm orange
          discColor = '#fb923c';
          textColor = '#ffffff';
          haloSize = 60;
          discSize = 44;
        }

        el.style.width = `${haloSize}px`;
        el.style.height = `${haloSize + 18}px`; // Extra space for area label
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        el.innerHTML = `
          <div style="position: relative; width: ${haloSize}px; height: ${haloSize}px; display: flex; align-items: center; justify-content: center;">
            <!-- Outer glowing halo ring -->
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${haloColor};"></div>
            <!-- Solid disc with count -->
            <div style="position: relative; z-index: 2; width: ${discSize}px; height: ${discSize}px; border-radius: 9999px; background-color: ${discColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center;">
              <span style="font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: ${discSize > 36 ? '16px' : '14px'}; color: ${textColor}; line-height: 1;">
                ${cluster.count}
              </span>
            </div>
          </div>
          <!-- Neighborhood Tag Label (Always crisp and readable) -->
          <div style="margin-top: 2px; white-space: nowrap; background: #3A0F34; color: #DDE3E8; padding: 1.5px 7px; border-radius: 9999px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; box-shadow: 0 2px 6px rgba(0,0,0,0.25); text-align: center;">
            ${cluster.name}
          </div>
        `;

        // Click on cluster: Smoothly fly into that area and expand into company pins
        el.onclick = (e) => {
          e.stopPropagation();
          onMapInteraction?.();
          map.flyTo({
            center: [cluster.lng, cluster.lat],
            zoom: 14.5,
            duration: 800,
            essential: true,
          });
        };

        const marker = new Marker({ element: el })
          .setLngLat([cluster.lng, cluster.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    } else {
      // EXPANDED PIN MODE: When zoom >= 13.2, show individual company logo badges
      listings.forEach((listing) => {
        const domain = extractCleanDomain(listing.website);
        const faviconUrl = getOriginalLogoUrl(listing);

        const isHiring = (listing.jobs_count || 0) > 0;
        const isSelected = selectedListing?.id === listing.id;

        const el = document.createElement('div');
        el.className =
          'custom-map-marker group cursor-pointer select-none';
        el.style.width = '38px';
        el.style.height = '38px';
        el.style.zIndex = isSelected ? '40' : '10';

        if (isHiring) {
          el.classList.add('pulse-hiring');
          el.style.borderRadius = '9999px';
        }

        const inner = document.createElement('div');
        inner.className =
          'w-full h-full rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-zinc-300 transition-transform duration-200 group-hover:scale-110';
        inner.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';

        const fallbackInitial = document.createElement('div');
        fallbackInitial.className =
          'w-full h-full bg-[#3A0F34] text-[#EAAA00] font-bold text-xs flex items-center justify-center uppercase';
        fallbackInitial.textContent = listing.name.slice(0, 2);

        if (faviconUrl) {
          const img = document.createElement('img');
          img.src = faviconUrl;
          img.alt = listing.name;
          img.className = 'w-5 h-5 object-contain';
          img.onload = () => {
            // Reject generic 16x16 fallback
            if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
              img.style.display = 'none';
              fallbackInitial.style.display = 'flex';
            }
          };
          img.onerror = () => {
            if (domain && !img.src.includes('unavatar.io')) {
              img.src = `https://unavatar.io/${domain}?fallback=false`;
              return;
            }
            img.style.display = 'none';
            fallbackInitial.style.display = 'flex';
          };
          inner.appendChild(img);
          fallbackInitial.style.display = 'none';
        }

        inner.appendChild(fallbackInitial);

        el.appendChild(inner);

        // Click handler opens popup & drawer
        el.onclick = (e) => {
          e.stopPropagation();
          onMapInteraction?.();
          onSelectListing(listing);
          showListingPopup(map, [listing.lng, listing.lat], listing);
        };

        const marker = new Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [clusters, listings, selectedListing, onSelectListing, onMapInteraction, showListingPopup]);

  // Keep a ref to updateMapVisuals so map.on('load') can safely invoke the latest version
  const updateMapVisualsRef = useRef(updateMapVisuals);
  updateMapVisualsRef.current = updateMapVisuals;

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const tileSource =
      process.env.NEXT_PUBLIC_MAP_TILE_URL ||
      MAP_CONFIG.tileUrl ||
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [tileSource],
            tileSize: 256,
            attribution: MAP_CONFIG.attribution,
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      bounds: MAP_CONFIG.bounds,
      attributionControl: false,
    });

    // Navigation Controls at bottom right
    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      updateMapVisualsRef.current();
    });

    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('dragstart', () => {
      onMapInteraction?.();
    });
    map.on('zoomstart', () => {
      onMapInteraction?.();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapInteraction]);

  // Update markers whenever zoom, mapLoaded, or listings change
  useEffect(() => {
    if (mapLoaded) {
      updateMapVisuals();
    }
  }, [currentZoom, listings, mapLoaded, updateMapVisuals]);

  // Fly to selected listing if chosen from list/drawer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedListing) return;

    map.flyTo({
      center: [selectedListing.lng, selectedListing.lat],
      zoom: 14.5,
      duration: 800,
      essential: true,
    });

    showListingPopup(map, [selectedListing.lng, selectedListing.lat], selectedListing);
  }, [selectedListing, showListingPopup]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Optional Map Legend in bottom-right */}
      {showLegend && (
        <div className="absolute bottom-6 right-16 z-10 hidden md:block max-w-[210px]">
          <MapLegend />
        </div>
      )}
    </div>
  );
}
