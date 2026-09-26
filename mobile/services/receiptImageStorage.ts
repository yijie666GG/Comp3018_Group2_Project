import * as FileSystem from "expo-file-system/legacy";

const RECEIPT_IMAGE_DIRECTORY =
  `${FileSystem.documentDirectory}receipt-images/`;

/*
========================================
Create local receipt image directory
========================================
*/

async function ensureReceiptImageDirectory() {
  const directoryInfo =
    await FileSystem.getInfoAsync(
      RECEIPT_IMAGE_DIRECTORY
    );

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      RECEIPT_IMAGE_DIRECTORY,
      {
        intermediates: true,
      }
    );
  }
}

/*
========================================
Save Receipt Image Locally
========================================
*/

export async function saveReceiptImage(
  receiptId: string,
  sourceUri: string
): Promise<string> {
  await ensureReceiptImageDirectory();

  const destination =
    `${RECEIPT_IMAGE_DIRECTORY}${receiptId}.jpg`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  console.log(
    "Receipt image saved locally:",
    destination
  );

  return destination;
}

/*
========================================
Get Receipt Image
========================================
*/

export async function getReceiptImage(
  receiptId: string
): Promise<string | null> {
  const imageUri =
    `${RECEIPT_IMAGE_DIRECTORY}${receiptId}.jpg`;

  const imageInfo =
    await FileSystem.getInfoAsync(imageUri);

  if (!imageInfo.exists) {
    return null;
  }

  return imageUri;
}

/*
========================================
Delete Receipt Image
========================================
*/

export async function deleteReceiptImage(
  receiptId: string
): Promise<void> {
  const imageUri =
    `${RECEIPT_IMAGE_DIRECTORY}${receiptId}.jpg`;

  const imageInfo =
    await FileSystem.getInfoAsync(imageUri);

  if (!imageInfo.exists) {
    return;
  }

  await FileSystem.deleteAsync(
    imageUri,
    {
      idempotent: true,
    }
  );

  console.log(
    "Local receipt image deleted:",
    receiptId
  );
}