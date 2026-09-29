import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { auth } from '../../firebase/firebase';
import { useTheme } from '../../theme/ThemeContext';

/**
 * Account screen.
 *
 * Provides access to account-related settings including:
 * - Personal information
 * - Notifications
 * - Financial years
 * - Appearance
 * - Logout
 */
export default function AccountScreen() {
  // Get the current theme colours and appearance mode.
  const { colors, mode } = useTheme();

  // Create styles using the active theme.
  const styles = createStyles(colors);

  /**
   * Convert the current theme mode into a user-friendly label.
   * The value is displayed under the Appearance setting.
   */
  const appearanceLabel =
    mode === 'light'
      ? 'Light'
      : mode === 'dark'
        ? 'Dark'
        : 'System';

  /**
   * Log the current user out of the application.
   *
   * A confirmation dialog is shown first to prevent
   * accidental logout.
   *
   * The function signs the user out from both:
   * - Google Sign-In
   * - Firebase Authentication
   *
   * After successful logout, the user is returned
   * to the initial screen.
   */
  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from the Google account session.
              await GoogleSignin.signOut();

              // Sign out from Firebase Authentication.
              await signOut(auth);

              console.log('Logout successful');

              // Return to the initial/login screen.
              router.replace('/');
            } catch (error) {
              console.log('Logout error:', error);

              // Inform the user if logout fails.
              Alert.alert(
                'Logout failed',
                'Unable to log out. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <Text style={styles.title}>Account</Text>

        {/* Account overview card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={28}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.profileTitle}>
              Your account
            </Text>

            <Text style={styles.profileSubtitle}>
              Manage your personal settings
            </Text>
          </View>
        </View>

        {/* Account settings section */}
        <Text style={styles.sectionTitle}>
          Settings
        </Text>

        {/* Personal Information
            Opens the screen for viewing and managing
            user account information.
        */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push('/personal-information')}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="person-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>
                Personal information
              </Text>

              <Text style={styles.menuSubtitle}>
                Name, email and account details
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedText}
          />
        </TouchableOpacity>

        {/* Notifications
            Opens notification settings, including
            the financial year reminder.
        */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>
                Notifications
              </Text>

              <Text style={styles.menuSubtitle}>
                Financial year reminder
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedText}
          />
        </TouchableOpacity>

        {/* Financial Years
            Opens the financial year management screen.
        */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push('/financial-years')}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>
                Financial years
              </Text>

              <Text style={styles.menuSubtitle}>
                View and manage financial years
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedText}
          />
        </TouchableOpacity>

        {/* Appearance
            Opens the theme settings screen.
            The current theme mode is displayed below the title.
        */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push('/appearance')}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="moon-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>
                Appearance
              </Text>

              <Text style={styles.menuSubtitle}>
                {appearanceLabel} mode
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedText}
          />
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.danger}
          />

          <Text style={styles.logoutText}>
            Log out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Creates styles for the Account screen.
 *
 * All main colours come from ThemeContext so the screen
 * automatically supports the application's appearance modes.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen background.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Main scrollable content container.
    content: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 110,
    },

    // Account screen heading.
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 24,
    },

    // Account information card.
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 30,
      backgroundColor: colors.card,
    },

    // User avatar/icon container.
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    profileTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },

    profileSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
    },

    // Settings section heading.
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
    },

    // Shared layout for each settings menu item.
    menuItem: {
      minHeight: 74,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    // Icon background used by each settings option.
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    menuTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    menuSubtitle: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
    },

    // Logout action button.
    logoutButton: {
      height: 52,
      marginTop: 34,
      borderRadius: 15,
      backgroundColor: colors.dangerSoft,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },

    logoutText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '800',
    },
  });