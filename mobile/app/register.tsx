import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { register } from '../firebase/register';
import { googleLogin } from '../firebase/google-login';
import { useTheme } from '../theme/ThemeContext';

/**
 * Register Screen
 *
 * Allows new users to create a Smart Expense account.
 *
 * Users can:
 * - Register using name, email and password
 * - Sign up using Google
 * - Switch between light and dark mode
 * - Return to the login screen
 *
 * Basic validation is performed before account creation.
 */
export default function RegisterScreen() {
  // Get the current theme information and theme controls.
  const { colors, isDark, setMode } = useTheme();

  // Create styles using the currently active theme colours.
  const styles = createStyles(colors);

  // Registration form values.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Quickly switch between light and dark appearance modes.
   */
  const handleThemeToggle = async () => {
    await setMode(isDark ? 'light' : 'dark');
  };

  /**
   * Create or access an account using Google authentication.
   */
  const handleGoogleSignup = async () => {
    try {
      // Authenticate the user using Google Sign-In.
      await googleLogin();

      // Redirect to the Home screen after successful authentication.
      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Google signup error:', error);

      Alert.alert(
        'Google sign-up failed',
        'Unable to continue with Google. Please try again.'
      );
    }
  };

  /**
   * Create a new account using name, email and password.
   *
   * All fields are validated before the registration
   * request is sent.
   */
  const handleCreateAccount = async () => {
    // Ensure all registration fields have been completed.
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing information',
        'Please complete all fields.'
      );
      return;
    }

    // Ensure both password fields contain the same value.
    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.'
      );
      return;
    }

    try {
      // Create the new user account.
      await register(name, email, password);

      /**
       * Inform the user that registration was successful.
       * Continue to the Home screen after confirmation.
       */
      Alert.alert(
        'Account created',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () =>
              router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error: any) {
      console.log('Register error:', error);

      /**
       * Handle the Firebase error returned when an
       * account already exists for the entered email.
       */
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists. Please log in or continue with Google.'
        );
        return;
      }

      // Display a general error for other registration failures.
      Alert.alert(
        'Registration failed',
        'Unable to create your account. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back navigation and appearance controls */}
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
            <Text style={styles.logoText}>$</Text>
          </View>

          <Text style={styles.brandText}>
            Smart Expense
          </Text>
        </View>

        {/* Registration heading */}
        <Text style={styles.title}>
          Create account
        </Text>

        <Text style={styles.subtitle}>
          Start managing your expenses and financial records.
        </Text>

        {/* Google account registration */}
        <Pressable
          style={styles.googleButton}
          onPress={handleGoogleSignup}
        >
          <Text style={styles.googleText}>
            G
          </Text>

          <Text style={styles.googleButtonText}>
            Continue with Google
          </Text>
        </Pressable>

        {/* Divider between Google and email registration */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />

          <Text style={styles.dividerText}>
            or
          </Text>

          <View style={styles.divider} />
        </View>

        {/* Full name input */}
        <Text style={styles.label}>
          Full name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Alex Smith"
          placeholderTextColor={colors.mutedText}
        />

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
          placeholderTextColor={colors.mutedText}
        />

        {/* Password input */}
        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Create a password"
          placeholderTextColor={colors.mutedText}
        />

        {/* Password confirmation input */}
        <Text style={styles.label}>
          Confirm password
        </Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter password"
          placeholderTextColor={colors.mutedText}
        />

        {/* Create the new account */}
        <Pressable
          style={styles.createButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createButtonText}>
            Create account
          </Text>
        </Pressable>

        {/* Return to the login screen */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
          </Text>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>
              Log in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Register screen.
 *
 * Colours are provided by ThemeContext so the interface
 * automatically follows the selected application theme.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Scrollable registration content.
    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },

    // Top navigation and theme controls.
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
      backgroundColor: colors.softBackground,
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
      backgroundColor: colors.softBackground,
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

    // Registration screen heading.
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      marginTop: 34,
      marginBottom: 8,
    },

    // Registration screen description.
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      marginBottom: 24,
    },

    // Google registration button.
    googleButton: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
    },

    // Google symbol.
    googleText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },

    // Google registration button text.
    googleButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    // Divider between registration methods.
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 20,
    },

    // Horizontal divider line.
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },

    // Divider text.
    dividerText: {
      color: colors.mutedText,
      fontSize: 12,
    },

    // Registration form field label.
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 8,
    },

    // Shared registration input style.
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 15,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      color: colors.text,
      marginBottom: 15,
    },

    // Main account creation button.
    createButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },

    // Account creation button text.
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    // Existing account login section.
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 22,
    },

    // Login prompt text.
    loginText: {
      color: colors.secondaryText,
      fontSize: 12,
    },

    // Login navigation link.
    link: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
  });