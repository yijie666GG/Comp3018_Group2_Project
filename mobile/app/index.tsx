import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import { login } from '../firebase/login';
import { auth } from '../firebase/firebase';
import { googleLogin } from '../firebase/google-login';

import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '../theme/ThemeContext';

/**
 * Login Screen
 *
 * Main authentication screen for the Smart Expense application.
 *
 * Users can:
 * - Sign in using email and password
 * - Sign in using Google
 * - Navigate to password recovery
 * - Navigate to account registration
 * - Switch between light and dark mode
 *
 * The screen also listens for Firebase authentication state
 * changes and automatically redirects authenticated users
 * to the main application.
 */
export default function LoginScreen() {
  // Get the current theme information and theme controls.
  const { colors, isDark, setMode } = useTheme();

  // Create styles using the currently active theme colours.
  const styles = createStyles(colors);

  // Login form values.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Listen for Firebase authentication state changes.
   *
   * If Firebase detects an authenticated user, redirect
   * directly to the Home screen.
   *
   * The listener is removed automatically when this
   * screen is unmounted.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          router.replace('/(tabs)/home');
        }
      }
    );

    return unsubscribe;
  }, []);

  /**
   * Sign in using email and password.
   *
   * The fields are validated before the login request
   * is passed to the Firebase authentication service.
   */
  const handleLogin = async () => {
    // Ensure both email and password have been entered.
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );

      return;
    }

    try {
      // Authenticate the user using email and password.
      await login(email, password);

      // Redirect to the Home screen after successful login.
      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Login error:', error);

      // Display a user-friendly message if authentication fails.
      Alert.alert(
        'Login failed',
        'Incorrect email or password. Please try again.'
      );
    }
  };

  /**
   * Sign in using the user's Google account.
   *
   * Google authentication is handled by the
   * googleLogin service.
   */
  const handleGoogleLogin = async () => {
    try {
      // Authenticate using Google Sign-In.
      await googleLogin();

      // Redirect to the Home screen after successful login.
      router.replace('/(tabs)/home');
    } catch (error) {
      console.log(
        'Google login error:',
        error
      );

      Alert.alert(
        'Google login failed',
        'Unable to sign in with Google. Please try again.'
      );
    }
  };

  /**
   * Quickly switch between light and dark appearance modes.
   */
  const handleThemeToggle = async () => {
    await setMode(
      isDark ? 'light' : 'dark'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*
        Adjust the interface when the keyboard appears.

        On iOS, padding is applied to prevent the keyboard
        from covering the login form.
      */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.content}>
          {/* Application branding and theme control */}
          <View style={styles.topRow}>
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

          {/* Login form */}
          <View style={styles.formSection}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to manage receipts, categories and financial years.
            </Text>

            {/* Email address input */}
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

            {/* Password label and recovery link */}
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>
                Password
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    '/forgot-password'
                  )
                }
              >
                <Text style={styles.link}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {/* Password input */}
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={
                colors.mutedText
              }
            />

            {/* Email and password login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                Log in
              </Text>
            </TouchableOpacity>

            {/* Authentication method divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                or continue with
              </Text>

              <View style={styles.divider} />
            </View>

            {/* Google authentication */}
            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.googleText}>
                G
              </Text>

              <Text
                style={
                  styles.googleButtonText
                }
              >
                Google
              </Text>
            </Pressable>

            {/* Navigate to account registration */}
            <View style={styles.registerRow}>
              <Text
                style={styles.registerText}
              >
                Don&apos;t have an account?{' '}
              </Text>

              <Pressable
                onPress={() =>
                  router.push('/register')
                }
              >
                <Text style={styles.link}>
                  Create account
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Login screen.
 *
 * Colours are provided by ThemeContext so the interface
 * automatically adapts to the selected application theme.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Keyboard-aware screen container.
    container: {
      flex: 1,
    },

    // Main page content.
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 28,
    },

    // Top section containing branding and theme control.
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    // Smart Expense branding container.
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    // Application logo.
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

    // Light/dark mode toggle button.
    themeButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Main login form section.
    formSection: {
      marginTop: 70,
    },

    // Login screen heading.
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },

    // Description below the login heading.
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      marginBottom: 28,
    },

    // Form field label.
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 8,
    },

    // Shared email and password input style.
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 15,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      fontSize: 14,
      color: colors.text,
      marginBottom: 16,
    },

    // Password label and password recovery link.
    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // Shared navigation link style.
    link: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },

    // Main login action button.
    loginButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },

    // Text displayed inside the login button.
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    // Divider between standard and Google authentication.
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 22,
    },

    // Horizontal divider line.
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },

    // Divider description.
    dividerText: {
      fontSize: 12,
      color: colors.mutedText,
    },

    // Google authentication button.
    googleButton: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
      backgroundColor: colors.card,
    },

    // Google symbol.
    googleText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },

    // Google authentication button text.
    googleButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    // Registration prompt container.
    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },

    // Registration prompt text.
    registerText: {
      fontSize: 12,
      color: colors.secondaryText,
    },
  });