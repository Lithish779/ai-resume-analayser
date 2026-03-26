const pdf = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts text from uploaded file buffer based on file extension
 */
async function extractTextFromFile(fileBuffer, filename) {
  const ext = filename.split(".").pop().toLowerCase();

  try {
    if (ext === "pdf") {
      const data = await pdf(fileBuffer);
      return data.text;
    }

    if (ext === "docx" || ext === "doc") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    }

    if (ext === "txt" || ext === "md") {
      return fileBuffer.toString("utf-8");
    }

    throw new Error(`Unsupported file type: .${ext}`);
  } catch (err) {
    throw new Error(`Failed to parse ${filename}: ${err.message}`);
  }
}

/**
 * Truncates text to a reasonable length for the API
 */
function truncateText(text, maxChars = 6000) {
  if (!text) return "";
  return text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
}

module.exports = { extractTextFromFile, truncateText };
