import { useState } from 'react';

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

const defaultCategories = [
  'Work',
  'Travel',
  'Equipment',
  'Education',
  'Home Office',
  'Technology',
];

export default function ManageCategoriesScreen() {
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) {
      Alert.alert('Category required', 'Enter a category name.');
      return;
    }

    const alreadyExists = categories.some(
      (category) => category.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert('Already exists', 'This category already exists.');
      return;
    }

    setCategories([...categories, name]);
    setNewCategory('');
  };

  const deleteCategory = (category: string) => {
    Alert.alert(
      'Delete category?',
      `Remove "${category}"?`,
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
              current.filter((item) => item !== category)
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
              color="#172033"
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
              placeholderTextColor="#8A94A8"
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
          contentContainerStyle={styles.listContent}
        >
          {categories.map((category) => (
            <View
              key={category}
              style={styles.categoryRow}
            >
              <View style={styles.categoryLeft}>
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name="pricetag-outline"
                    size={19}
                    color="#2563EB"
                  />
                </View>

                <Text style={styles.categoryName}>
                  {category}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteCategory(category)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#172033',
  },

  headerSpacer: {
    width: 42,
  },

  description: {
    color: '#7A8599',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 22,
    marginBottom: 20,
  },

  createCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 26,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#556078',
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
    borderColor: '#E6EBF3',
    borderRadius: 14,
    backgroundColor: '#FBFCFE',
    paddingHorizontal: 14,
    color: '#172033',
    fontSize: 14,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
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
    color: '#172033',
  },

  categoryCount: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EEF4FF',
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
    borderBottomColor: '#EEF1F6',
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
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172033',
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});