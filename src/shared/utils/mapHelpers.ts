/**
 * Map Helper Utilities
 * Distance calculations, coordinate formatting, route simplification
 */

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format duration for display (seconds to human-readable)
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}

/**
 * Format speed (m/s to km/h)
 */
export function formatSpeed(metersPerSecond: number): string {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Check if location is within geofence radius
 */
export function isWithinGeofence(
    lat: number,
    lng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number
): boolean {
    const distance = calculateDistance(lat, lng, centerLat, centerLng);
    return distance <= radiusMeters;
}

/**
 * Get center point of multiple coordinates
 */
export function getCenterPoint(coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (coordinates.length === 0) {
        return { lat: 0, lng: 0 };
    }

    const sum = coordinates.reduce(
        (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng,
        }),
        { lat: 0, lng: 0 }
    );

    return {
        lat: sum.lat / coordinates.length,
        lng: sum.lng / coordinates.length,
    };
}

/**
 * Calculate bounding box for coordinates
 */
export function getBoundingBox(coordinates: { lat: number; lng: number }[]): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
} {
    if (coordinates.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    return coordinates.reduce(
        (bounds, coord) => ({
            minLat: Math.min(bounds.minLat, coord.lat),
            maxLat: Math.max(bounds.maxLat, coord.lat),
            minLng: Math.min(bounds.minLng, coord.lng),
            maxLng: Math.max(bounds.maxLng, coord.lng),
        }),
        {
            minLat: coordinates[0].lat,
            maxLat: coordinates[0].lat,
            minLng: coordinates[0].lng,
            maxLng: coordinates[0].lng,
        }
    );
}
