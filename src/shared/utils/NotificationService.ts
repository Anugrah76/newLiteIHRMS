import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Service to manage local notifications
 */
export const NotificationService = {
    /**
     * persistent notification listener subscription
     */
    notificationListener: null as any,
    responseListener: null as any,

    /**
     * Register for push notifications and request permissions
     */
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // We calculate the Expo push token here if we need it later for remote push
        // token = (await Notifications.getExpoPushTokenAsync({ projectId: '...' })).data;

        return token;
    },

    /**
     * Schedule the Weekly Timesheet Reminder
     * @param isDebug - If true, schedules for every minute for testing.
     */
    scheduleTimesheetReminder: async (isDebug = false) => {
        // Cancel existing scheduled notifications to avoid duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (isDebug) {
            console.log('🔔 Scheduling DEBUG notification (Every 60s)...');
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏳ Timesheet Reminder (Test)",
                    body: "This is a test reminder to fill your timesheet!",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 100000,
                    repeats: true,
                },
            });
        } else {
            console.log('📅 Scheduling WEEKLY notification (Friday 4PM)...');
            // Schedule for Friday at 4 PM (16:00)
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "📝 Weekly Timesheet Reminder",
                    body: "Don't forget to submit your timesheet before the weekend!",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    weekday: 6, // 1 = Sunday, 6 = Friday (in Expo logic? Wait, let's verify docs or standard JS Date)
                    // Expo `CalendarTriggerInput`: weekday is 1-7 where 1 is Sunday
                    // So Friday = 6. Correct.
                    hour: 16,
                    minute: 0,
                    repeats: true,
                },
            });
        }
    },

    /**
     * Cancel all notifications
     */
    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
