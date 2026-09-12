import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

import { useTheme } from '../theme/ThemeContext';

export default function PersonalInformationScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPersonalInformation = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          Alert.alert(
            'Not signed in',
            'Please sign in again to view your account information.'
          );
          return;
        }

        setEmail(user.email || '');

        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setName(data.name || '');
          setEmail(data.email || user.email || '');
        }
      } catch (error) {
        console.log('Load personal information error:', error);

        Alert.alert(
          'Unable to load information',
          'Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPersonalInformation();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        'Not signed in',
        'Please sign in again before saving.'
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Missing name',
        'Please enter your full name.'
      );
      return;
    }

    try {
      setSaving(true);

      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          uid: user.uid,
          name: name.trim(),
          email: user.email || email,
        },
        { merge: true }
      );

      Alert.alert(
        'Saved',
        'Personal information has been saved successfully.'
      );
    } catch (error) {
      console.log('Save personal information error:', error);

      Alert.alert(
        'Unable to save',
        'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Personal information
          </Text>

          <View style={styles.spacer} />
        </View>

        <Text style={styles.description}>
          Update your personal account details.
        </Text>

        <Text style={styles.label}>
          Full name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={
            loading ? 'Loading...' : 'Enter your full name'
          }
          placeholderTextColor={colors.mutedText}
          editable={!loading}
        />

        <Text style={styles.label}>
          Email address
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.disabledInput,
          ]}
          value={email}
          placeholder="name@example.com"
          placeholderTextColor={colors.mutedText}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />

        <Text style={styles.emailHelper}>
          Your email is managed by your sign-in method.
        </Text>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (saving || loading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={saving || loading}
        >
          <Text style={styles.saveText}>
            {saving ? 'Saving...' : 'Save changes'}
          </Text>
        </TouchableOpacity>
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
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 40,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },

    spacer: {
      width: 42,
    },

    description: {
      fontSize: 13,
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
      color: colors.text,
      marginBottom: 20,
    },

    disabledInput: {
      backgroundColor: colors.softBackground,
      color: colors.secondaryText,
      marginBottom: 8,
    },

    emailHelper: {
      fontSize: 11,
      color: colors.mutedText,
      marginBottom: 20,
    },

    saveButton: {
      height: 54,
      backgroundColor: colors.primary,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });