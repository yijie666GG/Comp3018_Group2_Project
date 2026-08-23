import express from "express";
import cors from "cors";
import receiptRouter from "./routes/receipt";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

// Receipt API
app.use("/api/receipts", receiptRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});