import { create } from 'zustand';
import { Trip, LocationPoint } from '../types';

/**
 * Trip Tracking Store
 * Manages active trip state, location tracking, and offline sync queue
 */

interface TripStore {
    // Active trip state
    activeTrip: Trip | null;
    isTracking: boolean;

    // Current location
    currentLocation: LocationPoint | null;

    // Offline sync queue
    pendingSyncPoints: LocationPoint[];

    // Actions
    startTrip: (trip: Trip) => void;
    updateLocation: (location: LocationPoint) => void;
    addPendingLocation: (location: LocationPoint) => void;
    clearPendingLocations: () => void;
    pauseTrip: () => void;
    resumeTrip: () => void;
    endTrip: () => void;
    updateTripStats: (stats: Partial<Trip>) => void;
}

export const useTripStore = create<TripStore>((set) => ({
    activeTrip: null,
    isTracking: false,
    currentLocation: null,
    pendingSyncPoints: [],

    startTrip: (trip) => set({
        activeTrip: trip,
        isTracking: true,
        currentLocation: trip.start_location,
        pendingSyncPoints: [],
    }),

    updateLocation: (location) => set((state) => {
        if (!state.activeTrip) return state;

        // Update current location
        return {
            currentLocation: location,
            // Optionally update trip stats client-side for real-time display
            activeTrip: state.activeTrip ? {
                ...state.activeTrip,
                total_points: state.activeTrip.total_points + 1,
                updated_at: new Date().toISOString(),
            } : null,
        };
    }),

    addPendingLocation: (location) => set((state) => ({
        pendingSyncPoints: [...state.pendingSyncPoints, location],
    })),

    clearPendingLocations: () => set({ pendingSyncPoints: [] }),

    pauseTrip: () => set((state) => ({
        isTracking: false,
        activeTrip: state.activeTrip ? {
            ...state.activeTrip,
            status: 'paused',
            updated_at: new Date().toISOString(),
        } : null,
    })),

    resumeTrip: () => set((state) => ({
        isTracking: true,
        activeTrip: state.activeTrip ? {
            ...state.activeTrip,
            status: 'active',
            updated_at: new Date().toISOString(),
        } : null,
    })),

    endTrip: () => set({
        activeTrip: null,
        isTracking: false,
        currentLocation: null,
        pendingSyncPoints: [],
    }),

    updateTripStats: (stats) => set((state) => ({
        activeTrip: state.activeTrip ? {
            ...state.activeTrip,
            ...stats,
            updated_at: new Date().toISOString(),
        } : null,
    })),
}));
