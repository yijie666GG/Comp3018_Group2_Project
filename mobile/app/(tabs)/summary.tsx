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

import { useTheme } from "../../theme/ThemeContext";

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

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/").map(Number);
    date = new Date(year, month - 1, day);
  } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [selectedYear, setSelectedYear] =
    useState<FinancialYear>("2025-2026");

  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

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

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
    const dateToUse = receipt.date ?? receipt.createdAt;

    return getFinancialYear(dateToUse) === selectedYear;
  });
}, [receipts, selectedYear]);

  const totalExpenses = useMemo(() => {
    return filteredReceipts.reduce((total, receipt) => {
      if (receipt.total !== null && !Number.isNaN(receipt.total)) {
        return total + receipt.total;
      }

      const itemTotal = receipt.items.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return total + itemTotal;
    }, 0);
  }, [filteredReceipts]);

  const receiptCount = filteredReceipts.length;

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

  const categoryCount = categorySummaries.length;

  const recentExpenses = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading summary...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              color={colors.primary}
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
            color={colors.secondaryText}
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
                    color={colors.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color={colors.primary}
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

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="receipt-outline"
                size={21}
                color={colors.primary}
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
                color={colors.primary}
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
              color={colors.mutedText}
            />

            <Text style={styles.emptyTitle}>
              No expenses yet
            </Text>

            <Text style={styles.emptyText}>
              Save a receipt to see your spending breakdown.
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
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.categoryText}>
                      <Text style={styles.categoryName}>
                        {category.name}
                      </Text>

                      <Text style={styles.categoryCount}>
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
              color={colors.mutedText}
            />

            <Text style={styles.emptyTitle}>
              No recent expenses
            </Text>

            <Text style={styles.emptyText}>
              Your saved receipt items will appear here.
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
                  color={colors.primary}
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
                    <Text style={styles.categoryBadgeText}>
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

        <Pressable
          style={styles.refreshButton}
          onPress={loadReceipts}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color={colors.primary}
          />

          <Text style={styles.refreshText}>
            Refresh Summary
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 12,
      color: colors.secondaryText,
      fontSize: 14,
    },

    header: {
      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 18,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: colors.secondaryText,
    },

    scrollContent: {
      padding: 20,
      paddingBottom: 50,
    },

    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.secondaryText,
      marginBottom: 8,
    },

    yearSelector: {
      height: 52,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },

    yearMenu: {
      marginTop: 6,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.primarySoft,
    },

    yearOptionText: {
      fontSize: 14,
      color: colors.secondaryText,
    },

    selectedYearText: {
      color: colors.primary,
      fontWeight: "700",
    },

    totalCard: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    totalIcon: {
      width: 45,
      height: 45,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },

    totalLabel: {
      marginTop: 15,
      fontSize: 14,
      color: colors.secondaryText,
    },

    totalAmount: {
      marginTop: 3,
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
    },

    totalDescription: {
      marginTop: 4,
      fontSize: 12,
      color: colors.mutedText,
    },

    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },

    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },

    statNumber: {
      marginTop: 12,
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
    },

    statLabel: {
      marginTop: 2,
      fontSize: 12,
      color: colors.secondaryText,
    },

    sectionHeader: {
      marginTop: 26,
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
    },

    categoryCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderBottomColor: colors.border,
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
      backgroundColor: colors.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },

    categoryText: {
      marginLeft: 11,
    },

    categoryName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    categoryCount: {
      marginTop: 3,
      fontSize: 12,
      color: colors.mutedText,
    },

    categoryAmount: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },

    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 35,
      paddingHorizontal: 20,
      alignItems: "center",
    },

    emptyTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    emptyText: {
      marginTop: 5,
      fontSize: 13,
      color: colors.mutedText,
      textAlign: "center",
    },

    expenseCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    expenseIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
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
      color: colors.text,
    },

    expenseMerchant: {
      marginTop: 3,
      fontSize: 12,
      color: colors.secondaryText,
    },

    expenseMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      gap: 7,
    },

    expenseDate: {
      fontSize: 11,
      color: colors.mutedText,
    },

    categoryBadge: {
      backgroundColor: colors.softBackground,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },

    categoryBadgeText: {
      fontSize: 10,
      color: colors.secondaryText,
      fontWeight: "600",
    },

    expenseAmount: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },

    refreshButton: {
      marginTop: 18,
      height: 48,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    refreshText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
  });