import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
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
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not logged in.");
    }

    console.log(
      "Loading receipts for Firebase user:",
      user.uid
    );

    const receiptsRef =
      getCurrentUserReceiptsCollection();

    /*
    Do not use orderBy("createdAt") here.

    Some older receipt documents may not have
    createdAt correctly stored. Firestore can
    exclude those documents from an orderBy query.

    We load all receipts first and sort them
    locally instead.
    */

    const snapshot = await getDocs(receiptsRef);

    console.log(
      "Firebase receipts found:",
      snapshot.size
    );

    const receipts: SavedReceipt[] =
      snapshot.docs.map((receiptDoc) => {
        const data = receiptDoc.data();

        const createdAt =
          data.createdAt?.toDate?.();

        const items: SavedReceiptItem[] =
          Array.isArray(data.items)
            ? data.items.map((item: any) => ({
                name:
                  typeof item?.name === "string"
                    ? item.name
                    : "Unknown item",

                price:
                  typeof item?.price === "number"
                    ? item.price
                    : Number(item?.price) || 0,

                category:
                  typeof item?.category === "string"
                    ? item.category
                    : "Other",
              }))
            : [];

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

          items,

          createdAt:
            createdAt instanceof Date
              ? createdAt.toISOString()
              : "",
        };
      });

    /*
    Sort newest first.

    Receipts without createdAt are placed
    at the bottom instead of being removed.
    */

    receipts.sort((a, b) => {
      const timeA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const timeB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return timeB - timeA;
    });

    console.log(
      "Receipts returned to Summary:",
      receipts
    );

    return receipts;
  } catch (error) {
    console.error(
      "FAILED TO LOAD RECEIPTS FROM FIREBASE:"
    );

    console.error(error);

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