import { Redirect } from 'expo-router';
import { useAuthStore } from '@shared/store';
import { View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if a user object has the minimum required fields to be valid.
 * A "zombie" user like {profile_photo:""} will fail this check.
 */
function isValidUser(user: any): boolean {
    return !!(user && user.indo_code && user.api_key);
}

/**
 * Root index - redirects to appropriate screen based on auth state
 */
export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const didCleanup = useRef(false);

    // Debug: dump raw AsyncStorage on mount
    useEffect(() => {
        const debugAsyncStorage = async () => {
            try {
                const authRaw = await AsyncStorage.getItem('auth-storage');
                console.log('[INDEX] ===== RAW AsyncStorage "auth-storage" =====');
                console.log('[INDEX]', authRaw);
            } catch (e) {
                console.error('[INDEX] AsyncStorage debug error:', e);
            }
        };
        debugAsyncStorage();
    }, []);

    // Auto-cleanup: if hydration says "authenticated" but user data is corrupt, force logout
    useEffect(() => {
        if (hasHydrated && isAuthenticated && !isValidUser(user) && !didCleanup.current) {
            didCleanup.current = true;
            console.log('[INDEX] ⚠️ CORRUPT SESSION DETECTED — user object is missing required fields. Forcing logout.');
            console.log('[INDEX] Corrupt user object:', JSON.stringify(user));
            logout();
        }
    }, [hasHydrated, isAuthenticated, user, logout]);

    // Debug: log every render
    console.log('[INDEX] RENDER', {
        hasHydrated,
        isAuthenticated,
        hasUser: !!user,
        isValidUser: isValidUser(user),
        userName: user?.fullName || 'null',
        userIndoCode: user?.indo_code || 'null',
    });

    if (!hasHydrated) {
        console.log('[INDEX] → Showing LOADING spinner (waiting for hydration)');
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10, color: '#999' }}>Loading auth...</Text>
            </View>
        );
    }

    // Only redirect to dashboard if BOTH isAuthenticated AND user data is valid
    if (isAuthenticated && isValidUser(user)) {
        console.log('[INDEX] → REDIRECTING to DASHBOARD (valid session, user=' + user?.fullName + ')');
        return <Redirect href="/(tabs)/dashboard" />;
    }

    console.log('[INDEX] → REDIRECTING to AUTH/SUBMIT (isAuthenticated=' + isAuthenticated + ', validUser=' + isValidUser(user) + ')');
    return <Redirect href="/(auth)/submit" />;
}
