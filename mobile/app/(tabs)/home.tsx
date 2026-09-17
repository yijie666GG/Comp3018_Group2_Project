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
  orderBy,
  query,
  limit,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/firebase';

import {
  getCurrentFinancialYear,
  getFinancialYearSettings,
} from '../../firebase/financial-year';

import { useTheme } from '../../theme/ThemeContext';

type Receipt = {
  id: string;
  store?: string;
  date?: string;
  time?: string;
  total?: number;
  gst?: number;
  items?: any[];
  imageUrl?: string;
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [financialYear, setFinancialYear] = useState(
    getCurrentFinancialYear()
  );

  const [name, setName] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [itemsSaved, setItemSaved] = useState(0);
  const [recentReceipt, setRecentReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadHomeData = async () => {
        try {
          setLoading(true);

          const user = auth.currentUser;

          if (!user) {
            return;
          }

          // Get current financial year
          const settings = await getFinancialYearSettings();
          setFinancialYear(settings.activeFinancialYear);

          // Get user information
          const userRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setName(data.name || '');
          }

          // Reference to user's receipts
          const receiptRef = collection(
            db,
            'users',
            user.uid,
            'receipts'
          );

          // Get all receipts
          const receiptSnapshot = await getDocs(receiptRef);

          // Number of receipts saved
          setItemSaved(receiptSnapshot.size);

          // Calculate total expenses
          let total = 0;

          receiptSnapshot.forEach((receipt) => {
            const data = receipt.data();

            total += Number(data.total) || 0;
          });

          setTotalExpenses(total);

          // Get most recent receipt
          const recentQuery = query(
            receiptRef,
            orderBy('createdAt', 'desc'),
            limit(5)
          );

          const recentSnapshot = await getDocs(recentQuery);

          const showRecent: Receipt[] = recentSnapshot.docs.map(
            (receipt) => {
              const data = receipt.data();

              return {
                id: receipt.id,
                store: data.store,
                date: data.date,
                time: data.time,
                items: data.items,
                total: Number(data.total) || 0,
                gst: Number(data.gst) || 0,
                imageUrl: data.imageUrl,
              };
            }
          );

          setRecentReceipts(showRecent);
        } catch (error) {
          console.log('Load home data error:', error);
        } finally {
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
        {/* HEADER */}
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

        {/* FINANCIAL YEAR CARD */}
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

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/scan')}
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

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/manage-categories')}
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

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/items')}
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

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/summary')}
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

        {/* RECENT ITEMS */}
        <Text style={styles.sectionTitle}>
          Recent items
        </Text>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Loading recent items...
            </Text>
          </View>
        ) : recentReceipt.length === 0 ? (
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
              Scan or add a receipt to start tracking your expenses.
            </Text>
          </View>
        ) : (
          recentReceipt.map((receipt) => (
            <View
              key={receipt.id}
              style={styles.receiptCard}
            >
              {/* RECEIPT ICON */}
              <View style={styles.receiptIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              {/* RECEIPT INFORMATION */}
              <View style={styles.receiptInfo}>
                <Text
                  style={styles.receiptStore}
                  numberOfLines={1}
                >
                  {receipt.store || 'Unknown store'}
                </Text>

                <Text style={styles.receiptDate}>
                  {receipt.date || 'No date'}
                  {receipt.time
                    ? ` • ${receipt.time}`
                    : ''}
                </Text>
              </View>

              {/* RECEIPT TOTAL */}
              <Text style={styles.receiptTotal}>
                ${(receipt.total || 0).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 110,
    },

    // HEADER
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

    profileCircle: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // HERO CARD
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

    // SECTION
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },

    // QUICK ACTION GRID
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 28,
    },

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

    // EMPTY STATE
    emptyCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
    },

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

    // RECENT RECEIPT
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

    receiptIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

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

    receiptTotal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
  });