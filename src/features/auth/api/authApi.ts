import { useMutation } from '@tanstack/react-query';
import { apiClient, createFormData } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import { useConfigStore, useAuthStore } from '@shared/store';
import { saveToken } from '@shared/utils/auth';
import type { ApiResponse, CompanyConfig, LoginRequest, LoginResponse } from '@shared/types';

/**
 * Company configuration API response
 */
interface CompanyConfigResponse extends ApiResponse<CompanyConfig> { }

/**
 * Get company configuration by controller ID
 * This is the first API call in the app - uses hardcoded URL
 */
export const getCompanyConfig = async (controllerId: string): Promise<CompanyConfigResponse> => {
    const formData = createFormData({ controller_id: controllerId });

    const response = await fetch(
        'https://info.indovisionservices.in/dev/v15/hrms_api/v7/api/appcontroller/appcontroller',
        { method: 'POST', body: formData }
    );
    const data = await response.json();
    console.log('response.json', data);
    return data;
};

/**
 * Hook for submitting company code and retrieving configuration
 */
export const useCompanyConfig = () => {
    const setConfig = useConfigStore((state) => state.setConfig);

    return useMutation({
        mutationFn: getCompanyConfig,
        onSuccess: (data) => {
            // Store base URL and company config in Zustand
            setConfig(data);
        },
    });
};

/**
 * Login API call
 * Uses dynamic base URL from config store (injected by Axios interceptor)
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = createFormData(credentials);

    const response = await apiClient.post(API_ENDPOINTS.login(), formData);
    return response.data;
};

/**
 * Hook for user login
 */
export const useLogin = () => {
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: login,
        onSuccess: async (data: any) => {
            if (data.status === 2 || data.response === 200) {
                // Map API response to User type structure
                // Response is flat: { status: 2, indo_code: "...", ... }
                const user: any = {
                    fullName: data.fullName || data.username,
                    emp_code: data.emp_code,
                    email: data.manager_id,
                    api_key: data.api_key,
                    indo_code: data.indo_code,
                    manager_id: data.manager_id,
                    manager_indo_code: data.manager_indo_code,
                    username: data.username,
                    user_type: data.user_type
                };

                // Save to Zustand store
                setUser(user);

                // Also save to SecureStore for persistence
                await saveToken(user);
            }
        },
    });
};

/**
 * Forgot Password API
 * Sends password reset request
 */
export const forgotPassword = async (email: string): Promise<ApiResponse<any>> => {
    const formData = createFormData({ email });

    const { data } = await apiClient.post(API_ENDPOINTS.forgotPw(), formData);
    return data;
};

/**
 * React Query hook for forgot password
 */
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
    });
};
