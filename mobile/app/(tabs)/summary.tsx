import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { getReceipts, SavedReceipt } from "../../services/receiptStorage";

type FinancialYear = "2024-2025" | "2025-2026" | "2026-2027";

type Expense = {
  id: string;
  name: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
};

type CategorySummary = {
  name: string;
  amount: number;
  percentage: number;
  count: number;
};

const financialYears: FinancialYear[] = [
  "2024-2025",
  "2025-2026",
  "2026-2027",
];

const getFinancialYear = (dateString: string | null): FinancialYear | null => {
  if (!dateString) {
    return null;
  }

  let date: Date | null = null;

  // Handles YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  // Handles DD/MM/YYYY
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/").map(Number);
    date = new Date(year, month - 1, day);
  }

  // Handles DD-MM-YYYY
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  // Handles other dates recognised by JavaScript
  else {
    const parsed = new Date(dateString);

    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Australian financial year:
  // 1 July -> 30 June
  if (month >= 7) {
    return `${year}-${year + 1}` as FinancialYear;
  }

  return `${year - 1}-${year}` as FinancialYear;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return "Unknown date";
  }

  return dateString;
};

export default function Summary() {
  const [selectedYear, setSelectedYear] =
    useState<FinancialYear>("2025-2026");

  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  // ==========================================
  // Load receipts whenever Summary is opened
  // ==========================================

  const loadReceipts = async () => {
    try {
      setLoading(true);

      const savedReceipts = await getReceipts();

      setReceipts(savedReceipts);
    } catch (error) {
      console.error("Failed to load summary receipts:", error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  // ==========================================
  // Filter receipts by financial year
  // ==========================================

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      return getFinancialYear(receipt.date) === selectedYear;
    });
  }, [receipts, selectedYear]);

  // ==========================================
  // Total expenses
  // ==========================================

  const totalExpenses = useMemo(() => {
    return filteredReceipts.reduce((total, receipt) => {
      if (receipt.total !== null && !Number.isNaN(receipt.total)) {
        return total + receipt.total;
      }

      // Fallback to item prices if receipt total is unavailable
      const itemTotal = receipt.items.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return total + itemTotal;
    }, 0);
  }, [filteredReceipts]);

  // ==========================================
  // Number of receipts
  // ==========================================

  const receiptCount = filteredReceipts.length;

  // ==========================================
  // Convert receipt items into expenses
  // ==========================================

  const expenses = useMemo<Expense[]>(() => {
    const result: Expense[] = [];

    filteredReceipts.forEach((receipt) => {
      receipt.items.forEach((item, itemIndex) => {
        result.push({
          id: `${receipt.id}-${itemIndex}`,
          name: item.name,
          merchant: receipt.store ?? "Unknown",
          date: receipt.date ?? receipt.createdAt,
          category: item.category || "Other",
          amount: item.price,
        });
      });
    });

    return result;
  }, [filteredReceipts]);

  // ==========================================
  // Category summaries
  // ==========================================

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    const categoryMap: Record<
      string,
      {
        amount: number;
        count: number;
      }
    > = {};

    expenses.forEach((expense) => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = {
          amount: 0,
          count: 0,
        };
      }

      categoryMap[expense.category].amount += expense.amount;
      categoryMap[expense.category].count += 1;
    });

    const categoryTotal = Object.values(categoryMap).reduce(
      (sum, category) => sum + category.amount,
      0
    );

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage:
          categoryTotal > 0
            ? Math.round((data.amount / categoryTotal) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // ==========================================
  // Number of unique categories
  // ==========================================

  const categoryCount = categorySummaries.length;

  // ==========================================
  // Recent expenses
  // ==========================================

  const recentExpenses = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  // ==========================================
  // Loading state
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>
          Loading summary...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.title}>Summary</Text>

        <Text style={styles.subtitle}>
          Your expense overview
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Financial Year */}

        <Text style={styles.sectionLabel}>
          Financial Year
        </Text>

        <Pressable
          style={styles.yearSelector}
          onPress={() =>
            setYearMenuVisible(!yearMenuVisible)
          }
        >
          <View style={styles.yearSelectorLeft}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#2563EB"
            />

            <Text style={styles.yearSelectorText}>
              {selectedYear}
            </Text>
          </View>

          <Ionicons
            name={
              yearMenuVisible
                ? "chevron-up"
                : "chevron-down"
            }
            size={20}
            color="#64748B"
          />
        </Pressable>

        {yearMenuVisible && (
          <View style={styles.yearMenu}>
            {financialYears.map((year) => (
              <Pressable
                key={year}
                style={[
                  styles.yearOption,
                  selectedYear === year &&
                    styles.selectedYearOption,
                ]}
                onPress={() => {
                  setSelectedYear(year);
                  setYearMenuVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.yearOptionText,
                    selectedYear === year &&
                      styles.selectedYearText,
                  ]}
                >
                  {year}
                </Text>

                {selectedYear === year && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Total Expenses */}

        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <Text style={styles.totalLabel}>
            Total Expenses
          </Text>

          <Text style={styles.totalAmount}>
            ${totalExpenses.toFixed(2)}
          </Text>

          <Text style={styles.totalDescription}>
            Total spending for {selectedYear}
          </Text>
        </View>

        {/* Statistics */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="receipt-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>
              {receiptCount}
            </Text>

            <Text style={styles.statLabel}>
              Receipts
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="pricetags-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>
              {categoryCount}
            </Text>

            <Text style={styles.statLabel}>
              Categories
            </Text>
          </View>
        </View>

        {/* Spending By Category */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Spending by Category
          </Text>
        </View>

        {categorySummaries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="pie-chart-outline"
              size={40}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No expenses yet
            </Text>

            <Text style={styles.emptyText}>
              Save a receipt to see your spending
              breakdown.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryCard}>
            {categorySummaries.map(
              (category, index) => (
                <View
                  key={category.name}
                  style={[
                    styles.categoryRow,
                    index !==
                      categorySummaries.length - 1 &&
                      styles.categoryRowBorder,
                  ]}
                >
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryIcon}>
                      <Ionicons
                        name="pricetag-outline"
                        size={18}
                        color="#2563EB"
                      />
                    </View>

                    <View style={styles.categoryText}>
                      <Text
                        style={styles.categoryName}
                      >
                        {category.name}
                      </Text>

                      <Text
                        style={styles.categoryCount}
                      >
                        {category.count}{" "}
                        {category.count === 1
                          ? "item"
                          : "items"}{" "}
                        • {category.percentage}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.categoryAmount}>
                    ${category.amount.toFixed(2)}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* Recent Expenses */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Expenses
          </Text>
        </View>

        {recentExpenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No recent expenses
            </Text>

            <Text style={styles.emptyText}>
              Your saved receipt items will appear
              here.
            </Text>
          </View>
        ) : (
          recentExpenses.map((expense) => (
            <View
              key={expense.id}
              style={styles.expenseCard}
            >
              <View style={styles.expenseIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View style={styles.expenseInfo}>
                <Text
                  style={styles.expenseName}
                  numberOfLines={1}
                >
                  {expense.name}
                </Text>

                <Text style={styles.expenseMerchant}>
                  {expense.merchant}
                </Text>

                <View style={styles.expenseMeta}>
                  <Text style={styles.expenseDate}>
                    {formatDate(expense.date)}
                  </Text>

                  <View style={styles.categoryBadge}>
                    <Text
                      style={styles.categoryBadgeText}
                    >
                      {expense.category}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.expenseAmount}>
                ${expense.amount.toFixed(2)}
              </Text>
            </View>
          ))
        )}

        {/* Refresh */}

        <Pressable
          style={styles.refreshButton}
          onPress={loadReceipts}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#2563EB"
          />

          <Text style={styles.refreshText}>
            Refresh Summary
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#172033",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },

  yearSelector: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  yearSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  yearSelectorText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },

  yearMenu: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  yearOption: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedYearOption: {
    backgroundColor: "#EFF6FF",
  },

  yearOptionText: {
    fontSize: 14,
    color: "#475569",
  },

  selectedYearText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  totalCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  totalIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  totalLabel: {
    marginTop: 15,
    fontSize: 14,
    color: "#64748B",
  },

  totalAmount: {
    marginTop: 3,
    fontSize: 30,
    fontWeight: "800",
    color: "#172033",
  },

  totalDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "800",
    color: "#172033",
  },

  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
  },

  categoryRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  categoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  categoryText: {
    marginLeft: 11,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },

  categoryCount: {
    marginTop: 3,
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },

  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  expenseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  expenseInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  expenseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },

  expenseMerchant: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  expenseMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 7,
  },

  expenseDate: {
    fontSize: 11,
    color: "#94A3B8",
  },

  categoryBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  categoryBadgeText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },

  expenseAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172033",
  },

  refreshButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  refreshText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});