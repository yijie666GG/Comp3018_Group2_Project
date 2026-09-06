import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

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

/*
========================================
Get current user's receipt collection
========================================
*/

function getCurrentUserReceiptsCollection() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return collection(
    db,
    "users",
    user.uid,
    "receipts"
  );
}

/*
========================================
Get Receipts
========================================
*/

export async function getReceipts(): Promise<SavedReceipt[]> {
  try {
    const receiptsRef =
      getCurrentUserReceiptsCollection();

    const receiptsQuery = query(
      receiptsRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(receiptsQuery);

    return snapshot.docs.map((receiptDoc) => {
      const data = receiptDoc.data();

      return {
        id: receiptDoc.id,

        store:
          typeof data.store === "string"
            ? data.store
            : null,

        date:
          typeof data.date === "string"
            ? data.date
            : null,

        time:
          typeof data.time === "string"
            ? data.time
            : null,

        total:
          typeof data.total === "number"
            ? data.total
            : null,

        gst:
          typeof data.gst === "number"
            ? data.gst
            : null,

        items: Array.isArray(data.items)
          ? data.items
          : [],

        createdAt:
          data.createdAt?.toDate?.().toISOString?.() ??
          "",
      };
    });
  } catch (error) {
    console.error(
      "Failed to load receipts from Firebase:",
      error
    );

    return [];
  }
}

/*
========================================
Save Receipt
========================================
*/

export async function saveReceipt(
  receipt: Omit<SavedReceipt, "id" | "createdAt">
): Promise<SavedReceipt> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  try {
    const receiptsRef = collection(
      db,
      "users",
      user.uid,
      "receipts"
    );

    const receiptData = {
      userId: user.uid,

      store: receipt.store,
      date: receipt.date,
      time: receipt.time,

      total: receipt.total,
      gst: receipt.gst,

      items: receipt.items,

      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      receiptsRef,
      receiptData
    );

    const savedReceipt: SavedReceipt = {
      ...receipt,

      id: docRef.id,

      createdAt: new Date().toISOString(),
    };

    console.log(
      "Receipt saved to Firebase:",
      docRef.id
    );

    return savedReceipt;
  } catch (error) {
    console.error(
      "Failed to save receipt to Firebase:",
      error
    );

    throw error;
  }
}

/*
========================================
Delete Receipt
========================================
*/

export async function deleteReceipt(
  id: string
): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  try {
    const receiptRef = doc(
      db,
      "users",
      user.uid,
      "receipts",
      id
    );

    await deleteDoc(receiptRef);

    console.log(
      "Receipt deleted from Firebase:",
      id
    );
  } catch (error) {
    console.error(
      "Failed to delete receipt from Firebase:",
      error
    );

    throw error;
  }
}