import { Location } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 */
export const calculateDistance = (loc1: Location, loc2: Location): number => {
    if (!loc1 || typeof loc1.lat === 'undefined' || !loc2 || typeof loc2.lat === 'undefined') return 0;
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Number(distance.toFixed(2));
};

/**
 * Estimates travel time by car (assuming 35 km/h average in cities).
 */
export const estimateTravelTimeMins = (distanceKm: number): number => {
    const speedKmh = 35;
    return Math.max(5, Math.round((distanceKm / speedKmh) * 60)); // minimum 5 mins
};
