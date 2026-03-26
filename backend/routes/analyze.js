const express = require("express");
const router = express.Router();
const { extractTextFromFile, truncateText } = require("../utils/fileParser");
const { analyzeResumeWithAI } = require("../services/aiService");

/**
 * POST /api/analyze
 * Accepts: jdFile or jdText, resumeFile or resumeText
 * Returns: analysis JSON
 */
router.post("/", async (req, res) => {
  console.log("📥 Received /api/analyze request");
  try {
    let jdText = req.body.jdText || "";
    let resumeText = req.body.resumeText || "";

    console.log("Files received:", req.files ? Object.keys(req.files) : "none");

    // Parse JD file if uploaded
    if (req.files?.jdFile) {
      const file = req.files.jdFile;
      jdText = await extractTextFromFile(file.data, file.name);
    }

    // Parse resume file if uploaded
    if (req.files?.resumeFile) {
      const file = req.files.resumeFile;
      resumeText = await extractTextFromFile(file.data, file.name);
    }

    if (!jdText.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }
    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Resume is required." });
    }

    // Truncate for API efficiency
    const jdTruncated = truncateText(jdText, 5000);
    const resumeTruncated = truncateText(resumeText, 5000);

    const result = await analyzeResumeWithAI(jdTruncated, resumeTruncated);

    res.json({
      success: true,
      data: result,
      // Store texts in response for downstream use (download)
      jdText: jdTruncated,
      resumeText: resumeTruncated,
    });
  } catch (err) {
    console.error("❌ Analysis error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message || "Analysis failed. Please try again.",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
