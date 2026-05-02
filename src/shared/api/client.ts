import axios from 'axios';
import { useConfigStore } from '@shared/store';

/**
 * Centralized Axios API client
 * Automatically injects base URL and auth tokens
 */
export const apiClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

/**
 * Request interceptor
 * - Injects base URL from Zustand store
 * - Auto-adds auth credentials for authenticated requests
 */
apiClient.interceptors.request.use(
    async (config) => {
        // Get base URL from config store
        const baseUrl = useConfigStore.getState().baseUrl;
        if (baseUrl) {
            config.baseURL = baseUrl;
        }

        // Auto-inject user credentials into FormData
        // Backend expects indo_code and key in EVERY request
        if (config.data instanceof FormData) {
            const { useAuthStore } = await import('@shared/store');
            const user = useAuthStore.getState().user;

            if (user) {
                // Safely check if keys exist in FormData (handles both Web and React Native)
                let hasIndoCode = false;
                let hasKey = false;

                if (typeof config.data.has === 'function') {
                    hasIndoCode = config.data.has('indo_code');
                    hasKey = config.data.has('key');
                } else if ((config.data as any)._parts) {
                    // React Native FormData fallback
                    const parts = (config.data as any)._parts;
                    hasIndoCode = parts.some((part: any[]) => part[0] === 'indo_code');
                    hasKey = parts.some((part: any[]) => part[0] === 'key');
                }

                // Only append if not already present
                if (!hasIndoCode && user.indo_code) {
                    config.data.append('indo_code', user.indo_code);
                }
                if (!hasKey && user.api_key) {
                    config.data.append('key', user.api_key);
                }

                // Log FormData after injection
                if (__DEV__) {
                    const formDataEntries: any = {};
                    config.data.forEach((value, key) => { formDataEntries[key] = value; });
                    console.log('🔑 [Interceptor] FormData after auth injection:', formDataEntries);
                }
            }
        }

        // Log request for debugging
        if (__DEV__) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * - Logs responses in development
 * - Transforms errors
 */
apiClient.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`[API Response] ${response.config.url}:`, response.status);
        }
        return response;
    },
    (error) => {
        if (__DEV__) {
            console.error('[API Error]:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Helper to create FormData from object
 * PHP backend expects FormData format
 */
export const createFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
        }
    });
    return formData;
};
