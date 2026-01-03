import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

export interface Visitor {
    id: string;
    visit_id: string;
    first_name: string;
    last_name: string;
    visitor_mobile: string;
    purpose: string;
    meeting_datetime: string;
    status: string; // '1' = Pending, '2' = Approved, '3' = Rejected
    profile_picture?: string;
    photo_base_url?: string;

    // Health Declaration
    fever?: string; // '0' or '1'
    cough?: string;
    breathlessness?: string;
    throat?: string;
    covid_declaration?: string;

    // Document Info
    fk_master_document_types_id?: string;
    document_number?: string;

    // Additional fields
    company?: string;
    email?: string;
}

export interface GetVisitorsParams {
    year: string;
    month: string;
}

/**
 * Get all visitors with optional month/year filtering
 */
export const getAllVisitors = async (params?: GetVisitorsParams): Promise<ApiResponse<Visitor[]>> => {
    console.log('🔍 [getAllVisitors] Requesting:', API_ENDPOINTS.getAllVisitors());

    const formData = new FormData();
    if (params) {
        formData.append('year', params.year);
        formData.append('month', params.month);
    }
    // Auth tokens auto-injected by interceptor

    const { data } = await apiClient.post(API_ENDPOINTS.getAllVisitors(), formData);
    console.log('✅ [getAllVisitors] Response:', data);
    return data;
};

/**
 * Approve or reject visitor request
 */
export const approveRejectVisitor = async (payload: {
    visitor_id: string;
    meeting_id: string;
    status: string; // '2' for approve, '3' for reject
}): Promise<ApiResponse<any>> => {
    console.log('🔍 [approveRejectVisitor] Endpoint:', API_ENDPOINTS.approveRejectVisitorRequest());

    const formData = new FormData();
    formData.append('visitor_id', payload.visitor_id);
    formData.append('meeting_id', payload.meeting_id);
    formData.append('status', payload.status);
    // Auth tokens auto-injected by interceptor

    const { data } = await apiClient.post(API_ENDPOINTS.approveRejectVisitorRequest(), formData);
    console.log('✅ [approveRejectVisitor] Response:', data);
    return data;
};

/**
 * React Query hook for fetching visitors
 * Now accepts optional params for month/year filtering
 */
export const useAllVisitors = (params?: GetVisitorsParams) => {
    return useQuery({
        queryKey: ['allVisitors', params],
        queryFn: () => getAllVisitors(params),
        enabled: !!params, // Only fetch when params are provided
    });
};

/**
 * React Query mutation hook for approve/reject
 */
export const useApproveRejectVisitor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRejectVisitor,
        onSuccess: () => {
            // Invalidate and refetch visitors list
            queryClient.invalidateQueries({ queryKey: ['allVisitors'] });
        },
    });
};
