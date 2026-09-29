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

/**
 * Financial Years Screen
 *
 * Allows users to manage the financial years used
 * throughout the Smart Expense application.
 *
 * Users can:
 * - View saved financial years
 * - Create a new financial year
 * - Select the active financial year
 *
 * Financial year settings are saved to the user's account.
 */
export default function FinancialYearsScreen() {
  // Get colours from the currently active application theme.
  const { colors } = useTheme();

  // Create styles using the active theme colours.
  const styles = createStyles(colors);

  // Automatically determine the current financial year.
  const currentFinancialYear = getCurrentFinancialYear();

  // List of financial years available to the user.
  const [financialYears, setFinancialYears] = useState([
    currentFinancialYear,
  ]);

  // Financial year currently used by the application.
  const [activeYear, setActiveYear] = useState(
    currentFinancialYear
  );

  // Starting year entered when creating a new financial year.
  const [startYear, setStartYear] = useState('');

  /**
   * Load the user's saved financial year settings
   * when the screen is first opened.
   */
  useEffect(() => {
    const loadFinancialYears = async () => {
      try {
        const settings =
          await getFinancialYearSettings();

        setFinancialYears(
          settings.financialYears
        );

        setActiveYear(
          settings.activeFinancialYear
        );
      } catch (error) {
        console.log(
          'Load financial years error:',
          error
        );
      }
    };

    loadFinancialYears();
  }, []);

  /**
   * Creates and saves a new financial year.
   *
   * The user enters the starting year only.
   * For example:
   *
   * 2027 -> 2027–2028
   */
  const addFinancialYear = async () => {
    const year = Number(startYear.trim());

    /**
     * Validate the entered year.
     *
     * Only whole years between 2000 and 2100
     * are accepted.
     */
    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      Alert.alert(
        'Invalid year',
        'Enter a valid starting year, for example 2027.'
      );

      return;
    }

    // Automatically create the financial year range.
    const newFinancialYear =
      `${year}–${year + 1}`;

    // Prevent duplicate financial years.
    if (
      financialYears.includes(
        newFinancialYear
      )
    ) {
      Alert.alert(
        'Already exists',
        'This financial year has already been added.'
      );

      return;
    }

    try {
      // Save the new financial year to the user's settings.
      await saveFinancialYear(
        newFinancialYear
      );

      // Update the local list immediately.
      setFinancialYears((current) => [
        ...current,
        newFinancialYear,
      ]);

      // Clear the input after a successful save.
      setStartYear('');
    } catch (error) {
      console.log(
        'Add financial year error:',
        error
      );

      Alert.alert(
        'Unable to add year',
        'Please try again.'
      );
    }
  };

  /**
   * Changes the active financial year.
   *
   * The selected year is saved so other screens
   * can use it when displaying and filtering expenses.
   */
  const handleSetActiveYear = async (
    year: string
  ) => {
    try {
      await setActiveFinancialYear(year);

      // Update the selected year in the interface.
      setActiveYear(year);
    } catch (error) {
      console.log(
        'Set active year error:',
        error
      );

      Alert.alert(
        'Unable to change year',
        'Please try again.'
      );
    }
  };

  /**
   * Sort financial years by their starting year
   * so they are displayed in chronological order.
   *
   * Both "-" and "–" separators are supported.
   */
  const sortedFinancialYears = [
    ...financialYears,
  ].sort((a, b) => {
    const startA = parseInt(
      a.split(/[–-]/)[0],
      10
    );

    const startB = parseInt(
      b.split(/[–-]/)[0],
      10
    );

    return startA - startB;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Screen header with back navigation */}
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

          {/*
            Empty spacer keeps the title centred
            relative to the back button.
          */}
          <View style={styles.spacer} />
        </View>

        {/* Screen description */}
        <Text style={styles.description}>
          Create financial years and choose which year you want to manage.
        </Text>

        {/* Create a new financial year */}
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
              placeholderTextColor={
                colors.mutedText
              }
              keyboardType="number-pad"
              maxLength={4}
            />

            {/* Add the entered financial year */}
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

        {/* Saved financial years */}
        <Text style={styles.sectionTitle}>
          Your financial years
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
        >
          {sortedFinancialYears.map(
            (year) => {
              // Check whether this is the active financial year.
              const selected =
                activeYear === year;

              return (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearCard,
                    selected &&
                      styles.yearCardActive,
                  ]}
                  onPress={() =>
                    handleSetActiveYear(
                      year
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={styles.yearLeft}
                  >
                    {/* Financial year icon */}
                    <View
                      style={[
                        styles.iconBox,
                        selected &&
                          styles.iconBoxActive,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={21}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    {/* Financial year information */}
                    <View>
                      <Text
                        style={
                          styles.yearTitle
                        }
                      >
                        {year}
                      </Text>

                      <Text
                        style={
                          styles.yearSubtitle
                        }
                      >
                        {selected
                          ? 'Currently selected'
                          : 'Tap to switch'}
                      </Text>
                    </View>
                  </View>

                  {/*
                    Display the Active badge only for
                    the currently selected financial year.
                  */}
                  {selected && (
                    <View
                      style={
                        styles.selectedBadge
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={
                          colors.primary
                        }
                      />

                      <Text
                        style={
                          styles.selectedText
                        }
                      >
                        Active
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>

        {/* Information about financial year storage */}
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

/**
 * Creates theme-aware styles for the Financial Years screen.
 *
 * Colours are provided by ThemeContext so the interface
 * automatically follows the application's active theme.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Main screen content.
    content: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 12,
    },

    // Header containing the back button and screen title.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },

    // Back navigation button.
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Screen title.
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },

    // Balances the back button to keep the title centred.
    spacer: {
      width: 42,
    },

    // Description below the screen header.
    description: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.secondaryText,
      marginBottom: 22,
    },

    // Card containing the financial year creation form.
    createCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 26,
      backgroundColor: colors.card,
    },

    // Form label.
    label: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },

    // Helper text explaining the required input.
    helperText: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
      marginBottom: 12,
    },

    // Row containing the year input and add button.
    createRow: {
      flexDirection: 'row',
      gap: 10,
    },

    // Starting year input.
    input: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor:
        colors.softBackground,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 14,
    },

    // Button used to create a new financial year.
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Financial year list heading.
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 12,
    },

    // Bottom spacing for the financial year list.
    listContent: {
      paddingBottom: 16,
    },

    // Individual financial year card.
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

    // Highlight the currently active financial year.
    yearCardActive: {
      borderColor: colors.primary,
      backgroundColor:
        colors.primarySoft,
    },

    // Left section of the financial year card.
    yearLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    // Calendar icon container.
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    // Icon container when the year is active.
    iconBoxActive: {
      backgroundColor:
        colors.primarySoft,
    },

    // Financial year name.
    yearTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    // Financial year status description.
    yearSubtitle: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
    },

    // Badge shown beside the active financial year.
    selectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        colors.primarySoft,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 3,
    },

    // Text inside the active badge.
    selectedText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },

    // Information card displayed at the bottom.
    infoCard: {
      flexDirection: 'row',
      backgroundColor:
        colors.primarySoft,
      borderRadius: 15,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Information card text.
    infoText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 11,
      lineHeight: 17,
      color: colors.secondaryText,
    },
  });