import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User interface
 * Matches the login API response structure
 */
export interface User {
    indo_code: string;
    fullName: string;
    emp_code: string;
    email: string;
    profile_photo?: string;
    api_key: string;
    // Add other user fields as needed
    [key: string]: any;
}

/**
 * Auth store state interface
 */
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

/**
 * Authentication store
 * Manages user state and authentication status
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
