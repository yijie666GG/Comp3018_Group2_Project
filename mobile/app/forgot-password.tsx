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

export default function ForgotPasswordScreen() {
  const { colors, isDark, setMode } = useTheme();
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');

  const handleThemeToggle = async () => {
    await setMode(isDark ? 'light' : 'dark');
  };

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Missing email',
        'Please enter your email address.'
      );
      return;
    }

    try {
      await resetPassword(email);

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
      console.log('Password reset error:', error);

      Alert.alert(
        'Reset failed',
        'Unable to send the reset email. Please check the email and try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
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
          Reset your password
        </Text>

        <Text style={styles.subtitle}>
          Enter the email linked to your account and we&apos;ll send you a reset link.
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

        <Pressable
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>
            Send reset link
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backToLogin}>
            Back to login
          </Text>
        </Pressable>
      </View>
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
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 18,
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
      marginTop: 60,
      marginBottom: 10,
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: 14,
      lineHeight: 21,
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
      color: colors.text,
    },

    resetButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 18,
    },

    resetButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },

    backToLogin: {
      color: colors.primary,
      textAlign: 'center',
      fontWeight: '700',
      fontSize: 13,
      marginTop: 22,
    },
  });