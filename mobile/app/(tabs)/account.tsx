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

export default function AccountScreen() {
  const { colors, mode } = useTheme();

  const styles = createStyles(colors);

  const appearanceLabel =
    mode === 'light'
      ? 'Light'
      : mode === 'dark'
        ? 'Dark'
        : 'System';

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
              await GoogleSignin.signOut();
              await signOut(auth);

              console.log('Logout successful');

              router.replace('/');
            } catch (error) {
              console.log('Logout error:', error);

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
        <Text style={styles.title}>Account</Text>

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

        <Text style={styles.sectionTitle}>
          Settings
        </Text>

        {/* Personal Information */}
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

        {/* Notifications */}
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

        {/* Financial Years */}
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

        {/* Appearance */}
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

        {/* Logout */}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 110,
    },

    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 24,
    },

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

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
    },

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