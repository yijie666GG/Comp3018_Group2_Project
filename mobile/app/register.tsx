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

export default function RegisterScreen() {
  const { colors, isDark, setMode } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleThemeToggle = async () => {
    await setMode(isDark ? 'light' : 'dark');
  };

  const handleGoogleSignup = async () => {
    try {
      await googleLogin();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Google signup error:', error);

      Alert.alert(
        'Google sign-up failed',
        'Unable to continue with Google. Please try again.'
      );
    }
  };

  const handleCreateAccount = async () => {
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

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.'
      );
      return;
    }

    try {
      await register(name, email, password);

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

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists. Please log in or continue with Google.'
        );
        return;
      }

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
        <View style={styles.topRow}>
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

        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>$</Text>
          </View>

          <Text style={styles.brandText}>
            Smart Expense
          </Text>
        </View>

        <Text style={styles.title}>
          Create account
        </Text>

        <Text style={styles.subtitle}>
          Start managing your expenses and financial records.
        </Text>

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

        <View style={styles.dividerRow}>
          <View style={styles.divider} />

          <Text style={styles.dividerText}>
            or
          </Text>

          <View style={styles.divider} />
        </View>

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

        <Pressable
          style={styles.createButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createButtonText}>
            Create account
          </Text>
        </Pressable>

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

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

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

    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    logo: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    logoText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },

    brandText: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },

    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      marginTop: 34,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      marginBottom: 24,
    },

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

    googleText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },

    googleButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 20,
    },

    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },

    dividerText: {
      color: colors.mutedText,
      fontSize: 12,
    },

    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 8,
    },

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

    createButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 22,
    },

    loginText: {
      color: colors.secondaryText,
      fontSize: 12,
    },

    link: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
  });