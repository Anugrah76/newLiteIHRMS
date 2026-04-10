import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, createFormData } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Punch Time Data
 */
export interface PunchTime {
    punch_date: string;
    punch_in_time: string | null;
    punch_out_time: string | null;
    status: number;
}

/**
 * Attendance Record
 */
export interface AttendanceRecord {
    attend_date: string;
    punch_in_time: string;
    punch_out_time: string;
    working_hrs: string;
    status: string;
    attend_status?: string; // Present, Absent, Leave, Holiday, WeekOff
}


/**
 * Punch Option
 */
export interface PunchOption {
    id: string;
    office_name: string;
    is_default: string;
}

/**
 * Get punch time for a specific date
 * Original params: indo_code, key, punch_date
 */
export const getPunchTime = async (date: string): Promise<ApiResponse<PunchTime>> => {
    const formData = new FormData();
    // Backend expects these exact parameter names
    formData.append('punch_date', date); // DD-MM-YYYY format
    // indo_code and key are auto-injected by interceptor

    console.log('🔍 [getPunchTime] API Endpoint:', API_ENDPOINTS.getPunchTime());
    console.log('🔍 [getPunchTime] Params:', { punch_date: date });

    const { data } = await apiClient.post(API_ENDPOINTS.getPunchTime(), formData);

    console.log('✅ [getPunchTime] Response:', data);
    return data;
};

/**
 * Punch Options API Response
 * This endpoint returns: { status, emp_punch_option }
 * emp_punch_option is a number: 1=normal, 2=biometric, 3=QR, 4=both
 */
export interface PunchOptionsResponse {
    status: number;
    emp_punch_option: number;
}

/**
 * Get punch attendance options
 * Original params: Only indo_code and key (auto-injected)
 */
export const getPunchOptions = async (): Promise<PunchOptionsResponse> => {
    const formData = new FormData();
    // No additional params needed, only indo_code and key from interceptor

    console.log('🔍 [getPunchOptions] API Endpoint:', API_ENDPOINTS.getPunchAttendanceOption());

    const { data } = await apiClient.post(API_ENDPOINTS.getPunchAttendanceOption(), formData);

    console.log('✅ [getPunchOptions] Response:', data);
    return data;
};

/**
 * Mark attendance (punch in/out)
 * IMPORTANT: Parameters must match original API exactly
 */
export interface MarkAttendanceRequest {
    mode: string; // "1" for normal punch, "2" for save new location
    email: string; // User's email/username
    lat: string; // Latitude
    long: string; // Longitude (not longitude!)
    address: string; // Address
    city: string; // City
    state?: string; // State (optional)
    remarks?: string; // Remarks (optional, defaults to app version)
    ofc_id?: string; // Office ID (optional)
}

export const markAttendance = async (params: MarkAttendanceRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // CRITICAL: Must use exact parameter names as original
    formData.append('mode', params.mode);
    formData.append('email', params.email);
    formData.append('lat', params.lat);
    formData.append('long', params.long); // Note: "long" not "longitude"!
    formData.append('address', params.address);
    formData.append('city', params.city);

    if (params.state) {
        formData.append('state', params.state);
    }

    if (params.remarks) {
        formData.append('remarks', params.remarks);
    }

    if (params.ofc_id) {
        formData.append('ofc_id', params.ofc_id);
    }

    console.log('🔍 [markAttendance] API Endpoint:', API_ENDPOINTS.punch());
    console.log('🔍 [markAttendance] FormData params:', params);
    // Log FormData entries
    const formDataEntries: any = {};
    formData.forEach((value, key) => { formDataEntries[key] = value; });
    console.log('🔍 [markAttendance] FormData entries:', formDataEntries);

    const { data } = await apiClient.post(API_ENDPOINTS.punch(), formData);

    console.log('✅ [markAttendance] Response:', data);
    return data;
};

/**
 * Get attendance records
 */
export interface AttendanceRecordsRequest {
    month: string; // Month name like "December"
    year: string; // Year like "2024"
}

/**
 * Attendance Record Object (inside the arrays)
 */
export interface AttendanceRecord {
    attend_date: string;
    punch_in_time: string;
    punch_out_time: string;
    working_hrs: string;
    status: string;
    attend_status?: string;
    [key: string]: any;
}

/**
 * Attendance API Response Result
 */
export interface AttendanceResult {
    present_days: AttendanceRecord[];
    leave_days: AttendanceRecord[];
    weekoff: any[];
    holiday_days: any[];
    mispunch_days: string[];
    comp_off_days: any[];
    mispunch_criteria: string;
}

/**
 * Custom Response for Attendance Records (deviates from standard ApiResponse)
 */
export interface AttendanceRecordsResponse {
    status: number;
    response: number;
    result: AttendanceResult;
    freezed: string;
}

export const getAttendanceRecords = async (params: AttendanceRecordsRequest): Promise<AttendanceRecordsResponse> => {
    const formData = new FormData();
    // CRITICAL: Backend expects indo_code and key, not our user auth
    // These need to be added from auth store in the component
    formData.append('month', params.month);
    formData.append('year', params.year);

    console.log('🔍 [getAttendanceRecords] API Endpoint:', API_ENDPOINTS.attendanceRecord());
    console.log('🔍 [getAttendanceRecords] Params:', params);

    const { data } = await apiClient.post(API_ENDPOINTS.attendanceRecord(), formData);

    console.log('✅ [getAttendanceRecords] Response:', data);
    return data;
};

/**
 * React Query hook for punch time
 * Auto-refetches every minute
 */
export const usePunchTime = (date: string) => {
    return useQuery({
        queryKey: ['punchTime', date],
        queryFn: () => getPunchTime(date),
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider stale after 30 seconds
    });
};

/**
 * React Query hook for punch options
 */
export const usePunchOptions = () => {
    return useQuery({
        queryKey: ['punchOptions'],
        queryFn: getPunchOptions,
        staleTime: Infinity, // Options don't change often
    });
};

/**
 * React Query hook for marking attendance
 */
export const useMarkAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAttendance,
        onSuccess: () => {
            // Invalidate punch time to refresh
            queryClient.invalidateQueries({ queryKey: ['punchTime'] });
        },
    });
};

/**
 * React Query hook for attendance records
 */
export const useAttendanceRecords = (params: AttendanceRecordsRequest) => {
    return useQuery({
        queryKey: ['attendanceRecords', params.month, params.year],
        queryFn: () => getAttendanceRecords(params),
        enabled: !!params.month && !!params.year,
    });
};
