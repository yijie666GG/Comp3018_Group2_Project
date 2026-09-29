/**
 * Home Screen
 *
 * Main dashboard of the Smart Expense application.
 *
 * This screen:
 * - Displays the current user's name
 * - Loads the active financial year
 * - Calculates total expenses for the active financial year
 * - Displays the number of saved receipts
 * - Shows the five most recent receipts
 * - Provides quick navigation to Scan, Categories, Items and Summary
 *
 * Receipt and user data are loaded from Firebase Firestore.
 */


import { useCallback, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/firebase';

import {
  getCurrentFinancialYear,
  getFinancialYearSettings,
} from '../../firebase/financial-year';

import { useTheme } from '../../theme/ThemeContext';

/**
 * Represents a receipt loaded from Firebase Firestore.
 */
type Receipt = {
  id: string;
  store?: string;
  date?: string;
  time?: string;
  financialYear?: string | null;
  total?: number;
  gst?: number;
  items?: any[];
  imageUrl?: string;
  createdAt?: Date | null;
};

/**
 * Home Screen
 *
 * Main dashboard of the Smart Expense application.
 *
 * This screen:
 * - Displays the current user's name
 * - Displays the active financial year
 * - Calculates total expenses for the active financial year
 * - Displays the number of saved receipts
 * - Shows the five most recent receipts
 * - Provides quick navigation to important application features
 *
 * User and receipt information is loaded from Firebase Firestore.
 */
export default function HomeScreen() {
  // Get colours from the currently active application theme.
  const { colors } = useTheme();

  // Create styles using the active theme colours.
  const styles = createStyles(colors);

  // Current financial year used to filter receipt information.
  const [financialYear, setFinancialYear] = useState(
    getCurrentFinancialYear()
  );

  // User and dashboard information.
  const [name, setName] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [itemsSaved, setItemSaved] = useState(0);
  const [recentReceipt, setRecentReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Reload Home screen information whenever the screen becomes active.
   *
   * This ensures that newly added or updated receipts are reflected
   * when the user returns to the Home screen.
   */
  useFocusEffect(
    useCallback(() => {
      const loadHomeData = async () => {
        try {
          setLoading(true);

          // Get the currently authenticated Firebase user.
          const user = auth.currentUser;

          /**
           * If no user is currently signed in,
           * clear all dashboard information.
           */
          if (!user) {
            setRecentReceipts([]);
            setTotalExpenses(0);
            setItemSaved(0);
            return;
          }

          /**
           * Load the user's financial year settings
           * and determine the currently active financial year.
           */
          const settings = await getFinancialYearSettings();

          const activeFinancialYear =
            settings.activeFinancialYear;

          setFinancialYear(activeFinancialYear);

          /**
           * Load the user's profile information.
           *
           * Firestore structure:
           * users/{userId}
           */
          const userRef = doc(
            db,
            'users',
            user.uid
          );

          const userSnapshot =
            await getDoc(userRef);

          if (userSnapshot.exists()) {
            const data =
              userSnapshot.data();

            setName(data.name || '');
          }

          /**
           * Reference the current user's receipt collection.
           *
           * Firestore structure:
           * users/{userId}/receipts/{receiptId}
           */
          const receiptRef = collection(
            db,
            'users',
            user.uid,
            'receipts'
          );

          /**
           * Only retrieve receipts belonging to
           * the currently active financial year.
           */
          const financialYearQuery = query(
            receiptRef,
            where(
              'financialYear',
              '==',
              activeFinancialYear
            )
          );

          const receiptSnapshot =
            await getDocs(
              financialYearQuery
            );

          /**
           * Store the number of receipts found
           * for the active financial year.
           */
          setItemSaved(
            receiptSnapshot.size
          );

          /**
           * Calculate the total value of all receipts
           * belonging to the active financial year.
           */
          let total = 0;

          receiptSnapshot.forEach(
            (receipt) => {
              const data =
                receipt.data();

              total +=
                Number(data.total) || 0;
            }
          );

          setTotalExpenses(total);

          /**
           * Convert Firestore documents into Receipt objects
           * that can be displayed by the Home screen.
           */
          const allReceipts: Receipt[] =
            receiptSnapshot.docs.map(
              (receipt) => {
                const data =
                  receipt.data();

                let createdAt:
                  | Date
                  | null = null;

                /**
                 * Firestore stores createdAt as a Timestamp.
                 * Convert it into a standard JavaScript Date.
                 */
                if (
                  data.createdAt?.toDate
                ) {
                  createdAt =
                    data.createdAt.toDate();
                }

                return {
                  id: receipt.id,

                  store:
                    typeof data.store ===
                    'string'
                      ? data.store
                      : undefined,

                  date:
                    typeof data.date ===
                    'string'
                      ? data.date
                      : undefined,

                  time:
                    typeof data.time ===
                    'string'
                      ? data.time
                      : undefined,

                  financialYear:
                    typeof data.financialYear ===
                    'string'
                      ? data.financialYear
                      : null,

                  total:
                    Number(data.total) || 0,

                  gst:
                    Number(data.gst) || 0,

                  items:
                    Array.isArray(data.items)
                      ? data.items
                      : [],

                  imageUrl:
                    typeof data.imageUrl ===
                    'string'
                      ? data.imageUrl
                      : undefined,

                  createdAt,
                };
              }
            );

          /**
           * Sort receipts from newest to oldest
           * using their creation timestamp.
           */
          allReceipts.sort(
            (a, b) => {
              const timeA =
                a.createdAt?.getTime() || 0;

              const timeB =
                b.createdAt?.getTime() || 0;

              return timeB - timeA;
            }
          );

          /**
           * Only display the five most recent receipts
           * on the Home screen.
           */
          setRecentReceipts(
            allReceipts.slice(0, 5)
          );
        } catch (error) {
          console.error(
            'Load home data error:',
            error
          );

          // Clear recent receipt data if loading fails.
          setRecentReceipts([]);
        } finally {
          // Stop displaying the loading state.
          setLoading(false);
        }
      };

      loadHomeData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User greeting and profile header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.welcome}>
              {name || 'User'}
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Ionicons
              name="person-outline"
              size={22}
              color={colors.primary}
            />
          </View>
        </View>

        {/*
          Financial year overview.

          Displays:
          - Active financial year
          - Total expenses
          - Number of saved receipts
        */}
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

        {/* Quick navigation section */}
        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.grid}>
          {/* Navigate to receipt scanning/upload */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push('/(tabs)/scan')
            }
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="add-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Add receipt
            </Text>

            <Text style={styles.actionSubtitle}>
              Scan or upload receipt
            </Text>
          </TouchableOpacity>

          {/* Navigate to category management */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push('/manage-categories')
            }
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="pricetags-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Manage categories
            </Text>

            <Text style={styles.actionSubtitle}>
              Create and edit categories
            </Text>
          </TouchableOpacity>

          {/* Navigate to saved item history */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push('/(tabs)/items')
            }
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="list-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Item history
            </Text>

            <Text style={styles.actionSubtitle}>
              View saved items
            </Text>
          </TouchableOpacity>

          {/* Navigate to expense summary */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push('/(tabs)/summary')
            }
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="pie-chart-outline"
                size={24}
                color={colors.primary}
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

        {/* Recent receipts section */}
        <Text style={styles.sectionTitle}>
          Recent items
        </Text>

        {/*
          Display a loading message while receipt
          information is being retrieved.
        */}
        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Loading recent items...
            </Text>
          </View>
        ) : recentReceipt.length === 0 ? (
          /*
           * Empty state displayed when the user
           * has no receipts for the active financial year.
           */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={26}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No items yet
            </Text>

            <Text style={styles.emptyText}>
              Scan or add a receipt to start
              tracking your expenses.
            </Text>
          </View>
        ) : (
          /*
           * Display the most recent receipts.
           *
           * Each receipt shows:
           * - Store name
           * - Date
           * - Time
           * - Total amount
           */
          recentReceipt.map(
            (receipt) => (
              <View
                key={receipt.id}
                style={styles.receiptCard}
              >
                <View
                  style={styles.receiptIcon}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View
                  style={styles.receiptInfo}
                >
                  <Text
                    style={
                      styles.receiptStore
                    }
                    numberOfLines={1}
                  >
                    {receipt.store ||
                      'Unknown store'}
                  </Text>

                  <Text
                    style={
                      styles.receiptDate
                    }
                  >
                    {receipt.date ||
                      'No date'}

                    {receipt.time
                      ? ` • ${receipt.time}`
                      : ''}
                  </Text>
                </View>

                <Text
                  style={
                    styles.receiptTotal
                  }
                >
                  $
                  {(receipt.total || 0).toFixed(
                    2
                  )}
                </Text>
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Home screen.
 *
 * Colours are provided by ThemeContext so the screen
 * automatically adapts to the application's active theme.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Main scrollable content.
    content: {
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 110,
    },

    // Header containing greeting and profile icon.
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22,
    },

    greeting: {
      fontSize: 13,
      color: colors.secondaryText,
    },

    welcome: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
    },

    // User profile icon container.
    profileCircle: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Financial year overview card.
    heroCard: {
      backgroundColor: colors.primary,
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

    // Container for financial year statistics.
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

    // Shared section heading.
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },

    // Two-column quick action grid.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 28,
    },

    // Individual quick action card.
    actionCard: {
      width: '48%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      minHeight: 132,
      backgroundColor: colors.card,
    },

    // Icon container used by quick actions.
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    actionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    actionSubtitle: {
      marginTop: 4,
      fontSize: 11,
      color: colors.secondaryText,
    },

    // Empty/loading state container.
    emptyCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
    },

    // Icon displayed in the empty receipt state.
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },

    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    emptyText: {
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
      color: colors.secondaryText,
      marginTop: 4,
    },

    // Individual receipt displayed in the recent items section.
    receiptCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.card,
    },

    // Receipt icon container.
    receiptIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Receipt store/date information.
    receiptInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
    },

    receiptStore: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    receiptDate: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
    },

    // Receipt total amount.
    receiptTotal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
  });