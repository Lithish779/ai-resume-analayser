const TelegramBot = require("node-telegram-bot-api");
const { extractTextFromFile, truncateText } = require("./utils/fileParser");
const { analyzeResumeWithAI, generateImprovedResume, getAIChatResponse } = require("./services/aiService");
const { generateDocx } = require("./services/docxGenerator");
const { generatePdf } = require("./services/pdfGenerator");
const https = require("https");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Session store: chatId -> { step, jdText, resumeText, analysis, selectedFormat, selectedFileType }
const sessions = new Map();

console.log("🤖 Telegram Bot started...");

// Helper: download file from Telegram
async function downloadTelegramFile(fileId) {
  const fileInfo = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

  return new Promise((resolve, reject) => {
    https.get(fileUrl, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ buffer: Buffer.concat(chunks), path: fileInfo.file_path }));
      res.on("error", reject);
    });
  });
}

// Helper: format score message
function formatScoreMessage(result) {
  const score = result.score;
  const emoji = score >= 75 ? "🟢" : score >= 50 ? "🟡" : "🔴";
  const bar = "█".repeat(Math.round(score / 10)) + "░".repeat(10 - Math.round(score / 10));

  let msg = `${emoji} *ResumeIQ Analysis Complete*\n\n`;
  msg += `📊 *Overall Score: ${score}/100*\n`;
  msg += `\`${bar}\`\n\n`;
  msg += `*Verdict:* ${result.verdict}\n`;
  msg += `${result.description}\n\n`;

  msg += `📋 *Score Breakdown:*\n`;
  result.breakdown?.forEach((item) => {
    const b = "█".repeat(Math.round(item.score / 20)) + "░".repeat(5 - Math.round(item.score / 20));
    msg += `${item.label}: \`${b}\` ${item.score}%\n`;
  });

  msg += `\n✅ *Matched Keywords:*\n`;
  msg += (result.matched_keywords || []).slice(0, 6).map((k) => `• ${k}`).join("\n");

  msg += `\n\n❌ *Missing Keywords:*\n`;
  msg += (result.missing_keywords || []).slice(0, 6).map((k) => `• ${k}`).join("\n");

  if (result.recommendations?.length) {
    msg += `\n\n💡 *Top Recommendations:*\n`;
    result.recommendations.slice(0, 3).forEach((rec, i) => {
      const pEmoji = rec.priority === "high" ? "🔴" : rec.priority === "med" ? "🟡" : "🟢";
      msg += `\n${i + 1}. ${pEmoji} *${rec.title}*\n${rec.body}\n`;
    });
  }

  return msg;
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions.set(chatId, { step: "await_jd" });

  bot.sendMessage(
    chatId,
    `👋 Welcome to *ResumeIQ Bot*!\n\nI'll analyze your resume against a job description and give you a match score + recommendations.\n\n📄 *Step 1:* Send me the Job Description (JD) as a file (PDF, DOCX, TXT) or paste it as text.`,
    { 
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌐 Visit Web Dashboard", url: process.env.FRONTEND_URL || "http://localhost:3000" }]
        ]
      }
    }
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*ResumeIQ Bot Commands:*\n\n/start - Begin a new analysis\n/help - Show this message\n/cancel - Cancel current session\n\n*How it works:*\n1️⃣ Send your JD (file or text)\n2️⃣ Send your resume (file or text)\n3️⃣ Get your match score + AI recommendations\n4️⃣ Download an optimized resume!`,
    { parse_mode: "Markdown" }
  );
});

// /cancel command
bot.onText(/\/cancel/, (msg) => {
  sessions.delete(msg.chat.id);
  bot.sendMessage(msg.chat.id, "❌ Session cancelled. Send /start to begin again.");
});

// Handle documents (file uploads)
bot.on("document", async (msg) => {
  const chatId = msg.chat.id;
  const session = sessions.get(chatId);

  if (!session) {
    return bot.sendMessage(chatId, "Send /start to begin a new analysis.");
  }

  try {
    const waitMsg = await bot.sendMessage(chatId, "⏳ Processing your file...");

    const { buffer, path: filePath } = await downloadTelegramFile(msg.document.file_id);
    const filename = msg.document.file_name || filePath;
    const text = await extractTextFromFile(buffer, filename);
    const truncated = truncateText(text, 5000);

    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

    if (session.step === "await_jd") {
      session.jdText = truncated;
      session.step = "await_resume";
      bot.sendMessage(chatId, `✅ JD received! (${text.length} characters)\n\n📋 *Step 2:* Now send your resume as a file or paste it as text.`, { parse_mode: "Markdown" });
    } else if (session.step === "await_resume") {
      session.resumeText = truncated;
      await runAnalysis(chatId, session);
    }
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error reading file: ${err.message}\nPlease try a different format or paste the text directly.`);
  }
});

// MAIN Message Handler (Text)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  const session = sessions.get(chatId);

  // 1. Workflow Handlers
  if (session) {
    if (session.step === "await_jd") {
      session.jdText = text;
      session.step = "await_resume";
      return bot.sendMessage(chatId, `✅ JD received!\n\n📋 *Step 2:* Now send me your resume as a file or paste it as text.`, { parse_mode: "Markdown" });
    } 
    
    if (session.step === "await_resume") {
      session.resumeText = text;
      return await runAnalysis(chatId, session);
    } 
    
    if (session.step === "await_keywords") {
      if (text.toLowerCase() === "/skip") {
        return await sendImprovedResume(chatId, session, session.selectedFormat, session.selectedFileType, []);
      } else {
        const keywords = text.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean);
        return await sendImprovedResume(chatId, session, session.selectedFormat, session.selectedFileType, keywords);
      }
    }
  }

  // 2. DEFAULT: General AI Career Chat
  if (!session || session.step === "done" || session.step === undefined) {
    const typingMsg = await bot.sendMessage(chatId, "🤔 Let me think...");
    try {
      const aiResponse = await getAIChatResponse(text);
      console.log("✅ AI Response received:", aiResponse.substring(0, 100) + "...");
      await bot.editMessageText(aiResponse, { chat_id: chatId, message_id: typingMsg.message_id });
    } catch (err) {
      await bot.editMessageText(`❌ Sorry, I'm having trouble thinking. Please try /start to begin a resume analysis or ask me something later!`, { chat_id: chatId, message_id: typingMsg.message_id });
    }
  }
});

// Handle format selection callbacks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const session = sessions.get(chatId);
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith("format_") && session) {
    session.selectedFormat = data.replace("format_", "");
    await bot.sendMessage(chatId, `📂 *Format selected: ${session.selectedFormat}*\nNow choose your file type:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📜 Word Document (.docx)", callback_data: `type_docx` },
            { text: "📕 PDF Document (.pdf)", callback_data: `type_pdf` },
          ],
        ],
      },
    });
  } else if (data.startsWith("type_") && session) {
    session.selectedFileType = data.replace("type_", "");
    await bot.sendMessage(chatId, `✨ *Almost ready!*\n\nDo you want to add any specific keywords (e.g. AWS, Python, Teamwork) to prioritize? \n\nSend them as text, or send /skip to use only the AI suggestions.`, {
      parse_mode: "Markdown"
    });
    session.step = "await_keywords";
  }
});

async function runAnalysis(chatId, session) {
  const analyzeMsg = await bot.sendMessage(chatId, "🧠 Analyzing with AI... This takes about 10-15 seconds.");

  try {
    const result = await analyzeResumeWithAI(session.jdText, session.resumeText);
    session.analysis = result;
    session.step = "done";

    await bot.deleteMessage(chatId, analyzeMsg.message_id).catch(() => {});

    const scoreMsg = formatScoreMessage(result);
    await bot.sendMessage(chatId, scoreMsg, { parse_mode: "Markdown" });

    // Offer format options
    await bot.sendMessage(chatId, "🎨 *Want an optimized resume?*\nChoose your preferred format:", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📄 Classic (ATS)", callback_data: "format_classic" },
            { text: "🎭 Elegant", callback_data: "format_elegant" },
          ],
          [
            { text: "🎯 Sidebar", callback_data: "format_sidebar" },
            { text: "✨ Modern", callback_data: "format_modern" },
            { text: "💼 Professional", callback_data: "format_professional" },
          ],
          [
            { text: "🌐 Visit Web Dashboard", url: process.env.FRONTEND_URL || "http://localhost:3000" }
          ]
        ],
      },
    });
  } catch (err) {
    await bot.deleteMessage(chatId, analyzeMsg.message_id).catch(() => {});
    bot.sendMessage(chatId, `❌ Analysis failed: ${err.message}\n\nSend /start to try again.`);
  }
}

async function sendImprovedResume(chatId, session, format, fileType = "docx", customKeywords = []) {
  if (!session?.analysis || !session?.jdText || !session?.resumeText) {
    return bot.sendMessage(chatId, "Session expired. Please send /start to begin again.");
  }

  const genMsg = await bot.sendMessage(chatId, `⚙️ Generating your optimized *${format}* ${fileType.toUpperCase()}...`, { parse_mode: "Markdown" });

  try {
    const improvedData = await generateImprovedResume(session.jdText, session.resumeText, format, session.analysis, customKeywords);
    
    let buffer;
    let extension;
    let contentType;

    if (fileType === "pdf") {
      buffer = await generatePdf(improvedData, format);
      extension = "pdf";
      contentType = "application/pdf";
    } else {
      buffer = await generateDocx(improvedData, format);
      extension = "docx";
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    await bot.deleteMessage(chatId, genMsg.message_id).catch(() => {});

    await bot.sendDocument(
      chatId,
      buffer,
      { caption: `✅ Here's your optimized *${format}* resume! Tailored by AI.\n\nSend /start to analyze another resume.`, parse_mode: "Markdown" },
      { filename: `ResumeIQ_Optimized_${format}.${extension}`, contentType: contentType }
    );

    sessions.delete(chatId);
  } catch (err) {
    if (genMsg) await bot.deleteMessage(chatId, genMsg.message_id).catch(() => {});
    bot.sendMessage(chatId, `❌ Failed to generate resume: ${err.message}`);
  }
}

module.exports = bot;
