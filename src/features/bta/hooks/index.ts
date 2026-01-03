import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as btaApi from '../api/btaApi';
import type {
    CreateEventPayload,
    UpdateEventPayload,
    SubmitEventPayload,
    CreateTravelPayload,
    UpdateTravelPayload,
    CreateHotelPayload,
    UpdateHotelPayload,
    MyEventsPayload
} from '../api/btaApi';

export const useMyEvents = (payload: MyEventsPayload, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['myEvents', payload],
        queryFn: () => btaApi.getMyEvents(payload),
        enabled
    });
};

export const useTeamBtaList = (payload: MyEventsPayload, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['teamBtaList', payload], // Distinct query key
        queryFn: () => btaApi.getMyEvents(payload), // Reusing getMyEvents as endpoint logic likely handles 'type' or similar, or checking api file for specific endpoint
        enabled
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: btaApi.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myEvents'] });
        }
    });
};

/**
 * Hook to update an event
 */
export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateEventPayload) => btaApi.updateEvent(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myEvents'] });
        },
    });
};

export const useSubmitEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: btaApi.submitEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myEvents'] });
        }
    });
};

/**
 * Hook to cancel an event
 */
export const useCancelEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { event_id: string; cancel_by: string; cancel_remarks: string; status: string; key: string; indo_code: string; }) =>
            btaApi.cancelEvent(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myEvents'] });
        },
    });
};

/**
 * Hook to get travel modes
 */
export const useTravelModes = () => {
    return useQuery({
        queryKey: ['travelModes'],
        queryFn: btaApi.getTravelModes,
        staleTime: 1000 * 60 * 60, // 1 hour - masters data doesn't change often
    });
};

/**
 * Hook to get travel types
 */
export const useTravelTypes = () => {
    return useQuery({
        queryKey: ['travelTypes'],
        queryFn: btaApi.getTravelTypes,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// Travel Hook
export const useEventTravel = () => {
    return useMutation({
        mutationFn: ({ eventId, indoCode, apiKey }: { eventId: string, indoCode: string, apiKey: string }) =>
            btaApi.getEventTravel(eventId, indoCode, apiKey)
    });
};

export const useSaveTravel = (isEdit: boolean) => {
    return useMutation({
        mutationFn: isEdit ? btaApi.updateEventTravel : btaApi.createEventTravel
    });
};

// Hotel Hook
export const useEventHotel = () => {
    return useMutation({
        mutationFn: ({ eventId, indoCode, apiKey }: { eventId: string, indoCode: string, apiKey: string }) =>
            btaApi.getEventHotel(eventId, indoCode, apiKey)
    });
};

export const useSaveHotel = (isEdit: boolean) => {
    return useMutation({
        mutationFn: isEdit ? btaApi.updateEventHotel : btaApi.createEventHotel
    });
};
