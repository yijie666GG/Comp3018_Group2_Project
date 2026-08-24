import { createWorker } from "tesseract.js";

export async function scanReceiptImage(
  imagePath: string
): Promise<string> {
  const worker = await createWorker("eng");

  try {
    console.log("Starting local OCR...");

    const result = await worker.recognize(imagePath);

    const text = result.data.text;

    console.log("OCR completed.");

    return text;
  } catch (error) {
    console.error("LOCAL OCR ERROR:");
    console.error(error);

    throw error;
  } finally {
    await worker.terminate();
  }
}