import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { queryClient } from '@shared/api/queryClient';
import { ToastProvider } from '@shared/components/Toast';
import { NotificationService } from '@shared/utils/NotificationService';

export default function RootLayout() {
    console.log('[ROOT_LAYOUT] RootLayout MOUNTED');
    useEffect(() => {
        const initNotifications = async () => {
            await NotificationService.registerForPushNotificationsAsync();

            // Notification Listener (Optional: Handle foreground notifications)
            // NotificationService.notificationListener.current = Notifications.addNotificationReceivedListener(notification => { ... });

            // Schedule Reminder (Debug Mode: Every Minute)
            await NotificationService.scheduleTimesheetReminder(true);
        };

        initNotifications();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>

                <StatusBar style="auto" />
            </ToastProvider>
        </QueryClientProvider>
    );
}
