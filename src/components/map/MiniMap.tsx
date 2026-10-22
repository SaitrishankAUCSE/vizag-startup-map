'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG } from '@/config/map';
import { TYPE_COLORS } from '@/config/constants';

interface MiniMapPin {
  lat: number;
  lng: number;
  type?: string;
  name?: string;
}

interface MiniMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  pins?: MiniMapPin[];
  className?: string;
}

export function MiniMap({
  center,
  zoom = 13.5,
  pins = [],
  className = 'h-64 w-full rounded-2xl',
}: MiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let mapInstance: unknown = null;

    // Dynamically load MapLibre on client only to avoid SSR worker memory overhead
    import('maplibre-gl').then(({ Map: MapLibreMap, NavigationControl, Marker }) => {
      if (!mapContainerRef.current) return;

      const map = new MapLibreMap({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [MAP_CONFIG.tileUrl],
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
        center: center,
        zoom: zoom,
        scrollZoom: false,
      });

      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', () => {
        pins.forEach((pin) => {
          const el = document.createElement('div');
          const color = (pin.type && TYPE_COLORS[pin.type]?.hex) || '#0E4D64';
          el.className =
            'w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center';
          el.style.backgroundColor = color;
          el.style.cursor = 'pointer';

          if (pin.name) {
            el.title = pin.name;
          }

          new Marker({ element: el })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map);
        });
      });

      mapInstance = map;
    });

    return () => {
      if (mapInstance && typeof (mapInstance as { remove: () => void }).remove === 'function') {
        (mapInstance as { remove: () => void }).remove();
      }
    };
  }, [mounted, center, zoom, pins]);

  return (
    <div className={`relative overflow-hidden border border-gray-200 shadow-xs ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full bg-teal-50/30" />
    </div>
  );
}
