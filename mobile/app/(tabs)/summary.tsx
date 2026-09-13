import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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

// ------------------------------------------
// Financial year helper
// ------------------------------------------
const getFinancialYear = (
  dateString: string | null
): FinancialYear | null => {
  if (!dateString) {
    return null;
  }

  let date: Date | null = null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  // DD/MM/YYYY
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/").map(Number);
    date = new Date(year, month - 1, day);
  }

  // DD-MM-YYYY
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  // Other recognised date formats
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
  // 1 July - 30 June
  if (month >= 7) {
    return `${year}-${year + 1}` as FinancialYear;
  }

  return `${year - 1}-${year}` as FinancialYear;
};

// ------------------------------------------
// Date display helper
// ------------------------------------------
const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return "Unknown date";
  }

  // Convert ISO dates such as 2026-08-05
  // into 2026-08-05 to match the design
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  return dateString;
};

export default function Summary() {
  const [selectedYear, setSelectedYear] =
    useState<FinancialYear>("2026-2027");

  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearModalVisible, setYearModalVisible] = useState(false);

  // ------------------------------------------
  // Load receipts from Firebase
  // ------------------------------------------
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

  // ------------------------------------------
  // Filter receipts by financial year
  // ------------------------------------------
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const dateToUse = receipt.date ?? receipt.createdAt;

      return getFinancialYear(dateToUse) === selectedYear;
    });
  }, [receipts, selectedYear]);

  // ------------------------------------------
  // Total expenses
  // ------------------------------------------
  const totalExpenses = useMemo(() => {
    return filteredReceipts.reduce((total, receipt) => {
      if (
        receipt.total !== null &&
        receipt.total !== undefined &&
        !Number.isNaN(receipt.total)
      ) {
        return total + receipt.total;
      }

      const itemTotal = receipt.items.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return total + itemTotal;
    }, 0);
  }, [filteredReceipts]);

  // ------------------------------------------
  // Receipt count
  // ------------------------------------------
  const receiptCount = filteredReceipts.length;

  // ------------------------------------------
  // Convert receipt items into expenses
  // ------------------------------------------
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

  // ------------------------------------------
  // Category summaries
  // ------------------------------------------
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

  // ------------------------------------------
  // Export button
  // ------------------------------------------
  const handleExportCSV = () => {
    Alert.alert(
      "Export CSV",
      "CSV export is ready to be connected to the final export function."
    );
  };

  // ------------------------------------------
  // Loading
  // ------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>
          Loading summary...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* -------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------- */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color="#172033"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Financial summary
        </Text>

        <Pressable
          style={styles.exportButton}
          onPress={handleExportCSV}
        >
          <Text style={styles.exportText}>
            Export CSV
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------- */}
        {/* Financial Year */}
        {/* -------------------------------------- */}

        <Pressable
          style={styles.yearSelector}
          onPress={() => setYearModalVisible(true)}
        >
          <Text style={styles.yearText}>
            {selectedYear}
          </Text>

          <Ionicons
            name="chevron-down"
            size={19}
            color="#172033"
          />
        </Pressable>

        {/* -------------------------------------- */}
        {/* Total + Receipts */}
        {/* -------------------------------------- */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total expenses
            </Text>

            <Text style={styles.statAmount}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total receipts
            </Text>

            <Text style={styles.statNumber}>
              {receiptCount}
            </Text>
          </View>
        </View>

        {/* -------------------------------------- */}
        {/* Category Breakdown */}
        {/* -------------------------------------- */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Category breakdown
          </Text>

          <Text style={styles.sectionYear}>
            {selectedYear}
          </Text>
        </View>

        <View style={styles.categoryList}>
          {categorySummaries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No expenses in this financial year.
              </Text>
            </View>
          ) : (
            categorySummaries.map((category, index) => (
              <View
                key={category.name}
                style={[
                  styles.categoryRow,
                  index !== categorySummaries.length - 1 &&
                    styles.categoryBorder,
                ]}
              >
                <View>
                  <Text style={styles.categoryName}>
                    {category.name}
                  </Text>

                  <Text style={styles.itemCount}>
                    {category.count}{" "}
                    {category.count === 1
                      ? "item"
                      : "items"}
                  </Text>
                </View>

                <Text style={styles.categoryAmount}>
                  ${category.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* -------------------------------------- */}
        {/* Receipts Included in Export */}
        {/* -------------------------------------- */}

        <Text style={styles.receiptsTitle}>
          Receipts included in export
        </Text>

        {filteredReceipts.length === 0 ? (
          <View style={styles.emptyReceiptCard}>
            <Text style={styles.emptyText}>
              No receipts for this financial year.
            </Text>
          </View>
        ) : (
          filteredReceipts.map((receipt) => (
            <View
              key={receipt.id}
              style={styles.receiptCard}
            >
              {/* Receipt header */}

              <View style={styles.receiptHeader}>
                <View style={styles.storeIcon}>
                  <Text style={styles.storeIconText}>
                    {(receipt.store ?? "R")
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>
                    {receipt.store ?? "Unknown"}
                  </Text>

                  <Text style={styles.receiptDate}>
                    {formatDate(
                      receipt.date ?? receipt.createdAt
                    )}
                  </Text>
                </View>

                <Text style={styles.receiptTotal}>
                  $
                  {(receipt.total ?? 0).toFixed(2)}
                </Text>
              </View>

              {/* Items */}

              <View style={styles.receiptDivider} />

              {receipt.items.map((item, itemIndex) => (
                <View
                  key={`${receipt.id}-${itemIndex}`}
                  style={[
                    styles.receiptItem,
                    itemIndex !==
                      receipt.items.length - 1 &&
                      styles.itemBorder,
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>
                      {item.name}
                    </Text>

                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category || "Other"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemPrice}>
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* -------------------------------------- */}
      {/* Financial Year Modal */}
      {/* -------------------------------------- */}

      <Modal
        visible={yearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setYearModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setYearModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              Select financial year
            </Text>

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
                  setYearModalVisible(false);
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
                    name="checkmark-circle"
                    size={21}
                    color="#2563EB"
                  />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
  },

  // ------------------------------------------
  // Header
  // ------------------------------------------

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
  },

  exportButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  exportText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "800",
  },

  // ------------------------------------------
  // Scroll
  // ------------------------------------------

  scrollContent: {
    padding: 22,
    paddingBottom: 40,
  },

  // ------------------------------------------
  // Financial year
  // ------------------------------------------

  yearSelector: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  yearText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },

  // ------------------------------------------
  // Stats
  // ------------------------------------------

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  statCard: {
    flex: 1,
    minHeight: 86,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  statLabel: {
    fontSize: 12,
    color: "#172033",
    marginBottom: 7,
  },

  statAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  // ------------------------------------------
  // Category breakdown
  // ------------------------------------------

  sectionHeader: {
    marginTop: 26,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
  },

  sectionYear: {
    fontSize: 11,
    color: "#64748B",
  },

  categoryList: {
    backgroundColor: "#FFFFFF",
  },

  categoryRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },

  itemCount: {
    marginTop: 3,
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
  },

  // ------------------------------------------
  // Receipts
  // ------------------------------------------

  receiptsTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#172033",
  },

  receiptCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  storeIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  storeIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  storeInfo: {
    flex: 1,
    marginLeft: 11,
  },

  storeName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172033",
  },

  receiptDate: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  receiptTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
  },

  receiptDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 13,
  },

  receiptItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    borderStyle: "dashed",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
    marginRight: 7,
  },

  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172033",
  },

  // ------------------------------------------
  // Empty states
  // ------------------------------------------

  emptyState: {
    paddingVertical: 25,
    alignItems: "center",
  },

  emptyReceiptCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },

  bottomSpace: {
    height: 30,
  },

  // ------------------------------------------
  // Modal
  // ------------------------------------------

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 10,
  },

  yearOption: {
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: 10,
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
});