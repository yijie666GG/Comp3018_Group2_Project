import { useCallback, useState } from 'react';
import { uniqueCategories } from '../../firebase/categories';

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
import { router, useFocusEffect } from 'expo-router';

import {
  getCurrentFinancialYear,
  getFinancialYearSettings,
} from '../../firebase/financial-year';

import {
  getReceipts,
  SavedReceiptItem,
    updateReceiptItem,
      deleteReceiptItem,


} from '../../services/receiptStorage';

import { useTheme } from '../../theme/ThemeContext';

export default function ItemsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const currentFinancialYear = getCurrentFinancialYear();

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [categories, setCategories] = useState<string[]>(['All']);

  const [financialYears, setFinancialYears] = useState([
    currentFinancialYear,
  ]);

  const [selectedYear, setSelectedYear] = useState(
    currentFinancialYear
  );

  const [activeYear, setActiveYear] = useState(
    currentFinancialYear
  );

  const [search, setSearch] = useState('');

  const [selectedItem, setSelectedItem] =
  useState<
    (SavedReceiptItem & {
      receiptId: string;
      itemIndex: number;
      store: string | null;
      date: string | null;
      financialYear: string | null;
    }) | null
  >(null);

const [editModalVisible, setEditModalVisible] =
  useState(false);

  const [editName, setEditName] = useState('');
const [editPrice, setEditPrice] = useState('');
const [editCategory, setEditCategory] = useState('');
const [categorySearch, setCategorySearch] = useState('');
const [categoryModalVisible, setCategoryModalVisible] =
  useState(false);

  const [yearModalVisible, setYearModalVisible] =
    useState(false);

  const [allItems, setAllItems] = useState<
  (SavedReceiptItem & {
    receiptId: string;
    itemIndex: number;
    store: string | null;
    date: string | null;
    financialYear: string | null;
  })[]
>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const settings = await getFinancialYearSettings();

          setFinancialYears(settings.financialYears);
          setActiveYear(settings.activeFinancialYear);
          setSelectedYear(settings.activeFinancialYear);

          const firebaseCat = await uniqueCategories();

          setCategories([
            'All',
            ...firebaseCat.map(
              (category) => category.categoryName
            ),
          ]);

          const receipts = await getReceipts();

const flattenedItems = receipts.flatMap(
  (receipt) =>
    receipt.items.map((item, itemIndex) => ({
      ...item,
      receiptId: receipt.id,
      itemIndex,
      store: receipt.store,
      date: receipt.date,
      financialYear: receipt.financialYear,
    }))
);

          setAllItems(flattenedItems);
        } catch (error) {
          console.log(
            'Load Items error:',
            error
          );
        }
      };

      loadData();
    }, [])
  );

  const filteredItems = allItems.filter((item) => {
    const matchesYear =
      item.financialYear === selectedYear;

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      searchText === '' ||
      item.name.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText) ||
      (item.store ?? '')
        .toLowerCase()
        .includes(searchText);

    return (
      matchesYear &&
      matchesCategory &&
      matchesSearch
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Item history
        </Text>

        <TouchableOpacity
          style={styles.yearSelector}
          onPress={() =>
            setYearModalVisible(true)
          }
          activeOpacity={0.7}
        >
          <Text style={styles.yearText}>
            {selectedYear}
          </Text>

          <Ionicons
            name="chevron-down-outline"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.mutedText}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search item, receipt or category..."
            placeholderTextColor={
              colors.mutedText
            }
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.mutedText}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryRow
          }
        >
          {categories.map((category) => {
            const active =
              selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  active &&
                    styles.categoryChipActive,
                ]}
                onPress={() =>
                  setSelectedCategory(category)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Items
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/manage-categories'
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.manageText}>
              Manage categories
            </Text>
          </TouchableOpacity>
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="list-outline"
                size={30}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyText}>
              Items from scanned or uploaded
              receipts for {selectedYear}
              will appear here.
            </Text>

            {selectedCategory !== 'All' && (
              <Text style={styles.filterText}>
                Filter: {selectedCategory}
              </Text>
            )}

            {search.trim() !== '' && (
              <Text style={styles.filterText}>
                Search: {search}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {filteredItems.map(
              (item, index) => (
                <TouchableOpacity
  key={`${item.receiptId}-${item.itemIndex}-${index}`}
  style={styles.itemCard}
  activeOpacity={0.7}
  onPress={() => {
  setSelectedItem(item);
  setEditName(item.name);
  setEditPrice(item.price.toString());
  setEditCategory(item.category);
  setCategorySearch('');
  setEditModalVisible(true);
}}
>
                  <View
                    style={styles.itemLeft}
                  >
                    <View
                      style={styles.itemIcon}
                    >
                      <Ionicons
                        name="receipt-outline"
                        size={20}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <View
                      style={styles.itemInfo}
                    >
                      <Text
                        style={
                          styles.itemName
                        }
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={
                          styles.itemCategory
                        }
                      >
                        {item.category}
                      </Text>

                      {item.store && (
                        <Text
                          style={
                            styles.itemStore
                          }
                          numberOfLines={1}
                        >
                          {item.store}
                          {item.date
                            ? ` • ${item.date}`
                            : ''}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text
                    style={styles.itemPrice}
                  >
                    ${item.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </ScrollView>

      <Modal
  transparent
  visible={editModalVisible}
  animationType="slide"
  onRequestClose={() => {
    setEditModalVisible(false);
    setSelectedItem(null);
  }}
>
  <View style={styles.modalOverlay}>
    <View style={styles.editModalCard}>
      <Text style={styles.modalTitle}>
        Edit Item
      </Text>

      <Text style={styles.editLabel}>
        Item name
      </Text>

      <TextInput
        style={styles.editInput}
        value={editName}
        onChangeText={setEditName}
        placeholder="Item name"
        placeholderTextColor={colors.mutedText}
      />

      <Text style={styles.editLabel}>
        Price
      </Text>

      <TextInput
        style={styles.editInput}
        value={editPrice}
        onChangeText={setEditPrice}
        placeholder="0.00"
        placeholderTextColor={colors.mutedText}
        keyboardType="decimal-pad"
      />

      <Text style={styles.editLabel}>
        Category
      </Text>

      <TouchableOpacity
        style={styles.categorySelector}
        onPress={() =>
          setCategoryModalVisible(true)
        }
        activeOpacity={0.7}
      >
        <Text style={styles.categorySelectorText}>
          {editCategory || 'Select category'}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.editButtonRow}>
        <TouchableOpacity
          style={styles.cancelEditButton}
          onPress={() => {
            setEditModalVisible(false);
            setSelectedItem(null);
          }}
        >
          <Text style={styles.cancelEditText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.saveEditButton}
  onPress={async () => {
    if (!selectedItem) {
      return;
    }

    const price = Number(editPrice);

    if (!editName.trim()) {
      return;
    }

    if (Number.isNaN(price)) {
      return;
    }

    try {
      await updateReceiptItem(
        selectedItem.receiptId,
        selectedItem.itemIndex,
        {
          name: editName.trim(),
          price,
          category: editCategory,
        }
      );

      setAllItems((currentItems) =>
        currentItems.map((item) => {
          if (
            item.receiptId ===
              selectedItem.receiptId &&
            item.itemIndex ===
              selectedItem.itemIndex
          ) {
            return {
              ...item,
              name: editName.trim(),
              price,
              category: editCategory,
            };
          }

          return item;
        })
      );

      setEditModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(
        'Failed to save item:',
        error
      );
    }
  }}
>
  <Text style={styles.saveEditText}>
    Save
  </Text>
</TouchableOpacity>
      </View>

      <TouchableOpacity
  style={styles.deleteItemButton}
  onPress={async () => {
    if (!selectedItem) {
      return;
    }

    try {
      await deleteReceiptItem(
        selectedItem.receiptId,
        selectedItem.itemIndex
      );

      setAllItems((currentItems) =>
        currentItems.filter(
          (item) =>
            !(
              item.receiptId ===
                selectedItem.receiptId &&
              item.itemIndex ===
                selectedItem.itemIndex
            )
        )
      );

      setEditModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(
        'Failed to delete item:',
        error
      );
    }
  }}
>
  <Ionicons
    name="trash-outline"
    size={18}
    color="#ef4444"
  />

  <Text style={styles.deleteItemText}>
    Delete item
  </Text>
</TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  transparent
  visible={categoryModalVisible}
  animationType="slide"
  onRequestClose={() =>
    setCategoryModalVisible(false)
  }
>
  <View style={styles.modalOverlay}>
    <View style={styles.editModalCard}>
      <Text style={styles.modalTitle}>
        Select category
      </Text>

      <TextInput
        style={styles.editInput}
        value={categorySearch}
        onChangeText={setCategorySearch}
        placeholder="Search category..."
        placeholderTextColor={colors.mutedText}
      />

      <ScrollView
        style={{ maxHeight: 300 }}
        showsVerticalScrollIndicator={false}
      >
        {categories
          .filter((category) => category !== 'All')
          .filter((category) =>
            category
              .toLowerCase()
              .includes(
                categorySearch
                  .trim()
                  .toLowerCase()
              )
          )
          .map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.yearOption}
              onPress={() => {
                setEditCategory(category);
                setCategorySearch('');
                setCategoryModalVisible(false);
              }}
            >
              <Text
                style={styles.yearOptionText}
              >
                {category}
              </Text>

              {editCategory === category && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() =>
          setCategoryModalVisible(false)
        }
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  transparent
  visible={yearModalVisible}
  animationType="fade"
  onRequestClose={() =>
    setYearModalVisible(false)
  }
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
            setSelectedCategory('All');
            setYearModalVisible(false);
          }}
        >
          <Text style={styles.yearOptionText}>
            {year}
          </Text>

          <View style={styles.yearOptionRight}>
            {activeYear === year && (
              <Text style={styles.activeYearText}>
                Active
              </Text>
            )}

            {selectedYear === year && (
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.primary}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() =>
          setYearModalVisible(false)
        }
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 22,
      paddingTop: 16,
      paddingBottom: 110,
    },

    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 24,
    },

    yearSelector: {
      height: 54,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      marginBottom: 14,
    },

    yearText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },

    searchBox: {
      height: 52,
      borderRadius: 16,
      backgroundColor:
        colors.softBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      marginBottom: 14,
    },

    searchInput: {
      flex: 1,
      marginLeft: 9,
      fontSize: 14,
      color: colors.text,
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
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },

    categoryChipActive: {
      backgroundColor:
        colors.primarySoft,
      borderColor: colors.primary,
    },

    categoryText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
    },

    categoryTextActive: {
      color: colors.primary,
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
      color: colors.text,
    },

    manageText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },

    itemsContainer: {
      gap: 10,
    },

    itemCard: {
      minHeight: 72,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
    },

    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    itemIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    itemInfo: {
      flex: 1,
    },

    itemName: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    itemCategory: {
      marginTop: 4,
      fontSize: 12,
      color: colors.secondaryText,
    },

    itemStore: {
      marginTop: 3,
      fontSize: 11,
      color: colors.mutedText,
    },

    itemPrice: {
      marginLeft: 12,
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },

    emptyCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 34,
      paddingHorizontal: 24,
      alignItems: 'center',
      backgroundColor: colors.card,
    },

    emptyIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    emptyText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      color: colors.secondaryText,
      maxWidth: 260,
    },

    filterText: {
      marginTop: 12,
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },

    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },

    yearOption: {
      height: 50,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    yearOptionText: {
      fontSize: 15,
      color: colors.text,
    },

    yearOptionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    activeYearText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },

    cancelButton: {
      marginTop: 16,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        colors.softBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelText: {
      color: colors.primary,
      fontWeight: '800',
    },

    editModalCard: {
  backgroundColor: colors.card,
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
},

editLabel: {
  fontSize: 13,
  fontWeight: '700',
  color: colors.secondaryText,
  marginTop: 12,
  marginBottom: 6,
},

editInput: {
  height: 48,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  color: colors.text,
  backgroundColor: colors.softBackground,
},

categorySelector: {
  height: 48,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.softBackground,
},

categorySelectorText: {
  color: colors.text,
  fontSize: 14,
},

editButtonRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 20,
},

cancelEditButton: {
  flex: 1,
  height: 48,
  borderRadius: 12,
  backgroundColor: colors.softBackground,
  alignItems: 'center',
  justifyContent: 'center',
},

cancelEditText: {
  color: colors.text,
  fontWeight: '800',
},

saveEditButton: {
  flex: 1,
  height: 48,
  borderRadius: 12,
  backgroundColor: colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
},

saveEditText: {
  color: '#ffffff',
  fontWeight: '800',
},

deleteItemButton: {
  height: 48,
  marginTop: 12,
  borderRadius: 12,
  backgroundColor: 'rgba(239, 68, 68, 0.10)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},

deleteItemText: {
  color: '#ef4444',
  fontWeight: '800',
},

  }
);