import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Asset
 */
export interface Asset {
    asset_id: string;
    asset_name: string;
    asset_description: string;
    asset_type: string;
    asset_user_id: string;
    assign_date: string;
    qrcode: string | null;
    release_date: string | null;
    serial_no: string;
    ssit_code: string;
    status: string;
    user_acceptance: string | null;
}

export interface AssetsResponse {
    response: number;
    result: Asset[];
    status: number;
}

/**
 * Get assets
 */
export const getAssets = async (): Promise<AssetsResponse> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    console.log('🔍 [getAssets] API Endpoint:', API_ENDPOINTS.getAssets());

    const { data } = await apiClient.post(API_ENDPOINTS.getAssets(), formData);

    console.log('✅ [getAssets] Response:', data);
    console.log('✅ [getAssets] Assets count:', data?.result?.length || 0);
    return data;
};

/**
 * React Query hook for assets
 */
export const useAssets = () => {
    return useQuery({
        queryKey: ['assets'],
        queryFn: getAssets,
    });
};
