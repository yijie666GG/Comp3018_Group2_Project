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

export default function LoginScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>$</Text>
            </View>

            <Text style={styles.brandText}>Smart Expense</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to manage receipts, categories and financial years.
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

            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>

              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>or continue with</Text>

              <View style={styles.divider} />
            </View>

            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.googleText}>G</Text>
              <Text style={styles.googleButtonText}>Google</Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don&apos;t have an account?{' '}
              </Text>

              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.link}>Create account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
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

  formSection: {
    marginTop: 70,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#778198',
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
    fontSize: 14,
    color: '#172033',
    marginBottom: 16,
  },

  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  link: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563EB',
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
    backgroundColor: '#E7EBF3',
  },

  dividerText: {
    fontSize: 12,
    color: '#A0A8B7',
  },

  googleButton: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E7EBF3',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  googleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172033',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  registerText: {
    fontSize: 12,
    color: '#778198',
  },
});