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
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReceipts, SavedReceipt } from "../../services/receiptStorage";
import { useTheme } from "../../theme/ThemeContext";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

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

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  return dateString;
};

export default function Summary() {
  // ------------------------------------------
  // Theme
  // ------------------------------------------
  const { colors } = useTheme();

  const styles = createStyles(colors);

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
  // Export CSV
  // ------------------------------------------
  const handleExportCSV = async () => {
    try {
      if (filteredReceipts.length === 0) {
        Alert.alert(
          "Export CSV",
          "There are no receipts to export for this financial year."
        );
        return;
      }

      // Escape values for CSV
      const escapeCSV = (
        value: string | number | null | undefined
      ) => {
        const text = String(value ?? "");

        return `"${text.replace(/"/g, '""')}"`;
      };

      // CSV header
      const rows: string[] = [
        [
          "Receipt ID",
          "Store",
          "Date",
          "Receipt Total",
          "Item",
          "Category",
          "Item Price",
        ]
          .map(escapeCSV)
          .join(","),
      ];

      // Add receipt items
      filteredReceipts.forEach((receipt) => {
        receipt.items.forEach((item) => {
          rows.push(
            [
              receipt.id,
              receipt.store ?? "Unknown",
              formatDate(
                receipt.date ?? receipt.createdAt
              ),
              (receipt.total ?? 0).toFixed(2),
              item.name,
              item.category || "Other",
              item.price.toFixed(2),
            ]
              .map(escapeCSV)
              .join(",")
          );
        });
      });

      const csvContent = rows.join("\n");

      // ------------------------------------------
      // WEB EXPORT
      // ------------------------------------------
      if (Platform.OS === "web") {
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `expense-summary-${selectedYear}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        return;
      }

      // ------------------------------------------
      // MOBILE EXPORT
      // ------------------------------------------
      const fileName = `expense-summary-${selectedYear}.csv`;

      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        csvContent,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert(
          "Export CSV",
          "Sharing is not available on this device."
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: `Export ${selectedYear} summary`,
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.error("CSV export error:", error);

      Alert.alert(
        "Export CSV",
        "Something went wrong while creating the CSV file."
      );
    }
  };

  // ------------------------------------------
  // Loading
  // ------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading summary...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
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
            color={colors.text}
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
            color={colors.text}
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
            onPress={(event) =>
              event.stopPropagation()
            }
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
                    color={colors.primary}
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
// THEME-AWARE STYLES
// ======================================================

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"]
) =>
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
      marginTop: 10,
      fontSize: 14,
      color: colors.secondaryText,
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
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: colors.softBackground,
      justifyContent: "center",
      alignItems: "center",
    },

    headerTitle: {
      flex: 1,
      marginLeft: 12,
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },

    exportButton: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
    },

    exportText: {
      color: colors.primary,
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
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
    },

    yearText: {
      fontSize: 14,
      color: colors.text,
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
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      justifyContent: "center",
      backgroundColor: colors.card,
    },

    statLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 7,
    },

    statAmount: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },

    statNumber: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
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
      color: colors.text,
    },

    sectionYear: {
      fontSize: 11,
      color: colors.secondaryText,
    },

    categoryList: {
      backgroundColor: colors.background,
    },

    categoryRow: {
      minHeight: 67,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    categoryBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    categoryName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    itemCount: {
      marginTop: 3,
      fontSize: 12,
      color: colors.mutedText,
    },

    categoryAmount: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },

    // ------------------------------------------
    // Receipts
    // ------------------------------------------

    receiptsTitle: {
      marginTop: 20,
      marginBottom: 10,
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },

    receiptCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.card,
    },

    receiptHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    storeIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },

    storeIconText: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.primary,
    },

    storeInfo: {
      flex: 1,
      marginLeft: 11,
    },

    storeName: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },

    receiptDate: {
      marginTop: 3,
      fontSize: 12,
      color: colors.secondaryText,
    },

    receiptTotal: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },

    receiptDivider: {
      height: 1,
      backgroundColor: colors.border,
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
      borderBottomColor: colors.border,
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
      color: colors.text,
      marginRight: 7,
    },

    categoryBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
    },

    categoryBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
    },

    itemPrice: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
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
      borderColor: colors.border,
      borderRadius: 18,
      padding: 25,
      alignItems: "center",
      backgroundColor: colors.card,
    },

    emptyText: {
      fontSize: 13,
      color: colors.secondaryText,
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
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
    },

    modalTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
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
  });