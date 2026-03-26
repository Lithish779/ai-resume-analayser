const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in backend/.env");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Robust JSON extraction helper
 */
function extractJSON(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("JSON Parsing Error. Raw response content snippet:", text.substring(0, 500) + "...");
    throw new Error("Failed to parse AI response as JSON. Structure might be invalid.");
  }
}

/**
 * Analyzes resume against job description using Groq
 */
async function analyzeResumeWithAI(jdText, resumeText) {
  console.log("🔍 Starting AI Analysis (Groq)...");
  
  const prompt = `You are a world-class ATS (Applicant Tracking System) analyzer and career coach with 15+ years of experience.

TASK: Analyze the resume against the job description and provide detailed scoring and recommendations.

JOB DESCRIPTION:
---
${jdText}
---

RESUME:
---
${resumeText}
---

Respond ONLY with a valid JSON object. Use this exact structure:

{
  "score": <integer 0-100, overall ATS match score>,
  "verdict": "<5-7 word punchy verdict>",
  "description": "<2-3 sentence honest assessment of the candidate's fit>",
  "breakdown": [
    { "label": "Skills Match", "score": <0-100>, "note": "<10-word insight>" },
    { "label": "Experience Relevance", "score": <0-100>, "note": "<10-word insight>" },
    { "label": "Keywords Coverage", "score": <0-100>, "note": "<10-word insight>" },
    { "label": "Education Fit", "score": <0-100>, "note": "<10-word insight>" },
    { "label": "Formatting & Clarity", "score": <0-100>, "note": "<10-word insight>" }
  ],
  "matched_keywords": ["<keyword>", "<keyword>", ...],
  "missing_keywords": ["<keyword>", "<keyword>", ...],
  "recommendations": [
    {
      "priority": "high",
      "title": "<action title>",
      "body": "<specific, actionable advice with examples>",
      "impact": "<expected score improvement>"
    }
  ],
  "improved_summary": "<AI-rewritten professional summary tailored to this JD, 3-4 sentences>",
  "improved_skills_section": ["<skill1>", "<skill2>", ...],
  "ats_tips": ["<tip1>", "<tip2>", "<tip3>"]
}

Rules:
- matched_keywords: 6-10 keywords found in both resume and JD
- missing_keywords: 6-10 important keywords from JD missing in resume
- recommendations: 4-6 items, mix of high/med/low priority
- Be brutally honest but constructive
- improved_skills_section: list of 8-12 skills to add/emphasize based on JD`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
    });
    return extractJSON(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq AI API Error (Analysis):", err);
    throw err;
  }
}

/**
 * Generates improved resume content based on original + recommendations
 */
async function generateImprovedResume(jdText, resumeText, format, analysisResult, customKeywords = []) {
  console.log(`📝 Generating Improved Resume (${format} via Groq)...`);

  const prompt = `You are an expert resume writer. Rewrite the provided resume to better match the job description.

JOB DESCRIPTION:
---
${jdText}
---

ORIGINAL RESUME:
---
${resumeText}
---

ANALYSIS INSIGHTS:
- Missing keywords to add: ${analysisResult.missing_keywords?.join(", ")}
- User-specified keywords to prioritize: ${Array.isArray(customKeywords) ? customKeywords.join(", ") : ""}
- Improved summary to use: ${analysisResult.improved_summary}

INSTRUCTIONS:
1. Rewrite and optimize the resume content for this specific JD
2. Naturally incorporate missing keywords
3. Quantify achievements where possible
4. Use the improved professional summary
5. Keep the same general experience/education structure but enhance the language
6. Format: ${format} layout

Respond ONLY with a JSON object:
{
  "name": "<candidate name>",
  "title": "<professional title aligned to JD>",
  "email": "<email from resume>",
  "phone": "<phone from resume>",
  "location": "<location from resume>",
  "linkedin": "<linkedin if present>",
  "summary": "<rewritten professional summary>",
  "experience": [
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<date range>",
      "bullets": ["<achievement bullet>", ...]
    }
  ],
  "education": [
    {
      "institution": "<school>",
      "degree": "<degree>",
      "year": "<year>"
    }
  ],
  "skills": ["<skill1>", "<skill2>", ...],
  "certifications": ["<cert1>", ...]
}

Rules:
- Ensure ALL user-specified keywords are included naturally.
- Use the improved professional summary as the core of the summary section.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
    });
    return extractJSON(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq AI API Error (Generation):", err);
    throw err;
  }
}

/**
 * Handles general career-related chat queries
 */
async function getAIChatResponse(userQuery) {
  console.log("💬 AI Chat Query:", userQuery);

  const prompt = `You are a supportive and expert career coach and resume specialist named ResumeIQ AI.
  
  CONTEXT: You are part of the ResumeIQ platform, which helps users analyze resumes against job descriptions and optimize them.
  
  TASK: Respond to the user's career/resume-related question with actionable, professional, and encouraging advice.
  - If the question is about ResumeIQ, explain that it helps tailor resumes to JDs.
  - Keep the tone professional yet friendly.
  - Use Markdown for formatting (bold, bullet points).
  - Limit response to 2-3 short paragraphs.
  
  USER QUERY: ${userQuery}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
    });
    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq AI API Error (Chat):", err.message);
    throw new Error("I'm sorry, I'm having trouble thinking right now. Please try again later!");
  }
}

module.exports = { analyzeResumeWithAI, generateImprovedResume, getAIChatResponse };
