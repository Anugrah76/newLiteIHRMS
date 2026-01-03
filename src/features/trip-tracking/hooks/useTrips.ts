import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockTripApi, mockAnalyticsApi, mockLocationApi } from '../services/mockApi';
import { Trip, LocationPoint, EmployeeAnalytics, HRAnalytics } from '../types';

/**
 * React Query Hooks for Trip Tracking
 * Uses mock API service (can be easily swapped for real API later)
 */

// Query Keys
export const tripKeys = {
    all: ['trips'] as const,
    lists: () => [...tripKeys.all, 'list'] as const,
    list: (filters: any) => [...tripKeys.lists(), filters] as const,
    details: () => [...tripKeys.all, 'detail'] as const,
    detail: (id: string) => [...tripKeys.details(), id] as const,
    analytics: () => [...tripKeys.all, 'analytics'] as const,
};

/**
 * Fetch trip history
 */
export function useTrips(params?: {
    status?: 'active' | 'paused' | 'completed';
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: tripKeys.list(params),
        queryFn: async () => {
            const response = await mockTripApi.getTripHistory(params);
            return response.result || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch trip detail (with full route)
 */
export function useTripDetail(tripId: string | null) {
    return useQuery({
        queryKey: tripKeys.detail(tripId || ''),
        queryFn: async () => {
            if (!tripId) return null;
            const response = await mockTripApi.getTripDetail(tripId);
            return response.data || null;
        },
        enabled: !!tripId,
        staleTime: 10 * 60 * 1000, // 10 minutes (trips don't change often)
    });
}

/**
 * Start trip mutation
 */
export function useStartTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { purpose: string; lat: number; lng: number }) => {
            const response = await mockTripApi.startTrip(params.purpose, params.lat, params.lng);
            return response.data!.trip_id;
        },
        onSuccess: () => {
            // Invalidate trip list to refetch
            queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        },
    });
}

/**
 * Upload location points mutation
 */
export function useUploadLocations() {
    return useMutation({
        mutationFn: async (params: { tripId: string; locations: LocationPoint[] }) => {
            const response = await mockTripApi.uploadLocations(params.tripId, params.locations);
            return response.data;
        },
    });
}

/**
 * Pause trip mutation
 */
export function usePauseTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tripId: string) => {
            const response = await mockTripApi.pauseTrip(tripId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        },
    });
}

/**
 * Resume trip mutation
 */
export function useResumeTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tripId: string) => {
            const response = await mockTripApi.resumeTrip(tripId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        },
    });
}

/**
 * End trip mutation
 */
export function useEndTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { tripId: string; lat: number; lng: number }) => {
            const response = await mockTripApi.endTrip(params.tripId, params.lat, params.lng);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        },
    });
}

/**
 * Analytics Hooks
 */

export function useEmployeeAnalytics(employeeId: string, period: 'week' | 'month' | 'year' = 'month') {
    return useQuery({
        queryKey: [...tripKeys.analytics(), 'employee', employeeId, period],
        queryFn: async () => {
            const response = await mockAnalyticsApi.getEmployeeAnalytics(employeeId, period);
            return response.data!;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
}

export function useHRAnalytics() {
    return useQuery({
        queryKey: [...tripKeys.analytics(), 'hr', 'overview'],
        queryFn: async () => {
            const response = await mockAnalyticsApi.getHROverview();
            return response.data!;
        },
        staleTime: 15 * 60 * 1000,
    });
}

export function useHeatmapData(params?: {
    from_date?: string;
    to_date?: string;
    department?: string;
}) {
    return useQuery({
        queryKey: [...tripKeys.analytics(), 'heatmap', params],
        queryFn: async () => {
            const response = await mockAnalyticsApi.getHeatmapData(params);
            return response.data!;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes (expensive query)
    });
}

export function usePunctualityData(params

    ?: {
        from_date?: string;
        to_date?: string;
        location_id?: string;
    }) {
    return useQuery({
        queryKey: [...tripKeys.analytics(), 'punctuality', params],
        queryFn: async () => {
            const response = await mockAnalyticsApi.getPunctualityData(params);
            return response.result || [];
        },
        staleTime: 15 * 60 * 1000,
    });
}

export function useDistanceTrends(params?: {
    from_date?: string;
    to_date?: string;
    group_by?: 'day' | 'week' | 'month';
}) {
    return useQuery({
        queryKey: [...tripKeys.analytics(), 'distance', params],
        queryFn: async () => {
            const response = await mockAnalyticsApi.getDistanceTrends(params);
            return response.data!;
        },
        staleTime: 15 * 60 * 1000,
    });
}

export function useOfficeLocations() {
    return useQuery({
        queryKey: ['office-locations'],
        queryFn: async () => {
            const response = await mockLocationApi.getOfficeLocations();
            return response.result || [];
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (rarely changes)
    });
}
