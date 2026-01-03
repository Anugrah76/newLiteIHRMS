import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Leave Type
 */
export interface LeaveType {
    leave_type_id: string;
    leave_type_name: string;
    leave_type_code: string;
    name?: string; // API inconsistency handler
    description?: string;
}

/**
 * Leave Quota
 */
export interface LeaveQuota {
    leave_type_id: string;
    leave_type_name: string;
    total_leaves: number;
    leaves_taken: number;
    leaves_available: number;
}

/**
 * Leave Record
 */
export interface LeaveRecord {
    leave_id: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    days: number;
    reason: string;
    status: string;
    applied_date: string;
}

/**
 * Apply Leave Request
 * STRICT implementation based on user reference
 */
export interface ApplyLeaveRequest {
    leave_type: string; // Changed from leave_type_id
    from_date: string; // DD-MM-YYYY
    to_date: string; // DD-MM-YYYY
    from_time: string; // HH:mm:ss
    to_time: string; // HH:mm:ss
    comments: string;
}

/**
 * Get leave types
 */
export const getLeaveTypes = async (): Promise<ApiResponse<LeaveType[]>> => {
    const formData = new FormData();
    console.log('🔍 [getLeaveTypes] API Endpoint:', API_ENDPOINTS.leaveTypes());
    const { data } = await apiClient.post(API_ENDPOINTS.leaveTypes(), formData);
    console.log('✅ [getLeaveTypes] Response:', data);
    return data;
};

/**
 * Get leave quota
 */
export const getLeaveQuota = async (): Promise<ApiResponse<LeaveQuota[]>> => {
    const formData = new FormData();
    console.log('🔍 [getLeaveQuota] API Endpoint:', API_ENDPOINTS.leaveQuota());
    const { data } = await apiClient.post(API_ENDPOINTS.leaveQuota(), formData);
    console.log('✅ [getLeaveQuota] Response:', data);
    return data;
};

/**
 * Get leave history/records
 */
export const getLeaveHistory = async (): Promise<ApiResponse<LeaveRecord[]>> => {
    const formData = new FormData();
    console.log('🔍 [getLeaveHistory] API Endpoint:', API_ENDPOINTS.viewLeaves());
    const { data } = await apiClient.post(API_ENDPOINTS.viewLeaves(), formData);
    console.log('✅ [getLeaveHistory] Response:', data);
    return data;
};

/**
 * Apply for leave
 */
export const applyLeave = async (params: ApplyLeaveRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // STRICT payload mapping as per user instruction
    formData.append('leave_type', params.leave_type);
    formData.append('from_date', params.from_date);
    formData.append('to_date', params.to_date);
    formData.append('from_time', params.from_time);
    formData.append('to_time', params.to_time);
    formData.append('comments', params.comments);

    console.log('🔍 [applyLeave] API Endpoint:', API_ENDPOINTS.leaveRequest());

    // Log FormData entries for debugging
    const formDataEntries: any = {};
    // @ts-ignore
    if (formData.forEach) formData.forEach((value, key) => { formDataEntries[key] = value; });
    console.log('🔍 [applyLeave] FormData Payload:', formDataEntries);

    const { data } = await apiClient.post(API_ENDPOINTS.leaveRequest(), formData);
    console.log('✅ [applyLeave] Response:', data);
    return data;
};

/**
 * Get leave quota with month/year parameters
 */
export const getLeaveQuotaByPeriod = async (month: number, year: string): Promise<any> => {
    const formData = new FormData();
    formData.append('month', month.toString());
    formData.append('year', year);

    console.log('🔍 [getLeaveQuotaByPeriod] API Endpoint:', API_ENDPOINTS.leaveQuota());
    console.log('🔍 [getLeaveQuotaByPeriod] Params:', { month, year });

    const { data } = await apiClient.post(API_ENDPOINTS.leaveQuota(), formData);
    console.log('✅ [getLeaveQuotaByPeriod] Response:', data);
    return data;
};

/**
 * Get leave history with month/year parameters
 */
export const getLeaveHistoryByPeriod = async (month: number, year: string): Promise<any> => {
    const formData = new FormData();
    formData.append('month', month.toString());
    formData.append('year', year);

    console.log('🔍 [getLeaveHistoryByPeriod] API Endpoint:', API_ENDPOINTS.viewLeaves());
    console.log('🔍 [getLeaveHistoryByPeriod] Params:', { month, year });

    const { data } = await apiClient.post(API_ENDPOINTS.viewLeaves(), formData);
    console.log('✅ [getLeaveHistoryByPeriod] Response:', data);
    return data;
};

/**
 * React Query hooks with parameters
 */
export const useLeaveTypes = () => {
    return useQuery({
        queryKey: ['leaveTypes'],
        queryFn: getLeaveTypes,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useLeaveQuota = () => {
    return useQuery({
        queryKey: ['leaveQuota'],
        queryFn: getLeaveQuota,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useLeaveHistory = () => {
    return useQuery({
        queryKey: ['leaveHistory'],
        queryFn: getLeaveHistory,
    });
};

export const useApplyLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applyLeave,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['leaveQuota'] });
        },
    });
};

export const useLeaveQuotaByPeriod = (month: number, year: string, enabled = true) => {
    return useQuery({
        queryKey: ['leaveQuota', month, year],
        queryFn: () => getLeaveQuotaByPeriod(month, year),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled,
    });
};

export const useLeaveHistoryByPeriod = (month: number, year: string, enabled = true) => {
    return useQuery({
        queryKey: ['leaveHistory', month, year],
        queryFn: () => getLeaveHistoryByPeriod(month, year),
        staleTime: 5 * 60 * 1000,
        enabled,
    });
};
