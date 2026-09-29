import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { resetPassword } from '../firebase/forgot-password';
import { useTheme } from '../theme/ThemeContext';

/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email
 * for their Smart Expense account.
 *
 * This screen:
 * - Accepts the user's email address
 * - Sends a password reset request
 * - Displays success or error messages
 * - Provides navigation back to the login screen
 * - Allows the user to quickly switch between light and dark mode
 */
export default function ForgotPasswordScreen() {
  // Get the current theme information and theme controls.
  const { colors, isDark, setMode } = useTheme();

  // Create styles using the currently active theme colours.
  const styles = createStyles(colors);

  // Email address entered by the user.
  const [email, setEmail] = useState('');

  /**
   * Switch between light and dark appearance modes.
   *
   * If dark mode is currently active, switch to light mode.
   * Otherwise, switch to dark mode.
   */
  const handleThemeToggle = async () => {
    await setMode(isDark ? 'light' : 'dark');
  };

  /**
   * Send a password reset request for the entered email.
   *
   * The email field is validated before the reset request
   * is passed to the Firebase password reset service.
   */
  const handleReset = async () => {
    // Prevent a reset request when no email has been entered.
    if (!email.trim()) {
      Alert.alert(
        'Missing email',
        'Please enter your email address.'
      );

      return;
    }

    try {
      // Send the password reset email.
      await resetPassword(email);

      /**
       * Inform the user that the reset email was sent.
       * Return to the previous screen after confirmation.
       */
      Alert.alert(
        'Reset email sent',
        'Check your email for the password reset link.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Password reset error:',
        error
      );

      // Display an error if the reset request fails.
      Alert.alert(
        'Reset failed',
        'Unable to send the reset email. Please check the email and try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Top navigation and appearance controls */}
        <View style={styles.topRow}>
          {/* Return to the previous screen */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </Pressable>

          {/* Toggle between light and dark mode */}
          <TouchableOpacity
            style={styles.themeButton}
            onPress={handleThemeToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                isDark
                  ? 'sunny-outline'
                  : 'moon-outline'
              }
              size={21}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Smart Expense branding */}
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>
              $
            </Text>
          </View>

          <Text style={styles.brandText}>
            Smart Expense
          </Text>
        </View>

        {/* Password reset heading */}
        <Text style={styles.title}>
          Reset your password
        </Text>

        {/* Password reset instructions */}
        <Text style={styles.subtitle}>
          Enter the email linked to your account and we&apos;ll send you a reset link.
        </Text>

        {/* Email input */}
        <Text style={styles.label}>
          Email address
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@example.com"
          placeholderTextColor={
            colors.mutedText
          }
        />

        {/* Send password reset email */}
        <Pressable
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>
            Send reset link
          </Text>
        </Pressable>

        {/* Return to the login screen */}
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.backToLogin}>
            Back to login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Forgot Password screen.
 *
 * Colours are provided by ThemeContext so the screen
 * automatically adapts to the selected application theme.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Main page content.
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 18,
    },

    // Top row containing navigation and theme controls.
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    // Back navigation button.
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.softBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Light/dark mode toggle button.
    themeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.softBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Smart Expense branding container.
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    // Application logo container.
    logo: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Dollar symbol displayed inside the logo.
    logoText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },

    // Application name.
    brandText: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },

    // Main screen heading.
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      marginTop: 60,
      marginBottom: 10,
    },

    // Password reset instructions.
    subtitle: {
      color: colors.secondaryText,
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 28,
    },

    // Email field label.
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 8,
    },

    // Email address input.
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 15,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      color: colors.text,
    },

    // Main password reset action button.
    resetButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 18,
    },

    // Text displayed inside the reset button.
    resetButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },

    // Link used to return to the login screen.
    backToLogin: {
      color: colors.primary,
      textAlign: 'center',
      fontWeight: '700',
      fontSize: 13,
      marginTop: 22,
    },
  });