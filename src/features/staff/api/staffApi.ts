import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Base Types
 */
export interface StaffMember {
    emp_code: string;
    emp_name: string;
    attendance_status: string; // 'P', 'A', etc.
    in_time?: string;
    out_time?: string;
    [key: string]: any;
}

export interface ApprovalPayload {
    key: string;
    indo_code: string;
    managerRemark?: string;
    [key: string]: any;
}

/**
 * Comp Off Types
 */
export interface CompOffRequest {
    compoff_id: string;
    indo_code: string;
    resource_name: string;
    compoff_date: string;
    status: string | number; // 1: Pending, 3: Approved, 4: Rejected
}

export interface ApproveCompOffPayload extends ApprovalPayload {
    compoffList: {
        compoff_id: string;
        indo_code: string;
        compoff_date: string;
        status: number;
    }[];
}

/**
 * Leave Types
 */
export interface LeaveRequest {
    leave_id: string;
    indo_code: string;
    resource_name: string;
    lt_id: string; // Leave Type ID
    from_date: string;
    to_date: string;
    comments: string;
    status: string | number;
}

export interface ApproveLeavePayload extends ApprovalPayload {
    leavesList: {
        leave_id: string;
        status: number;
    }[];
}

/**
 * Missed Punch Types
 */
export interface MissedPunchRequest {
    mp_id: string;
    atten_id: string;
    indo_code: string;
    resource_name: string;
    mispunch_date: string;
    oldpunch: string;
    newpunch: string;
    comments: string;
    status: string | number;
}

export interface ApproveMissedPunchPayload extends ApprovalPayload {
    approveList: {
        mp_id: string;
        atten_id: string;
        newpunch: string;
        status: number;
    }[];
}

/**
 * Business Trip (BTA) Types
 */
export interface BTARequest {
    bt_id: string;
    indo_code: string;
    resource_name: string;
    start_date: string;
    end_date: string;
    destination: string;
    purpose: string;
    status: string;
}

export interface ApproveBTAPayload extends ApprovalPayload {
    approveList: {
        bt_id: string;
        status: string; // 'Approved' or 'Rejected' string based on reference
    }[];
}

/**
 * F&F (Resignation) Types
 */
export interface FNFRequest {
    leave_id: string; // Typically reusing leave ID or specific ID
    indo_code: string;
    resource_name: string;
    from_date: string;
    to_date: string;
    status: string | number;
}

export interface ApproveFNFPayload extends ApprovalPayload {
    leaveList: {
        indo_code: string;
        leave_id: string;
        from_date: string;
        to_date: string;
        status: number;
    }[];
    approver_name?: string;
    approver_mail?: string;
}

export interface TravelMode {
    id: string;
    name: string;
}

export interface TravelType {
    id: string;
    name: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Staff Attendance
 */
export const getStaffAttendanceList = async (formData: FormData): Promise<ApiResponse<StaffMember[]>> => {
    console.log('🔍 [getStaffAttendanceList] Requesting:', API_ENDPOINTS.StaffAttendanceList());
    const { data } = await apiClient.post(API_ENDPOINTS.StaffAttendanceList(), formData);
    return data;
};

export const approveStaffAttendance = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveStaffAttendance] To:', API_ENDPOINTS.StaffAttendanceApprove());
    const formData = new FormData();
    // Payload usually comes as 'rawData' JSON string inside FormData for this endpoint based on reference
    if (payload.staff_employees) {
        formData.append("rawData", JSON.stringify(payload));
    } else {
        // Fallback for direct formData appending if needed
        Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    }
    const { data } = await apiClient.post(API_ENDPOINTS.StaffAttendanceApprove(), formData);
    return data;
};

/**
 * Comp Off
 */
export const getCompOffRequests = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getCompOffRequests] Requesting:', API_ENDPOINTS.compoffList());
    const { data } = await apiClient.post(API_ENDPOINTS.compoffList(), formData);
    return data;
};

export const approveCompOff = async (payload: ApproveCompOffPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveCompOff] Payload:', payload);
    const { data } = await apiClient.post(API_ENDPOINTS.approveCompoff(), payload);
    return data;
};

/**
 * Leave Approval
 */
export const getLeaveRequests = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getLeaveRequests] Requesting:', API_ENDPOINTS.leaveList());
    const { data } = await apiClient.post(API_ENDPOINTS.leaveList(), formData);
    return data;
};

export const approveLeave = async (payload: ApproveLeavePayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveLeave] Payload:', payload);
    const { data } = await apiClient.post(API_ENDPOINTS.approveLeave(), payload);
    return data;
};

/**
 * Missed Punch Approval
 */
export const getMissedPunchRequests = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getMissedPunchRequests] Requesting:', API_ENDPOINTS.missPunchList());
    const { data } = await apiClient.post(API_ENDPOINTS.missPunchList(), formData);
    return data;
};

export const approveMissedPunch = async (payload: ApproveMissedPunchPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveMissedPunch] Payload:', payload);
    const { data } = await apiClient.post(API_ENDPOINTS.approveMPunch(), payload);
    return data;
};

/**
 * Business Trip Approval
 */
export const getBTARequests = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getBTARequests] Requesting:', API_ENDPOINTS.BTAList());
    const { data } = await apiClient.post(API_ENDPOINTS.BTAList(), formData);
    return data; // Note: Returns array of employees with businessTrip[]
};

export const approveBTA = async (payload: ApproveBTAPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveBTA] Payload:', payload);
    const { data } = await apiClient.post(API_ENDPOINTS.BTAApprove(), payload); // Assuming Endpoint exists, corrected name based on usage
    return data;
};

/**
 * F&F (Resignation) Approval
 */
export const getFNFRequests = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getFNFRequests] Requesting:', API_ENDPOINTS.resignationList());
    const { data } = await apiClient.post(API_ENDPOINTS.resignationList(), formData);
    return data;
};

export const approveFNF = async (payload: ApproveFNFPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveFNF] Payload:', payload);
    const formData = new FormData();
    formData.append("rawData", JSON.stringify(payload));
    const { data } = await apiClient.post(API_ENDPOINTS.approveResignation(), formData);
    return data;
};


// ============================================================================
// BTA Employee Module API Functions
// ============================================================================

export const getTravelModes = async (): Promise<ApiResponse<{ travel_modes: TravelMode[] }>> => {
    const formData = new FormData();
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelModes(), formData);
    console.log('🔍 [getTravelModes] Response:', data);
    return data;
};

export const getTravelTypes = async (): Promise<ApiResponse<{ travel_types: TravelType[] }>> => {
    const formData = new FormData();
    const { data } = await apiClient.post(API_ENDPOINTS.getTravelTypes(), formData);
    console.log('🔍 [getTravelTypes] Response:', data);
    return data;
};

export const createBTAEvent = async (formData: FormData): Promise<ApiResponse<any>> => {
    console.log('🔍 [createBTAEvent] Requesting:', API_ENDPOINTS.createEvent());

    const { data } = await apiClient.post(API_ENDPOINTS.createEvent(), formData);
    console.log('create event ', data);
    return data;
};

export const submitBTAEvent = async (payload: any): Promise<ApiResponse<any>> => {
    console.log('🔍 [submitBTAEvent] Requesting:', API_ENDPOINTS.submitEvent());
    const { data } = await apiClient.post(API_ENDPOINTS.submitEvent(), payload);
    console.log('submite event ', data);
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


// ============================================================================
// React Query Hooks
// ============================================================================

export const useStaffAttendanceList = () => {
    return useMutation({
        mutationFn: getStaffAttendanceList,
    });
};

export const useStaffAttendanceApprove = () => {
    return useMutation({
        mutationFn: approveStaffAttendance,
    });
};

export const useCompOffRequests = () => {
    return useMutation({ mutationFn: getCompOffRequests });
};

export const useApproveCompOff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveCompOff,
        onSuccess: () => {
            // Invalidate list if we were caching it, but since it's search-based (mutation), mostly manual refresh
        }
    });
};

export const useLeaveRequests = () => {
    return useMutation({ mutationFn: getLeaveRequests });
};

export const useApproveLeave = () => {
    return useMutation({ mutationFn: approveLeave });
};

export const useMissedPunchRequests = () => {
    return useMutation({ mutationFn: getMissedPunchRequests });
};

export const useApproveMissedPunch = () => {
    return useMutation({ mutationFn: approveMissedPunch });
};

export const useBTARequests = () => {
    return useMutation({ mutationFn: getBTARequests });
};

export const useApproveBTA = () => {
    return useMutation({ mutationFn: approveBTA });
};

export const useFNFRequests = () => {
    return useMutation({ mutationFn: getFNFRequests });
};

export const useApproveFNF = () => {
    return useMutation({ mutationFn: approveFNF });
};

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

// My BTA Events
export const getMyEvents = async (formData: FormData): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getMyEvents] Requesting:', API_ENDPOINTS.getMyEvents());
    const { data } = await apiClient.post(API_ENDPOINTS.getMyEvents(), formData);
    return data; // Returns { data: [...] } usually
};

export const cancelEvent = async (formData: FormData): Promise<ApiResponse<any>> => {
    console.log('🔍 [cancelEvent] Requesting:', API_ENDPOINTS.cancelEvent());
    const { data } = await apiClient.post(API_ENDPOINTS.cancelEvent(), formData);
    return data;
};

export const useMyEvents = () => {
    return useMutation({ mutationFn: getMyEvents });
};

export const useCancelEvent = () => {
    return useMutation({ mutationFn: cancelEvent });
};

// ============================================================================
// Work From Home (WFH) API Functions
// ============================================================================

export const startWork = async (): Promise<ApiResponse<any>> => {
    console.log('🔍 [startWork] Requesting:', API_ENDPOINTS.startWork());
    const formData = new FormData();
    // Auth injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.startWork(), formData);
    return data;
};

export const stopWork = async (payload: {
    work_date: string;
    start_time: string;
    status: string;
    remarks: string;
}): Promise<ApiResponse<any>> => {
    console.log('🔍 [stopWork] Requesting:', API_ENDPOINTS.stopWork());
    const formData = new FormData();
    formData.append('work_date', payload.work_date);
    formData.append('start_time', payload.start_time);
    formData.append('status', payload.status);
    formData.append('remarks', payload.remarks);
    // Auth injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.stopWork(), formData);
    return data;
};

export const useStartWork = () => {
    return useMutation({ mutationFn: startWork });
};

export const useStopWork = () => {
    return useMutation({ mutationFn: stopWork });
};

// WFH Filter (Work Logs by Date)
export interface WfhLogEntry {
    id: string;
    indo_code: string;
    work_date: string;
    start_time: string;
    end_time: string | null;
    work_hours: string | null;
    remarks: string | null;
    current_status: string;
    application: string;
}

export interface WfhFilterResponse {
    response: string;
    message: string;
    total_work_hours: string;
    data: WfhLogEntry[];
}

export const getWfhFilter = async (workDate: string): Promise<WfhFilterResponse> => {
    console.log('🔍 [getWfhFilter] Requesting:', API_ENDPOINTS.wfhFilter(), 'for date:', workDate);
    const formData = new FormData();
    formData.append('work_date', workDate);
    // Auth (key, indo_code) injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.wfhFilter(), formData);
    return data;
};

export const useWfhFilter = () => {
    return useMutation({ mutationFn: getWfhFilter });
};

export const endDay = async (payload: {
    work_date: string;
    start_time: string;
    status: string;
    remarks: string;
}): Promise<ApiResponse<any>> => {
    console.log('🔍 [endDay] Requesting:', API_ENDPOINTS.endDay());
    const formData = new FormData();
    formData.append('work_date', payload.work_date);
    formData.append('start_time', payload.start_time);
    formData.append('status', payload.status);
    formData.append('remarks', payload.remarks);
    // Auth injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.endDay(), formData);
    return data;
};

export const useEndDay = () => {
    return useMutation({ mutationFn: endDay });
};

// ============================================================================
// Missed Punch API Functions
// ============================================================================

export interface MissPunchListPayload {
    year: string;
    month: string;
    status: string;
}

export interface ApproveMissPunchPayload {
    approveList: Array<{
        mp_id: string;
        atten_id: string;
        newpunch: string;
        status: number;
    }>;
    managerRemark: string;
}

export const getMissPunchList = async (payload: MissPunchListPayload): Promise<ApiResponse<any[]>> => {
    console.log('🔍 [getMissPunchList] Requesting:', API_ENDPOINTS.missPunchList());
    const formData = new FormData();
    formData.append('year', payload.year);
    formData.append('month', payload.month);
    formData.append('status', payload.status);
    // Auth injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.missPunchList(), formData);
    return data;
};

export const approveMissPunch = async (payload: ApproveMissPunchPayload): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveMissPunch] Requesting:', API_ENDPOINTS.approveMPunch());
    // This endpoint expects JSON, not FormData
    const { data } = await apiClient.post(API_ENDPOINTS.approveMPunch(), payload, {
        headers: { 'Content-Type': 'application/json' }
    });
    return data;
};

export const useMissPunchList = () => {
    return useMutation({ mutationFn: getMissPunchList });
};

export const useApproveMissPunch = () => {
    return useMutation({ mutationFn: approveMissPunch });
};
