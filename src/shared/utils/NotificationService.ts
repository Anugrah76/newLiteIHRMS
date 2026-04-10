import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
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
     * Schedule Daily Goal Reminders
     * - Morning: 10:00 AM - "Set your goal for the day!"
     * - Evening: 6:00 PM - "Did you complete your goal?"
     */
    scheduleDailyGoalReminders: async () => {
        try {
            // Cancel any existing daily goal notifications
            const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const goalNotifications = allNotifications.filter(
                n => n.content.title?.includes('Goal') || n.identifier.includes('daily_goal')
            );

            for (const notification of goalNotifications) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }

            // Calculate seconds until next 10 AM
            const now = new Date();
            const morningTime = new Date();
            morningTime.setHours(10, 0, 0, 0);
            if (now.getTime() >= morningTime.getTime()) {
                morningTime.setDate(morningTime.getDate() + 1);
            }
            const secondsUntilMorning = Math.floor((morningTime.getTime() - now.getTime()) / 1000);

            // Morning Reminder - 10:00 AM
            console.log('📅 Scheduling Daily Goal Morning Reminder (10:00 AM)...');
            await Notifications.scheduleNotificationAsync({
                identifier: 'daily_goal_morning',
                content: {
                    title: "🎯 Set Your Goal for Today!",
                    body: "Take a moment to set your main goal for the day.",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsUntilMorning,
                    repeats: true,
                },
            });

            // Calculate seconds until next 6 PM
            const eveningTime = new Date();
            eveningTime.setHours(18, 0, 0, 0);
            if (now.getTime() >= eveningTime.getTime()) {
                eveningTime.setDate(eveningTime.getDate() + 1);
            }
            const secondsUntilEvening = Math.floor((eveningTime.getTime() - now.getTime()) / 1000);

            // Evening Reminder - 6:00 PM
            console.log('📅 Scheduling Daily Goal Evening Reminder (6:00 PM)...');
            await Notifications.scheduleNotificationAsync({
                identifier: 'daily_goal_evening',
                content: {
                    title: "✅ Goal Check-In",
                    body: "Did you complete your goal for today?",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsUntilEvening,
                    repeats: true,
                },
            });

            console.log('✅ Daily Goal reminders scheduled successfully');
        } catch (error) {
            console.error('❌ Error scheduling daily goal reminders:', error);
        }
    },

    /**
     * Cancel Daily Goal Reminders
     */
    cancelDailyGoalReminders: async () => {
        try {
            await Notifications.cancelScheduledNotificationAsync('daily_goal_morning');
            await Notifications.cancelScheduledNotificationAsync('daily_goal_evening');
            console.log('✅ Daily Goal reminders cancelled');
        } catch (error) {
            console.error('❌ Error cancelling daily goal reminders:', error);
        }
    },

    /**
     * Cancel all notifications
     */
    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
