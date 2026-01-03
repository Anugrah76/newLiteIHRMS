import { Trip, LocationPoint, EmployeeAnalytics, HRAnalytics, HeatmapPoint, PunctualityData, DistanceTrend, TopTraveler, OfficeLocation } from '../types';

/**
 * Mock Trip Data Generator
 * Generates realistic trip data for testing without backend
 */

// Delhi NCR coordinates for realistic routes
const OFFICE_LOCATION = { lat: 28.4595, lng: 77.0266, address: 'Main Office, Sec 16, Gurugram' };
const CLIENT_SITES = [
    { lat: 28.5355, lng: 77.3910, address: 'Client Site A, Sec 18, Noida' },
    { lat: 28.6139, lng: 77.2090, address: 'Client Site B, Connaught Place, Delhi' },
    { lat: 28.4089, lng: 77.3178, address: 'Client Site C, Sec 62, Noida' },
];

/**
 * Generate realistic GPS route between two points
 */
function generateRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }, points: number = 50): LocationPoint[] {
    const route: LocationPoint[] = [];
    const startTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);

        // Linear interpolation with slight random variation for realism
        const lat = start.lat + (end.lat - start.lat) * progress + (Math.random() - 0.5) * 0.001;
        const lng = start.lng + (end.lng - start.lng) * progress + (Math.random() - 0.5) * 0.001;

        route.push({
            latitude: lat,
            longitude: lng,
            timestamp: new Date(startTime.getTime() + (i * 120 * 1000)).toISOString(), // 2 min intervals
            accuracy: 10 + Math.random() * 10,
            speed: i === 0 || i === points - 1 ? 0 : 5 + Math.random() * 10, // 5-15 m/s
            altitude: 235 + Math.random() * 20,
        });
    }

    return route;
}

/**
 * Calculate distance using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Mock Trips (Last 30 days)
 */
export const MOCK_TRIPS: Trip[] = [
    // Active trip (current)
    {
        id: 'trip-active-001',
        employee_id: 'emp-123',
        employee_name: 'Current User',
        trip_purpose: 'Client meeting - Project Alpha',
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
        end_time: null,
        status: 'active',
        total_distance: 8450,
        total_duration: 1800, // 30 minutes
        average_speed: 4.7,
        max_speed: 15.2,
        total_points: 15,
        start_location: {
            latitude: OFFICE_LOCATION.lat,
            longitude: OFFICE_LOCATION.lng,
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            accuracy: 10,
            speed: 0,
            altitude: 235,
            address: OFFICE_LOCATION.address,
        },
        end_location: null,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    },

    // Completed trips
    ...Array.from({ length: 12 }, (_, i) => {
        const daysAgo = i + 1;
        const client = CLIENT_SITES[i % CLIENT_SITES.length];
        const start = OFFICE_LOCATION;
        const end = client;
        const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
        const duration = 3600 + Math.random() * 3600; // 1-2 hours

        return {
            id: `trip-${String(i + 1).padStart(3, '0')}`,
            employee_id: 'emp-123',
            employee_name: 'Current User',
            trip_purpose: `Client visit - Site ${String.fromCharCode(65 + (i % 3))}`,
            start_time: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000 + duration * 1000).toISOString(),
            status: 'completed' as const,
            total_distance: Math.round(distance + Math.random() * 2000),
            total_duration: Math.round(duration),
            average_speed: distance / duration,
            max_speed: 15 + Math.random() * 10,
            total_points: 50 + Math.round(Math.random() * 100),
            start_location: {
                latitude: start.lat,
                longitude: start.lng,
                timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000).toISOString(),
                accuracy: 10,
                speed: 0,
                altitude: 235,
                address: start.address,
            },
            end_location: {
                latitude: end.lat,
                longitude: end.lng,
                timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000 + duration * 1000).toISOString(),
                accuracy: 12,
                speed: 0,
                altitude: 240,
                address: end.address,
            },
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000 + duration * 1000).toISOString(),
        };
    }),
];

/**
 * Get trip with full route (for detail view)
 */
export function getMockTripDetail(tripId: string): Trip | null {
    const trip = MOCK_TRIPS.find(t => t.id === tripId);
    if (!trip) return null;

    // Generate full route if completed
    if (trip.status === 'completed' && trip.end_location) {
        return {
            ...trip,
            locations: generateRoute(
                { lat: trip.start_location.latitude, lng: trip.start_location.longitude },
                { lat: trip.end_location.latitude, lng: trip.end_location.longitude },
                trip.total_points
            ),
        };
    }

    return trip;
}

/**
 * Mock Employee Analytics
 */
export const MOCK_EMPLOYEE_ANALYTICS: EmployeeAnalytics = {
    employee_id: 'emp-123',
    period: 'month',
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    total_hours: 176.5,
    trip_count: 12,
    total_distance: 245800, // meters
    punctuality_score: 87.5,
    work_locations: [
        {
            name: 'Main Office',
            latitude: OFFICE_LOCATION.lat,
            longitude: OFFICE_LOCATION.lng,
            visit_count: 20,
            total_hours: 144.0,
        },
        {
            name: 'Client Site A',
            latitude: CLIENT_SITES[0].lat,
            longitude: CLIENT_SITES[0].lng,
            visit_count: 5,
            total_hours: 20.0,
        },
        {
            name: 'Client Site B',
            latitude: CLIENT_SITES[1].lat,
            longitude: CLIENT_SITES[1].lng,
            visit_count: 3,
            total_hours: 12.5,
        },
    ],
    daily_hours: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: i % 7 < 5 ? 8 + Math.random() * 2 : 0, // Weekdays only
        status: i % 7 < 5 ? 'present' as const : 'absent' as const,
    })),
    time_distribution: {
        office: 144.0,
        field: 20.0,
        remote: 12.5,
    },
};

/**
 * Mock HR Analytics
 */
export const MOCK_HR_ANALYTICS: HRAnalytics = {
    as_of_date: new Date().toISOString().split('T')[0],
    total_employees: 500,
    active_today: 423,
    on_trips: 45,
    remote: 78,
    absent: 77,
    late: 32,
    department_summary: [
        { department: 'Engineering', total: 120, present: 105, absent: 15 },
        { department: 'Sales', total: 80, present: 72, absent: 8 },
        { department: 'Marketing', total: 50, present: 45, absent: 5 },
        { department: 'Operations', total: 100, present: 88, absent: 12 },
        { department: 'Support', total: 150, present: 113, absent: 37 },
    ],
};

/**
 * Mock Heatmap Data
 */
export const MOCK_HEATMAP_DATA: HeatmapPoint[] = [
    { latitude: 28.4595, longitude: 77.0266, weight: 245 }, // Main office
    { latitude: 28.5355, longitude: 77.3910, weight: 87 },
    { latitude: 28.6139, longitude: 77.2090, weight: 124 },
    { latitude: 28.4089, longitude: 77.3178, weight: 56 },
    // Random points for visualization
    ...Array.from({ length: 50 }, () => ({
        latitude: 28.4 + Math.random() * 0.3,
        longitude: 77.0 + Math.random() * 0.4,
        weight: Math.round(Math.random() * 50),
    })),
];

/**
 * Mock Punctuality Data
 */
export const MOCK_PUNCTUALITY_DATA: PunctualityData[] = [
    {
        location_id: 'loc-1',
        location_name: 'Main Office - Gurugram',
        on_time_percentage: 85.5,
        avg_delay_minutes: 12.3,
        late_count: 87,
        total_count: 600,
        trend: Array.from({ length: 8 }, (_, i) => ({
            date: new Date(Date.now() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            on_time_percentage: 80 + Math.random() * 10,
        })),
    },
    {
        location_id: 'loc-2',
        location_name: 'Noida Office',
        on_time_percentage: 78.2,
        avg_delay_minutes: 18.5,
        late_count: 65,
        total_count: 298,
    },
    {
        location_id: 'loc-3',
        location_name: 'Delhi Office',
        on_time_percentage: 92.1,
        avg_delay_minutes: 6.8,
        late_count: 23,
        total_count: 291,
    },
];

/**
 * Mock Distance Trends
 */
export const MOCK_DISTANCE_TRENDS: DistanceTrend[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_distance: i % 7 < 5 ? 50000 + Math.random() * 50000 : 0, // Weekdays only
    trip_count: i % 7 < 5 ? Math.round(20 + Math.random() * 30) : 0,
    employee_count: i % 7 < 5 ? Math.round(15 + Math.random() * 20) : 0,
    avg_distance_per_trip: i % 7 < 5 ? 2000 + Math.random() * 2000 : 0,
}));

/**
 * Mock Top Travelers
 */
export const MOCK_TOP_TRAVELERS: TopTraveler[] = [
    { employee_id: 'emp-456', employee_name: 'Jane Smith', total_distance: 45600, trip_count: 8, avg_per_trip: 5700 },
    { employee_id: 'emp-789', employee_name: 'Bob Johnson', total_distance: 38200, trip_count: 12, avg_per_trip: 3183 },
    { employee_id: 'emp-321', employee_name: 'Alice Williams', total_distance: 32100, trip_count: 6, avg_per_trip: 5350 },
    { employee_id: 'emp-654', employee_name: 'Charlie Brown', total_distance: 29800, trip_count: 10, avg_per_trip: 2980 },
    { employee_id: 'emp-987', employee_name: 'Diana Prince', total_distance: 27500, trip_count: 7, avg_per_trip: 3929 },
];

/**
 * Mock Office Locations
 */
export const MOCK_OFFICE_LOCATIONS: OfficeLocation[] = [
    {
        location_id: 'loc-1',
        name: 'Main Office - Gurugram',
        address: '123 MG Road, Sector 16, Gurugram, 122001',
        city: 'Gurugram',
        latitude: 28.4595,
        longitude: 77.0266,
        geofence_radius: 100,
        capacity: 200,
        timezone: 'Asia/Kolkata',
        is_active: true,
    },
    {
        location_id: 'loc-2',
        name: 'Noida Office',
        address: '456 Sector 62, Noida, 201301',
        city: 'Noida',
        latitude: 28.6139,
        longitude: 77.3910,
        geofence_radius: 100,
        capacity: 150,
        timezone: 'Asia/Kolkata',
        is_active: true,
    },
    {
        location_id: 'loc-3',
        name: 'Delhi Office',
        address: '789 Connaught Place, New Delhi, 110001',
        city: 'Delhi',
        latitude: 28.6304,
        longitude: 77.2177,
        geofence_radius: 50,
        capacity: 100,
        timezone: 'Asia/Kolkata',
        is_active: true,
    },
];
