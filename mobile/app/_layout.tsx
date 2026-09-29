import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { ThemeProvider } from '../theme/ThemeContext';

/**
 * Configure how notifications are displayed while
 * the application is running in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Display the notification as a banner.
    shouldShowBanner: true,

    // Add the notification to the notification list.
    shouldShowList: true,

    // Play the notification sound.
    shouldPlaySound: true,

    // Do not update the application badge number.
    shouldSetBadge: false,
  }),
});

/**
 * Root Layout
 *
 * This is the main navigation layout for the Smart Expense application.
 *
 * It:
 * - Provides the application-wide theme through ThemeProvider
 * - Defines the main Stack navigation structure
 * - Hides the default navigation header
 * - Includes authentication and main application routes
 *
 * Notification behaviour is also configured in this file.
 */
export default function RootLayout() {
  return (
    // Make theme settings available throughout the application.
    <ThemeProvider>
      <Stack
        screenOptions={{
          // Hide the default Expo Router header on all screens.
          headerShown: false,
        }}
      >
        {/* Initial login / entry screen */}
        <Stack.Screen name="index" />

        {/* User registration screen */}
        <Stack.Screen name="register" />

        {/* Password recovery screen */}
        <Stack.Screen name="forgot-password" />

        {/* Main application tab navigation */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}