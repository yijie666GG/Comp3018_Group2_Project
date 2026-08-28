import { createWorker, PSM } from "tesseract.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function scanReceiptImage(
  imagePath: string
): Promise<string> {
  const worker = await createWorker("eng");

  // Create temporary processed image
  const processedImagePath = path.join(
    path.dirname(imagePath),
    `processed-${Date.now()}.png`
  );

  try {
    console.log("Starting image preprocessing...");

    // =========================
    // Image Preprocessing
    // =========================

    await sharp(imagePath)
      // Automatically rotate image using EXIF orientation
      .rotate()

      // Convert to grayscale
      .grayscale()

      // Improve contrast
      .normalize()

      // Sharpen receipt text
      .sharpen()

      // Resize large camera images
      .resize({
        width: 1800,
        withoutEnlargement: true,
      })

      // Convert to PNG for OCR
      .png()

      .toFile(processedImagePath);

    console.log(
      "Image preprocessing completed."
    );

    console.log(
      "Starting local OCR..."
    );

    // =========================
    // Tesseract Configuration
    // =========================

    await worker.setParameters({
      tessedit_pageseg_mode:
        PSM.SINGLE_BLOCK,
      preserve_interword_spaces:
        "1",
    });

    // =========================
    // OCR
    // =========================

    const result =
      await worker.recognize(
        processedImagePath
      );

    const text =
      result.data.text;

    console.log(
      "OCR completed."
    );

    console.log(
      "========== OCR TEXT =========="
    );

    console.log(text);

    console.log(
      "=============================="
    );

    return text;
  } catch (error) {
    console.error(
      "LOCAL OCR ERROR:"
    );

    console.error(error);

    throw error;
  } finally {
    await worker.terminate();

    // Delete processed temporary image
    if (
      fs.existsSync(
        processedImagePath
      )
    ) {
      try {
        fs.unlinkSync(
          processedImagePath
        );

        console.log(
          "Processed image deleted."
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Unable to delete processed image:",
          deleteError
        );
      }
    }
  }
}