import { createWorker, PSM } from "tesseract.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// ======================================================
// OCR quality scoring
// ======================================================

function scoreOcrText(text: string): number {
  if (!text) {
    return 0;
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let score = 0;

  for (const line of lines) {
    const letters =
      (line.match(/[A-Za-zÀ-ÿ]/g) || []).length;

    const numbers =
      (line.match(/\d/g) || []).length;

    const moneyValues =
      (line.match(/\d+[.,]\d{2}/g) || []).length;

    score += letters;
    score += numbers * 0.5;
    score += moneyValues * 5;

    if (
      /\b(total|subtotal|gst|tax|vat|mwst|cash|receipt|invoice|chf|aud|usd|eur)\b/i.test(
        line
      )
    ) {
      score += 8;
    }

    const garbage =
      (
        line.match(
          /[^A-Za-zÀ-ÿ0-9\s.,:$€£@%\-()/]/g
        ) || []
      ).length;

    score -= garbage * 0.5;
  }

  return score;
}

// ======================================================
// Run one OCR pass
// ======================================================

async function runOCR(
  imagePath: string,
  processedImagePath: string,
  thresholdMode: boolean
): Promise<string> {
  const metadata =
    await sharp(imagePath).metadata();

  const originalWidth =
    metadata.width ?? 1200;

  const targetWidth =
    originalWidth < 2000
      ? 2000
      : Math.min(originalWidth, 2800);

  let pipeline = sharp(imagePath)
    .rotate()
    .resize({
      width: targetWidth,
      withoutEnlargement: false,
      fit: "inside",
    })
    .grayscale()
    .normalize()
    .sharpen({
      sigma: 1.1,
    });

  if (thresholdMode) {
    pipeline = pipeline
      .linear(1.2, -10)
      .threshold(175);
  }

  await pipeline
    .png()
    .toFile(processedImagePath);

  const worker =
    await createWorker("eng");

  try {
    await worker.setParameters({
      tessedit_pageseg_mode:
        PSM.SINGLE_BLOCK,

      preserve_interword_spaces:
        "1",
    });

    const result =
      await worker.recognize(
        processedImagePath
      );

    return (
      result.data.text ?? ""
    ).trim();
  } finally {
    await worker.terminate();
  }
}

// ======================================================
// Main OCR function
// ======================================================

export async function scanReceiptImage(
  imagePath: string
): Promise<string> {
  const normalImagePath =
    path.join(
      path.dirname(imagePath),
      `processed-normal-${Date.now()}.png`
    );

  const thresholdImagePath =
    path.join(
      path.dirname(imagePath),
      `processed-threshold-${Date.now()}.png`
    );

  try {
    console.log(
      "===== OCR START ====="
    );

    console.log(
      "Original image:",
      imagePath
    );

    // ==========================================
    // Pass 1 - normal enhanced image
    // ==========================================

    console.log(
      "Starting OCR pass 1..."
    );

    const normalText =
      await runOCR(
        imagePath,
        normalImagePath,
        false
      );

    const normalScore =
      scoreOcrText(
        normalText
      );

    console.log(
      "OCR pass 1 score:",
      normalScore
    );

    // ==========================================
    // Pass 2 - threshold image
    // ==========================================

    console.log(
      "Starting OCR pass 2..."
    );

    const thresholdText =
      await runOCR(
        imagePath,
        thresholdImagePath,
        true
      );

    const thresholdScore =
      scoreOcrText(
        thresholdText
      );

    console.log(
      "OCR pass 2 score:",
      thresholdScore
    );

    // ==========================================
    // Select best result
    // ==========================================

    const bestText =
      thresholdScore >
      normalScore
        ? thresholdText
        : normalText;

    console.log(
      "===== RAW OCR TEXT ====="
    );

    console.log(
      bestText
    );

    console.log(
      "===== OCR END ====="
    );

    return bestText;
  } catch (error) {
    console.error(
      "LOCAL OCR ERROR:"
    );

    console.error(error);

    throw error;
  } finally {
    const tempFiles = [
      normalImagePath,
      thresholdImagePath,
    ];

    for (const tempFile of tempFiles) {
      if (
        fs.existsSync(
          tempFile
        )
      ) {
        try {
          fs.unlinkSync(
            tempFile
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
}