import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const FINANCIAL_YEAR_NOTIFICATION_ID =
    'financial-year-reminder';

const ANDROID_CHANNEL_ID =
    'financial-year-reminders';

export async function configureFinancialYearNotifications() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
            ANDROID_CHANNEL_ID,
            {
                name: 'Financial year reminders',
                importance:
                    Notifications.AndroidImportance.DEFAULT,
            }
        );
    }
}

export async function requestNotificationPermission() {
    const currentPermissions =
        await Notifications.getPermissionsAsync();

    if (currentPermissions.granted) {
        return true;
    }

    const requestedPermissions =
        await Notifications.requestPermissionsAsync();

    return requestedPermissions.granted;
}

export async function scheduleFinancialYearReminder() {
    await configureFinancialYearNotifications();

    const permissionGranted =
        await requestNotificationPermission();

    if (!permissionGranted) {
        return false;
    }

    // Prevent duplicate reminders.
    await cancelFinancialYearReminder();

    const trigger:
        Notifications.YearlyTriggerInput = {
        type:
            Notifications.SchedulableTriggerInputTypes.YEARLY,

        // JavaScript month numbers start at 0.
        // June = 5.
        month: 5,

        // Reminder on 25 June.
        day: 25,

        // 9:00 AM.
        hour: 9,
        minute: 0,

        ...(Platform.OS === 'android'
            ? {
                channelId: ANDROID_CHANNEL_ID,
            }
            : {}),
    };

    const identifier =
        await Notifications.scheduleNotificationAsync({
            identifier:
                FINANCIAL_YEAR_NOTIFICATION_ID,

            content: {
                title: 'Financial year reminder',
                body:
                    'The new financial year starts on 1 July. Review your expenses and prepare for the new financial year.',
                sound: 'default',
            },

            trigger,
        });

    console.log(
        'Financial year notification scheduled:',
        identifier
    );

    return true;
}

export async function cancelFinancialYearReminder() {
    try {
        await Notifications.cancelScheduledNotificationAsync(
            FINANCIAL_YEAR_NOTIFICATION_ID
        );

        console.log(
            'Financial year notification cancelled'
        );
    } catch (error) {
        console.log(
            'No financial year notification to cancel:',
            error
        );
    }
}

export async function getScheduledFinancialYearReminder() {
    const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

    return scheduled.find(
        (notification) =>
            notification.identifier ===
            FINANCIAL_YEAR_NOTIFICATION_ID
    );
}

