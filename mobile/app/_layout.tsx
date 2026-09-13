import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { ThemeProvider } from '../theme/ThemeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}