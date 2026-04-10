import { useKRATasks } from '@features/timesheet/hooks';
import { format } from 'date-fns';

/**
 * Hook to fetch today's KRA tasks for dashboard
 */
export const useTodayKRATasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return useKRATasks(today);
};
