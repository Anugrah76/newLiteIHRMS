import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

/**
 * Holiday
 */
export interface Holiday {
    name: string;
    date: string; // YYYY-MM-DD format
    description?: string;
}

/**
 * Get holidays list
 * Original params: indo_code, key (auto-injected), year (optional)
 */
export const getHolidays = async (year?: string): Promise<ApiResponse<Holiday[]>> => {
    const formData = new FormData();
    // indo_code and key auto-injected by interceptor

    // Add year if provided, otherwise backend will use current year
    if (year) {
        formData.append('year', year);
    }

    console.log('🔍 [getHolidays] API Endpoint:', API_ENDPOINTS.holidayList());
    console.log('🔍 [getHolidays] Year:', year || 'current year');

    const { data } = await apiClient.post(API_ENDPOINTS.holidayList(), formData);

    console.log('✅ [getHolidays] Response:', data);
    console.log('✅ [getHolidays] Holidays count:', data?.data?.length || 0);
    return data;
};

/**
 * React Query hook for holidays
 * Changed to mutation to support year parameter
 */
export const useHolidays = () => {
    return useMutation({
        mutationFn: (year?: string) => getHolidays(year),
    });
};
