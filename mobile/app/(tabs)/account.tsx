import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

export default function AccountScreen() {
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
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.profileTitle}>Your account</Text>
            <Text style={styles.profileSubtitle}>
              Manage your personal settings
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

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
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>Personal information</Text>
              <Text style={styles.menuSubtitle}>
                Name, email and account details
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#8A94A8"
          />
        </TouchableOpacity>

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
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubtitle}>
                Financial year reminder
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#8A94A8"
          />
        </TouchableOpacity>

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
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.menuTitle}>Financial years</Text>
              <Text style={styles.menuSubtitle}>
                View and manage financial years
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#8A94A8"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 110,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 24,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  profileTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  profileSubtitle: {
    fontSize: 12,
    color: '#7A8599',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 10,
  },

  menuItem: {
    minHeight: 74,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
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
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172033',
  },

  menuSubtitle: {
    fontSize: 11,
    color: '#7A8599',
    marginTop: 3,
  },

  logoutButton: {
    height: 52,
    marginTop: 34,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});