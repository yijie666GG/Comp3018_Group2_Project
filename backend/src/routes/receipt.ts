import { Router } from "express";
import path from "path";

import {
  scanReceiptImage
} from "../services/ocrService";

import {
  parseReceipt
} from "../services/receiptParser";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Receipt API is working",
  });
});

router.get("/test-scan", async (req, res) => {
  try {
    const imagePath = path.join(
      process.cwd(),
      "test-images",
      "test-receipt.jpg"
    );

    // 1. OCR: image -> text
    const text = await scanReceiptImage(imagePath);

    // 2. Parser: text -> structured receipt data
    const receipt = parseReceipt(text);

    // 3. Return result
    res.json({
      success: true,
      receipt: receipt,
      rawText: text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to scan receipt",
    });
  }
});

export default router;