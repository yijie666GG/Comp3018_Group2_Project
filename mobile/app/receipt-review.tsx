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
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { categories } from "../data/categories";

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
  const params = useLocalSearchParams();

  const receiptParam =
    typeof params.receipt === "string"
      ? params.receipt
      : "";

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

  const [items, setItems] =
    useState<ReceiptItem[]>(
      originalReceipt.items.map((item) => ({
        ...item,
        category: item.category ?? null,
      }))
    );

  const [selectedItemIndex, setSelectedItemIndex] =
    useState<number | null>(null);

  const [categoryModalVisible, setCategoryModalVisible] =
    useState(false);

  // =========================
  // Open Category Selection
  // =========================

  const openCategoryPicker = (index: number) => {
    setSelectedItemIndex(index);
    setCategoryModalVisible(true);
  };

  // =========================
  // Select Category
  // =========================

  const selectCategory = (category: string) => {
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

  // =========================
  // Remove Item
  // =========================

  const removeItem = (index: number) => {
    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // =========================
  // Save Receipt
  // =========================

const handleSaveReceipt = async () => {
  const missingCategory = items.some(
    (item) => item.category === null
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
    await saveReceipt({
      store: originalReceipt.store,
      date: originalReceipt.date,
      time: originalReceipt.time,
      total: originalReceipt.total,
      gst: originalReceipt.gst,

      items: items.map((item) => ({
        name: item.name,
        price: item.price,
        category: item.category as string,
      })),
    });

    Alert.alert(
      "Receipt Saved",
      "Receipt saved successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            router.replace("/(tabs)/scan"),
        },
      ]
    );
  } catch (error) {
    console.error("Save receipt error:", error);

    Alert.alert(
      "Save Error",
      "Unable to save receipt."
    );
  }
};

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#172033"
          />
        </Pressable>

        <Text style={styles.title}>
          Receipt Review
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Summary */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Store
            </Text>

            <Text style={styles.summaryValue}>
              {originalReceipt.store ??
                "Unknown"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Date
            </Text>

            <Text style={styles.summaryValue}>
              {originalReceipt.date ??
                "Unknown"}
            </Text>
          </View>

          {originalReceipt.time && (
            <View style={styles.summaryRow}>
              <Text
                style={styles.summaryLabel}
              >
                Time
              </Text>

              <Text
                style={styles.summaryValue}
              >
                {originalReceipt.time}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              $
              {originalReceipt.total !== null
                ? originalReceipt.total.toFixed(
                    2
                  )
                : "0.00"}
            </Text>
          </View>

          {originalReceipt.gst !== null && (
            <View style={styles.summaryRow}>
              <Text
                style={styles.summaryLabel}
              >
                GST
              </Text>

              <Text
                style={styles.summaryValue}
              >
                $
                {originalReceipt.gst.toFixed(
                  2
                )}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Receipt Items
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select a category for each item.
        </Text>

        {/* Items */}

        {items.map((item, index) => (
          <View
            key={`${item.name}-${index}`}
            style={styles.itemCard}
          >
            <View style={styles.itemTopRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.name}
                </Text>

                <Text style={styles.itemPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  removeItem(index)
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color="#DC2626"
                />
              </Pressable>
            </View>

            <Text style={styles.categoryLabel}>
              Category
            </Text>

            <Pressable
              style={styles.categoryButton}
              onPress={() =>
                openCategoryPicker(index)
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
                color="#64748B"
              />
            </Pressable>
          </View>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color="#94A3B8"
            />

            <Text style={styles.emptyText}>
              No receipt items.
            </Text>
          </View>
        )}

        {/* Save */}

        <Pressable
        style={styles.saveButton}
        onPress={handleSaveReceipt}
        >
          <Ionicons
            name="save-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.saveButtonText}>
            Save Receipt
          </Text>
        </Pressable>
      </ScrollView>

      {/* Category Modal */}

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCategoryModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setCategoryModalVisible(false)
          }
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Category
            </Text>

            {categories.map((category) => (
              <Pressable
                key={category}
                style={styles.categoryOption}
                onPress={() =>
                  selectCategory(category)
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
                  color="#94A3B8"
                />
              </Pressable>
            ))}

            <Pressable
              style={styles.cancelButton}
              onPress={() =>
                setCategoryModalVisible(false)
              }
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
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
    color: "#172033",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 14,
  },

  summaryValue: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "600",
  },

  totalValue: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 15,
    color: "#64748B",
    fontSize: 13,
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
    lineHeight: 21,
  },

  itemPrice: {
    marginTop: 5,
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "800",
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  categoryLabel: {
    marginTop: 16,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  categoryButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryButtonText: {
    fontSize: 14,
    color: "#172033",
    fontWeight: "600",
  },

  placeholderCategory: {
    color: "#94A3B8",
    fontWeight: "400",
  },

  emptyCard: {
    paddingVertical: 35,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    color: "#94A3B8",
  },

  saveButton: {
    marginTop: 15,
    backgroundColor: "#2563EB",
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 15,
  },

  categoryOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryOptionText: {
    fontSize: 16,
    color: "#172033",
  },

  cancelButton: {
    marginTop: 18,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "700",
  },
});