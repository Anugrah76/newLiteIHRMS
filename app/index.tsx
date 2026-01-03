import { Redirect } from 'expo-router';
import { useAuthStore } from '@shared/store';

/**
 * Root index - redirects to appropriate screen based on auth state
 */
export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/dashboard" />;
    }

    return <Redirect href="/(auth)/submit" />;
}
