import {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import {
  getPersonalInformation,
  savePersonalInformation,
} from '../firebase/personal-information';

import {
  deleteUserAccount,
} from '../firebase/delete-user';

import { auth } from '../firebase/firebase';

import {
  useTheme,
} from '../theme/ThemeContext';

export default function PersonalInformationScreen() {
  const { colors } = useTheme();

  const styles =
    createStyles(colors);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [usesPassword, setUsesPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    const loadPersonalInformation =
      async () => {
        try {
          const information =
            await getPersonalInformation();

          setName(
            information.name
          );

          setEmail(
            information.email
          );

          const user =
            auth.currentUser;

          const providerIds =
            user?.providerData.map(
              (provider) =>
                provider.providerId
            ) || [];

          setUsesPassword(
            providerIds.includes(
              'password'
            )
          );
        } catch (error) {
          console.log(
            'Load personal information error:',
            error
          );

          Alert.alert(
            'Unable to load information',
            'Please sign in again and try again.'
          );
        } finally {
          setLoading(false);
        }
      };

    loadPersonalInformation();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Missing name',
        'Please enter your full name.'
      );

      return;
    }

    try {
      setSaving(true);

      await savePersonalInformation(
        name
      );

      Alert.alert(
        'Saved',
        'Personal information has been saved successfully.'
      );
    } catch (error) {
      console.log(
        'Save personal information error:',
        error
      );

      Alert.alert(
        'Unable to save',
        'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      usesPassword &&
      !password.trim()
    ) {
      Alert.alert(
        'Password required',
        'Please enter your password before deleting your account.'
      );

      return;
    }

    Alert.alert(
      'Delete account?',
      'This will permanently delete your account and saved data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete account',
          style: 'destructive',

          onPress: async () => {
            try {
              setDeleting(true);

              await deleteUserAccount(
                password
              );

              Alert.alert(
                'Account deleted',
                'Your account has been deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/');
                    },
                  },
                ]
              );
            } catch (error) {
              console.log(
                'Delete account error:',
                error
              );

              let message =
                'Unable to delete your account.';

              if (error instanceof Error) {
                if (
                  error.message.includes(
                    'auth/invalid-credential'
                  ) ||
                  error.message.includes(
                    'auth/wrong-password'
                  )
                ) {
                  message =
                    'The password you entered is incorrect. Please try again.';
                } else if (
                  error.message.includes(
                    'auth/requires-recent-login'
                  )
                ) {
                  message =
                    'For security, please sign in again before deleting your account.';
                } else {
                  message =
                    error.message;
                }
              }

              Alert.alert(
                'Unable to delete account',
                message
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text
            style={styles.title}
          >
            Personal information
          </Text>

          <View
            style={styles.spacer}
          />
        </View>

        <Text
          style={
            styles.description
          }
        >
          Update your personal account details.
        </Text>

        <Text
          style={styles.label}
        >
          Full name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={
            loading
              ? 'Loading...'
              : 'Enter your full name'
          }
          placeholderTextColor={
            colors.mutedText
          }
          editable={!loading}
        />

        <Text
          style={styles.label}
        >
          Email address
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.disabledInput,
          ]}
          value={email}
          placeholder="name@example.com"
          placeholderTextColor={
            colors.mutedText
          }
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />

        <Text
          style={
            styles.emailHelper
          }
        >
          Your email is managed by your sign-in method.
        </Text>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (
              saving ||
              loading
            ) &&
            styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={
            saving ||
            loading
          }
        >
          <Text
            style={
              styles.saveText
            }
          >
            {saving
              ? 'Saving...'
              : 'Save changes'}
          </Text>
        </TouchableOpacity>

        <View
          style={styles.divider}
        />

        <Text
          style={
            styles.dangerTitle
          }
        >
          Delete account
        </Text>

        <Text
          style={
            styles.dangerDescription
          }
        >
          Permanently delete your account and saved data. This action cannot be undone.
        </Text>

        {usesPassword && (
          <>
            <Text
              style={styles.label}
            >
              Confirm password
            </Text>

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={
                setPassword
              }
              placeholder="Enter your password"
              placeholderTextColor={
                colors.mutedText
              }
              secureTextEntry
              editable={!deleting}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleting &&
            styles.deleteButtonDisabled,
          ]}
          onPress={
            handleDeleteAccount
          }
          activeOpacity={0.7}
          disabled={deleting}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={colors.danger}
          />

          <Text
            style={
              styles.deleteText
            }
          >
            {deleting
              ? 'Deleting...'
              : 'Delete account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles =
  (colors: any) =>
    StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor:
          colors.background,
      },

      content: {
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 50,
      },

      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
          'space-between',
        marginBottom: 22,
      },

      backButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor:
          colors.softBackground,
        alignItems: 'center',
        justifyContent:
          'center',
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
        color:
          colors.secondaryText,
        marginBottom: 28,
      },

      label: {
        fontSize: 12,
        fontWeight: '700',
        color:
          colors.secondaryText,
        marginBottom: 8,
      },

      input: {
        height: 52,
        borderWidth: 1,
        borderColor:
          colors.border,
        borderRadius: 15,
        paddingHorizontal: 14,
        backgroundColor:
          colors.card,
        color: colors.text,
        marginBottom: 20,
      },

      disabledInput: {
        backgroundColor:
          colors.softBackground,
        color:
          colors.secondaryText,
        marginBottom: 8,
      },

      emailHelper: {
        fontSize: 11,
        color:
          colors.mutedText,
        marginBottom: 20,
      },

      saveButton: {
        height: 54,
        backgroundColor:
          colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent:
          'center',
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

      divider: {
        height: 1,
        backgroundColor:
          colors.border,
        marginVertical: 32,
      },

      dangerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color:
          colors.danger,
        marginBottom: 8,
      },

      dangerDescription: {
        fontSize: 12,
        lineHeight: 18,
        color:
          colors.secondaryText,
        marginBottom: 20,
      },

      deleteButton: {
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor:
          colors.danger,
        backgroundColor:
          colors.dangerSoft,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
          'center',
        gap: 8,
      },

      deleteButtonDisabled: {
        opacity: 0.6,
      },

      deleteText: {
        color:
          colors.danger,
        fontSize: 14,
        fontWeight: '800',
      },
    });