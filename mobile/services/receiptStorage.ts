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
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  auth,
  db,
  storage,
} from "../firebase/firebase";

/*
========================================
Types
========================================
*/

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

  imageUrl: string | null;
  imagePath: string | null;

  createdAt: string;
};

export type ReceiptImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

/*
========================================
Get current user's receipt collection
========================================
*/

function getCurrentUserReceiptsCollection() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in."
    );
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
Get file extension
========================================
*/

function getImageExtension(
  fileName?: string | null,
  mimeType?: string | null
): string {
  const lowerFileName =
    fileName?.toLowerCase() ?? "";

  if (
    lowerFileName.endsWith(".png") ||
    mimeType === "image/png"
  ) {
    return "png";
  }

  if (
    lowerFileName.endsWith(".webp") ||
    mimeType === "image/webp"
  ) {
    return "webp";
  }

  if (
    lowerFileName.endsWith(".jpeg") ||
    mimeType === "image/jpeg"
  ) {
    return "jpeg";
  }

  if (
    lowerFileName.endsWith(".jpg")
  ) {
    return "jpg";
  }

  return "jpg";
}

/*
========================================
Upload Receipt Image
========================================
*/

async function uploadReceiptImage(
  image: ReceiptImage,
  userId: string
): Promise<{
  imageUrl: string;
  imagePath: string;
}> {
  console.log(
    "===== Uploading Receipt Image ====="
  );

  console.log(
    "Image URI:",
    image.uri
  );

  console.log(
    "Original file name:",
    image.fileName
  );

  console.log(
    "Original mime type:",
    image.mimeType
  );

  /*
  ========================================
  Read local image
  ========================================
  */

  const response =
    await fetch(image.uri);

  console.log(
    "Image fetch status:",
    response.status
  );

  console.log(
    "Image fetch OK:",
    response.ok
  );

  if (!response.ok) {
    throw new Error(
      `Unable to read receipt image. Status: ${response.status}`
    );
  }

  const blob =
    await response.blob();

  console.log(
    "Blob size:",
    blob.size
  );

  console.log(
    "Blob type:",
    blob.type
  );

  if (
    !blob ||
    blob.size === 0
  ) {
    throw new Error(
      "Receipt image is empty."
    );
  }

  /*
  ========================================
  Create Firebase Storage path
  ========================================
  */

  const extension =
    getImageExtension(
      image.fileName,
      image.mimeType
    );

  const uniqueFileName =
    `receipt-${Date.now()}-${Math.round(
      Math.random() * 1000000
    )}.${extension}`;

  const imagePath =
    `users/${userId}/receipts/${uniqueFileName}`;

  console.log(
    "Generated image path:",
    imagePath
  );

  console.log(
    "Firebase Storage bucket:",
    storage.app.options.storageBucket
  );

  const imageRef =
    ref(
      storage,
      imagePath
    );

  /*
  ========================================
  Determine content type
  ========================================
  */

  const contentType =
    image.mimeType ||
    blob.type ||
    "image/jpeg";

  console.log(
    "Upload content type:",
    contentType
  );

  /*
  ========================================
  Upload image
  ========================================
  */

  try {
    console.log(
      "Starting Firebase Storage upload..."
    );

    const uploadResult =
      await uploadBytes(
        imageRef,
        blob,
        {
          contentType,
        }
      );

    console.log(
      "Firebase Storage upload completed."
    );

    console.log(
      "Uploaded full path:",
      uploadResult.metadata.fullPath
    );

    console.log(
      "Uploaded bucket:",
      uploadResult.metadata.bucket
    );
  } catch (uploadError: any) {
    console.error(
      "===== Firebase Storage Upload Failed ====="
    );

    console.error(
      "Storage error:",
      uploadError
    );

    console.error(
      "Storage error code:",
      uploadError?.code
    );

    console.error(
      "Storage error message:",
      uploadError?.message
    );

    console.error(
      "Storage server response:",
      uploadError?.serverResponse
    );

    throw uploadError;
  }

  /*
  ========================================
  Get download URL
  ========================================
  */

  console.log(
    "Getting image download URL..."
  );

  const imageUrl =
    await getDownloadURL(
      imageRef
    );

  console.log(
    "Receipt image uploaded successfully."
  );

  console.log(
    "Image path:",
    imagePath
  );

  console.log(
    "Image URL:",
    imageUrl
  );

  return {
    imageUrl,
    imagePath,
  };
}

/*
========================================
Get Receipts
========================================
*/

export async function getReceipts(): Promise<
  SavedReceipt[]
> {
  try {
    const receiptsRef =
      getCurrentUserReceiptsCollection();

    const receiptsQuery =
      query(
        receiptsRef,
        orderBy(
          "createdAt",
          "desc"
        )
      );

    const snapshot =
      await getDocs(
        receiptsQuery
      );

    return snapshot.docs.map(
      (receiptDoc) => {
        const data =
          receiptDoc.data();

        return {
          id: receiptDoc.id,

          store:
            typeof data.store ===
            "string"
              ? data.store
              : null,

          date:
            typeof data.date ===
            "string"
              ? data.date
              : null,

          time:
            typeof data.time ===
            "string"
              ? data.time
              : null,

          total:
            typeof data.total ===
            "number"
              ? data.total
              : null,

          gst:
            typeof data.gst ===
            "number"
              ? data.gst
              : null,

          items:
            Array.isArray(
              data.items
            )
              ? data.items
              : [],

          imageUrl:
            typeof data.imageUrl ===
            "string"
              ? data.imageUrl
              : null,

          imagePath:
            typeof data.imagePath ===
            "string"
              ? data.imagePath
              : null,

          createdAt:
            data.createdAt
              ?.toDate?.()
              .toISOString?.() ??
            "",
        };
      }
    );
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
  receipt: Omit<
    SavedReceipt,
    | "id"
    | "createdAt"
    | "imageUrl"
    | "imagePath"
  >,
  image?: ReceiptImage | null
): Promise<SavedReceipt> {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in."
    );
  }

  let imageUrl:
    | string
    | null = null;

  let imagePath:
    | string
    | null = null;

  try {
    console.log(
      "===== Saving Receipt ====="
    );

    console.log(
      "Firebase user:",
      user.uid
    );

    console.log(
      "Has receipt image:",
      Boolean(image?.uri)
    );

    /*
    ========================================
    Upload original receipt image
    ========================================
    */

    if (image?.uri) {
      const uploadedImage =
        await uploadReceiptImage(
          image,
          user.uid
        );

      imageUrl =
        uploadedImage.imageUrl;

      imagePath =
        uploadedImage.imagePath;
    }

    /*
    ========================================
    Save receipt information to Firestore
    ========================================
    */

    console.log(
      "Saving receipt data to Firestore..."
    );

    const receiptsRef =
      collection(
        db,
        "users",
        user.uid,
        "receipts"
      );

    const receiptData = {
      userId:
        user.uid,

      store:
        receipt.store,

      date:
        receipt.date,

      time:
        receipt.time,

      total:
        receipt.total,

      gst:
        receipt.gst,

      items:
        receipt.items,

      imageUrl,
      imagePath,

      createdAt:
        serverTimestamp(),
    };

    const docRef =
      await addDoc(
        receiptsRef,
        receiptData
      );

    const savedReceipt:
      SavedReceipt = {
      ...receipt,

      id:
        docRef.id,

      imageUrl,
      imagePath,

      createdAt:
        new Date()
          .toISOString(),
    };

    console.log(
      "Receipt saved to Firestore:",
      docRef.id
    );

    return savedReceipt;
  } catch (error) {
    /*
    ========================================
    Cleanup image if Firestore save fails
    ========================================
    */

    if (imagePath) {
      try {
        console.log(
          "Cleaning up uploaded image..."
        );

        const imageRef =
          ref(
            storage,
            imagePath
          );

        await deleteObject(
          imageRef
        );

        console.log(
          "Uploaded image cleaned up."
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Unable to clean up receipt image:",
          cleanupError
        );
      }
    }

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
  id: string,
  imagePath?: string | null
): Promise<void> {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not logged in."
    );
  }

  try {
    /*
    ========================================
    Delete image from Firebase Storage
    ========================================
    */

    if (imagePath) {
      try {
        const imageRef =
          ref(
            storage,
            imagePath
          );

        await deleteObject(
          imageRef
        );

        console.log(
          "Receipt image deleted:",
          imagePath
        );
      } catch (
        imageDeleteError
      ) {
        console.error(
          "Unable to delete receipt image:",
          imageDeleteError
        );
      }
    }

    /*
    ========================================
    Delete Firestore document
    ========================================
    */

    const receiptRef =
      doc(
        db,
        "users",
        user.uid,
        "receipts",
        id
      );

    await deleteDoc(
      receiptRef
    );

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