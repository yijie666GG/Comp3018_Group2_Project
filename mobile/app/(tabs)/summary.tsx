import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

type FinancialYear = '2024-2025' | '2025-2026' | '2026-2027';

type Expense = {
  name: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
  icon: string;
};

const summaryData = {
  '2024-2025': {
    total: 0,
    receipts: 0,
    categories: 0,
    spending: [],
    expenses: [],
  },

  '2025-2026': {
    total: 564.4,
    receipts: 5,
    categories: 4,

    spending: [
      {
        category: 'Technology',
        items: 2,
        amount: 438,
        percentage: 78,
      },
      {
        category: 'Home Office',
        items: 1,
        amount: 80,
        percentage: 14,
      },
      {
        category: 'Travel',
        items: 1,
        amount: 26.4,
        percentage: 5,
      },
      {
        category: 'Work',
        items: 1,
        amount: 20,
        percentage: 4,
      },
    ],

    expenses: [
      {
        name: 'USB-C Hub',
        merchant: 'Officeworks',
        date: '4 Aug 2025',
        category: 'Technology',
        amount: 89,
        icon: 'U',
      },
      {
        name: 'Notebook',
        merchant: 'Officeworks',
        date: '4 Aug 2025',
        category: 'Work',
        amount: 20,
        icon: 'N',
      },
      {
        name: 'Desk Lamp',
        merchant: 'Officeworks',
        date: '4 Aug 2025',
        category: 'Home Office',
        amount: 80,
        icon: 'D',
      },
      {
        name: 'Airport trip',
        merchant: 'Uber',
        date: '2 Sep 2025',
        category: 'Travel',
        amount: 26.4,
        icon: 'A',
      },
      {
        name: 'Monitor',
        merchant: 'JB Hi-Fi',
        date: '18 Feb 2026',
        category: 'Technology',
        amount: 349,
        icon: 'M',
      },
    ],
  },

  '2026-2027': {
    total: 0,
    receipts: 0,
    categories: 0,
    spending: [],
    expenses: [],
  },
};

export default function SummaryScreen() {
  const [selectedYear, setSelectedYear] =
    useState<FinancialYear>('2025-2026');

  const data = summaryData[selectedYear];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Summary</Text>
            <Text style={styles.subtitle}>
              Your expense overview
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="bar-chart-outline"
              size={20}
              color="#2563EB"
            />
          </View>
        </View>

        {/* Financial Year */}
        <Text style={styles.sectionLabel}>
          Financial year
        </Text>

        <View style={styles.yearRow}>
          {(
            ['2024-2025', '2025-2026', '2026-2027'] as FinancialYear[]
          ).map((year) => (
            <Pressable
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year &&
                  styles.yearButtonSelected,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedYear === year &&
                    styles.yearTextSelected,
                ]}
              >
                {year}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Total Expenses */}
        <View style={styles.totalCard}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="briefcase-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <Text style={styles.smallLabel}>
            Total expenses
          </Text>

          <Text style={styles.totalAmount}>
            ${data.total.toFixed(2)}
          </Text>

          <Text style={styles.financialYearText}>
            {selectedYear}
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>

          {/* Receipts */}
          <View style={styles.statCard}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="receipt-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>
              {data.receipts}
            </Text>

            <Text style={styles.statLabel}>
              Receipts
            </Text>
          </View>

          {/* Categories */}
          <View style={styles.statCard}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="pricetag-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>
              {data.categories}
            </Text>

            <Text style={styles.statLabel}>
              Categories
            </Text>
          </View>

        </View>

        {/* Spending by Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Spending by category
          </Text>

          <Text style={styles.yearSmall}>
            {selectedYear}
          </Text>
        </View>

        {data.spending.length > 0 ? (
          <View style={styles.categoryCard}>
            {data.spending.map((item, index) => (
              <View
                key={item.category}
                style={[
                  styles.categoryRow,
                  index === data.spending.length - 1 &&
                    styles.lastRow,
                ]}
              >
                <View style={styles.categoryLeft}>

                  <View style={styles.categoryIcon}>
                    <Ionicons
                      name="pricetag-outline"
                      size={17}
                      color="#2563EB"
                    />
                  </View>

                  <View>
                    <Text style={styles.categoryName}>
                      {item.category}
                    </Text>

                    <Text style={styles.itemCount}>
                      {item.items}{' '}
                      {item.items === 1 ? 'item' : 'items'}
                    </Text>
                  </View>

                </View>

                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>
                    ${item.amount.toFixed(2)}
                  </Text>

                  <Text style={styles.percentage}>
                    {item.percentage}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No expenses in this financial year.
            </Text>
          </View>
        )}

        {/* Recent Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent expenses
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {data.expenses.length}
            </Text>
          </View>
        </View>

        {data.expenses.length > 0 ? (
          <View style={styles.expensesContainer}>
            {data.expenses.map((expense) => (
              <Pressable
                key={`${expense.name}-${expense.date}`}
                style={styles.expenseCard}
              >
                <View style={styles.expenseIcon}>
                  <Text style={styles.expenseIconText}>
                    {expense.icon}
                  </Text>
                </View>

                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>
                    {expense.name}
                  </Text>

                  <Text style={styles.expenseDetails}>
                    {expense.merchant} • {expense.date}
                  </Text>

                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {expense.category}
                    </Text>
                  </View>
                </View>

                <Text style={styles.expenseAmount}>
                  ${expense.amount.toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>
              0
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />

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
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172033',
  },

  subtitle: {
    fontSize: 13,
    color: '#7A8599',
    marginTop: 3,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#556078',
    marginBottom: 9,
  },

  yearRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F6FB',
  },

  yearButtonSelected: {
    backgroundColor: '#2563EB',
  },

  yearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E7890',
  },

  yearTextSelected: {
    color: '#FFFFFF',
  },

  totalCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  smallLabel: {
    fontSize: 11,
    color: '#71809A',
    marginBottom: 3,
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172033',
  },

  financialYearText: {
    fontSize: 10,
    color: '#71809A',
    marginTop: 3,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    minHeight: 105,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 16,
    padding: 14,
  },

  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
  },

  statLabel: {
    fontSize: 10,
    color: '#7A8599',
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  yearSmall: {
    fontSize: 9,
    color: '#7A8599',
  },

  categoryCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 22,
  },

  categoryRow: {
    minHeight: 68,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172033',
  },

  itemCount: {
    fontSize: 9,
    color: '#8A94A8',
    marginTop: 2,
  },

  categoryRight: {
    alignItems: 'flex-end',
  },

  categoryAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172033',
  },

  percentage: {
    fontSize: 9,
    color: '#8A94A8',
    marginTop: 2,
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },

  emptyText: {
    fontSize: 11,
    color: '#8A94A8',
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },

  expensesContainer: {
    gap: 8,
  },

  expenseCard: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  expenseIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  expenseIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  expenseInfo: {
    flex: 1,
  },

  expenseName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172033',
  },

  expenseDetails: {
    fontSize: 9,
    color: '#8A94A8',
    marginTop: 2,
  },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
  },

  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2563EB',
  },

  expenseAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172033',
    marginLeft: 8,
  },

  emptyRecent: {
    alignItems: 'flex-end',
    paddingRight: 5,
  },

  emptyRecentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
});