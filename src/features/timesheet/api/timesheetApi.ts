import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Timesheet Task Interface
 */
export interface TimesheetTask {
    kra_id: string;
    name: string;
    description: string;
    category_name: string;
    target: string;
    weightage: string;
    measurement_criteria: string;
    task_done: string | null;
    comment: string | null;
    timesheet_id: string | null;
    submit_status: number;
}

/**
 * KRA Tasks Normalized Response (Matches Reference Implementation)
 */
export interface KRATasksNormalized {
    tasks: TimesheetTask[];
    additional_task_status: number;
    additional_task: string;
    submit_status: number;
}

/**
 * Fill Timesheet Request
 */
export interface FillTimesheetRequest {
    date: string; // YYYY-MM-DD format
    task_id: string;
    hrs: string; // Note: "hrs" not "hours"!
    remarks?: string;
    status?: string; // "0" for draft, "1" for submit
}

/**
 * Get KRA tasks (Key Result Areas)
 * Original params: indo_code, key, date
 */
export const getKRATasks = async (date: string): Promise<ApiResponse<KRATasksNormalized>> => {
    const formData = new FormData();
    formData.append('date', date); // YYYY-MM-DD format
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getKRATasks] API Endpoint:', API_ENDPOINTS.getKRA());
    console.log('🔍 [getKRATasks] Params:', { date });

    try {
        const { data } = await apiClient.post(API_ENDPOINTS.getKRA(), formData);

        console.log('✅ [getKRATasks] Raw API Response:', data);

        // Normalize per Reference logic (AlmostFinal/app/screens/Timesheet.jsx)
        const normalizedData: KRATasksNormalized = {
            tasks: data.emp_kra || [],
            additional_task_status: Number(data.additional_task_status || 0),
            additional_task: data.additional_task ?? '',
            // Reference logic: s_s: json.emp_kra && json.emp_kra.length > 0 ? Number(json.emp_kra[0].submit_status || 0) : 0
            submit_status: (data.emp_kra && data.emp_kra.length > 0) ? Number(data.emp_kra[0].submit_status || 0) : 0
        };

        console.log('✅ [getKRATasks] Normalized Response:', normalizedData);

        const wrappedResponse = {
            data: normalizedData,
            status: data.status || 200,
            message: 'Success'
        };

        return wrappedResponse as any;
    } catch (error: any) {
        console.error('❌ [getKRATasks] Error:', error);
        throw error;
    }
};

/**
 * Fill timesheet for a task
 * Original params: indo_code, key, date, task_id, hrs, remarks, status
 */
export const fillTimesheet = async (params: FillTimesheetRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // CRITICAL: Must use exact parameter names as original
    formData.append('date', params.date);
    formData.append('task_id', params.task_id);
    formData.append('hrs', params.hrs); // Note: "hrs" not "hours"!

    if (params.remarks) {
        formData.append('remarks', params.remarks);
    }

    if (params.status) {
        formData.append('status', params.status); // "0" for draft, "1" for submit
    }

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [fillTimesheet] API Endpoint:', API_ENDPOINTS.fillTimeSheet());
    console.log('🔍 [fillTimesheet] Params:', params);

    // Log FormData entries
    const formDataEntries: any = {};
    formData.forEach((value, key) => { formDataEntries[key] = value; });
    console.log('🔍 [fillTimesheet] FormData entries (before interceptor):', formDataEntries);

    try {
        const { data } = await apiClient.post(API_ENDPOINTS.fillTimeSheet(), formData);

        console.log('✅ [fillTimesheet] Response:', data);
        return data;
    } catch (error: any) {
        console.error('❌ [fillTimesheet] Error:', error);
        throw error;
    }
};

/**
 * React Query hook for KRA tasks
 */
export const useKRATasks = (date?: string) => {
    return useQuery({
        queryKey: ['kraTasks', date],
        queryFn: () => getKRATasks(date!),
        enabled: !!date,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * React Query hook for filling timesheet
 */
export const useFillTimesheet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fillTimesheet,
        onSuccess: () => {
            // Invalidate to refresh data
            queryClient.invalidateQueries({ queryKey: ['kraTasks'] });
        },
    });
};

/**
 * Timesheet Calendar Status Response
 */
export interface TimesheetCalendarStatus {
    draftDates: string[];
    submittedDates: string[];
}

/**
 * Get monthly timesheet status (draft/submitted dates)
 */
export const getTimesheetCalendarStatus = async (month: string, year: string): Promise<TimesheetCalendarStatus> => {
    // API expects full month name (e.g., "January")
    const formData = new FormData();
    formData.append('month', month);
    formData.append('year', year);

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getTimesheetCalendarStatus] API Endpoints:', [API_ENDPOINTS.draftKRA(), API_ENDPOINTS.submitKRA()]);
    console.log('🔍 [getTimesheetCalendarStatus] Params:', { month, year });

    try {
        // Run both requests in parallel
        const [draftRes, submitRes] = await Promise.all([
            apiClient.post<{ submit_kra_date?: { task_date: string }[] }>(API_ENDPOINTS.draftKRA(), formData),
            apiClient.post<{ submit_kra_date?: string[] }>(API_ENDPOINTS.submitKRA(), formData)
        ]);

        console.log('✅ [getTimesheetCalendarStatus] Draft Response:', draftRes.data);
        console.log('✅ [getTimesheetCalendarStatus] Submit Response:', submitRes.data);

        const draftDates = draftRes.data.submit_kra_date?.map(d => d.task_date) || [];
        // Submit API returns strings directly in array, or sometimes objects? Reference said:
        // submittedJson.submit_kra_date.map(d => moment(d).format('YYYY-MM-DD'))
        // Let's assume strings based on ref mapping, but date formatted standard YYYY-MM-DD
        const submittedDates = submitRes.data.submit_kra_date || [];

        return {
            draftDates,
            submittedDates
        };
    } catch (error: any) {
        console.error('❌ [getTimesheetCalendarStatus] Error:', error);
        throw error;
    }
};

/**
 * React Query hook for Calendar Status
 */
export const useTimesheetCalendar = (month: string, year: string) => {
    return useQuery({
        queryKey: ['timesheetCalendar', month, year],
        queryFn: () => getTimesheetCalendarStatus(month, year),
        enabled: !!month && !!year,
    });
};
