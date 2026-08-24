import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const financialYears = ['2026–2027', '2025–2026', '2024–2025'];

type CategoryData = {
  name: string;
  amount: number;
  percentage: number;
};

export default function SummaryScreen() {
  const [selectedYear, setSelectedYear] = useState('2026–2027');
  const [yearModalVisible, setYearModalVisible] = useState(false);

  // This will later come from Firebase
  const totalExpenses = 0;
  const itemsSaved = 0;
  const categoriesUsed = 0;
  const categoryData: CategoryData[] = [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.subtitle}>
          View your expenses for each financial year.
        </Text>

        {/* Financial Year */}
        <TouchableOpacity
          style={styles.yearSelector}
          onPress={() => setYearModalVisible(true)}
        >
          <View>
            <Text style={styles.yearLabel}>Financial year</Text>
            <Text style={styles.yearText}>{selectedYear}</Text>
          </View>

          <Ionicons name="chevron-down" size={22} color="#475569" />
        </TouchableOpacity>

        {/* Total Expenses */}
        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
          </View>

          <Text style={styles.totalLabel}>Total expenses</Text>

          <Text style={styles.totalAmount}>
            ${totalExpenses.toFixed(2)}
          </Text>

          <Text style={styles.totalYear}>{selectedYear}</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt-outline" size={23} color="#2563EB" />
            </View>

            <Text style={styles.statNumber}>{itemsSaved}</Text>
            <Text style={styles.statLabel}>Items saved</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="pricetags-outline" size={23} color="#2563EB" />
            </View>

            <Text style={styles.statNumber}>{categoriesUsed}</Text>
            <Text style={styles.statLabel}>Categories used</Text>
          </View>
        </View>

        {/* Spending By Category */}
        <Text style={styles.sectionTitle}>Spending by category</Text>

        <View style={styles.categoryCard}>
          {categoryData.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="pie-chart-outline"
                  size={38}
                  color="#64748B"
                />
              </View>

              <Text style={styles.emptyTitle}>No spending data yet</Text>

              <Text style={styles.emptyDescription}>
                Your expense summary will appear here after you save items.
              </Text>
            </View>
          ) : (
            categoryData.map((category) => (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>

                  <Text style={styles.categoryAmount}>
                    ${category.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width:
                          `${category.percentage}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Financial Year Modal */}
      <Modal
        visible={yearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setYearModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select financial year</Text>

            {financialYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.yearOption}
                onPress={() => {
                  setSelectedYear(year);
                  setYearModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.yearOptionText,
                    selectedYear === year && styles.selectedYearText,
                  ]}
                >
                  {year}
                </Text>

                {selectedYear === year && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
  },

  yearSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  yearLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
  },

  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },

  totalCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
  },

  totalIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  totalLabel: {
    fontSize: 14,
    color: '#DBEAFE',
  },

  totalAmount: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 34,
    marginTop: 5,
  },

  totalYear: {
    marginTop: 7,
    color: '#BFDBFE',
    fontSize: 13,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 13,
    marginTop: 3,
    color: '#64748B',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '600',
  },

  emptyDescription: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
    maxWidth: 280,
  },

  categoryItem: {
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  categoryName: {
    color: '#334155',
    fontWeight: '500',
  },

  categoryAmount: {
    color: '#0F172A',
    fontWeight: '600',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 15,
  },

  yearOption: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  yearOptionText: {
    fontSize: 16,
    color: '#475569',
  },

  selectedYearText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});