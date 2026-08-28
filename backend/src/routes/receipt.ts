import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

import {
  scanReceiptImage
} from "../services/ocrService";

import {
  parseReceipt
} from "../services/receiptParser";

const router = Router();


// ===============================
// Upload configuration
// ===============================

const uploadFolder = path.join(
  process.cwd(),
  "uploads"
);

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});


// ===============================
// Test API
// ===============================

router.get("/", (req, res) => {
  res.json({
    message: "Receipt API is working",
  });
});


// ===============================
// Test receipt scan
// Uses test-receipt.jpg
// ===============================

router.get("/test-scan", async (req, res) => {
  try {

    const imagePath = path.join(
      process.cwd(),
      "test-images",
      "test-receipt.jpg"
    );

    // OCR
    const text = await scanReceiptImage(
      imagePath
    );

    // Convert OCR text to receipt data
    const receipt = parseReceipt(text);

    res.json({
      success: true,
      receipt: receipt,
      rawText: text,
    });

  } catch (error) {

    console.error(
      "TEST SCAN ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to scan receipt",
    });
  }
});


// ===============================
// Scan uploaded receipt
// Android / Gallery -> Backend
// ===============================

router.post(
  "/scan",

  upload.single("receipt"),

  async (req, res) => {

    let imagePath: string | null = null;

    try {

      // Check image
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No receipt image uploaded",
        });

        return;
      }

      imagePath = req.file.path;

      console.log(
        "Receipt received:",
        imagePath
      );


      // ===========================
      // 1. OCR
      // ===========================

const text =
  await scanReceiptImage(
    imagePath
  );

console.log(
  "OCR completed"
);

console.log(
  "========== OCR TEXT =========="
);

console.log(text);

console.log(
  "=============================="
);


// ===========================
// 2. Parse receipt
// ===========================

const receipt =
  parseReceipt(text);


      // ===========================
      // 3. Return result
      // ===========================

      res.json({
        success: true,
        receipt: receipt,
        rawText: text,
      });


    } catch (error) {

      console.error(
        "RECEIPT SCAN ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to scan receipt",
      });


    } finally {

      // ===========================
      // Delete temporary image
      // ===========================

      if (
        imagePath &&
        fs.existsSync(imagePath)
      ) {
        try {
          fs.unlinkSync(imagePath);

          console.log(
            "Temporary image deleted"
          );

        } catch (deleteError) {

          console.error(
            "Unable to delete temporary image:",
            deleteError
          );
        }
      }
    }
  }
);


export default router;