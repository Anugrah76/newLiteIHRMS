import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CompanyConfig } from '@shared/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    companyConfig: CompanyConfig | null;

    // Actions
    setAuth: (user: User, token: string) => void;
    setCompanyConfig: (config: CompanyConfig) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            companyConfig: null,

            setAuth: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            setCompanyConfig: (config) => set({ companyConfig: config }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),

            updateUser: (newUser) => set((state) => ({
                user: state.user ? { ...state.user, ...newUser } : null
            })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
