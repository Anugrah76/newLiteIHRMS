import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Dependent
 */
export interface Dependent {
    dependent_id: string;
    dependent_name: string;
    relationship: string;
    date_of_birth: string;
    gender: string;
    phone?: string;
    dependent_age?: string;
    aadhar_number?: string;
    nominee?: string; // 'Yes' or 'No'
}

/**
 * Add/Update Dependent Request
 */
export interface DependentRequest {
    dependent_name: string;
    dependent_relation: string;
    dependent_dob: string; // DD-MM-YYYY
    gender?: string;
    phone?: string;
    dependent_age?: string;
    aadhar_number?: string;
    nominee?: string; // 'Yes' or 'No'
}

/**
 * Get dependents info
 * Original params: indo_code, key (auto-injected)
 */
export const getDependents = async (): Promise<ApiResponse<Dependent[]>> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getDependents] API Endpoint:', API_ENDPOINTS.getDependents());

    const { data } = await apiClient.post(API_ENDPOINTS.getDependents(), formData);

    console.log('✅ [getDependents] Response:', data);
    console.log('✅ [getDependents] Count:', data?.data?.length || 0);
    return data;
};

/**
 * Add new dependent
 * Original params: indo_code, key, dependent_name, relationship, date_of_birth, gender, phone
 */
export const addDependent = async (params: DependentRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // CRITICAL: Must use exact parameter names as original
    formData.append('dependent_name', params.dependent_name);
    formData.append('dependent_relation', params.dependent_relation);
    formData.append('dependent_dob', params.dependent_dob);
    //formData.append('gender', params.gender);

    /*     if (params.phone) {
            formData.append('phone', params.phone);
        } */
    if (params.dependent_age) {
        formData.append('dependent_age', params.dependent_age);
    }
    if (params.aadhar_number) {
        formData.append('aadhar_number', params.aadhar_number);
    }
    if (params.nominee) {
        formData.append('nominee', params.nominee);
    }

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [addDependent] API Endpoint:', API_ENDPOINTS.addDependent());
    console.log('🔍 [addDependent] Params:', params);

    const { data } = await apiClient.post(API_ENDPOINTS.addDependent(), formData);

    console.log('✅ [addDependent] Response:', data);
    return data;
};

/**
 * Update dependent
 * Original params: indo_code, key, dependent_id, dependent_name, relationship, date_of_birth, gender, phone
 */
export const updateDependent = async (dependentId: string, params: DependentRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    formData.append('id', dependentId);
    formData.append('dependent_name', params.dependent_name);
    formData.append('dependent_relation', params.dependent_relation);
    formData.append('dependent_dob', params.dependent_dob);
    //formData.append('gender', params.gender);

    /*  if (params.phone) {
         formData.append('phone', params.phone);
     } */
    if (params.dependent_age) {
        formData.append('dependent_age', params.dependent_age);
    }
    if (params.aadhar_number) {
        formData.append('aadhar_number', params.aadhar_number);
    }
    if (params.nominee) {
        formData.append('nominee', params.nominee);
    }

    // indo_code and key auto-injected by interceptor

    console.log('🔍 [updateDependent] API Endpoint:', API_ENDPOINTS.updateDependent());
    console.log('🔍 [updateDependent] Params:', { dependentId, ...params });

    const { data } = await apiClient.post(API_ENDPOINTS.updateDependent(), formData);

    console.log('✅ [updateDependent] Response:', data);
    return data;
};

/**
 * Delete dependent
 * Original params: indo_code, key, dependent_id
 */
export const deleteDependent = async (dependentId: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('id', dependentId);
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [deleteDependent] API Endpoint:', API_ENDPOINTS.deleteDependent());
    console.log('🔍 [deleteDependent] Dependent ID:', dependentId);

    const { data } = await apiClient.post(API_ENDPOINTS.deleteDependent(), formData);

    console.log('✅ [deleteDependent] Response:', data);
    return data;
};

/**
 * React Query hooks
 */
export const useDependents = () => {
    return useQuery({
        queryKey: ['dependents'],
        queryFn: getDependents,
    });
};

export const useAddDependent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addDependent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependents'] });
        },
    });
};

export const useUpdateDependent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ dependentId, data }: { dependentId: string; data: DependentRequest }) =>
            updateDependent(dependentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependents'] });
        },
    });
};

export const useDeleteDependent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteDependent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependents'] });
        },
    });
};
