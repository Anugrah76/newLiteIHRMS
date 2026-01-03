import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

/**
 * Query keys factory for consistent cache management
 */
export const queryKeys = {
    auth: {
        user: ['user'] as const,
    },
    attendance: {
        punchTime: (date: string) => ['punchTime', date] as const,
        records: (filters?: any) => ['attendanceRecords', filters] as const,
    },
    timesheet: {
        list: (month: string) => ['timesheet', month] as const,
    },
    leave: {
        quota: ['leaveQuota'] as const,
        list: (filters?: any) => ['leaves', filters] as const,
    },
} as const;
