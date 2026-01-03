import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import type { ApiResponse } from '@shared/types';

export interface SalaryRecord {
    id?: string;
    monthly_ctc: string;
    paid_salary: string;
    date: string;
    salary_slip_url: string;
    // Parsed values for calculation
    paid_salary_parsed?: number;
    monthly_ctc_parsed?: number;
}

export interface SalaryDetail {
    month: string;
    year: string;
    net_salary: string;
    total_earnings: string;
    total_deductions: string;
    earnings: Array<{ component_name: string; amount: string }>;
    deductions: Array<{ component_name: string; amount: string }>;
}

export interface TransSalaryResponse extends ApiResponse<any> {
    year_salary: SalaryRecord[];
}


/**
 * Helper to parse Indian number format string to number
 * e.g. "1,23,456.00" -> 123456.00
 */
export const parseIndianNumberFormat = (value: string | number | undefined | null): number => {
    if (!value) return 0;
    const strValue = String(value);
    // Remove commas and non-numeric chars except dot
    const cleaned = strValue.replace(/,/g, '').replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get Transferred Salary API
 */
/**
 * Get Transferred Salary API
 * Using salaryDetail endpoint with year parameter to get list
 */
export const getTransferredSalary = async (year: string): Promise<TransSalaryResponse> => {
    const formData = new FormData();
    formData.append('year', year);

    console.log('🔍 [getTransferredSalary] Requesting:', API_ENDPOINTS.salaryDetail());

    // Auth tokens auto-injected by interceptor
    const { data } = await apiClient.post(API_ENDPOINTS.salaryDetail(), formData);

    // Process data to add parsed values

    // Process data to add parsed values
    if (data && data.year_salary) {
        data.year_salary = data.year_salary
            .filter((item: any) => item !== null)
            .map((item: any) => ({
                ...item,
                paid_salary_parsed: parseIndianNumberFormat(item.paid_salary),
                monthly_ctc_parsed: parseIndianNumberFormat(item.monthly_ctc)
            }));
    }

    console.log('✅ [getTransferredSalary] Response:', data);
    return data;
};

/**
 * Get Salary Detail API ( Current Month)
 */
export const getSalaryDetail = async (): Promise<ApiResponse<SalaryDetail>> => {
    console.log('🔍 [getSalaryDetail] Requesting:', API_ENDPOINTS.salaryDetail());
    const { data } = await apiClient.post(API_ENDPOINTS.salaryDetail());
    console.log('✅ [getSalaryDetail] Response:', data);
    return data;
};

/**
 * React Query hook for salary
 * Using useMutation because we want to trigger it on search click, similar to legacy
 * though useQuery with enabled flag could also work. Legacy uses "Search".
 */
export const useTransferredSalary = () => {
    return useMutation({
        mutationFn: ({ year }: { year: string }) =>
            getTransferredSalary(year),
    });
};

/**
 * React Query hook for current salary detail
 */
export const useSalaryDetail = () => {
    return useQuery({
        queryKey: ['salaryDetail'],
        queryFn: getSalaryDetail,
    });
};
