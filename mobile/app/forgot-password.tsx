import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { resetPassword } from '../firebase/forgot-password';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>$</Text>
          </View>
          <Text style={styles.brandText}>Smart Expense</Text>
        </View>

        <Text style={styles.title}>Reset your password</Text>

        <Text style={styles.subtitle}>
          Enter the email linked to your account and we&apos;ll send you a reset link.
        </Text>

        <Text style={styles.label}>Email address</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@example.com"
        />

        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Send reset link</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backToLogin}>Back to login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F6FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  backText: {
    fontSize: 28,
    color: '#172033',
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
    backgroundColor: '#2563EB',
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
    color: '#172033',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172033',
    marginTop: 60,
    marginBottom: 10,
  },

  subtitle: {
    color: '#778198',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#556078',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E7EBF3',
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: '#FBFCFE',
    color: '#172033',
  },

  resetButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563EB',
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
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 22,
  },
});