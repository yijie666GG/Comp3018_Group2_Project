import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import {
  getCurrentFinancialYear,
  getFinancialYearSettings,
  addFinancialYear as saveFinancialYear,
  setActiveFinancialYear,
} from '../firebase/financial-year';

import { useTheme } from '../theme/ThemeContext';

export default function FinancialYearsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const currentFinancialYear = getCurrentFinancialYear();

  const [financialYears, setFinancialYears] = useState([
    currentFinancialYear,
  ]);

  const [activeYear, setActiveYear] = useState(currentFinancialYear);
  const [startYear, setStartYear] = useState('');

  useEffect(() => {
    const loadFinancialYears = async () => {
      try {
        const settings = await getFinancialYearSettings();

        setFinancialYears(settings.financialYears);
        setActiveYear(settings.activeFinancialYear);
      } catch (error) {
        console.log('Load financial years error:', error);
      }
    };

    loadFinancialYears();
  }, []);

  const addFinancialYear = async () => {
    const year = Number(startYear.trim());

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      Alert.alert(
        'Invalid year',
        'Enter a valid starting year, for example 2027.'
      );
      return;
    }

    const newFinancialYear = `${year}–${year + 1}`;

    if (financialYears.includes(newFinancialYear)) {
      Alert.alert(
        'Already exists',
        'This financial year has already been added.'
      );
      return;
    }

    try {
      await saveFinancialYear(newFinancialYear);

      setFinancialYears((current) => [
        newFinancialYear,
        ...current,
      ]);

      setStartYear('');
    } catch (error) {
      console.log('Add financial year error:', error);

      Alert.alert(
        'Unable to add year',
        'Please try again.'
      );
    }
  };

  const handleSetActiveYear = async (year: string) => {
    try {
      await setActiveFinancialYear(year);

      setActiveYear(year);
    } catch (error) {
      console.log('Set active year error:', error);

      Alert.alert(
        'Unable to change year',
        'Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Financial years
          </Text>

          <View style={styles.spacer} />
        </View>

        <Text style={styles.description}>
          Create financial years and choose which year you want to manage.
        </Text>

        <View style={styles.createCard}>
          <Text style={styles.label}>
            Create financial year
          </Text>

          <Text style={styles.helperText}>
            Enter the starting year.
          </Text>

          <View style={styles.createRow}>
            <TextInput
              style={styles.input}
              value={startYear}
              onChangeText={setStartYear}
              placeholder="e.g. 2027"
              placeholderTextColor={colors.mutedText}
              keyboardType="number-pad"
              maxLength={4}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={addFinancialYear}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Your financial years
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {financialYears.map((year) => {
            const selected = activeYear === year;

            return (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearCard,
                  selected && styles.yearCardActive,
                ]}
                onPress={() => handleSetActiveYear(year)}
                activeOpacity={0.7}
              >
                <View style={styles.yearLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      selected && styles.iconBoxActive,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <View>
                    <Text style={styles.yearTitle}>
                      {year}
                    </Text>

                    <Text style={styles.yearSubtitle}>
                      {selected
                        ? 'Currently selected'
                        : 'Tap to switch'}
                    </Text>
                  </View>
                </View>

                {selected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={colors.primary}
                    />

                    <Text style={styles.selectedText}>
                      Active
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Financial years are saved to your account.
          </Text>
        </View>
      </View>
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
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 12,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },

    spacer: {
      width: 42,
    },

    description: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.secondaryText,
      marginBottom: 22,
    },

    createCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 26,
      backgroundColor: colors.card,
    },

    label: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    helperText: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
      marginBottom: 12,
    },

    createRow: {
      flexDirection: 'row',
      gap: 10,
    },

    input: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.softBackground,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 14,
    },

    addButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
    },

    listContent: {
      paddingBottom: 16,
    },

    yearCard: {
      minHeight: 72,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 17,
      padding: 13,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
    },

    yearCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },

    yearLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    iconBoxActive: {
      backgroundColor: colors.primarySoft,
    },

    yearTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    yearSubtitle: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
    },

    selectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 3,
    },

    selectedText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },

    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.primarySoft,
      borderRadius: 15,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    infoText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
    },
  });