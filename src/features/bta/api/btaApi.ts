import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Types
 */
export interface BtaEvent {
    id: string;
    serial_no: string;
    description: string;
    start_date: string;
    end_date: string;
    from_address: string;
    to_address: string;
    budget: string;
    status: string; // "1": Draft, "2": Submitted, "3": Approved, etc.
    travel_mode_id: string;
    travel_type_id: string;
    created_at?: string;
    [key: string]: any;
}

export interface TravelMode {
    id: string;
    name: string;
}

export interface TravelType {
    id: string;
    name: string;
}

export interface MyEventsPayload {
    creator_id: string;
    status: string;
    from_date: string;
    to_date: string;
    indo_code: string;
}

export interface CreateEventPayload {
    description: string;
    start_date: string;
    end_date: string;
    from_address: string;
    to_address: string;
    budget: string;
    travel_mode_id: string;
    travel_type_id: string;
    is_manager_change?: string; // "NO"
    manager_id?: string;
    manager_code?: string;
    uploadedFiles?: any[];
    user_id?: string;
    indo_code?: string;
    key?: string;
    [key: string]: any;
}

export interface UpdateEventPayload extends CreateEventPayload {
    id: string;
}

export interface SubmitEventPayload {
    event_ids: {
        event_id: string;
        serial_number: string;
        indo_code: string;
    }[];
    submit_by: string;
    remark: string;
    status_id: string;
    key?: string;
    indo_code?: string;
}

export interface CreateTravelPayload {
    event_id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    departure_time: string;
    description: string;
    user_id: string;
    is_return: string; // "YES" | "NO"
    return_travel_date?: string;
    return_departure_time?: string;
    indo_code: string;
}

export interface UpdateTravelPayload extends CreateTravelPayload {
    id: string;
}

export interface CreateHotelPayload {
    event_id: string;
    hotel_address: string;
    check_in_time: string;
    check_out_time: string;
    description: string;
    user_id: string;
    indo_code: string;
}

export interface UpdateHotelPayload extends CreateHotelPayload {
    id: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get My Events List
 */
export const getMyEvents = async (payload: MyEventsPayload): Promise<ApiResponse<BtaEvent[]>> => {
    console.log('🔍 [getMyEvents] Requesting:', API_ENDPOINTS.getMyEvents());
    console.log('🔍 [getMyEvents] Params:', payload);

    // Strict FormData per requirement
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.getMyEvents(), formData);
    console.log('✅ [getMyEvents] Response:', data);
    return data;
};

/**
 * Create New Event
 */
export const createEvent = async (payload: CreateEventPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [createEvent] Requesting:', API_ENDPOINTS.createEvent());
    console.log('🔍 [createEvent] Raw Payload:', payload);

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
        if (key !== 'uploadedFiles') {
            formData.append(key, payload[key]);
        }
    });

    // Handle files strictly matching Reference loop
    if (payload.uploadedFiles && payload.uploadedFiles.length > 0) {
        payload.uploadedFiles.forEach((file, index) => {
            // React Native Append Style for files
            formData.append('userfiles', {
                uri: file.uri,
                type: file.type || 'application/octet-stream', // Fallback type
                name: file.name || `file_${index}`
            } as any);
        });
    }

    // Log FormData entries for debugging
    const formDataEntries: any = {};
    // @ts-ignore - FormData iteration
    if (formData._parts) {
        // @ts-ignore
        formData._parts.forEach(p => formDataEntries[p[0]] = p[1]);
    }
    console.log('🔍 [createEvent] Final FormData:', formDataEntries);

    const { data } = await apiClient.post(API_ENDPOINTS.createEvent(), formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Explicit header
    });

    console.log('✅ [createEvent] Response:', data);
    return data;
};

/**
 * Update Event
 */
export const updateEvent = async (payload: UpdateEventPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [updateEvent] Requesting:', API_ENDPOINTS.updateEvent());
    console.log('🔍 [updateEvent] Raw Payload:', payload);

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
        if (key !== 'uploadedFiles') {
            formData.append(key, payload[key]);
        }
    });

    // Handle files (if update allows adding more files similar to create)
    if (payload.uploadedFiles && payload.uploadedFiles.length > 0) {
        payload.uploadedFiles.forEach((file, index) => {
            formData.append('userfiles', {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || `file_${index}`
            } as any);
        });
    }

    const { data } = await apiClient.post(API_ENDPOINTS.updateEvent(), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('✅ [updateEvent] Response:', data);
    return data;
};

/**
 * Submit Event (Submit for approval)
 */
export const submitEvent = async (payload: SubmitEventPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [submitEvent] Requesting:', API_ENDPOINTS.submitEvent());
    console.log('🔍 [submitEvent] JSON Payload:', payload);

    // Reference executes: body: JSON.stringify(submitData) with Content-Type: application/json
    const { data } = await apiClient.post(API_ENDPOINTS.submitEvent(), payload, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    console.log('✅ [submitEvent] Response:', data);
    return data;
};

/**
 * Cancel Event
 */
export const cancelEvent = async (payload: { event_id: string; cancel_by: string; cancel_remarks: string; status: string; key: string; indo_code: string; }): Promise<ApiResponse<any>> => {
    console.log('🔍 [cancelEvent] Requesting:', API_ENDPOINTS.cancelEvent());
    console.log('🔍 [cancelEvent] Payload:', payload);

    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.cancelEvent(), formData);

    console.log('✅ [cancelEvent] Response:', data);
    return data;
};


// ----------------------------------------------------------------------------
// Travel & Hotel Logic
// ----------------------------------------------------------------------------

export const getEventTravel = async (eventId: string, indoCode: string, apiKey: string): Promise<ApiResponse<any>> => {
    console.log('🔍 [getEventTravel] Requesting for Event ID:', eventId);
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("event_id", eventId);
    formData.append("indo_code", indoCode);

    const { data } = await apiClient.post(API_ENDPOINTS.getEventTravel(), formData);
    console.log('✅ [getEventTravel] Response:', data);
    return data;
};

export const createEventTravel = async (payload: CreateTravelPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [createEventTravel] Requesting:', API_ENDPOINTS.createEventTravel());
    console.log('🔍 [createEventTravel] Payload:', payload);

    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.createEventTravel(), formData);
    console.log('✅ [createEventTravel] Response:', data);
    return data;
};

export const updateEventTravel = async (payload: UpdateTravelPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [updateEventTravel] Requesting:', API_ENDPOINTS.updateEventTravel());
    console.log('🔍 [updateEventTravel] Payload:', payload);

    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.updateEventTravel(), formData);
    console.log('✅ [updateEventTravel] Response:', data);
    return data;
};

export const getEventHotel = async (eventId: string, indoCode: string, apiKey: string): Promise<ApiResponse<any>> => {
    console.log('🔍 [getEventHotel] Requesting for Event ID:', eventId);
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("event_id", eventId);
    formData.append("indo_code", indoCode);

    const { data } = await apiClient.post(API_ENDPOINTS.getEventHotel(), formData);
    console.log('✅ [getEventHotel] Response:', data);
    return data;
};

export const createEventHotel = async (payload: CreateHotelPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [createEventHotel] Requesting:', API_ENDPOINTS.createEventHotel());
    console.log('🔍 [createEventHotel] Payload:', payload);
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.createEventHotel(), formData);
    console.log('✅ [createEventHotel] Response:', data);
    return data;
};

export const updateEventHotel = async (payload: UpdateHotelPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [updateEventHotel] Requesting:', API_ENDPOINTS.updateEventHotel());
    console.log('🔍 [updateEventHotel] Payload:', payload);
    const formData = new FormData();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));

    const { data } = await apiClient.post(API_ENDPOINTS.updateEventHotel(), formData);
    console.log('✅ [updateEventHotel] Response:', data);
    return data;
};

/**
 * Masters
 */
export const getTravelModes = async (): Promise<ApiResponse<{ travel_modes: TravelMode[] }>> => {
    console.log('🔍 [getTravelModes] Requesting...');
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelModes());
    console.log('✅ [getTravelModes] Response Count:', data?.travel_modes?.length || 0);
    return data;
};

export const getTravelTypes = async (): Promise<ApiResponse<{ travel_types: TravelType[] }>> => {
    console.log('🔍 [getTravelTypes] Requesting...');
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelTypes());
    console.log('✅ [getTravelTypes] Response Count:', data?.travel_types?.length || 0);
    return data;
};
