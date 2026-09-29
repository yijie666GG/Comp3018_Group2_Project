import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { useTheme } from '../theme/ThemeContext';

/**
 * Appearance Screen
 *
 * Allows the user to choose the visual appearance
 * of the Smart Expense application.
 *
 * Available appearance modes:
 * - Light
 * - Dark
 * - System
 *
 * Theme changes are managed through ThemeContext and
 * are applied throughout the application.
 */
export default function AppearanceScreen() {
  // Get the current appearance mode, theme setter and colours.
  const { mode, setMode, colors } = useTheme();

  // Create styles using the currently active theme colours.
  const styles = createStyles(colors);

  /**
   * Available appearance options.
   *
   * "System" allows the application to follow the
   * appearance setting of the user's device.
   */
  const options = [
    {
      key: 'light',
      title: 'Light',
      subtitle: 'Always use light mode',
      icon: 'sunny-outline',
    },
    {
      key: 'dark',
      title: 'Dark',
      subtitle: 'Always use dark mode',
      icon: 'moon-outline',
    },
    {
      key: 'system',
      title: 'System',
      subtitle: 'Follow your device appearance',
      icon: 'phone-portrait-outline',
    },
  ] as const;

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
            Appearance
          </Text>

          {/*
            Empty spacer keeps the title visually centred
            between the left and right sides of the header.
          */}
          <View style={styles.spacer} />
        </View>

        {/* Screen description */}
        <Text style={styles.description}>
          Choose how Smart Expense looks on your device.
        </Text>

        {/* Appearance mode options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            // Determine whether this option is currently selected.
            const selected = mode === option.key;

            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionCard,
                  selected && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}

                // Update the global application appearance mode.
                onPress={() => setMode(option.key)}
              >
                <View style={styles.optionLeft}>
                  {/* Appearance mode icon */}
                  <View
                    style={[
                      styles.iconBox,
                      selected && styles.iconBoxSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={colors.primary}
                    />
                  </View>

                  {/* Appearance mode name and description */}
                  <View>
                    <Text style={styles.optionTitle}>
                      {option.title}
                    </Text>

                    <Text style={styles.optionSubtitle}>
                      {option.subtitle}
                    </Text>
                  </View>
                </View>

                {/*
                  Custom radio button used to show
                  the currently selected appearance mode.
                */}
                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioOuterSelected,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Appearance screen.
 *
 * All main colours come from ThemeContext so this screen
 * also updates when the selected appearance mode changes.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Main screen container.
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Main page content.
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
      backgroundColor: colors.softBackground,
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

    // Description displayed below the header.
    description: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.secondaryText,
      marginBottom: 24,
    },

    // Container for appearance options.
    optionsContainer: {
      gap: 12,
    },

    // Default appearance option card.
    optionCard: {
      minHeight: 78,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 17,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
    },

    // Additional styling for the selected appearance option.
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },

    // Left section containing the icon and option information.
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    // Appearance option icon container.
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },

    // Icon background when the option is selected.
    iconBoxSelected: {
      backgroundColor: colors.primarySoft,
    },

    // Appearance option name.
    optionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    // Appearance option description.
    optionSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: colors.secondaryText,
    },

    // Outer circle of the custom radio button.
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Radio button border when selected.
    radioOuterSelected: {
      borderColor: colors.primary,
    },

    // Inner circle displayed for the selected option.
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  });