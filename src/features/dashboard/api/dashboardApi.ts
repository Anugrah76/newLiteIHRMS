import { useQuery } from '@tanstack/react-query';
import { apiClient, createFormData } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import { queryKeys } from '@shared/api/queryClient';
import { useAuthStore } from '@shared/store';
import type { PunchTime } from '@shared/types';

/**
 * Get punch time for a specific date
 */
export const getPunchTime = async (date: string): Promise<PunchTime> => {
    const user = useAuthStore.getState().user;

    if (!user) {
        throw new Error('User not authenticated');
    }

    const formData = createFormData({
        indo_code: user.indo_code,
        key: user.api_key,
        punch_date: date,
    });

    console.log('🔍 [Dashboard getPunchTime] API Endpoint:', API_ENDPOINTS.getPunchTime());
    console.log('🔍 [Dashboard getPunchTime] Params:', { punch_date: date, indo_code: user.indo_code });

    const response = await apiClient.post(API_ENDPOINTS.getPunchTime(), formData);

    console.log('✅ [Dashboard getPunchTime] Response:', response.data);
    return response.data;
};

/**
 * Hook to fetch punch time
 * Auto-refetches every 30 seconds when screen is focused
 */
export const usePunchTime = (date: string) => {
    return useQuery({
        queryKey: queryKeys.attendance.punchTime(date),
        queryFn: () => getPunchTime(date),
        refetchInterval: 300000, // Refetch every 30 seconds
        enabled: !!date,
    });
};
