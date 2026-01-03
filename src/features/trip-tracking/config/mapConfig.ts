/**
 * OpenStreetMap Configuration
 * 100% Free, No Account Required, No Limits!
 */

export const OSM_CONFIG = {
    // Tile Server URLs (choose one or rotate for better reliability)
    TILE_SERVERS: {
        // Standard OSM tiles (recommended)
        STANDARD: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

        // Alternative tile servers (for redundancy)
        HUMANITARIAN: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        CYCLE: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png',

        // Offline tile caching
        USE_CACHED_TILES: true,
    },

    // Map Settings
    MAP_SETTINGS: {
        // Initial region (Delhi NCR)
        INITIAL_REGION: {
            latitude: 28.6139,
            longitude: 77.2090,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
        },

        // Default zoom levels
        MIN_ZOOM: 3,
        MAX_ZOOM: 19,
        DEFAULT_ZOOM: 14,

        // Map style
        SHOW_TRAFFIC: false,
        SHOW_BUILDINGS: true,
        SHOW_POINTS_OF_INTEREST: true,
        SHOW_COMPASS: true,
        SHOW_SCALE: true,
        SHOW_ZOOM_CONTROLS: true,

        // User location
        SHOW_USER_LOCATION: true,
        FOLLOW_USER_LOCATION: true,
        SHOW_USER_HEADING: true,

        // Performance
        CACHE_ENABLED: true,
        LOAD_TILES_WHILE_ANIMATING: true,
        SHOW_TILE_LOADING_INDICATOR: false,
    },

    // Offline Support
    OFFLINE: {
        ENABLE_OFFLINE_MAPS: true,
        MAX_CACHE_SIZE_MB: 100,
        TILE_CACHE_DURATION_DAYS: 30,
    },

    // Custom Markers & Styles
    MARKERS: {
        START_MARKER_COLOR: '#10b981', // Green
        END_MARKER_COLOR: '#ef4444',   // Red
        CURRENT_LOCATION_COLOR: '#3b82f6', // Blue
        ROUTE_LINE_COLOR: '#2563eb',
        ROUTE_LINE_WIDTH: 3,
    },

    // Attribution (Required by OSM)
    ATTRIBUTION: '© OpenStreetMap contributors',
    ATTRIBUTION_URL: 'https://www.openstreetmap.org/copyright',
};

/**
 * Get tile URL with subdomain rotation
 */
export function getOSMTileUrl(variant: 'standard' | 'humanitarian' | 'cycle' = 'standard'): string {
    const urls = {
        standard: OSM_CONFIG.TILE_SERVERS.STANDARD,
        humanitarian: OSM_CONFIG.TILE_SERVERS.HUMANITARIAN,
        cycle: OSM_CONFIG.TILE_SERVERS.CYCLE,
    };

    return urls[variant];
}

/**
 * URL Template for react-native-maps
 */
export const osmUrlTemplate = OSM_CONFIG.TILE_SERVERS.STANDARD;

/**
 * Tile overlay props for react-native-maps
 */
export const osmTileOverlayProps = {
    urlTemplate: osmUrlTemplate,
    maximumZ: OSM_CONFIG.MAP_SETTINGS.MAX_ZOOM,
    minimumZ: OSM_CONFIG.MAP_SETTINGS.MIN_ZOOM,
    tileSize: 256,
};
