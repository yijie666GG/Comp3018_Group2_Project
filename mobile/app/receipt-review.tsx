import { useState } from "react";
import { saveReceipt } from "../services/receiptStorage";

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

import { categories } from "../data/categories";
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
  // Receipt items
  // ======================================================

  const [items, setItems] =
    useState<ReceiptItem[]>(
      originalReceipt.items.map((item) => ({
        ...item,
        category: item.category ?? null,
      }))
    );

  // ======================================================
  // Category modal
  // ======================================================

  const [
    selectedItemIndex,
    setSelectedItemIndex,
  ] = useState<number | null>(null);

  const [
    categoryModalVisible,
    setCategoryModalVisible,
  ] = useState(false);

  const openCategoryPicker = (
    index: number
  ) => {
    setSelectedItemIndex(index);
    setCategoryModalVisible(true);
  };

  const selectCategory = (
    category: string
  ) => {
    if (selectedItemIndex === null) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item, index) =>
        index === selectedItemIndex
          ? {
              ...item,
              category,
            }
          : item
      )
    );

    setCategoryModalVisible(false);
    setSelectedItemIndex(null);
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
            item.category === null
        );

      if (missingCategory) {
        Alert.alert(
          "Category Required",
          "Please select a category for every item before saving."
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
        await saveReceipt(
          {
            store:
              originalReceipt.store,

            date:
              originalReceipt.date,

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
                  item.category as string,
              })
            ),
          },

          imageUri
            ? {
                uri: imageUri,
                fileName:
                  imageFileName,
                mimeType:
                  imageMimeType,
              }
            : null
        );

        Alert.alert(
          "Receipt Saved",
          "Receipt and image saved successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace(
                  "/(tabs)/scan"
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
              Select a category for
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
                style={
                  styles.categoryButton
                }
                onPress={() =>
                  openCategoryPicker(
                    index
                  )
                }
              >
                <Text
                  style={[
                    styles.categoryButtonText,

                    !item.category &&
                      styles.placeholderCategory,
                  ]}
                >
                  {item.category ??
                    "Select Category"}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={19}
                  color={
                    colors.secondaryText
                  }
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
        visible={
          categoryModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCategoryModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setCategoryModalVisible(
              false
            )
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Select Category
            </Text>

            {categories.map(
              (category) => (
                <Pressable
                  key={category}
                  style={
                    styles.categoryOption
                  }
                  onPress={() =>
                    selectCategory(
                      category
                    )
                  }
                >
                  <Text
                    style={
                      styles.categoryOptionText
                    }
                  >
                    {category}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      colors.mutedText
                    }
                  />
                </Pressable>
              )
            )}

            <Pressable
              style={
                styles.cancelButton
              }
              onPress={() =>
                setCategoryModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>
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

    categoryButton: {
      height: 48,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        colors.softBackground,
    },

    categoryButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
    },

    placeholderCategory: {
      color: colors.mutedText,
      fontWeight: "400",
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

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      justifyContent:
        "flex-end",
    },

    modalContent: {
      backgroundColor:
        colors.card,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 30,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 15,
    },

    categoryOption: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    categoryOptionText: {
      fontSize: 16,
      color: colors.text,
    },

    cancelButton: {
      marginTop: 18,
      backgroundColor:
        colors.softBackground,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },

    cancelText: {
      color:
        colors.secondaryText,
      fontSize: 15,
      fontWeight: "700",
    },
  });