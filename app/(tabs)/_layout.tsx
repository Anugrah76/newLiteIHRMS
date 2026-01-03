import { Tabs } from 'expo-router';
import { Home, Calendar, FileText, User, Layers } from 'lucide-react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@shared/theme';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    height: Platform.OS === 'ios' ? 85 : 100,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
                    paddingTop: 8,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Home width={size} height={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Attendance',
                    tabBarIcon: ({ color, size }) => <Calendar width={size} height={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="unified-calendar"
                options={{
                    title: 'Unified',
                    tabBarIcon: ({ color, size }) => <Layers width={size} height={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="timesheet"
                options={{
                    title: 'Timesheet',
                    tabBarIcon: ({ color, size }) => <FileText width={size} height={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="outProfile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User width={size} height={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
