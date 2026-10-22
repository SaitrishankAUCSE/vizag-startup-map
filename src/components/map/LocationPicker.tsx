'use client';

import React, { useEffect, useRef } from 'react';
import { Map as MapLibreMap, NavigationControl, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG } from '@/config/map';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [lng || 83.32, lat || 17.72];

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
      center: initialCenter,
      zoom: 13,
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');

    const marker = new Marker({
      draggable: true,
      color: '#E04F36',
    })
      .setLngLat(initialCenter)
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      onChange(Math.round(lngLat.lat * 10000) / 10000, Math.round(lngLat.lng * 10000) / 10000);
    });

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      onChange(Math.round(e.lngLat.lat * 10000) / 10000, Math.round(e.lngLat.lng * 10000) / 10000);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Click on the map or drag the pin to your exact office location:</span>
        <span className="font-mono font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
      <div className="relative h-60 w-full rounded-xl overflow-hidden border border-gray-200 shadow-xs">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
