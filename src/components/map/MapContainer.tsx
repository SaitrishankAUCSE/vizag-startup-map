'use client';

import React, { useEffect, useRef } from 'react';
import { Map as MapLibreMap, NavigationControl, Popup, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Listing } from '@/types';
import { MAP_CONFIG } from '@/config/map';
import { TYPE_COLORS } from '@/config/constants';

interface MapContainerProps {
  listings: Listing[];
  selectedListing: Listing | null;
  onSelectListing: (listing: Listing) => void;
  className?: string;
}

export function MapContainer({
  listings,
  selectedListing,
  onSelectListing,
  className = '',
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      maxBounds: MAP_CONFIG.bounds,
    });

    // Add navigation controls (zoom in/out, compass)
    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // Add empty listings GeoJSON source
      map.addSource('listings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      });

      // 1. Cluster Circles Layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#0E4D64',
            5,
            '#0A3747',
            10,
            '#E04F36',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // 2. Cluster Count Text Layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // 3. Featured Pins Glow Layer (Under unclustered points)
      map.addLayer({
        id: 'unclustered-featured-glow',
        type: 'circle',
        source: 'listings',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], true]],
        paint: {
          'circle-color': '#E04F36',
          'circle-radius': 14,
          'circle-opacity': 0.35,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#E04F36',
        },
      });

      // 4. Individual Unclustered Point Circle Layer
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'case',
            ['==', ['get', 'is_featured'], true],
            9,
            7.5,
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Cluster Click: Zoom in
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('listings') as GeoJSONSource;

        if (source && typeof clusterId === 'number') {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({
            center: coordinates,
            zoom: zoom + 0.5,
            duration: 500,
          });
        }
      });

      // Point Click: Open Popup & Select Listing
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return;
        const feature = e.features[0];
        const props = feature.properties as Record<string, unknown>;
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

        const listingId = props.id as string;
        const listing = listings.find((l) => l.id === listingId);

        if (listing) {
          onSelectListing(listing);
          showListingPopup(map, coordinates, listing);
        }
      });

      // Mouse cursors
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source whenever listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSource = () => {
      const source = map.getSource('listings') as GeoJSONSource;
      if (!source) return;

      const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: listings.map((item) => {
          const color = TYPE_COLORS[item.type]?.hex || '#0E4D64';
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [item.lng, item.lat],
            },
            properties: {
              id: item.id,
              name: item.name,
              slug: item.slug,
              type: item.type,
              stage: item.stage,
              sector: item.sector,
              area: item.area,
              color: color,
              is_featured: item.is_featured,
              jobs_count: item.jobs_count || 0,
            },
          };
        }),
      };

      source.setData(geojsonData);
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once('load', updateSource);
    }
  }, [listings]);

  // Handle selectedListing change (e.g., when clicked from left list)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedListing) return;

    const coordinates: [number, number] = [selectedListing.lng, selectedListing.lat];

    map.flyTo({
      center: coordinates,
      zoom: 14.5,
      speed: 1.4,
      curve: 1.2,
      essential: true,
    });

    showListingPopup(map, coordinates, selectedListing);
  }, [selectedListing]);

  // Helper to render popup with rich HTML and action link
  const showListingPopup = (
    map: MapLibreMap,
    coordinates: [number, number],
    listing: Listing
  ) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const typeStyle = TYPE_COLORS[listing.type] || TYPE_COLORS.startup;

    const popupHtml = `
      <div style="padding: 14px; max-width: 280px; font-family: inherit;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${
            typeStyle.hex
          }; background: ${typeStyle.hex}15; padding: 2px 6px; border-radius: 4px;">
            ${listing.type}
          </span>
          ${
            listing.is_featured
              ? `<span style="font-size: 10px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 1px solid #fcd34d;">Featured</span>`
              : ''
          }
        </div>
        <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
          ${listing.name}
        </h4>
        <p style="font-size: 11px; color: #475569; margin: 0 0 10px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${listing.description}
        </p>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: #64748b; margin-bottom: 10px;">
          <span>${listing.area}</span>
          <span>•</span>
          <span>${listing.stage}</span>
          ${
            (listing.jobs_count || 0) > 0
              ? `<span>•</span><span style="color: #e04f36; font-weight: 700;">Hiring (${listing.jobs_count})</span>`
              : ''
          }
        </div>
        <a href="/startup/${listing.slug}" style="display: block; text-align: center; background: #0E4D64; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
          View details &rarr;
        </a>
      </div>
    `;

    popupRef.current = new Popup({
      offset: 14,
      closeButton: true,
      closeOnClick: false,
    })
      .setLngLat(coordinates)
      .setHTML(popupHtml)
      .addTo(map);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
