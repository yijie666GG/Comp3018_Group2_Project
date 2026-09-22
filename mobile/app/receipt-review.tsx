import {
  useEffect,
  useState,
} from "react";

import { saveReceipt } from "../services/receiptStorage";
import { addCategory, deleteCategory, uniqueCategories } from "../firebase/categories";

import {
  getFinancialYearSettings,
} from "../firebase/financial-year";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useTheme } from "../theme/ThemeContext";

type ReceiptItem = {
  name: string;
  price: number;
  category: string | null;
};

type Receipt = {
  store: string | null;
  date: string | null;
  time: string | null;
  total: number | null;
  gst: number | null;
  items: ReceiptItem[];
};

export default function ReceiptReview() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // ======================================================
  // Route parameters
  // ======================================================

  const params = useLocalSearchParams();

  const imageUri =
    typeof params.imageUri === "string"
      ? params.imageUri
      : null;

  const imageFileName =
    typeof params.fileName === "string"
      ? params.fileName
      : null;

  const imageMimeType =
    typeof params.mimeType === "string"
      ? params.mimeType
      : null;

  const receiptParam =
    typeof params.receipt === "string"
      ? params.receipt
      : "";

  // ======================================================
  // Receipt data
  // ======================================================

  const originalReceipt: Receipt = receiptParam
    ? JSON.parse(receiptParam)
    : {
        store: null,
        date: null,
        time: null,
        total: null,
        gst: null,
        items: [],
      };

// ======================================================
// Financial Year
// ======================================================

const [
  financialYears,
  setFinancialYears,
] = useState<string[]>([]);

const [
  financialYear,
  setFinancialYear,
] = useState<string>("");

const [
  financialYearModalVisible,
  setFinancialYearModalVisible,
] = useState(false);

/*
======================================================
Calculate Australian financial year from receipt date
======================================================
*/

const getFinancialYearFromDate = (
  dateString: string | null
): string | null => {
  if (!dateString) {
    return null;
  }

  let date: Date | null = null;

  /*
    Australian receipt format:

    DD/MM/YYYY

    Example:
    02/01/2021
    = 2 January 2021
    = financial year 2020-2021
  */

  const slashMatch = dateString.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);

    date = new Date(
      year,
      month - 1,
      day
    );
  }

  /*
    ISO format:

    YYYY-MM-DD
  */

  if (!date) {
    const isoMatch = dateString.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );

    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);

      date = new Date(
        year,
        month - 1,
        day
      );
    }
  }

  /*
    Fallback for other valid date strings
  */

  if (!date) {
    const parsedDate = new Date(dateString);

    if (!Number.isNaN(parsedDate.getTime())) {
      date = parsedDate;
    }
  }

  if (
    !date ||
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  const year = date.getFullYear();
  const month = date.getMonth();

  /*
    Australian financial year:

    1 July -> 30 June
  */

  return month >= 6
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
};

/*
======================================================
Load financial years
======================================================
*/

useEffect(() => {
  const loadFinancialYears = async () => {
    try {
      const settings =
        await getFinancialYearSettings();

      const receiptFinancialYear =
        getFinancialYearFromDate(
          originalReceipt.date
        );

      /*
        Start with the financial years
        already created by the user.
      */

      const availableYears = [
        ...settings.financialYears,
      ];

      /*
        Make sure the receipt's automatically
        detected financial year is also available
        in the dropdown.
      */

      if (
        receiptFinancialYear &&
        !availableYears.includes(
          receiptFinancialYear
        )
      ) {
        availableYears.push(
          receiptFinancialYear
        );
      }

      setFinancialYears(
        availableYears
      );

      /*
        DEFAULT:
        Use the financial year calculated
        from the receipt date.

        The user can then manually change
        this using the dropdown.
      */

      if (receiptFinancialYear) {
        setFinancialYear(
          receiptFinancialYear
        );
      } else {
        setFinancialYear(
          settings.activeFinancialYear
        );
      }
    } catch (error) {
      console.error(
        "Failed to load financial years:",
        error
      );

      Alert.alert(
        "Financial Years",
        "Unable to load your financial years."
      );
    }
  };

  loadFinancialYears();
}, [originalReceipt.date]);

  // ======================================================
  // Categories
  // ======================================================

  type CategoryOption = {
    categoryId: string;
    categoryName: string;
  };

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryItemIndex, setCategoryItemIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await uniqueCategories();

        const validCategories = savedCategories
          .filter(
            (category) =>
              category.categoryId &&
              category.categoryName?.trim()
          )
          .map((category) => ({
            categoryId: category.categoryId,
            categoryName: category.categoryName.trim(),
          }));

        setCategories(validCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // ======================================================
  // Receipt items
  // ======================================================

  const [items, setItems] =
    useState<ReceiptItem[]>(
      originalReceipt.items.map((item) => ({
        ...item,
        category: item.category ?? null,
      }))
    );

  const openCategoryModal = (index: number) => {
    setCategoryItemIndex(index);
    setNewCategory("");
    setCategoryDropdownOpen(false);
    setCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
    setCategoryItemIndex(null);
    setNewCategory("");
    setCategoryDropdownOpen(false);
  };

  const selectCategory = (category: string) => {
    if (categoryItemIndex === null) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item, index) =>
        index === categoryItemIndex
          ? { ...item, category }
          : item
      )
    );

    closeCategoryModal();
  };

  const useNewCategory = async () => {
    const cleanCategory = newCategory.trim();

    if (!cleanCategory) {
      Alert.alert("Category Required", "Please enter a category.");
      return;
    }

    const existingCategory = categories.find(
      (category) =>
        category.categoryName.toLowerCase() ===
        cleanCategory.toLowerCase()
    );

    if (existingCategory) {
      selectCategory(existingCategory.categoryName);
      return;
    }

    try {
      const addedCategory = await addCategory(cleanCategory);

      if (!addedCategory) {
        Alert.alert(
          "Category Error",
          "Unable to create category."
        );
        return;
      }

      const categoryToAdd: CategoryOption = {
        categoryId: addedCategory.categoryId,
        categoryName: addedCategory.categoryName,
      };

      setCategories((currentCategories) => [
        ...currentCategories,
        categoryToAdd,
      ]);

      selectCategory(categoryToAdd.categoryName);
    } catch (error) {
      console.error("Add category error:", error);

      Alert.alert(
        "Category Error",
        "Unable to create category."
      );
    }
  };

  const handleDeleteCategory = (
    category: CategoryOption
  ) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.categoryName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteCategory(
                category.categoryId
              );

              if (!success) {
                Alert.alert(
                  "Delete Error",
                  "Unable to delete category."
                );
                return;
              }

              setCategories((currentCategories) =>
                currentCategories.filter(
                  (item) =>
                    item.categoryId !== category.categoryId
                )
              );
            } catch (error) {
              console.error(
                "Delete category error:",
                error
              );

              Alert.alert(
                "Delete Error",
                "Unable to delete category."
              );
            }
          },
        },
      ]
    );
  };

  // ======================================================
  // Delete item
  // ======================================================

  const removeItem = (
    index: number
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // ======================================================
  // Add / Edit item modal
  // ======================================================

  const [
    itemModalVisible,
    setItemModalVisible,
  ] = useState(false);

  const [
    editingItemIndex,
    setEditingItemIndex,
  ] = useState<number | null>(null);

  const [
    itemName,
    setItemName,
  ] = useState("");

  const [
    itemPrice,
    setItemPrice,
  ] = useState("");

  const openAddItem = () => {
    setEditingItemIndex(null);
    setItemName("");
    setItemPrice("");
    setItemModalVisible(true);
  };

  const openEditItem = (
    index: number
  ) => {
    const item = items[index];

    setEditingItemIndex(index);
    setItemName(item.name);
    setItemPrice(
      item.price.toFixed(2)
    );

    setItemModalVisible(true);
  };

  const closeItemModal = () => {
    setItemModalVisible(false);
    setEditingItemIndex(null);
    setItemName("");
    setItemPrice("");
  };

  const saveManualItem = () => {
    const cleanName =
      itemName.trim();

    const cleanPrice =
      itemPrice
        .trim()
        .replace(",", ".");

    const parsedPrice =
      Number(cleanPrice);

    if (!cleanName) {
      Alert.alert(
        "Item Name Required",
        "Please enter an item name."
      );
      return;
    }

    if (
      cleanPrice === "" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      Alert.alert(
        "Invalid Price",
        "Please enter a valid item price."
      );
      return;
    }

    // Edit existing item
    if (
      editingItemIndex !== null
    ) {
      setItems((currentItems) =>
        currentItems.map(
          (item, index) =>
            index === editingItemIndex
              ? {
                  ...item,
                  name: cleanName,
                  price: parsedPrice,
                }
              : item
        )
      );
    }

    // Add new item
    else {
      setItems((currentItems) => [
        ...currentItems,
        {
          name: cleanName,
          price: parsedPrice,
          category: null,
        },
      ]);
    }

    closeItemModal();
  };

  // ======================================================
  // Save receipt
  // ======================================================

  const handleSaveReceipt =
    async () => {
      const missingCategory =
        items.some(
          (item) =>
            !item.category?.trim()
        );

      if (missingCategory) {
        Alert.alert(
          "Category Required",
          "Please enter a category for every item before saving."
        );
        return;
      }

      if (items.length === 0) {
        Alert.alert(
          "No Items",
          "There are no receipt items to save."
        );
        return;
      }

      try {
        const existingCategory = await uniqueCategories();

        for(const item of items){
          const name = item.category?.trim();
          
          if(!name){
            continue
          }

          const alreadyExists =  existingCategory.some((category) =>
            category.categoryName.toLowerCase() === name.toLowerCase()
          );

          if(!alreadyExists){
            const addedCategory = await addCategory(name);
            if(addedCategory){
              existingCategory.push(addedCategory);
            }
          }
        }

        await saveReceipt(
          {
            store:
              originalReceipt.store,

            date:
              originalReceipt.date,

            financialYear: financialYear,

            time:
              originalReceipt.time,

            total:
              originalReceipt.total,

            gst:
              originalReceipt.gst,

            items: items.map(
              (item) => ({
                name: item.name,
                price: item.price,
                category:
                  item.category?.trim() ?? "",
              })
            ),
          },


        );

        Alert.alert(
          "Receipt Saved",
          "Receipt saved successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace(
                  "/(tabs)/home"
                ),
            },
          ]
        );
      } catch (error) {
        console.error(
          "Save receipt error:",
          error
        );

        Alert.alert(
          "Save Error",
          "Unable to save receipt."
        );
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.title}>
          Receipt Review
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Receipt summary */}

        <View
          style={styles.summaryCard}
        >
          <View
            style={styles.summaryRow}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Store
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {originalReceipt.store ??
                "Unknown"}
            </Text>
          </View>

          <View
            style={styles.summaryRow}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Date
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {originalReceipt.date ??
                "Unknown"}
            </Text>
          </View>

          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryLabel}
            >
              Financial Year
            </Text>

            <Pressable
              style={
                styles.financialYearButton
              }
              onPress={() =>
                setFinancialYearModalVisible(
                  true
                )
              }
            >
              <Text
                style={
                  styles.financialYearValue
                }
              >
                {financialYear ||
                  "Select financial year"}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color={colors.primary}
              />
            </Pressable>
          </View>

          {originalReceipt.time && (
            <View
              style={
                styles.summaryRow
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Time
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {
                  originalReceipt.time
                }
              </Text>
            </View>
          )}

          <View
            style={styles.summaryRow}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Total
            </Text>

            <Text
              style={
                styles.totalValue
              }
            >
              $
              {originalReceipt.total !==
              null
                ? originalReceipt.total.toFixed(
                    2
                  )
                : "0.00"}
            </Text>
          </View>

          {originalReceipt.gst !==
            null && (
            <View
              style={
                styles.summaryRow
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                GST
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                $
                {originalReceipt.gst.toFixed(
                  2
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Receipt items header */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Receipt Items
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Enter a category for
              each item.
            </Text>
          </View>

          <Pressable
            style={
              styles.addItemButton
            }
            onPress={openAddItem}
          >
            <Ionicons
              name="add"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addItemButtonText
              }
            >
              Add Item
            </Text>
          </Pressable>
        </View>

        {/* Receipt item cards */}

        {items.map(
          (item, index) => (
            <View
              key={`${item.name}-${index}`}
              style={
                styles.itemCard
              }
            >
              <View
                style={
                  styles.itemTopRow
                }
              >
                <View
                  style={
                    styles.itemInfo
                  }
                >
                  <Text
                    style={
                      styles.itemName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.itemPrice
                    }
                  >
                    $
                    {item.price.toFixed(
                      2
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.itemActions
                  }
                >
                  {/* Edit */}

                  <Pressable
                    style={
                      styles.editButton
                    }
                    onPress={() =>
                      openEditItem(
                        index
                      )
                    }
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={
                        colors.primary
                      }
                    />
                  </Pressable>

                  {/* Delete */}

                  <Pressable
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      removeItem(
                        index
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={21}
                      color={
                        colors.danger
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* Category */}

              <Text
                style={
                  styles.categoryLabel
                }
              >
                Category
              </Text>

              <Pressable
                style={styles.categorySelector}
                onPress={() => openCategoryModal(index)}
              >
                <Text
                  style={[
                    styles.categorySelectorText,
                    !item.category && styles.categoryPlaceholder,
                  ]}
                >
                  {item.category || "Select or enter category"}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          )
        )}

        {/* No items */}

        {items.length === 0 && (
          <View
            style={styles.emptyCard}
          >
            <Ionicons
              name="receipt-outline"
              size={40}
              color={
                colors.mutedText
              }
            />

            <Text
              style={
                styles.emptyText
              }
            >
              No receipt items.
            </Text>

            <Text
              style={
                styles.emptySubText
              }
            >
              Add an item manually if
              the receipt scan missed
              it.
            </Text>
          </View>
        )}

        {/* Save receipt */}

        <Pressable
          style={styles.saveButton}
          onPress={
            handleSaveReceipt
          }
        >
          <Ionicons
            name="save-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.saveButtonText
            }
          >
            Save Receipt
          </Text>
        </Pressable>
      </ScrollView>

      {/* ==================================================
          ADD / EDIT ITEM MODAL
      ================================================== */}

      <Modal
        visible={itemModalVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeItemModal
        }
      >
        <View
          style={
            styles.itemModalOverlay
          }
        >
          <View
            style={
              styles.itemModalContent
            }
          >
            <Text
              style={
                styles.itemModalTitle
              }
            >
              {editingItemIndex !==
              null
                ? "Edit Item"
                : "Add Item"}
            </Text>

            <Text
              style={
                styles.inputLabel
              }
            >
              Item Name
            </Text>

            <TextInput
              style={
                styles.textInput
              }
              value={itemName}
              onChangeText={
                setItemName
              }
              placeholder="Enter item name"
              placeholderTextColor={
                colors.mutedText
              }
              autoCapitalize="sentences"
              returnKeyType="next"
            />

            <Text
              style={
                styles.inputLabel
              }
            >
              Price
            </Text>

            <TextInput
              style={
                styles.textInput
              }
              value={itemPrice}
              onChangeText={
                setItemPrice
              }
              placeholder="0.00"
              placeholderTextColor={
                colors.mutedText
              }
              keyboardType="decimal-pad"
            />

            <View
              style={
                styles.itemModalButtons
              }
            >
              <Pressable
                style={
                  styles.itemModalCancelButton
                }
                onPress={
                  closeItemModal
                }
              >
                <Text
                  style={
                    styles.itemModalCancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.itemModalSaveButton
                }
                onPress={
                  saveManualItem
                }
              >
                <Text
                  style={
                    styles.itemModalSaveText
                  }
                >
                  {editingItemIndex !==
                  null
                    ? "Save Changes"
                    : "Add Item"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================================================
          CATEGORY MODAL
      ================================================== */}

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCategoryModal}
      >
        <Pressable
          style={styles.categoryModalOverlay}
          onPress={closeCategoryModal}
        >
          <Pressable
            style={styles.categoryModalContent}
            onPress={() => {}}
          >
            <Text style={styles.categoryModalTitle}>
              Select Category
            </Text>

            <Text style={styles.categoryModalSubtitle}>
              Choose an existing category or enter a new one.
            </Text>

            <Text style={styles.categoryExistingLabel}>
              Existing Category
            </Text>

            <Pressable
              style={styles.categoryDropdownButton}
              onPress={() =>
                setCategoryDropdownOpen((current) => !current)
              }
            >
              <Text
                style={[
                  styles.categoryDropdownButtonText,
                  categoryItemIndex === null ||
                  !items[categoryItemIndex]?.category
                    ? styles.categoryPlaceholder
                    : null,
                ]}
              >
                {categoryItemIndex !== null &&
                items[categoryItemIndex]?.category
                  ? items[categoryItemIndex]?.category
                  : "Select a category"}
              </Text>

              <Ionicons
                name={
                  categoryDropdownOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={colors.primary}
              />
            </Pressable>

            {categoryDropdownOpen && (
              <View style={styles.categoryDropdownMenu}>
                {categories.length > 0 ? (
                  <ScrollView
                    style={styles.categoryDropdownList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {categories.map((category, index) => {
                      const selected =
                        categoryItemIndex !== null &&
                        items[categoryItemIndex]?.category ===
                          category.categoryName;

                      return (
                        <View
                          key={`${category.categoryId}-${index}`}
                          style={[
                            styles.categoryOption,
                            selected &&
                              styles.categoryOptionSelected,
                          ]}
                        >
                          <Pressable
                            style={styles.categoryOptionSelect}
                            onPress={() =>
                              selectCategory(
                                category.categoryName
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.categoryOptionText,
                                selected &&
                                  styles.categoryOptionTextSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {category.categoryName}
                            </Text>

                            {selected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color={colors.primary}
                              />
                            )}
                          </Pressable>

                          <Pressable
                            style={styles.categoryDeleteButton}
                            onPress={() =>
                              handleDeleteCategory(category)
                            }
                            hitSlop={8}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color={colors.danger}
                            />
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={styles.noCategoryText}>
                    No saved categories yet.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.categoryDivider} />

            <Text style={styles.categoryNewLabel}>
              New Category
            </Text>

            <TextInput
              style={styles.categoryNewInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Enter new category"
              placeholderTextColor={colors.mutedText}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={useNewCategory}
            />

            <View style={styles.categoryModalButtons}>
              <Pressable
                style={styles.categoryCancelButton}
                onPress={closeCategoryModal}
              >
                <Text style={styles.categoryCancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.categoryUseButton}
                onPress={useNewCategory}
              >
                <Text style={styles.categoryUseText}>
                  Use Category
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================================================
          FINANCIAL YEAR MODAL
      ================================================== */}

      <Modal
        visible={
          financialYearModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setFinancialYearModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.yearModalOverlay
          }
          onPress={() =>
            setFinancialYearModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.yearModalContent
            }
            onPress={() => {}}
          >
            <Text
              style={styles.yearModalTitle}
            >
              Select financial year
            </Text>

            {financialYears.map((year) => {
              const selected =
                year === financialYear;

              return (
                <Pressable
                  key={year}
                  style={[
                    styles.yearOption,
                    selected &&
                      styles.yearOptionSelected,
                  ]}
                  onPress={() => {
                    setFinancialYear(year);
                    setFinancialYearModalVisible(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.yearOptionText,
                      selected &&
                        styles.yearOptionTextSelected,
                    ]}
                  >
                    {year}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>


    </View>
  );
}

// ======================================================
// Styles
// ======================================================

const createStyles = (
  colors: any
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    header: {
      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
    },

    headerSpacer: {
      width: 40,
    },

    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },

    scrollContent: {
      padding: 20,
      paddingBottom: 50,
    },

    summaryCard: {
      backgroundColor:
        colors.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 25,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    summaryLabel: {
      color:
        colors.secondaryText,
      fontSize: 14,
    },

    summaryValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      flexShrink: 1,
      textAlign: "right",
      marginLeft: 15,
    },

    totalValue: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "800",
    },

    financialYearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    financialYearValue: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },

    yearModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    yearModalContent: {
      backgroundColor:
        colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    yearModalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 14,
    },

    yearOption: {
      minHeight: 56,
      paddingHorizontal: 14,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 6,
    },

    yearOptionSelected: {
      backgroundColor:
        colors.softBackground,
    },

    yearOptionText: {
      fontSize: 16,
      color:
        colors.secondaryText,
      fontWeight: "500",
    },

    yearOptionTextSelected: {
      color: colors.primary,
      fontWeight: "700",
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 15,
      gap: 12,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },

    sectionSubtitle: {
      marginTop: 4,
      color:
        colors.secondaryText,
      fontSize: 13,
    },

    addItemButton: {
      backgroundColor:
        colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    addItemButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    itemCard: {
      backgroundColor:
        colors.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    itemTopRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "flex-start",
    },

    itemInfo: {
      flex: 1,
      paddingRight: 10,
    },

    itemName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 21,
    },

    itemPrice: {
      marginTop: 5,
      color: colors.primary,
      fontSize: 16,
      fontWeight: "800",
    },

    itemActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    editButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor:
        colors.softBackground,
      justifyContent: "center",
      alignItems: "center",
    },

    deleteButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor:
        colors.dangerSoft,
      justifyContent: "center",
      alignItems: "center",
    },

    categoryLabel: {
      marginTop: 16,
      marginBottom: 7,
      fontSize: 12,
      fontWeight: "600",
      color:
        colors.secondaryText,
    },

    categorySelector: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.softBackground,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    categorySelectorText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },

    categoryPlaceholder: {
      color: colors.mutedText,
      fontWeight: "500",
    },

    categoryModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    categoryModalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: "80%",
    },

    categoryModalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },

    categoryModalSubtitle: {
      marginTop: 5,
      marginBottom: 14,
      fontSize: 13,
      color: colors.secondaryText,
    },

    categoryExistingLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.secondaryText,
      marginBottom: 7,
    },

    categoryDropdownButton: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.softBackground,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    categoryDropdownButtonText: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },

    categoryDropdownMenu: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: "hidden",
    },

    categoryDropdownList: {
      maxHeight: 220,
    },

    categoryOption: {
      minHeight: 52,
      paddingLeft: 14,
      paddingRight: 6,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    categoryOptionSelect: {
      flex: 1,
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    categoryDeleteButton: {
      width: 42,
      height: 42,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: colors.dangerSoft,
    },

    categoryOptionSelected: {
      backgroundColor: colors.softBackground,
    },

    categoryOptionText: {
      color: colors.secondaryText,
      fontSize: 15,
      fontWeight: "500",
    },

    categoryOptionTextSelected: {
      color: colors.primary,
      fontWeight: "700",
    },

    noCategoryText: {
      color: colors.mutedText,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 20,
    },

    categoryDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },

    categoryNewLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.secondaryText,
      marginBottom: 7,
    },

    categoryNewInput: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.softBackground,
      color: colors.text,
      fontSize: 15,
    },

    categoryModalButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
    },

    categoryCancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.softBackground,
      alignItems: "center",
    },

    categoryCancelText: {
      color: colors.secondaryText,
      fontWeight: "700",
    },

    categoryUseButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },

    categoryUseText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    emptyCard: {
      paddingVertical: 35,
      alignItems: "center",
    },

    emptyText: {
      marginTop: 10,
      color: colors.mutedText,
      fontSize: 15,
      fontWeight: "600",
    },

    emptySubText: {
      marginTop: 5,
      color: colors.mutedText,
      fontSize: 13,
      textAlign: "center",
      maxWidth: 260,
    },

    saveButton: {
      marginTop: 15,
      backgroundColor:
        colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

    itemModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    itemModalContent: {
      backgroundColor:
        colors.card,
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    itemModalTitle: {
      fontSize: 21,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 20,
    },

    inputLabel: {
      color:
        colors.secondaryText,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 7,
    },

    textInput: {
      height: 50,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
      backgroundColor:
        colors.softBackground,
      color: colors.text,
      fontSize: 15,
    },

    itemModalButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 5,
    },

    itemModalCancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor:
        colors.softBackground,
      alignItems: "center",
    },

    itemModalCancelText: {
      color:
        colors.secondaryText,
      fontWeight: "700",
    },

    itemModalSaveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor:
        colors.primary,
      alignItems: "center",
    },

    itemModalSaveText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },


  });