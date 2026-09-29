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

/**
 * Personal Information Screen
 *
 * Allows the user to view and update their personal
 * account information.
 *
 * Users can:
 * - View their saved name and email address
 * - Update their full name
 * - Delete their account
 *
 * Account deletion behaviour depends on the authentication
 * provider used by the current Firebase user.
 */
export default function PersonalInformationScreen() {
  // Get colours from the currently active application theme.
  const { colors } = useTheme();

  // Create styles using the active theme colours.
  const styles =
    createStyles(colors);

  // User's editable full name.
  const [name, setName] =
    useState('');

  // Email address associated with the user's account.
  const [email, setEmail] =
    useState('');

  // Password used to confirm account deletion when required.
  const [password, setPassword] =
    useState('');

  // Indicates whether the user signed in using email/password authentication.
  const [usesPassword, setUsesPassword] =
    useState(false);

  // Loading state while retrieving personal information.
  const [loading, setLoading] =
    useState(true);

  // Saving state while updating personal information.
  const [saving, setSaving] =
    useState(false);

  // Deleting state while removing the user's account.
  const [deleting, setDeleting] =
    useState(false);

  /**
   * Load the user's personal information when
   * the screen is opened.
   *
   * The Firebase authentication providers are also checked
   * to determine whether password confirmation is required
   * before account deletion.
   */
  useEffect(() => {
    const loadPersonalInformation =
      async () => {
        try {
          // Retrieve saved personal information.
          const information =
            await getPersonalInformation();

          setName(
            information.name
          );

          setEmail(
            information.email
          );

          // Get the currently authenticated Firebase user.
          const user =
            auth.currentUser;

          /**
           * Collect authentication provider IDs.
           *
           * Examples may include:
           * - "password"
           * - Google authentication provider
           */
          const providerIds =
            user?.providerData.map(
              (provider) =>
                provider.providerId
            ) || [];

          // Check whether password authentication is used.
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

  /**
   * Save changes to the user's personal information.
   */
  const handleSave = async () => {
    // A name is required before saving.
    if (!name.trim()) {
      Alert.alert(
        'Missing name',
        'Please enter your full name.'
      );

      return;
    }

    try {
      setSaving(true);

      // Save the updated name.
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

  /**
   * Permanently delete the current user's account.
   *
   * Password-based users must enter their password
   * before the deletion process can continue.
   *
   * A confirmation dialog is displayed before the
   * account is permanently deleted.
   */
  const handleDeleteAccount = () => {
    // Require password confirmation for password-based accounts.
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

    // Ask for final confirmation before deleting the account.
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

              /**
               * Delete the user account and associated data.
               * The password is passed for authentication
               * when the account uses password sign-in.
               */
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
                      // Return to the initial login screen.
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

              // Default account deletion error message.
              let message =
                'Unable to delete your account.';

              /**
               * Convert common Firebase authentication errors
               * into clearer messages for the user.
               */
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
        {/* Screen header with back navigation */}
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

          {/* Keeps the screen title visually centred */}
          <View
            style={styles.spacer}
          />
        </View>

        {/* Screen description */}
        <Text
          style={
            styles.description
          }
        >
          Update your personal account details.
        </Text>

        {/* Editable full name */}
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

        {/* Account email address */}
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

        {/*
          Email editing is disabled because the email
          is controlled by the user's authentication method.
        */}
        <Text
          style={
            styles.emailHelper
          }
        >
          Your email is managed by your sign-in method.
        </Text>

        {/* Save personal information changes */}
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

        {/* Separate account settings from the danger zone */}
        <View
          style={styles.divider}
        />

        {/* Account deletion section */}
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

        {/*
          Password confirmation is only displayed for
          accounts using password authentication.
        */}
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

        {/* Permanently delete the user account */}
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

/**
 * Creates theme-aware styles for the Personal Information screen.
 */
const createStyles =
  (colors: any) =>
    StyleSheet.create({
      // Main screen container.
      safeArea: {
        flex: 1,
        backgroundColor:
          colors.background,
      },

      // Scrollable page content.
      content: {
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 50,
      },

      // Screen header.
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
          'space-between',
        marginBottom: 22,
      },

      // Back navigation button.
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

      // Screen title.
      title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
      },

      // Balances the back button in the header.
      spacer: {
        width: 42,
      },

      // Screen description.
      description: {
        fontSize: 13,
        color:
          colors.secondaryText,
        marginBottom: 28,
      },

      // Form field label.
      label: {
        fontSize: 12,
        fontWeight: '700',
        color:
          colors.secondaryText,
        marginBottom: 8,
      },

      // Shared text input style.
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

      // Style applied to the non-editable email field.
      disabledInput: {
        backgroundColor:
          colors.softBackground,
        color:
          colors.secondaryText,
        marginBottom: 8,
      },

      // Explanation displayed below the email field.
      emailHelper: {
        fontSize: 11,
        color:
          colors.mutedText,
        marginBottom: 20,
      },

      // Save changes button.
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

      // Disabled state while loading or saving.
      saveButtonDisabled: {
        opacity: 0.6,
      },

      // Save button text.
      saveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
      },

      // Divider before the account deletion section.
      divider: {
        height: 1,
        backgroundColor:
          colors.border,
        marginVertical: 32,
      },

      // Account deletion heading.
      dangerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color:
          colors.danger,
        marginBottom: 8,
      },

      // Account deletion warning.
      dangerDescription: {
        fontSize: 12,
        lineHeight: 18,
        color:
          colors.secondaryText,
        marginBottom: 20,
      },

      // Delete account button.
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

      // Disabled state while account deletion is running.
      deleteButtonDisabled: {
        opacity: 0.6,
      },

      // Delete account button text.
      deleteText: {
        color:
          colors.danger,
        fontSize: 14,
        fontWeight: '800',
      },
    });