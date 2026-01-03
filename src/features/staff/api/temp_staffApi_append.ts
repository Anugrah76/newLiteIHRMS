
// ============================================================================
// BTA Employee Module Types & Functions
// ============================================================================

export interface TravelMode {
    id: string;
    name: string;
}

export interface TravelType {
    id: string;
    name: string;
}

export const getTravelModes = async (): Promise<ApiResponse<{ travel_modes: TravelMode[] }>> => {
    // Note: manual fetch used FormData with indo_code/key, interceptor handles it if we pass FormData or post
    // The endpoint is likely a POST with auth.
    // However, existing masters might be simpler. Let's stick to the pattern: use apiClient.post
    // Since interceptor injects auth into FormData, we should pass an empty FormData or object.
    const formData = new FormData();
    // API likely expects keys.
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelModes(), formData);
    return data;
};

export const getTravelTypes = async (): Promise<ApiResponse<{ travel_types: TravelType[] }>> => {
    const formData = new FormData();
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelTypes(), formData);
    return data;
};

export const createBTAEvent = async (formData: FormData): Promise<ApiResponse<any>> => {
    console.log('🔍 [createBTAEvent] Requesting:', API_ENDPOINTS.createEvent());
    const { data } = await apiClient.post(API_ENDPOINTS.createEvent(), formData);
    return data;
};

export const submitBTAEvent = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [submitBTAEvent] Requesting:', API_ENDPOINTS.submitEvent());
    const { data } = await apiClient.post(API_ENDPOINTS.submitEvent(), payload);
    return data;
};

export const getBTALeaveRecordList = async (formData: FormData): Promise<ApiResponse<any>> => {
    console.log('🔍 [getBTALeaveRecordList] Requesting:', API_ENDPOINTS.getBTALeaveRecordList());
    const { data } = await apiClient.post(API_ENDPOINTS.getBTALeaveRecordList(), formData);
    return data;
};

// Hotel
export const getEventHotel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.getEventHotel(), formData);
    return data;
};

export const createEventHotel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.createEventHotel(), formData);
    return data;
};

export const updateEventHotel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.updateEventHotel(), formData);
    return data;
};

// Travel
export const getEventTravel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.getEventTravel(), formData);
    return data;
};

export const createEventTravel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.createEventTravel(), formData);
    return data;
};

export const updateEventTravel = async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.updateEventTravel(), formData);
    return data;
};

// Hooks

export const useTravelModes = () => {
    return useQuery({
        queryKey: ['travelModes'],
        queryFn: getTravelModes
    });
};

export const useTravelTypes = () => {
    return useQuery({
        queryKey: ['travelTypes'],
        queryFn: getTravelTypes
    });
};

export const useCreateBTAEvent = () => {
    return useMutation({ mutationFn: createBTAEvent });
};

export const useSubmitBTAEvent = () => {
    return useMutation({ mutationFn: submitBTAEvent });
};

export const useBTALeaveRecordList = () => {
    return useMutation({ mutationFn: getBTALeaveRecordList });
};

export const useEventHotel = () => {
    return useMutation({ mutationFn: getEventHotel });
};

export const useCreateEventHotel = () => {
    return useMutation({ mutationFn: createEventHotel });
};

export const useUpdateEventHotel = () => {
    return useMutation({ mutationFn: updateEventHotel });
};

export const useEventTravel = () => {
    return useMutation({ mutationFn: getEventTravel });
};

export const useCreateEventTravel = () => {
    return useMutation({ mutationFn: createEventTravel });
};

export const useUpdateEventTravel = () => {
    return useMutation({ mutationFn: updateEventTravel });
};
