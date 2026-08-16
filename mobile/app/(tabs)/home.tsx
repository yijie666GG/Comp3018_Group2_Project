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

function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  return month >= 6
    ? `${year}–${year + 1}`
    : `${year - 1}–${year}`;
}

export default function HomeScreen() {
  const financialYear = getCurrentFinancialYear();

  // These will come from the database later.
  const totalExpenses = 0;
  const itemsSaved = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.welcome}>Welcome</Text>
          </View>

          <View style={styles.profileCircle}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#2563EB"
            />
          </View>
        </View>

        {/* Financial year */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            Current financial year
          </Text>

          <Text style={styles.heroYear}>
            {financialYear}
          </Text>

          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatLabel}>
                Total expenses
              </Text>

              <Text style={styles.heroStatValue}>
                ${totalExpenses.toFixed(2)}
              </Text>
            </View>

            <View>
              <Text style={styles.heroStatLabel}>
                Items saved
              </Text>

              <Text style={styles.heroStatValue}>
                {itemsSaved}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="add-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <Text style={styles.actionTitle}>
              Add receipt
            </Text>

            <Text style={styles.actionSubtitle}>
              Scan or upload receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/manage-categories')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="pricetags-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <Text style={styles.actionTitle}>
              Manage categories
            </Text>

            <Text style={styles.actionSubtitle}>
              Create and edit categories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/items')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="list-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <Text style={styles.actionTitle}>
              Item history
            </Text>

            <Text style={styles.actionSubtitle}>
              View saved items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/summary')}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="pie-chart-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <Text style={styles.actionTitle}>
              Summary
            </Text>

            <Text style={styles.actionSubtitle}>
              Reports and totals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent items */}
        <Text style={styles.sectionTitle}>
          Recent items
        </Text>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="receipt-outline"
              size={26}
              color="#2563EB"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No items yet
          </Text>

          <Text style={styles.emptyText}>
            Scan or add a receipt to start tracking your expenses.
          </Text>
        </View>
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
    paddingTop: 12,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 13,
    color: '#7A8599',
  },

  welcome: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
    marginTop: 2,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 20,
    marginBottom: 28,
  },

  heroLabel: {
    color: '#DCE8FF',
    fontSize: 12,
  },

  heroYear: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 22,
  },

  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heroStatLabel: {
    color: '#DCE8FF',
    fontSize: 11,
    marginBottom: 4,
  },

  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    minHeight: 132,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172033',
  },

  actionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#7A8599',
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
  },

  emptyText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: '#7A8599',
    marginTop: 4,
  },
});