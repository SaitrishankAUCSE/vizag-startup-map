'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  Popup,
  Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Listing } from '@/types';
import { MAP_CONFIG } from '@/config/map';
import { createCustomMarkerElement } from './CustomPin';
import { createPinPopupContent } from './PinPopup';
import { MapLegend } from '@/components/ui/MapLegend';
import { Plus, Minus, Navigation } from 'lucide-react';

interface MapContainerProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
  onMapInteraction?: () => void;
  className?: string;
  showLegend?: boolean;
}

export function MapContainer({
  listings,
  selectedListing,
  onSelectListing,
  onMapInteraction,
  className = '',
  showLegend = true,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use reliable OpenStreetMap tiles with CSS duotone (no API key required)
    const tileSource =
      process.env.NEXT_PUBLIC_MAP_TILE_URL ||
      MAP_CONFIG.tileUrl ||
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'base-tiles': {
            type: 'raster',
            tiles: [tileSource],
            tileSize: 256,
            attribution: MAP_CONFIG.attribution,
          },
        },
        layers: [
          {
            id: 'base-tiles-layer',
            type: 'raster',
            source: 'base-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [83.2185, 17.6868], // Vizag city center: 17.6868° N, 83.2185° E
      zoom: 11.8,
      minZoom: 9.5,
      maxZoom: 18,
      bounds: [
        [83.05, 17.55],
        [83.5, 17.95],
      ],
      attributionControl: false,
    });

    // Notify parent if user interacts with the map (drag/zoom)
    const handleInteraction = () => {
      if (onMapInteraction) {
        onMapInteraction();
      }
    };

    map.on('dragstart', handleInteraction);
    map.on('zoomstart', handleInteraction);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapInteraction]);

  // Update Markers whenever listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers that are no longer in listings
    const currentListingIds = new Set(listings.map((l) => l.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentListingIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    listings.forEach((listing) => {
      const isSelected = selectedListing?.id === listing.id;
      const existingMarker = markersRef.current.get(listing.id);

      if (existingMarker) {
        // Update DOM element if selection state changed
        const newEl = createCustomMarkerElement(listing, isSelected, () => {
          onSelectListing(listing);
        });
        existingMarker.getElement().replaceWith(newEl);
      } else {
        // Create new marker
        const el = createCustomMarkerElement(listing, isSelected, () => {
          onSelectListing(listing);
        });

        const marker = new Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .addTo(map);

        markersRef.current.set(listing.id, marker);
      }
    });
  }, [listings, selectedListing, onSelectListing]);

  // Handle selected listing popup & camera pan
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedListing) {
      // Pan smoothly to selected coordinates
      map.flyTo({
        center: [selectedListing.lng, selectedListing.lat],
        zoom: Math.max(map.getZoom(), 13.5),
        duration: 900,
        essential: true,
      });

      // Show silver-and-aubergine popup
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const popup = new Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
        className: 'editorial-pin-popup',
      })
        .setLngLat([selectedListing.lng, selectedListing.lat])
        .setHTML(createPinPopupContent(selectedListing))
        .addTo(map);

      popupRef.current = popup;
    } else {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  }, [selectedListing]);

  // Map Controls: Zoom In, Zoom Out, Locate
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: 1000,
        });
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#DDE3E8] select-none ${className}`}
      aria-label="Map of startups in Visakhapatnam"
    >
      {/* MapLibre DOM element with duotone CSS treatment */}
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 z-0 [&_.maplibregl-canvas]:filter [&_.maplibregl-canvas]:grayscale-[100%] [&_.maplibregl-canvas]:contrast-[1.12] [&_.maplibregl-canvas]:brightness-[0.94]"
      />

      {/* Editorial Duotone Wash: Ice Silver base with aubergine multiply overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-20 mix-blend-color"
        style={{ backgroundColor: '#3A0F34' }}
      />

      {/* Map Legend (Bottom-Left) */}
      {showLegend && (
        <div className="absolute bottom-6 left-6 z-10 hidden sm:block max-w-[200px]">
          <MapLegend />
        </div>
      )}

      {/* Map Controls: Square silver buttons with aubergine icons (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center gap-1.5 shadow-[0_4px_16px_rgba(58,15,52,0.12)]">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-10 h-10 rounded-sm bg-[#DDE3E8] border border-[#3A0F34]/25 flex items-center justify-center text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-10 h-10 rounded-sm bg-[#DDE3E8] border border-[#3A0F34]/25 flex items-center justify-center text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          aria-label="Locate me"
          className={`w-10 h-10 rounded-sm bg-[#DDE3E8] border border-[#3A0F34]/25 flex items-center justify-center text-[#3A0F34] hover:bg-[#3A0F34] hover:text-[#DDE3E8] transition-colors cursor-pointer ${
            isLocating ? 'animate-pulse' : ''
          }`}
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* OpenStreetMap Attribution (Bottom-Right tiny label) */}
      <div className="absolute bottom-1 right-2 z-10 text-[9px] font-sans text-[#3A0F34]/60 pointer-events-none select-none">
        Map data © OpenStreetMap
      </div>
    </div>
  );
}
