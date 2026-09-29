import { useState, useEffect } from 'react';

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
  uniqueCategories,
  addCategory as firebaseAddCategory,
  deleteCategory as firebaseDeleteCategory,
} from '../firebase/categories';

import { useTheme } from '../theme/ThemeContext';

/**
 * Represents a category stored in the user's account.
 */
type Category = {
  categoryId: string;
  categoryName: string;
};

/**
 * Manage Categories Screen
 *
 * Allows users to manage the expense categories used
 * throughout the Smart Expense application.
 *
 * Users can:
 * - View existing categories
 * - Create new categories
 * - Prevent duplicate category names
 * - Delete existing categories
 *
 * Category information is loaded from and saved to Firebase.
 */
export default function ManageCategoriesScreen() {
  // Get colours from the currently active application theme.
  const { colors } = useTheme();

  // Create styles using the active theme colours.
  const styles = createStyles(colors);

  // Keep compatibility with the existing category work.
  const [categories, setCategories] = useState<Category[]>([]);

  // Category name currently entered by the user.
  const [newCategory, setNewCategory] = useState('');

  // Loading state used while retrieving categories.
  const [loading, setLoading] = useState(true);

  // Indicates whether a category is currently being added.
  const [adding, setAdding] = useState(false);

  /**
   * Load the user's categories when the screen
   * is opened for the first time.
   */
  useEffect(() => {
    loadcategories();
  }, []);

  /**
   * Retrieve the user's unique categories from Firebase
   * and store them in local state.
   */
  const loadcategories = async () => {
    try {
      setLoading(true);

      const categoriesFromDB =
        await uniqueCategories();

      setCategories(categoriesFromDB);
    } catch (error) {
      console.log(
        'error fetching users categories: ',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new expense category.
   *
   * The category name is validated before being saved.
   * Empty names and duplicate category names are rejected.
   */
  const addCategory = async () => {
    // Remove unnecessary spaces from the entered category name.
    const name = newCategory.trim();

    // Prevent empty category names.
    if (!name) {
      Alert.alert(
        'Category required',
        'Enter a category name.'
      );

      return;
    }

    /**
     * Check whether a category with the same name
     * already exists.
     *
     * The comparison is case-insensitive so categories
     * such as "Travel" and "travel" are treated as duplicates.
     */
    const alreadyExists = categories.some(
      (category) => {
        const categoryName =
          typeof category === 'string'
            ? category
            : category.categoryName;

        return (
          categoryName.toLowerCase() ===
          name.toLowerCase()
        );
      }
    );

    if (alreadyExists) {
      Alert.alert(
        'Already exists',
        'This category already exists.'
      );

      return;
    }

    try {
      setAdding(true);

      // Save the new category to Firebase.
      const addCategories =
        await firebaseAddCategory(name);

      // Stop if Firebase does not return the created category.
      if (!addCategories) {
        Alert.alert(
          'Could not add category'
        );

        return;
      }

      // Add the new category to the local list immediately.
      setCategories((current) => [
        ...current,
        addCategories,
      ]);

      // Clear the category input after a successful save.
      setNewCategory('');
    } catch (error) {
      console.log(
        'Error adding category: ',
        error
      );
    } finally {
      setAdding(false);
    }
  };

  /**
   * Delete an existing expense category.
   *
   * A confirmation dialog is displayed before the
   * category is permanently removed.
   */
  const deleteCategory = (
    category: Category
  ) => {
    Alert.alert(
      'Delete category?',
      `Remove "${category.categoryName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              // Delete the selected category from Firebase.
              const deletedCategory =
                await firebaseDeleteCategory(
                  category.categoryId
                );

              // Stop if the category could not be deleted.
              if (!deletedCategory) {
                Alert.alert(
                  'Could not delete category'
                );

                return;
              }

              /**
               * Remove the deleted category from local state
               * so the interface updates immediately.
               */
              setCategories((current) =>
                current.filter(
                  (item) =>
                    item.categoryId !==
                    category.categoryId
                )
              );
            } catch (error) {
              console.log(
                'Error deleting category: ',
                error
              );
            }
          },
        },
      ]
    );
  };

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
            Manage categories
          </Text>

          {/*
            Empty spacer keeps the title visually centred
            relative to the back button.
          */}
          <View style={styles.headerSpacer} />
        </View>

        {/* Screen description */}
        <Text style={styles.description}>
          Create categories to organise individual expense items.
        </Text>

        {/* New category creation form */}
        <View style={styles.createCard}>
          <Text style={styles.label}>
            New category
          </Text>

          <View style={styles.createRow}>
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g. Professional fees"
              placeholderTextColor={
                colors.mutedText
              }
            />

            {/* Add the entered category */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCategory}
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

        {/* Category list heading and total count */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Categories
          </Text>

          <Text style={styles.categoryCount}>
            {categories.length}
          </Text>
        </View>

        {/* Existing category list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
        >
          {categories.map(
            (category, index) => {
              /**
               * Keep compatibility with category data
               * that may be represented as either a
               * string or a Category object.
               */
              const categoryName =
                typeof category === 'string'
                  ? category
                  : category.categoryName;

              /**
               * Use the Firebase category ID as the key.
               * A fallback key is provided for string categories.
               */
              const categoryKey =
                typeof category === 'string'
                  ? `${category}-${index}`
                  : category.categoryId;

              return (
                <View
                  key={categoryKey}
                  style={styles.categoryRow}
                >
                  {/* Category information */}
                  <View
                    style={styles.categoryLeft}
                  >
                    <View
                      style={
                        styles.categoryIcon
                      }
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={19}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.categoryName
                      }
                    >
                      {categoryName}
                    </Text>
                  </View>

                  {/* Delete category */}
                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteCategory(
                        category
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              );
            }
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/**
 * Creates theme-aware styles for the Manage Categories screen.
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
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Screen title.
    title: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.text,
    },

    // Balances the back button to keep the title centred.
    headerSpacer: {
      width: 42,
    },

    // Description displayed below the header.
    description: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 22,
      marginBottom: 20,
    },

    // Card containing the category creation form.
    createCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 26,
      backgroundColor: colors.card,
    },

    // New category field label.
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 9,
    },

    // Row containing the category input and add button.
    createRow: {
      flexDirection: 'row',
      gap: 10,
    },

    // New category name input.
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

    // Add category button.
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Category section heading.
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    // Category section title.
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },

    // Number of categories currently available.
    categoryCount: {
      marginLeft: 8,
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor:
        colors.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },

    // Bottom spacing for the category list.
    listContent: {
      paddingBottom: 30,
    },

    // Individual category row.
    categoryRow: {
      minHeight: 64,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    // Left side of a category row.
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    // Category icon container.
    categoryIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    // Category name.
    categoryName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    // Delete category button.
    deleteButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });