import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse, User } from '@shared/types';

/**
 * Profile Information Response
 */
export interface ProfileInfo {
    status: boolean;
    personal?: {
        designation?: string;
        company?: string;
        email?: string;
        mobile?: string;
        circle?: string;
        reporting_manager_name?: string;
        reporting_manager_email?: string;
        reporting_manager_contact?: string;
        joining_date?: string;
    };
    bank?: {
        bank_name?: string;
        bank_address?: string;
        account_holder_name?: string;
        account_number?: string;
        ifsc?: string;
    };
}

/**
 * Get profile information
 * Original params: indo_code, key (auto-injected)
 */
export const getProfileInfo = async (): Promise<ProfileInfo> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getProfileInfo] API Endpoint:', API_ENDPOINTS.profileInfo());

    const { data } = await apiClient.post(API_ENDPOINTS.profileInfo(), formData);

    console.log('✅ [getProfileInfo] Response:', data);
    return data;
};

/**
 * React Query hook for profile info
 */
export const useProfileInfo = () => {
    return useQuery({
        queryKey: ['profileInfo'],
        queryFn: getProfileInfo,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
