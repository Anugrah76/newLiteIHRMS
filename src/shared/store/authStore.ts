import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CompanyConfig } from '@shared/types';

/**
 * User interface — matches the login API response structure
 */
export interface User {
    indo_code: string;
    fullName: string;
    emp_code: string;
    email: string;
    profile_photo?: string;
    api_key: string;
    token?: string | null;
    username?: string;
    user_type?: string;
    manager_id?: string;
    manager_indo_code?: string;
    [key: string]: any;
}

/**
 * Auth store state interface — single source of truth for auth
 */
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    companyConfig: CompanyConfig | null;

    // Actions
    setAuth: (user: User, token?: string) => void;
    setUser: (user: User | null) => void;  // kept for backward compat
    setCompanyConfig: (config: CompanyConfig) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

/**
 * THE one and only authentication store.
 * All screens must import from '@shared/store', NOT from '@features/auth/store/authSlice'.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            companyConfig: null,
            _hasHydrated: false,

            // Called after a successful login
            setAuth: (user, token = undefined) => {
                console.log('[AUTH_STORE] setAuth called', { userName: user?.fullName, hasToken: !!token });
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },

            // Alias kept so existing code that calls setUser() still works
            setUser: (user) => {
                console.log('[AUTH_STORE] setUser called', { userName: user?.fullName, willBeAuth: !!user });
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            setCompanyConfig: (config) => set({ companyConfig: config }),

            // Called on logout — clears everything
            logout: () => {
                console.log('[AUTH_STORE] logout called');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            // Merge partial updates into existing user object
            updateUser: (newUser) => set((state) => ({
                user: state.user ? { ...state.user, ...newUser } : null,
            })),

            // Called by onRehydrateStorage — tells us hydration is done
            setHasHydrated: (hydrated) => {
                const currentState = get();
                console.log('[AUTH_STORE] setHasHydrated called', {
                    hydrated,
                    isAuthenticated: currentState.isAuthenticated,
                    hasUser: !!currentState.user,
                    userName: currentState.user?.fullName || 'null',
                    token: currentState.token ? 'exists' : 'null',
                });
                set({ _hasHydrated: hydrated });
            },
        }),
        {
            name: 'auth-storage',  // ← single key in AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                console.log('[AUTH_STORE] onRehydrateStorage: STARTING hydration from AsyncStorage');
                return (state, error) => {
                    if (error) {
                        console.error('[AUTH_STORE] onRehydrateStorage ERROR:', error);
                    }
                    console.log('[AUTH_STORE] onRehydrateStorage COMPLETE', {
                        isAuthenticated: state?.isAuthenticated,
                        hasUser: !!state?.user,
                        userName: state?.user?.fullName || 'null',
                    });
                    state?.setHasHydrated(true);
                };
            },
        }
    )
);
