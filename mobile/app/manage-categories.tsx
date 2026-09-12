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

type Category = {
  categoryId: string;
  categoryName: string;
};

export default function ManageCategoriesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Keep compatibility with the existing category work.
  const [categories, setCategories] = useState<Array<Category | string>>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadcategories();
  }, []);

  const loadcategories = async () => {
    try {
      setLoading(true);

      const categoriesFromDB = await uniqueCategories();

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

  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) {
      Alert.alert(
        'Category required',
        'Enter a category name.'
      );
      return;
    }

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

    setCategories([
      ...categories,
      name,
    ]);

    setNewCategory('');
  };

  const deleteCategory = (
    category: Category | string
  ) => {
    const categoryName =
      typeof category === 'string'
        ? category
        : category.categoryName;

    Alert.alert(
      'Delete category?',
      `Remove "${categoryName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setCategories((current) =>
              current.filter(
                (item) => item !== category
              )
            ),
        },
      ]
    );
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
            Manage categories
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.description}>
          Create categories to organise individual expense items.
        </Text>

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Categories
          </Text>

          <Text style={styles.categoryCount}>
            {categories.length}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
        >
          {categories.map(
            (category, index) => {
              const categoryName =
                typeof category === 'string'
                  ? category
                  : category.categoryName;

              const categoryKey =
                typeof category === 'string'
                  ? `${category}-${index}`
                  : category.categoryId;

              return (
                <View
                  key={categoryKey}
                  style={styles.categoryRow}
                >
                  <View
                    style={styles.categoryLeft}
                  >
                    <View
                      style={styles.categoryIcon}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={19}
                        color={colors.primary}
                      />
                    </View>

                    <Text
                      style={styles.categoryName}
                    >
                      {categoryName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      deleteCategory(category)
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
    },

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

    title: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.text,
    },

    headerSpacer: {
      width: 42,
    },

    description: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 22,
      marginBottom: 20,
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
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 9,
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
      backgroundColor:
        colors.softBackground,
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

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },

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

    listContent: {
      paddingBottom: 30,
    },

    categoryRow: {
      minHeight: 64,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

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

    categoryName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },

    deleteButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });