// Geographic calculations and distance utilities

import { VIZAG_COASTLINE_POINTS } from '@/config/constants';

/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the shortest distance from a given point to the Visakhapatnam coastline in kilometers
 */
export function getDistanceToVizagCoastlineKm(lat: number, lng: number): number {
  let minDistance = Infinity;

  for (const [coastLat, coastLng] of VIZAG_COASTLINE_POINTS) {
    const dist = haversineDistanceKm(lat, lng, coastLat, coastLng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return Math.round(minDistance * 10) / 10; // Rounded to 1 decimal place
}
