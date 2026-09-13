import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import {
  getNotificationPreference,
  setNotificationPreference,
} from '../firebase/notification';

import {
  scheduleFinancialYearReminder,
  cancelFinancialYearReminder,
} from '../services/financialYearReminder';

import { useTheme } from '../theme/ThemeContext';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const [financialYearReminder, setFinancialYearReminder] =
    useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const savedPreference =
          await getNotificationPreference();

        setFinancialYearReminder(savedPreference);
      } catch (error) {
        console.log(
          'Load notification preference error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreference();
  }, []);

  const handleReminderChange = async (value: boolean) => {
    try {
      setSaving(true);

      if (value) {
        // Ask for notification permission and
        // schedule the yearly reminder.
        const scheduled =
          await scheduleFinancialYearReminder();

        if (!scheduled) {
          setFinancialYearReminder(false);

          await setNotificationPreference(false);

          Alert.alert(
            'Notifications disabled',
            'Notification permission is required to enable the financial year reminder.'
          );

          return;
        }

        // Save the preference to Firestore.
        await setNotificationPreference(true);

        setFinancialYearReminder(true);

        console.log(
          'Financial year reminder enabled'
        );
      } else {
        // Cancel the notification scheduled on the device.
        await cancelFinancialYearReminder();

        // Save the preference to Firestore.
        await setNotificationPreference(false);

        setFinancialYearReminder(false);

        console.log(
          'Financial year reminder disabled'
        );
      }
    } catch (error) {
      console.log(
        'Financial year reminder error:',
        error
      );

      Alert.alert(
        'Unable to update reminder',
        'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
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
            Notifications
          </Text>

          <View style={styles.spacer} />
        </View>

        <Text style={styles.description}>
          Choose whether you want to be reminded about the upcoming financial year.
        </Text>

        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>
                Financial year reminder
              </Text>

              <Text style={styles.reminderSubtitle}>
                Remind me before the next financial year begins.
              </Text>
            </View>
          </View>

          <Switch
            value={financialYearReminder}
            onValueChange={handleReminderChange}
            disabled={loading || saving}
            trackColor={{
              false: isDark ? '#475569' : '#D7DEE9',
              true: isDark ? '#1E40AF' : '#93B9FF',
            }}
            thumbColor={
              financialYearReminder
                ? colors.primary
                : isDark
                  ? '#CBD5E1'
                  : '#FFFFFF'
            }
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            When enabled, a reminder will be scheduled for 25 June at 9:00 AM before the new financial year begins on 1 July. Your preference is also saved to your account.
          </Text>
        </View>
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
      paddingHorizontal: 22,
      paddingTop: 12,
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
      borderWidth: 1,
      borderColor: colors.border,
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
      lineHeight: 19,
      color: colors.secondaryText,
      marginBottom: 24,
    },

    reminderCard: {
      minHeight: 92,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
    },

    reminderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },

    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    reminderInfo: {
      flex: 1,
    },

    reminderTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    reminderSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.secondaryText,
      marginTop: 4,
    },

    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.primarySoft,
      borderRadius: 15,
      padding: 14,
      marginTop: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    infoText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
    },
  });