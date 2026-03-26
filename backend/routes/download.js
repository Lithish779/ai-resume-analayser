const express = require("express");
const router = express.Router();
const { generateImprovedResume } = require("../services/aiService");
const { generateDocx } = require("../services/docxGenerator");
const { generatePdf } = require("../services/pdfGenerator");

/**
 * POST /api/download
 * Accepts: jdText, resumeText, format, fileType, analysisResult
 * Returns: File buffer (PDF or DOCX)
 */
router.post("/", async (req, res) => {
  try {
    const { jdText, resumeText, format = "classic", fileType = "docx", analysisResult, customKeywords = [] } = req.body;

    if (!jdText || !resumeText) {
      return res.status(400).json({ error: "JD and resume text are required." });
    }

    console.log(`📥 Download request: Format=${format}, Type=${fileType}, Extras=${customKeywords.length} keywords`);

    // Generate improved resume content
    let improvedData;
    try {
      improvedData = await generateImprovedResume(jdText, resumeText, format, analysisResult || {}, customKeywords);
      console.log(`✅ AI Generation success for ${format}`);
    } catch (aiErr) {
      console.error("❌ AI Generation failed:", aiErr);
      return res.status(500).json({ error: "AI failed to rewrite resume. Please try again." });
    }

    if (!improvedData || typeof improvedData !== 'object') {
      console.error("❌ Invalid AI data format:", improvedData);
      return res.status(500).json({ error: "AI returned invalid data format." });
    }

    let buffer;
    if (fileType === "pdf") {
      buffer = await generatePdf(improvedData, format);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ResumeIQ_Optimized_${format}.pdf"`,
        "Content-Length": buffer.length,
      });
    } else {
      buffer = await generateDocx(improvedData, format);
      res.set({
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="ResumeIQ_Optimized_${format}.docx"`,
        "Content-Length": buffer.length,
      });
    }

    res.send(buffer);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: err.message || "Failed to generate resume." });
  }
});

module.exports = router;
