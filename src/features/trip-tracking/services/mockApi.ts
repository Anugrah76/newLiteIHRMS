import {
    Trip,
    LocationPoint,
    EmployeeAnalytics,
    HRAnalytics,
    HeatmapPoint,
    PunctualityData,
    DistanceTrend,
    TopTraveler,
    OfficeLocation,
} from '../types';
import {
    MOCK_TRIPS,
    getMockTripDetail,
    MOCK_EMPLOYEE_ANALYTICS,
    MOCK_HR_ANALYTICS,
    MOCK_HEATMAP_DATA,
    MOCK_PUNCTUALITY_DATA,
    MOCK_DISTANCE_TRENDS,
    MOCK_TOP_TRAVELERS,
    MOCK_OFFICE_LOCATIONS,
} from './mockData';

/**
 * Mock API Service
 * Simulates backend API responses with realistic delays
 * Switch USE_MOCK_DATA to false when real backend is ready
 */

// Feature flag: Set to false to use real backend APIs
export const USE_MOCK_DATA = true;

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Standard API Response Format (matches backend)
 */
interface ApiResponse<T> {
    status: number;
    response: number;
    message: string;
    data?: T;
    result?: T[];
}

/**
 * Trip Tracking Mock APIs
 */
export const mockTripApi = {
    /**
     * Start a new trip
     */
    async startTrip(purpose: string, start_lat: number, start_lng: number): Promise<ApiResponse<{ trip_id: string }>> {
        await delay();

        const new_trip_id = `trip-${Date.now()}`;

        // Add to mock data (simulating database insert)
        const newTrip: Trip = {
            id: new_trip_id,
            employee_id: 'emp-123',
            employee_name: 'Current User',
            trip_purpose: purpose,
            start_time: new Date().toISOString(),
            end_time: null,
            status: 'active',
            total_distance: 0,
            total_duration: 0,
            average_speed: 0,
            max_speed: 0,
            total_points: 0,
            start_location: {
                latitude: start_lat,
                longitude: start_lng,
                timestamp: new Date().toISOString(),
                accuracy: 10,
                speed: 0,
                altitude: 235,
            },
            end_location: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        MOCK_TRIPS.unshift(newTrip);

        return {
            status: 2,
            response: 200,
            message: 'Trip started successfully',
            data: { trip_id: new_trip_id },
        };
    },

    /**
     * Upload location points (batch)
     */
    async uploadLocations(tripId: string, locations: LocationPoint[]): Promise<ApiResponse<{ points_saved: number }>> {
        await delay(300);

        const trip = MOCK_TRIPS.find(t => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        // Simulate updating trip stats
        trip.total_points += locations.length;
        trip.updated_at = new Date().toISOString();

        return {
            status: 2,
            response: 200,
            message: 'Location points saved',
            data: {
                points_saved: locations.length,
            },
        };
    },

    /**
     * Pause trip
     */
    async pauseTrip(tripId: string): Promise<ApiResponse<{ trip_id: string; status: string }>> {
        await delay();

        const trip = MOCK_TRIPS.find(t => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        trip.status = 'paused';
        trip.updated_at = new Date().toISOString();

        return {
            status: 2,
            response: 200,
            message: 'Trip paused',
            data: { trip_id: tripId, status: 'paused' },
        };
    },

    /**
     * Resume trip
     */
    async resumeTrip(tripId: string): Promise<ApiResponse<{ trip_id: string; status: string }>> {
        await delay();

        const trip = MOCK_TRIPS.find(t => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        trip.status = 'active';
        trip.updated_at = new Date().toISOString();

        return {
            status: 2,
            response: 200,
            message: 'Trip resumed',
            data: { trip_id: tripId, status: 'active' },
        };
    },

    /**
     * End trip
     */
    async endTrip(
        tripId: string,
        end_lat: number,
        end_lng: number
    ): Promise<ApiResponse<{ trip_id: string; total_distance: number; total_duration: number }>> {
        await delay();

        const trip = MOCK_TRIPS.find(t => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        const duration = Math.floor((Date.now() - new Date(trip.start_time).getTime()) / 1000);

        trip.status = 'completed';
        trip.end_time = new Date().toISOString();
        trip.end_location = {
            latitude: end_lat,
            longitude: end_lng,
            timestamp: new Date().toISOString(),
            accuracy: 12,
            speed: 0,
            altitude: 240,
        };
        trip.total_duration = duration;
        trip.updated_at = new Date().toISOString();

        return {
            status: 2,
            response: 200,
            message: 'Trip completed successfully',
            data: {
                trip_id: tripId,
                total_distance: trip.total_distance,
                total_duration: duration,
            },
        };
    },

    /**
     * Get trip history
     */
    async getTripHistory(params?: {
        status?: 'active' | 'paused' | 'completed';
        from_date?: string;
        to_date?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<Trip[]>> {
        await delay();

        let filtered = [...MOCK_TRIPS];

        // Filter by status
        if (params?.status) {
            filtered = filtered.filter(t => t.status === params.status);
        }

        // Filter by date range
        if (params?.from_date) {
            filtered = filtered.filter(t => t.start_time >= params.from_date!);
        }
        if (params?.to_date) {
            filtered = filtered.filter(t => t.start_time <= params.to_date!);
        }

        // Pagination
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);

        return {
            status: 2,
            response: 200,
            message: 'Trips retrieved',
            result: paginated,
        };
    },

    /**
     * Get trip detail (with full route)
     */
    async getTripDetail(tripId: string): Promise<ApiResponse<Trip>> {
        await delay();

        const trip = getMockTripDetail(tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }

        return {
            status: 2,
            response: 200,
            message: 'Trip details retrieved',
            data: trip,
        };
    },
};

/**
 * Analytics Mock APIs
 */
export const mockAnalyticsApi = {
    /**
     * Get employee analytics
     */
    async getEmployeeAnalytics(
        employeeId: string,
        period: 'week' | 'month' | 'year' = 'month'
    ): Promise<ApiResponse<EmployeeAnalytics>> {
        await delay();

        return {
            status: 2,
            response: 200,
            message: 'Analytics retrieved',
            data: { ...MOCK_EMPLOYEE_ANALYTICS, period },
        };
    },

    /**
     * Get HR overview
     */
    async getHROverview(): Promise<ApiResponse<HRAnalytics>> {
        await delay();

        return {
            status: 2,
            response: 200,
            message: 'Overview retrieved',
            data: MOCK_HR_ANALYTICS,
        };
    },

    /**
     * Get heatmap data
     */
    async getHeatmapData(params?: {
        from_date?: string;
        to_date?: string;
        department?: string;
    }): Promise<ApiResponse<{ total_points: number; points: HeatmapPoint[] }>> {
        await delay(800);

        return {
            status: 2,
            response: 200,
            message: 'Heatmap data retrieved',
            data: {
                total_points: MOCK_HEATMAP_DATA.length,
                points: MOCK_HEATMAP_DATA,
            },
        };
    },

    /**
     * Get punctuality analytics
     */
    async getPunctualityData(params?: {
        from_date?: string;
        to_date?: string;
        location_id?: string;
    }): Promise<ApiResponse<PunctualityData[]>> {
        await delay();

        let result = MOCK_PUNCTUALITY_DATA;

        if (params?.location_id) {
            result = result.filter(p => p.location_id === params.location_id);
        }

        return {
            status: 2,
            response: 200,
            message: 'Punctuality data retrieved',
            result,
        };
    },

    /**
     * Get distance trends
     */
    async getDistanceTrends(params?: {
        from_date?: string;
        to_date?: string;
        group_by?: 'day' | 'week' | 'month';
    }): Promise<ApiResponse<{ trends: DistanceTrend[]; top_travelers: TopTraveler[] }>> {
        await delay();

        return {
            status: 2,
            response: 200,
            message: 'Distance trends retrieved',
            data: {
                trends: MOCK_DISTANCE_TRENDS,
                top_travelers: MOCK_TOP_TRAVELERS,
            },
        };
    },
};

/**
 * Office Locations Mock API
 */
export const mockLocationApi = {
    async getOfficeLocations(): Promise<ApiResponse<OfficeLocation[]>> {
        await delay();

        return {
            status: 2,
            response: 200,
            message: 'Locations retrieved',
            result: MOCK_OFFICE_LOCATIONS,
        };
    },
};
