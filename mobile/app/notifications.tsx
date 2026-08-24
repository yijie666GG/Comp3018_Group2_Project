import { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const [financialYearReminder, setFinancialYearReminder] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#172033"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Notifications</Text>

          <View style={styles.spacer} />
        </View>

        <Text style={styles.description}>
          Choose whether you want to be reminded about the upcoming financial year.
        </Text>

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.iconBox}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#2563EB"
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
            onValueChange={setFinancialYearReminder}
            trackColor={{
              false: '#D7DEE9',
              true: '#93B9FF',
            }}
            thumbColor={
              financialYearReminder ? '#2563EB' : '#FFFFFF'
            }
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Your reminder preference will be stored with your account once the database is connected.
          </Text>
        </View>
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
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
  },

  spacer: {
    width: 42,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7A8599',
    marginBottom: 24,
  },

  reminderCard: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#EEF4FF',
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
    color: '#172033',
  },

  reminderSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#7A8599',
    marginTop: 4,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FF',
    borderRadius: 15,
    padding: 14,
    marginTop: 18,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    lineHeight: 17,
    color: '#667085',
  },
});