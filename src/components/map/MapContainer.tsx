'use client';

import React, { useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  GeoJSONSource,
  Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Listing } from '@/types';
import { MAP_CONFIG } from '@/config/map';

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
  const markersRef = useRef<Map<string, Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-tiles': {
            type: 'raster',
            tiles: [MAP_CONFIG.tileUrl],
            tileSize: 256,
            attribution: MAP_CONFIG.attribution,
          },
        },
        layers: [
          {
            id: 'carto-tiles-layer',
            type: 'raster',
            source: 'carto-tiles',
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
      attributionControl: false,
    });

    // Add navigation controls (zoom in/out, compass) at bottom right
    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // Add empty listings GeoJSON source with clustering
      map.addSource('listings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // 1. Cluster Outer Halo Ring
      map.addLayer({
        id: 'cluster-halo',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            'rgba(134, 239, 172, 0.4)', // soft green halo
            10,
            'rgba(253, 224, 71, 0.4)',  // warm amber halo
            50,
            'rgba(251, 146, 60, 0.4)',  // coral halo
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            26,
            10,
            32,
            50,
            40,
          ],
          'circle-opacity': 0.7,
        },
      });

      // 2. Cluster Solid Circle Layer (Matching Bangalore Startup Map pastel circles)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#86efac', // < 10: pastel green
            10,
            '#fde047', // 10 - 49: pastel yellow/amber
            50,
            '#fb923c', // 50+: coral/orange
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            24,
            50,
            30,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });

      // 3. Cluster Count Number
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': [
            'step',
            ['get', 'point_count'],
            '#166534', // dark green for small
            10,
            '#854d0e', // dark amber for medium
            50,
            '#ffffff', // white for coral/orange
          ],
        },
      });

      // 4. Cluster Click: Zoom in with smooth easeTo
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('listings') as GeoJSONSource;

        if (source && typeof clusterId === 'number') {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const coordinates = (features[0].geometry as GeoJSON.Point)
            .coordinates as [number, number];
          map.easeTo({
            center: coordinates,
            zoom: zoom + 0.6,
            duration: 500,
          });
        }
      });

      // Cursors
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source & HTML unclustered markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSourceAndMarkers = () => {
      const source = map.getSource('listings') as GeoJSONSource;
      if (!source) return;

      const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: listings.map((item) => ({
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
            is_featured: item.is_featured,
            jobs_count: item.jobs_count || 0,
          },
        })),
      };

      source.setData(geojsonData);
      renderUnclusteredMarkers();
    };

    const renderUnclusteredMarkers = () => {
      // Clear previous HTML markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Create rich circular logo/favicon badge markers matching Bangalore Startup Map
      listings.forEach((listing) => {
        let domain = '';
        try {
          if (listing.website) {
            domain = new URL(
              listing.website.startsWith('http')
                ? listing.website
                : `https://${listing.website}`
            ).hostname;
          }
        } catch {
          domain = '';
        }

        const faviconUrl = domain
          ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
          : null;

        // Custom marker DOM element
        const el = document.createElement('div');
        el.className = 'custom-map-marker group cursor-pointer transition-transform duration-200 hover:scale-115 hover:z-30';
        el.style.width = '36px';
        el.style.height = '36px';

        const inner = document.createElement('div');
        inner.className =
          'w-full h-full rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-zinc-200';

        if (faviconUrl) {
          const img = document.createElement('img');
          img.src = faviconUrl;
          img.alt = listing.name;
          img.className = 'w-5 h-5 object-contain';
          img.onerror = () => {
            img.style.display = 'none';
            fallbackInitial.style.display = 'flex';
          };
          inner.appendChild(img);
        }

        const fallbackInitial = document.createElement('div');
        fallbackInitial.className =
          'w-full h-full bg-[#0E4D64] text-white font-bold text-xs flex items-center justify-center uppercase';
        fallbackInitial.textContent = listing.name.charAt(0);
        if (faviconUrl) {
          fallbackInitial.style.display = 'none';
        }
        inner.appendChild(fallbackInitial);

        el.appendChild(inner);

        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectListing(listing);
          showListingPopup(map, [listing.lng, listing.lat], listing);
        });

        const marker = new Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .addTo(map);

        markersRef.current.set(listing.id, marker);
      });
    };

    if (map.isStyleLoaded()) {
      updateSourceAndMarkers();
    } else {
      map.once('load', updateSourceAndMarkers);
    }
  }, [listings, onSelectListing]);

  // Handle selectedListing flyTo & popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedListing) return;

    const coordinates: [number, number] = [
      selectedListing.lng,
      selectedListing.lat,
    ];

    map.flyTo({
      center: coordinates,
      zoom: 14.5,
      speed: 1.4,
      curve: 1.2,
      essential: true,
    });

    showListingPopup(map, coordinates, selectedListing);
  }, [selectedListing]);

  // Speech bubble popup matching Bangalore Startup Map exact layout
  const showListingPopup = (
    map: MapLibreMap,
    coordinates: [number, number],
    listing: Listing
  ) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupContent = document.createElement('div');
    popupContent.className = 'p-4 max-w-[280px] font-sans text-left';

    popupContent.innerHTML = `
      <div style="margin-bottom: 4px;">
        <h4 style="font-size: 15px; font-weight: 700; color: #18181b; margin: 0; line-height: 1.25;">
          ${listing.name}
        </h4>
      </div>
      <p style="font-size: 12px; color: #52525b; margin: 6px 0 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        ${listing.description}
      </p>
      <div style="font-size: 11px; color: #71717a; margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
        <span>${listing.stage}</span>
        <span>·</span>
        <span>${listing.sector}</span>
        <span>·</span>
        <span style="color: #3f3f46;">${listing.area}</span>
        ${
          listing.jobs_count && listing.jobs_count > 0
            ? `<span>·</span><span style="color: #e04f36; font-weight: 600;">💼 ${listing.jobs_count} jobs</span>`
            : ''
        }
      </div>
      <button
        id="popup-view-more-btn"
        style="background: transparent; border: none; padding: 0; font-size: 13px; font-weight: 600; color: #e04f36; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;"
      >
        View more &rarr;
      </button>
    `;

    // Hook View More click to open CompanyDrawer
    const viewMoreBtn = popupContent.querySelector('#popup-view-more-btn');
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', () => {
        if (popupRef.current) {
          popupRef.current.remove();
        }
        onSelectListing(listing);
      });
    }

    popupRef.current = new Popup({
      offset: 18,
      closeButton: true,
      closeOnClick: false,
      className: 'bangalore-style-popup',
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContent)
      .addTo(map);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
