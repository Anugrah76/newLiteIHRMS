import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Company configuration interface
 * Retrieved from Submit screen API call
 */
export interface CompanyConfig {
    company_name?: string;
    logo_url: string;
    base_url: string;
    youtube_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
}

/**
 * Config store state interface
 */
interface ConfigState {
    baseUrl: string | null;
    companyConfig: CompanyConfig | null;
    setConfig: (data: { data: CompanyConfig }) => void;
    clearConfig: () => void;
}

/**
 * Global configuration store
 * Manages base URL and company configuration from Submit screen
 */
export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            baseUrl: null,
            companyConfig: null,

            setConfig: (result) => {
                set({
                    baseUrl: result.data.base_url,
                    companyConfig: result.data,
                });
            },

            clearConfig: () => {
                set({
                    baseUrl: null,
                    companyConfig: null,
                });
            },
        }),
        {
            name: 'company-config-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
