const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const analyzeRoutes = require("./routes/analyze");
const downloadRoutes = require("./routes/download");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    useTempFiles: false,
    abortOnLimit: true,
  })
);

// Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/download", downloadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ Backend running on http://localhost:${PORT}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/api/health\n`);
});

// Start Telegram Bot (optional - only if token provided)
if (process.env.TELEGRAM_BOT_TOKEN) {
  require("./telegramBot");
}
