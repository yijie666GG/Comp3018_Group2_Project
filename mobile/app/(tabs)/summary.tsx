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

import {
  useFocusEffect,
  router,
} from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  getReceipts,
  SavedReceipt,
} from "../../services/receiptStorage";

import {
  getFinancialYearSettings,
} from "../../firebase/financial-year";

import { useTheme } from "../../theme/ThemeContext";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/* ======================================================
   TYPES
====================================================== */

type FinancialYear = string;

type ReceiptItem = {
  name: string;
  price: number;
  category?: string | null;
};

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

/* ======================================================
   NORMALISE FINANCIAL YEAR
====================================================== */

const normaliseFinancialYear = (
  year: string | null | undefined
): string => {
  return String(year ?? "")
    .replace(/[–—]/g, "-")
    .trim();
};

/* ======================================================
   FINANCIAL YEAR HELPER
====================================================== */

const getFinancialYear = (
  dateString: string | null
): FinancialYear | null => {
  if (!dateString) {
    return null;
  }

  let date: Date | null = null;

  /* ------------------------------------------
     YYYY-MM-DD

     Example:
     2025-08-26
  ------------------------------------------ */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      dateString
    )
  ) {
    const [
      year,
      month,
      day,
    ] = dateString
      .split("-")
      .map(Number);

    date = new Date(
      year,
      month - 1,
      day
    );
  }

  /* ------------------------------------------
     Slash dates

     Australian:
     26/08/2025

     American:
     02/19/2024
  ------------------------------------------ */

  else if (
    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
      dateString
    )
  ) {
    const [
      first,
      second,
      year,
    ] = dateString
      .split("/")
      .map(Number);

    /*
      02/19/2024

      second = 19
      therefore this is MM/DD/YYYY
    */

    if (second > 12) {
      date = new Date(
        year,
        first - 1,
        second
      );
    }

    /*
      26/08/2025

      first = 26
      therefore this is DD/MM/YYYY
    */

    else if (first > 12) {
      date = new Date(
        year,
        second - 1,
        first
      );
    }

    /*
      Ambiguous dates are treated
      as Australian DD/MM/YYYY.
    */

    else {
      date = new Date(
        year,
        second - 1,
        first
      );
    }
  }

  /* ------------------------------------------
     Hyphen dates

     26-08-2025
     02-19-2024
  ------------------------------------------ */

  else if (
    /^\d{1,2}-\d{1,2}-\d{4}$/.test(
      dateString
    )
  ) {
    const [
      first,
      second,
      year,
    ] = dateString
      .split("-")
      .map(Number);

    if (second > 12) {
      date = new Date(
        year,
        first - 1,
        second
      );
    } else if (first > 12) {
      date = new Date(
        year,
        second - 1,
        first
      );
    } else {
      date = new Date(
        year,
        second - 1,
        first
      );
    }
  }

  /* ------------------------------------------
     Other formats
  ------------------------------------------ */

  else {
    const parsed =
      new Date(dateString);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      date = parsed;
    }
  }

  if (
    !date ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  /*
    Australian financial year:
    July -> June
  */

  if (month >= 7) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
};

/* ======================================================
   DATE DISPLAY
====================================================== */

const formatDate = (
  dateString: string | null
): string => {
  if (!dateString) {
    return "Unknown date";
  }

  return dateString;
};

/* ======================================================
   TEXT NORMALISATION
====================================================== */

const normaliseText = (
  value: any
): string => {
  return String(
    value ?? ""
  )
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

/* ======================================================
   AMOUNT NORMALISATION
====================================================== */

const normaliseAmount = (
  value: any
): string => {
  const number =
    Number(value ?? 0);

  if (
    Number.isNaN(number)
  ) {
    return "0.00";
  }

  return number.toFixed(2);
};

/* ======================================================
   DUPLICATE KEY
====================================================== */

/*
  A receipt is considered a duplicate when
  the following information matches:

  - Store
  - Date
  - Total
  - Item names
  - Item prices
  - Item categories

  IMPORTANT:

  This function DOES NOT delete anything.

  It is only used by Summary to avoid showing
  the same receipt multiple times.
*/

const getDuplicateKey = (
  receipt: SavedReceipt
): string => {
  const store =
    normaliseText(
      receipt.store
    );

  const date =
    normaliseText(
      receipt.date
    );

  const total =
    normaliseAmount(
      receipt.total
    );

  const items =
    Array.isArray(
      receipt.items
    )
      ? receipt.items
          .map(
            (item) =>
              `${normaliseText(
                item.name
              )}|${normaliseAmount(
                item.price
              )}|${normaliseText(
                item.category
              )}`
          )
          .sort()
          .join("||")
      : "";

  return [
    store,
    date,
    total,
    items,
  ].join("###");
};

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function Summary() {
  const { colors } =
    useTheme();

  const styles =
    createStyles(colors);

  /* ====================================================
     FINANCIAL YEARS
  ==================================================== */

  const [
    financialYears,
    setFinancialYears,
  ] = useState<
    FinancialYear[]
  >([]);

  const [
    selectedYear,
    setSelectedYear,
  ] = useState<FinancialYear>("");
    
  

  /* ====================================================
     RECEIPTS
  ==================================================== */

  const [
    receipts,
    setReceipts,
  ] = useState<
    SavedReceipt[]
  >([]);

  /* ====================================================
     LOADING
  ==================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* ====================================================
     FINANCIAL YEAR MODAL
  ==================================================== */

  const [
    yearModalVisible,
    setYearModalVisible,
  ] = useState(false);

  /* ====================================================
     RECEIPT DETAILS MODAL
  ==================================================== */

  const [
    selectedReceipt,
    setSelectedReceipt,
  ] = useState<
    SavedReceipt | null
  >(null);

  const [
    receiptModalVisible,
    setReceiptModalVisible,
  ] = useState(false);

  /* ====================================================
     LOAD SUMMARY
  ==================================================== */

const loadSummary = async () => {
  try {
    setLoading(true);

    /* --------------------------------------------
       LOAD RECEIPTS
    -------------------------------------------- */

    const savedReceipts = await getReceipts();

    setReceipts(savedReceipts);

    console.log(
      "SUMMARY RECEIPTS:",
      savedReceipts
    );

    /* --------------------------------------------
       LOAD FINANCIAL YEAR SETTINGS
    -------------------------------------------- */

    const settings =
      await getFinancialYearSettings();

    /* --------------------------------------------
       GET YEARS FROM FINANCIAL YEAR SETTINGS
    -------------------------------------------- */

    const settingYears =
      (settings.financialYears ?? [])
        .map((year) =>
          normaliseFinancialYear(year)
        )
        .filter(Boolean);

    /* --------------------------------------------
       GET FINANCIAL YEARS DIRECTLY FROM RECEIPTS

       This makes sure that a receipt's financial
       year appears in the Summary even if that
       year has not been manually added yet.
    -------------------------------------------- */

    const receiptYears =
      savedReceipts
        .map((receipt) => {
          const dateToUse =
            receipt.date ??
            receipt.createdAt;

          return normaliseFinancialYear(
            getFinancialYear(dateToUse)
          );
        })
        .filter(Boolean);

    /* --------------------------------------------
       COMBINE BOTH SOURCES

       Financial Year Settings
       +
       Receipt Financial Years
    -------------------------------------------- */

    const uniqueYears = [
      ...new Set([
        ...settingYears,
        ...receiptYears,
      ]),
    ].sort((a, b) => {
      const startYearA =
        Number(a.split("-")[0]);

      const startYearB =
        Number(b.split("-")[0]);

      return startYearB - startYearA;
    });

    setFinancialYears(uniqueYears);

    console.log(
      "SUMMARY FINANCIAL YEARS:",
      uniqueYears
    );

    /* --------------------------------------------
       SELECT THE CORRECT FINANCIAL YEAR

       First preference:
       user's active financial year.

       If the active year has no receipts,
       choose the first year that actually
       contains receipt data.
    -------------------------------------------- */

    const activeYear =
  normaliseFinancialYear(
    settings.activeFinancialYear
  );

const yearsWithReceipts = [
  ...new Set(receiptYears),
];

if (activeYear) {
  const yearsWithActiveYear = uniqueYears.includes(activeYear)
    ? uniqueYears
    : [...uniqueYears, activeYear];

  setFinancialYears(yearsWithActiveYear);
  setSelectedYear(activeYear);
} else if (yearsWithReceipts.length > 0) {
  setSelectedYear(yearsWithReceipts[0]);
} else if (uniqueYears.length > 0) {
  setSelectedYear(uniqueYears[0]);
} else {
  setSelectedYear("");
}

    console.log(
      "SUMMARY SELECTED YEAR:",
      activeYear
    );

  } catch (error) {
    console.error(
      "Failed to load Summary:",
      error
    );

    setReceipts([]);

    Alert.alert(
      "Summary Error",
      "Unable to load your summary."
    );
  } finally {
    setLoading(false);
  }
};

  /* ====================================================
     REFRESH WHEN SCREEN OPENS
  ==================================================== */

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [])
  );

  /* ====================================================
     DUPLICATE DETECTION BY FINANCIAL YEAR
  ==================================================== */

  const duplicateInfo =
    useMemo(() => {
      /*
        We keep a separate Set for every
        financial year.

        Example:

        2025-2026 -> Set of receipts
        2026-2027 -> Set of receipts
        2027-2028 -> Set of receipts

        This means duplicate counts are
        independent for each year.
      */

      const seenByYear: Record<
        string,
        Set<string>
      > = {};

      const duplicateCounts: Record<
        string,
        number
      > = {};

      const uniqueReceipts: SavedReceipt[] =
        [];

      receipts.forEach(
        (receipt) => {
          const dateToUse =
            receipt.date ??
            receipt.createdAt;

          const receiptYear =
            normaliseFinancialYear(
              getFinancialYear(
                dateToUse
              )
            );

          /*
            If the receipt has no valid
            financial year, don't attempt
            duplicate grouping.
          */

          if (!receiptYear) {
            uniqueReceipts.push(
              receipt
            );

            return;
          }

          /*
            Create a separate Set
            for this financial year.
          */

          if (
            !seenByYear[
              receiptYear
            ]
          ) {
            seenByYear[
              receiptYear
            ] = new Set();
          }

          const duplicateKey =
            getDuplicateKey(
              receipt
            );

          /*
            Duplicate found inside
            this specific financial year.
          */

          if (
            seenByYear[
              receiptYear
            ].has(
              duplicateKey
            )
          ) {
            duplicateCounts[
              receiptYear
            ] =
              (
                duplicateCounts[
                  receiptYear
                ] ?? 0
              ) + 1;

            return;
          }

          /*
            First copy of the receipt.
          */

          seenByYear[
            receiptYear
          ].add(
            duplicateKey
          );

          uniqueReceipts.push(
            receipt
          );
        }
      );

      return {
        uniqueReceipts,
        duplicateCounts,
      };
    }, [receipts]);

  /* ====================================================
     UNIQUE RECEIPTS
  ==================================================== */

  const uniqueReceipts =
    duplicateInfo.uniqueReceipts;

  /* ====================================================
     DUPLICATE COUNT FOR CURRENT YEAR
  ==================================================== */

  const duplicateCountForSelectedYear =
    duplicateInfo
      .duplicateCounts[
      normaliseFinancialYear(
        selectedYear
      )
    ] ?? 0;

  /* ====================================================
     FILTER RECEIPTS BY FINANCIAL YEAR
  ==================================================== */

 const filteredReceipts = useMemo(() => {
  return uniqueReceipts.filter((receipt) => {
    const receiptYear =
      receipt.financialYear ??
      getFinancialYear(
        receipt.date ?? receipt.createdAt
      );

    return (
      normaliseFinancialYear(
        receiptYear
      ) ===
      normaliseFinancialYear(
        selectedYear
      )
    );
  });
}, [
  uniqueReceipts,
  selectedYear,
]);

  /* ====================================================
     TOTAL EXPENSES
  ==================================================== */

  const totalExpenses =
    useMemo(() => {
      return filteredReceipts.reduce(
        (
          total,
          receipt
        ) => {
          if (
            receipt.total !==
              null &&
            receipt.total !==
              undefined &&
            !Number.isNaN(
              receipt.total
            )
          ) {
            return (
              total +
              receipt.total
            );
          }

          const itemTotal =
            receipt.items.reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.price,
              0
            );

          return (
            total +
            itemTotal
          );
        },
        0
      );
    }, [
      filteredReceipts,
    ]);

  /* ====================================================
     RECEIPT COUNT
  ==================================================== */

  const receiptCount =
    filteredReceipts.length;

  /* ====================================================
     EXPENSE ITEMS
  ==================================================== */

  const expenses =
    useMemo<Expense[]>(
      () => {
        const result: Expense[] =
          [];

        filteredReceipts.forEach(
          (receipt) => {
            receipt.items.forEach(
              (
                item,
                itemIndex
              ) => {
                result.push({
                  id: `${receipt.id}-${itemIndex}`,

                  name:
                    item.name,

                  merchant:
                    receipt.store ??
                    "Unknown",

                  date:
                    receipt.date ??
                    "",

                  category:
                    item.category ||
                    "Other",

                  amount:
                    item.price,
                });
              }
            );
          }
        );

        return result;
      },
      [filteredReceipts]
    );

  /* ====================================================
     CATEGORY SUMMARY
  ==================================================== */

  const categorySummaries =
    useMemo<
      CategorySummary[]
    >(() => {
      const categoryMap: Record<
        string,
        {
          amount: number;
          count: number;
        }
      > = {};

      expenses.forEach(
        (expense) => {
          if (
            !categoryMap[
              expense.category
            ]
          ) {
            categoryMap[
              expense.category
            ] = {
              amount: 0,
              count: 0,
            };
          }

          categoryMap[
            expense.category
          ].amount +=
            expense.amount;

          categoryMap[
            expense.category
          ].count += 1;
        }
      );

      const categoryTotal =
        Object.values(
          categoryMap
        ).reduce(
          (
            sum,
            category
          ) =>
            sum +
            category.amount,
          0
        );

      return Object.entries(
        categoryMap
      )
        .map(
          ([
            name,
            data,
          ]) => ({
            name,

            amount:
              data.amount,

            count:
              data.count,

            percentage:
              categoryTotal >
              0
                ? Math.round(
                    (data.amount /
                      categoryTotal) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount
        );
    }, [expenses]);

  /* ====================================================
     OPEN RECEIPT DETAILS
  ==================================================== */

  const openReceipt =
    (
      receipt: SavedReceipt
    ) => {
      setSelectedReceipt(
        receipt
      );

      setReceiptModalVisible(
        true
      );
    };

  /* ====================================================
     EXPORT CSV
  ==================================================== */

  const handleExportCSV =
    async () => {
      try {
        if (
          filteredReceipts.length ===
          0
        ) {
          Alert.alert(
            "Export CSV",
            "There are no receipts to export for this financial year."
          );

          return;
        }

        const escapeCSV =
          (
            value:
              | string
              | number
              | null
              | undefined
          ) => {
            const text =
              String(
                value ?? ""
              );

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          };

        const rows: string[] =
          [
            [
              "Receipt ID",
              "Store",
              "Date",
              "Financial Year",
              "Receipt Total",
              "GST",
              "Item",
              "Category",
              "Item Price",
            ]
              .map(
                escapeCSV
              )
              .join(","),
          ];

        filteredReceipts.forEach(
          (receipt) => {
            receipt.items.forEach(
              (item) => {
                rows.push(
                  [
                    receipt.id,

                    receipt.store ??
                      "Unknown",

                    formatDate(
                      receipt.date ??
                        receipt.createdAt
                    ),

                    getFinancialYear(
                      receipt.date ??
                        receipt.createdAt
                    ) ??
                      "Unknown",

                    (
                      receipt.total ??
                      0
                    ).toFixed(2),

                    (
                      receipt.gst ??
                      0
                    ).toFixed(2),

                    item.name,

                    item.category ||
                      "Other",

                    item.price.toFixed(
                      2
                    ),
                  ]
                    .map(
                      escapeCSV
                    )
                    .join(",")
                );
              }
            );
          }
        );

        const csvContent =
          rows.join(
            "\n"
          );

        /* ------------------------------------------
           WEB
        ------------------------------------------ */

        if (
          Platform.OS ===
          "web"
        ) {
          const blob =
            new Blob(
              [csvContent],
              {
                type:
                  "text/csv;charset=utf-8;",
              }
            );

          const url =
            URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              "a"
            );

          link.href = url;

          link.download =
            `expense-summary-${selectedYear}.csv`;

          document.body.appendChild(
            link
          );

          link.click();

          document.body.removeChild(
            link
          );

          URL.revokeObjectURL(
            url
          );

          return;
        }

        /* ------------------------------------------
           MOBILE
        ------------------------------------------ */

        const fileName =
          `expense-summary-${selectedYear}.csv`;

        const fileUri =
          `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(
          fileUri,
          csvContent,
          {
            encoding:
              FileSystem
                .EncodingType
                .UTF8,
          }
        );

        const sharingAvailable =
          await Sharing.isAvailableAsync();

        if (
          !sharingAvailable
        ) {
          Alert.alert(
            "Export CSV",
            "Sharing is not available on this device."
          );

          return;
        }

        await Sharing.shareAsync(
          fileUri,
          {
            mimeType:
              "text/csv",

            dialogTitle:
              `Export ${selectedYear} summary`,

            UTI:
              "public.comma-separated-values-text",
          }
        );
      } catch (error) {
        console.error(
          "CSV export error:",
          error
        );

        Alert.alert(
          "Export CSV",
          "Something went wrong while creating the CSV file."
        );
      }
    };

  /* ====================================================
     LOADING SCREEN
  ==================================================== */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading summary...
        </Text>
      </SafeAreaView>
    );
  }

  /* ====================================================
     MAIN UI
  ==================================================== */

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={["top"]}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              colors.text
            }
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Financial summary
        </Text>

        <Pressable
          style={
            styles.exportButton
          }
          onPress={
            handleExportCSV
          }
        >
          <Text
            style={
              styles.exportText
            }
          >
            Export CSV
          </Text>
        </Pressable>
      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            FINANCIAL YEAR SELECTOR
        ================================================== */}

        <Pressable
          style={
            styles.yearSelector
          }
          onPress={() =>
            setYearModalVisible(
              true
            )
          }
        >
          <Text
            style={
              styles.yearText
            }
          >
            {selectedYear ||
              "Select financial year"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={19}
            color={
              colors.text
            }
          />
        </Pressable>

        {/* ==================================================
            DUPLICATE NOTICE

            IMPORTANT:
            This count belongs ONLY to the
            currently selected financial year.
        ================================================== */}

        {duplicateCountForSelectedYear >
          0 && (
          <View
            style={
              styles.duplicateNotice
            }
          >
            <Ionicons
              name="copy-outline"
              size={17}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.duplicateNoticeText
              }
            >
              {
                duplicateCountForSelectedYear
              }{" "}
              duplicate{" "}
              {duplicateCountForSelectedYear ===
              1
                ? "record"
                : "records"}{" "}
              hidden in{" "}
              {selectedYear}
            </Text>
          </View>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <View
          style={
            styles.statsRow
          }
        >
          <View
            style={
              styles.statCard
            }
          >
            <Text
              style={
                styles.statLabel
              }
            >
              Total expenses
            </Text>

            <Text
              style={
                styles.statAmount
              }
            >
              $
              {totalExpenses.toFixed(
                2
              )}
            </Text>
          </View>

          <View
            style={
              styles.statCard
            }
          >
            <Text
              style={
                styles.statLabel
              }
            >
              Total receipts
            </Text>

            <Text
              style={
                styles.statNumber
              }
            >
              {receiptCount}
            </Text>
          </View>
        </View>

        {/* ==================================================
            CATEGORY BREAKDOWN
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Category breakdown
          </Text>

          <Text
            style={
              styles.sectionYear
            }
          >
            {selectedYear}
          </Text>
        </View>

        <View
          style={
            styles.categoryList
          }
        >
          {categorySummaries.length ===
          0 ? (
            <View
              style={
                styles.emptyState
              }
            >
              <Text
                style={
                  styles.emptyText
                }
              >
                No expenses in
                this financial
                year.
              </Text>
            </View>
          ) : (
            categorySummaries.map(
              (
                category,
                index
              ) => (
                <View
                  key={
                    category.name
                  }
                  style={[
                    styles.categoryRow,
                    index !==
                      categorySummaries.length -
                        1 &&
                      styles.categoryBorder,
                  ]}
                >
                  <View>
                    <Text
                      style={
                        styles.categoryName
                      }
                    >
                      {
                        category.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.itemCount
                      }
                    >
                      {
                        category.count
                      }{" "}
                      {category.count ===
                      1
                        ? "item"
                        : "items"}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.categoryAmount
                    }
                  >
                    $
                    {category.amount.toFixed(
                      2
                    )}
                  </Text>
                </View>
              )
            )
          )}
        </View>

        {/* ==================================================
            RECEIPTS
        ================================================== */}

        <Text
          style={
            styles.receiptsTitle
          }
        >
          Receipts included in
          export
        </Text>

        {filteredReceipts.length ===
        0 ? (
          <View
            style={
              styles.emptyReceiptCard
            }
          >
            <Text
              style={
                styles.emptyText
              }
            >
              No receipts for
              this financial
              year.
            </Text>
          </View>
        ) : (
          filteredReceipts.map(
            (receipt) => (
              <Pressable
                key={
                  receipt.id
                }
                style={
                  styles.receiptCard
                }
                onPress={() =>
                  openReceipt(
                    receipt
                  )
                }
              >
                {/* ------------------------------------------
                    RECEIPT HEADER
                ------------------------------------------ */}

                <View
                  style={
                    styles.receiptHeader
                  }
                >
                  <View
                    style={
                      styles.storeIcon
                    }
                  >
                    <Text
                      style={
                        styles.storeIconText
                      }
                    >
                      {(
                        receipt.store ??
                        "R"
                      )
                        .charAt(
                          0
                        )
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.storeInfo
                    }
                  >
                    <Text
                      style={
                        styles.storeName
                      }
                    >
                      {receipt.store ??
                        "Unknown"}
                    </Text>

                    <Text
                      style={
                        styles.receiptDate
                      }
                    >
                      {formatDate(
                        receipt.date ??
                          receipt.createdAt
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.receiptTotalContainer
                    }
                  >
                    <Text
                      style={
                        styles.receiptTotal
                      }
                    >
                      $
                      {(
                        receipt.total ??
                        0
                      ).toFixed(
                        2
                      )}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        colors.secondaryText
                      }
                    />
                  </View>
                </View>

                {/* ------------------------------------------
                    DIVIDER
                ------------------------------------------ */}

                <View
                  style={
                    styles.receiptDivider
                  }
                />

                {/* ------------------------------------------
                    ITEMS
                ------------------------------------------ */}

                {receipt.items.map(
                  (
                    item,
                    itemIndex
                  ) => (
                    <View
                      key={`${receipt.id}-${itemIndex}`}
                      style={[
                        styles.receiptItem,
                        itemIndex !==
                          receipt.items.length -
                            1 &&
                          styles.itemBorder,
                      ]}
                    >
                      <View
                        style={
                          styles.itemLeft
                        }
                      >
                        <Text
                          style={
                            styles.itemName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            item.name
                          }
                        </Text>

                        <View
                          style={
                            styles.categoryBadge
                          }
                        >
                          <Text
                            style={
                              styles.categoryBadgeText
                            }
                          >
                            {item.category ||
                              "Other"}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={
                          styles.itemPrice
                        }
                      >
                        $
                        {item.price.toFixed(
                          2
                        )}
                      </Text>
                    </View>
                  )
                )}
              </Pressable>
            )
          )
        )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      {/* ==================================================
          FINANCIAL YEAR MODAL
      ================================================== */}

      <Modal
        visible={
          yearModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setYearModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setYearModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.modalContent
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Select financial year
            </Text>

            {financialYears.length ===
            0 ? (
              <Text
                style={
                  styles.emptyModalText
                }
              >
                No financial years
                have been created
                yet.
              </Text>
            ) : (
              financialYears.map(
                (year) => (
                  <Pressable
                    key={
                      year
                    }
                    style={[
                      styles.yearOption,
                      selectedYear ===
                        year &&
                        styles.selectedYearOption,
                    ]}
                    onPress={() => {
                      setSelectedYear(
                        year
                      );

                      setYearModalVisible(
                        false
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.yearOptionText,
                        selectedYear ===
                          year &&
                          styles.selectedYearText,
                      ]}
                    >
                      {year}
                    </Text>

                    {selectedYear ===
                      year && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color={
                          colors.primary
                        }
                      />
                    )}
                  </Pressable>
                )
              )
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================================================
          RECEIPT DETAILS MODAL
      ================================================== */}

      <Modal
        visible={
          receiptModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setReceiptModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.detailsOverlay
          }
        >
          <View
            style={
              styles.detailsModal
            }
          >
            {/* ------------------------------------------
                DETAILS HEADER
            ------------------------------------------ */}

            <View
              style={
                styles.detailsHeader
              }
            >
              <Text
                style={
                  styles.detailsTitle
                }
              >
                Receipt Details
              </Text>

              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setReceiptModalVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    colors.text
                  }
                />
              </Pressable>
            </View>

            {selectedReceipt && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                {/* ------------------------------------------
                    STORE
                ------------------------------------------ */}

                <View
                  style={
                    styles.detailsStoreRow
                  }
                >
                  <View
                    style={
                      styles.detailsStoreIcon
                    }
                  >
                    <Text
                      style={
                        styles.detailsStoreIconText
                      }
                    >
                      {(
                        selectedReceipt.store ??
                        "R"
                      )
                        .charAt(
                          0
                        )
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailsStoreInfo
                    }
                  >
                    <Text
                      style={
                        styles.detailsStoreName
                      }
                    >
                      {selectedReceipt.store ??
                        "Unknown store"}
                    </Text>

                    <Text
                      style={
                        styles.detailsDate
                      }
                    >
                      {formatDate(
                        selectedReceipt.date ??
                          selectedReceipt.createdAt
                      )}
                    </Text>
                  </View>
                </View>

                {/* ------------------------------------------
                    RECEIPT INFORMATION
                ------------------------------------------ */}

                <View
                  style={
                    styles.detailsInfoCard
                  }
                >
                  <View
                    style={
                      styles.detailsInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.detailsLabel
                      }
                    >
                      Financial year
                    </Text>

                    <Text
                      style={
                        styles.detailsValue
                      }
                    >
                      {getFinancialYear(
                        selectedReceipt.date ??
                          selectedReceipt.createdAt
                      ) ??
                        "Unknown"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailsInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.detailsLabel
                      }
                    >
                      Date
                    </Text>

                    <Text
                      style={
                        styles.detailsValue
                      }
                    >
                      {formatDate(
                        selectedReceipt.date
                      )}
                    </Text>
                  </View>

                  {selectedReceipt.time && (
                    <View
                      style={
                        styles.detailsInfoRow
                      }
                    >
                      <Text
                        style={
                          styles.detailsLabel
                        }
                      >
                        Time
                      </Text>

                      <Text
                        style={
                          styles.detailsValue
                        }
                      >
                        {
                          selectedReceipt.time
                        }
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.detailsInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.detailsLabel
                      }
                    >
                      GST
                    </Text>

                    <Text
                      style={
                        styles.detailsValue
                      }
                    >
                      $
                      {(
                        selectedReceipt.gst ??
                        0
                      ).toFixed(
                        2
                      )}
                    </Text>
                  </View>
                </View>

                {/* ------------------------------------------
                    ITEMS
                ------------------------------------------ */}

                <Text
                  style={
                    styles.detailsItemsTitle
                  }
                >
                  Items
                </Text>

                <View
                  style={
                    styles.detailsItemsCard
                  }
                >
                  {selectedReceipt.items.map(
                    (
                      item,
                      index
                    ) => (
                      <View
                        key={`${selectedReceipt.id}-details-${index}`}
                        style={[
                          styles.detailsItemRow,
                          index !==
                            selectedReceipt.items.length -
                              1 &&
                            styles.detailsItemBorder,
                        ]}
                      >
                        <View
                          style={
                            styles.detailsItemLeft
                          }
                        >
                          <Text
                            style={
                              styles.detailsItemName
                            }
                          >
                            {
                              item.name
                            }
                          </Text>

                          <View
                            style={
                              styles.detailsCategoryBadge
                            }
                          >
                            <Text
                              style={
                                styles.detailsCategoryText
                              }
                            >
                              {item.category ||
                                "Other"}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={
                            styles.detailsItemPrice
                          }
                        >
                          $
                          {item.price.toFixed(
                            2
                          )}
                        </Text>
                      </View>
                    )
                  )}
                </View>

                {/* ------------------------------------------
                    TOTAL
                ------------------------------------------ */}

                <View
                  style={
                    styles.detailsTotalCard
                  }
                >
                  <Text
                    style={
                      styles.detailsTotalLabel
                    }
                  >
                    Total
                  </Text>

                  <Text
                    style={
                      styles.detailsTotalAmount
                    }
                  >
                    $
                    {(
                      selectedReceipt.total ??
                      selectedReceipt.items.reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          item.price,
                        0
                      )
                    ).toFixed(
                      2
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailsBottomSpace
                  }
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const createStyles = (
  colors: ReturnType<
    typeof useTheme
  >["colors"]
) =>
  StyleSheet.create({
    /* ------------------------------------------
       MAIN
    ------------------------------------------ */

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    loadingContainer: {
      flex: 1,
      backgroundColor:
        colors.background,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color:
        colors.secondaryText,
    },

    /* ------------------------------------------
       HEADER
    ------------------------------------------ */

    header: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        colors.softBackground,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    headerTitle: {
      flex: 1,
      marginLeft: 12,
      fontSize: 18,
      fontWeight: "800",
      color:
        colors.text,
    },

    exportButton: {
      backgroundColor:
        colors.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
    },

    exportText: {
      color:
        colors.primary,
      fontSize: 13,
      fontWeight: "800",
    },

    /* ------------------------------------------
       SCROLL
    ------------------------------------------ */

    scrollContent: {
      padding: 22,
      paddingBottom: 40,
    },

    /* ------------------------------------------
       YEAR SELECTOR
    ------------------------------------------ */

    yearSelector: {
      height: 48,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        colors.card,
    },

    yearText: {
      fontSize: 14,
      color:
        colors.text,
      fontWeight: "500",
    },

    /* ------------------------------------------
       DUPLICATE NOTICE
    ------------------------------------------ */

    duplicateNotice: {
      marginTop: 10,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor:
        colors.primarySoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    duplicateNoticeText: {
      fontSize: 12,
      fontWeight: "700",
      color:
        colors.primary,
    },

    /* ------------------------------------------
       STATS
    ------------------------------------------ */

    statsRow: {
      flexDirection:
        "row",
      gap: 12,
      marginTop: 12,
    },

    statCard: {
      flex: 1,
      minHeight: 86,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 18,
      padding: 16,
      justifyContent:
        "center",
      backgroundColor:
        colors.card,
    },

    statLabel: {
      fontSize: 12,
      color:
        colors.secondaryText,
      marginBottom: 7,
    },

    statAmount: {
      fontSize: 20,
      fontWeight: "800",
      color:
        colors.text,
    },

    statNumber: {
      fontSize: 20,
      fontWeight: "800",
      color:
        colors.text,
    },

    /* ------------------------------------------
       CATEGORY
    ------------------------------------------ */

    sectionHeader: {
      marginTop: 26,
      marginBottom: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color:
        colors.text,
    },

    sectionYear: {
      fontSize: 11,
      color:
        colors.secondaryText,
    },

    categoryList: {
      backgroundColor:
        colors.background,
    },

    categoryRow: {
      minHeight: 67,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    categoryBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    categoryName: {
      fontSize: 15,
      fontWeight: "700",
      color:
        colors.text,
    },

    itemCount: {
      marginTop: 3,
      fontSize: 12,
      color:
        colors.mutedText,
    },

    categoryAmount: {
      fontSize: 15,
      fontWeight: "800",
      color:
        colors.text,
    },

    /* ------------------------------------------
       RECEIPTS
    ------------------------------------------ */

    receiptsTitle: {
      marginTop: 20,
      marginBottom: 10,
      fontSize: 16,
      fontWeight: "800",
      color:
        colors.text,
    },

    receiptCard: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      backgroundColor:
        colors.card,
    },

    receiptHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    storeIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        colors.primarySoft,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    storeIconText: {
      fontSize: 18,
      fontWeight: "800",
      color:
        colors.primary,
    },

    storeInfo: {
      flex: 1,
      marginLeft: 11,
    },

    storeName: {
      fontSize: 14,
      fontWeight: "800",
      color:
        colors.text,
    },

    receiptDate: {
      marginTop: 3,
      fontSize: 12,
      color:
        colors.secondaryText,
    },

    receiptTotalContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    receiptTotal: {
      fontSize: 15,
      fontWeight: "800",
      color:
        colors.text,
    },

    receiptDivider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginTop: 13,
    },

    receiptItem: {
      minHeight: 48,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      borderStyle:
        "dashed",
    },

    itemLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flex: 1,
      paddingRight: 10,
    },

    itemName: {
      flexShrink: 1,
      fontSize: 14,
      fontWeight: "700",
      color:
        colors.text,
      marginRight: 7,
    },

    categoryBadge: {
      backgroundColor:
        colors.primarySoft,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
    },

    categoryBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color:
        colors.primary,
    },

    itemPrice: {
      fontSize: 14,
      fontWeight: "800",
      color:
        colors.text,
    },

    /* ------------------------------------------
       EMPTY STATES
    ------------------------------------------ */

    emptyState: {
      paddingVertical: 25,
      alignItems:
        "center",
    },

    emptyReceiptCard: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 18,
      padding: 25,
      alignItems:
        "center",
      backgroundColor:
        colors.card,
    },

    emptyText: {
      fontSize: 13,
      color:
        colors.secondaryText,
    },

    bottomSpace: {
      height: 30,
    },

    /* ------------------------------------------
       YEAR MODAL
    ------------------------------------------ */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.25)",
      justifyContent:
        "center",
      paddingHorizontal: 25,
    },

    modalContent: {
      backgroundColor:
        colors.card,
      borderRadius: 18,
      padding: 18,
    },

    modalTitle: {
      fontSize: 17,
      fontWeight: "800",
      color:
        colors.text,
      marginBottom: 10,
    },

    emptyModalText: {
      fontSize: 14,
      color:
        colors.secondaryText,
      paddingVertical: 15,
    },

    yearOption: {
      minHeight: 48,
      paddingHorizontal: 10,
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    selectedYearOption: {
      backgroundColor:
        colors.primarySoft,
    },

    yearOptionText: {
      fontSize: 14,
      color:
        colors.secondaryText,
    },

    selectedYearText: {
      color:
        colors.primary,
      fontWeight: "700",
    },

    /* ------------------------------------------
       RECEIPT DETAILS
    ------------------------------------------ */

    detailsOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "flex-end",
    },

    detailsModal: {
      maxHeight: "90%",
      backgroundColor:
        colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 18,
    },

    detailsHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    detailsTitle: {
      fontSize: 20,
      fontWeight: "800",
      color:
        colors.text,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.softBackground,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    detailsStoreRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 18,
    },

    detailsStoreIcon: {
      width: 54,
      height: 54,
      borderRadius: 16,
      backgroundColor:
        colors.primarySoft,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    detailsStoreIconText: {
      fontSize: 22,
      fontWeight: "800",
      color:
        colors.primary,
    },

    detailsStoreInfo: {
      flex: 1,
      marginLeft: 13,
    },

    detailsStoreName: {
      fontSize: 17,
      fontWeight: "800",
      color:
        colors.text,
    },

    detailsDate: {
      marginTop: 4,
      fontSize: 13,
      color:
        colors.secondaryText,
    },

    detailsInfoCard: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 16,
      backgroundColor:
        colors.card,
      paddingHorizontal: 15,
      marginBottom: 20,
    },

    detailsInfoRow: {
      minHeight: 48,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    detailsLabel: {
      fontSize: 13,
      color:
        colors.secondaryText,
    },

    detailsValue: {
      fontSize: 13,
      fontWeight: "700",
      color:
        colors.text,
    },

    detailsItemsTitle: {
      fontSize: 16,
      fontWeight: "800",
      color:
        colors.text,
      marginBottom: 10,
    },

    detailsItemsCard: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 16,
      backgroundColor:
        colors.card,
      paddingHorizontal: 15,
    },

    detailsItemRow: {
      minHeight: 60,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    detailsItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    detailsItemLeft: {
      flex: 1,
      paddingRight: 10,
    },

    detailsItemName: {
      fontSize: 14,
      fontWeight: "700",
      color:
        colors.text,
      marginBottom: 5,
    },

    detailsCategoryBadge: {
      alignSelf:
        "flex-start",
      backgroundColor:
        colors.primarySoft,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
    },

    detailsCategoryText: {
      fontSize: 10,
      fontWeight: "700",
      color:
        colors.primary,
    },

    detailsItemPrice: {
      fontSize: 14,
      fontWeight: "800",
      color:
        colors.text,
    },

    detailsTotalCard: {
      marginTop: 18,
      padding: 18,
      borderRadius: 18,
      backgroundColor:
        colors.primarySoft,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    detailsTotalLabel: {
      fontSize: 15,
      fontWeight: "700",
      color:
        colors.text,
    },

    detailsTotalAmount: {
      fontSize: 22,
      fontWeight: "900",
      color:
        colors.primary,
    },

    detailsBottomSpace: {
      height: 30,
    },
  });