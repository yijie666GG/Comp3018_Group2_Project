import AsyncStorage from "@react-native-async-storage/async-storage";

const RECEIPTS_STORAGE_KEY = "saved_receipts";

export type SavedReceiptItem = {
  name: string;
  price: number;
  category: string;
};

export type SavedReceipt = {
  id: string;
  store: string | null;
  date: string | null;
  time: string | null;
  total: number | null;
  gst: number | null;
  items: SavedReceiptItem[];
  createdAt: string;
};

export async function getReceipts(): Promise<SavedReceipt[]> {
  try {
    const data = await AsyncStorage.getItem(RECEIPTS_STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load receipts:", error);
    return [];
  }
}

export async function saveReceipt(
  receipt: Omit<SavedReceipt, "id" | "createdAt">
): Promise<SavedReceipt> {
  const receipts = await getReceipts();

  const newReceipt: SavedReceipt = {
    ...receipt,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const updatedReceipts = [newReceipt, ...receipts];

  await AsyncStorage.setItem(
    RECEIPTS_STORAGE_KEY,
    JSON.stringify(updatedReceipts)
  );

  return newReceipt;
}

export async function deleteReceipt(id: string): Promise<void> {
  const receipts = await getReceipts();

  const updatedReceipts = receipts.filter(
    (receipt) => receipt.id !== id
  );

  await AsyncStorage.setItem(
    RECEIPTS_STORAGE_KEY,
    JSON.stringify(updatedReceipts)
  );
}