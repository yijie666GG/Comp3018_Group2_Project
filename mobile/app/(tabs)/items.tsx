import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

const categories = [
  'All',
  'Work',
  'Travel',
  'Equipment',
  'Education',
  'Home Office',
  'Technology',
];

const financialYears = [
  '2026–2027',
  '2025–2026',
  '2024–2025',
];

export default function ItemsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026–2027');
  const [search, setSearch] = useState('');
  const [yearModalVisible, setYearModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Item history</Text>

        <TouchableOpacity
          style={styles.yearSelector}
          onPress={() => setYearModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.yearText}>
            {selectedYear}
          </Text>

          <Ionicons
            name="chevron-down-outline"
            size={20}
            color="#172033"
          />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#8A94A8"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search item, receipt or category..."
            placeholderTextColor="#8A94A8"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color="#8A94A8"
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>

          <TouchableOpacity
            onPress={() => router.push('/manage-categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.manageText}>
              Manage categories
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="list-outline"
              size={30}
              color="#2563EB"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No items saved
          </Text>

          <Text style={styles.emptyText}>
            Items from scanned or uploaded receipts will appear here.
          </Text>

          {selectedCategory !== 'All' && (
            <Text style={styles.filterText}>
              Filter: {selectedCategory}
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={yearModalVisible}
        animationType="fade"
        onRequestClose={() => setYearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Select financial year
            </Text>

            {financialYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.yearOption}
                onPress={() => {
                  setSelectedYear(year);
                  setYearModalVisible(false);
                }}
              >
                <Text style={styles.yearOptionText}>
                  {year}
                </Text>

                {selectedYear === year && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#2563EB"
                  />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setYearModalVisible(false)}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 110,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 24,
  },

  yearSelector: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFCFE',
    marginBottom: 14,
  },

  yearText: {
    fontSize: 16,
    color: '#172033',
    fontWeight: '600',
  },

  searchBox: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: '#172033',
  },

  categoryRow: {
    gap: 8,
    paddingBottom: 24,
  },

  categoryChip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E0E6F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  categoryChipActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#A9CCFF',
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#667085',
  },

  categoryTextActive: {
    color: '#2563EB',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
  },

  manageText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#7A8599',
    maxWidth: 260,
  },

  filterText: {
    marginTop: 12,
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },

  yearOption: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  yearOptionText: {
    fontSize: 15,
    color: '#172033',
  },

  cancelButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#2563EB',
    fontWeight: '800',
  },
});