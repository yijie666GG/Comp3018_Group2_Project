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

export default function LoginScreen() {
  const { colors, isDark, setMode } = useTheme();
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)/home');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      await login(email, password);

      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Login error:', error);

      Alert.alert(
        'Login failed',
        'Incorrect email or password. Please try again.'
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.log('Google login error:', error);

      Alert.alert(
        'Google login failed',
        'Unable to sign in with Google. Please try again.'
      );
    }
  };

  const handleThemeToggle = async () => {
    await setMode(isDark ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>$</Text>
              </View>

              <Text style={styles.brandText}>
                Smart Expense
              </Text>
            </View>

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

          <View style={styles.formSection}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to manage receipts, categories and financial years.
            </Text>

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

            <View style={styles.passwordHeader}>
              <Text style={styles.label}>
                Password
              </Text>

              <Pressable
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.link}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedText}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>
                Log in
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                or continue with
              </Text>

              <View style={styles.divider} />
            </View>

            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.googleText}>
                G
              </Text>

              <Text style={styles.googleButtonText}>
                Google
              </Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don&apos;t have an account?{' '}
              </Text>

              <Pressable
                onPress={() => router.push('/register')}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
    },

    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 28,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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

    themeButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    formSection: {
      marginTop: 70,
    },

    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      marginBottom: 28,
    },

    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 8,
    },

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

    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    link: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },

    loginButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },

    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 22,
    },

    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },

    dividerText: {
      fontSize: 12,
      color: colors.mutedText,
    },

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

    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },

    registerText: {
      fontSize: 12,
      color: colors.secondaryText,
    },
  });