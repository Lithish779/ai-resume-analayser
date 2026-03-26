# ResumeIQ — AI-Powered Resume Analyzer

A full-stack **React + Node.js** application that analyzes resumes against job descriptions using Claude AI, scores the match, provides actionable recommendations, and generates optimized resumes as downloadable `.docx` files — with a **Telegram Bot** integration.

---

## Features

| Feature | Details |
|---|---|
| **3-Page Flow** | JD Upload → Resume Upload → Results Dashboard |
| **File Support** | PDF, DOCX, DOC, TXT, Markdown for both JD and Resume |
| **AI Scoring** | 0–100 ATS match score with 5-category breakdown |
| **Keyword Analysis** | Matched vs missing keywords highlighted |
| **Recommendations** | 4–6 prioritized, actionable improvement tips |
| **AI Summary Rewrite** | Improved professional summary tailored to the JD |
| **3 Resume Formats** | Classic, Sidebar, Modern Two-Column — all downloadable as `.docx` |
| **Telegram Bot** | Full bot integration — upload files, get scores, download resumes |

---

## Tech Stack

**Frontend:** React 18, Framer Motion, Axios, React Dropzone, Lucide React  
**Backend:** Node.js, Express, Anthropic SDK (Claude), pdf-parse, mammoth, docx  
**Bot:** node-telegram-bot-api  

---

## Project Structure

```
resumeiq/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── telegramBot.js         # Telegram bot logic
│   ├── routes/
│   │   ├── analyze.js         # POST /api/analyze
│   │   └── download.js        # POST /api/download
│   ├── services/
│   │   ├── aiService.js       # Claude AI calls
│   │   └── docxGenerator.js   # DOCX resume builder (3 layouts)
│   ├── utils/
│   │   └── fileParser.js      # PDF/DOCX/TXT extraction
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js             # Main app + routing
│   │   ├── index.js
│   │   ├── styles/global.css
│   │   ├── pages/
│   │   │   ├── JDPage.js      # Step 1: Job Description
│   │   │   ├── ResumePage.js  # Step 2: Resume upload + trigger analysis
│   │   │   └── ResultsPage.js # Step 3: Score + recommendations + download
│   │   └── components/
│   │       ├── Navbar.js
│   │       ├── FileDropzone.js
│   │       ├── ScoreRing.js
│   │       ├── RecommendationCard.js
│   │       ├── FormatSelector.js
│   │       └── TelegramModal.js
│   └── package.json
│
├── package.json               # Root scripts (concurrently)
└── README.md
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd resumeiq
npm install                     # Install root deps
npm run install:all             # Install backend + frontend deps
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional — enables Telegram bot
TELEGRAM_BOT_TOKEN=123456:ABC-your-token-here

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Get your API key:**
- Anthropic: https://console.anthropic.com
- Telegram Bot: Message [@BotFather](https://t.me/BotFather) → `/newbot`

### 3. Run in Development

```bash
# From the root directory — runs both frontend and backend
npm run dev
```

Or separately:
```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
```

### 4. Open the App

Visit **http://localhost:3000**

---

## API Endpoints

### `POST /api/analyze`
Analyzes a resume against a job description.

**Request:** `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| `jdFile` | File | JD as PDF/DOCX/TXT/MD (optional) |
| `jdText` | string | JD as plain text (optional) |
| `resumeFile` | File | Resume as PDF/DOCX/TXT (optional) |
| `resumeText` | string | Resume as plain text (optional) |

> Provide either file or text for each. File takes priority.

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 72,
    "verdict": "Solid foundation, key gaps remain",
    "description": "...",
    "breakdown": [...],
    "matched_keywords": [...],
    "missing_keywords": [...],
    "recommendations": [...],
    "improved_summary": "...",
    "improved_skills_section": [...],
    "ats_tips": [...]
  },
  "jdText": "...",
  "resumeText": "..."
}
```

---

### `POST /api/download`
Generates an AI-optimized resume as a `.docx` file.

**Request:** `application/json`
```json
{
  "jdText": "...",
  "resumeText": "...",
  "format": "classic | sidebar | modern",
  "analysisResult": { ... }
}
```

**Response:** Binary `.docx` file stream

---

## Telegram Bot Commands

| Command | Description |
|---|---|
| `/start` | Begin a new resume analysis session |
| `/help` | Show available commands and usage |
| `/cancel` | Cancel current session |

**Bot Flow:**
1. User sends `/start`
2. Bot prompts for JD (file or text)
3. Bot prompts for resume (file or text)
4. AI analyzes and returns formatted score + breakdown
5. User chooses a resume format (inline keyboard)
6. Bot sends back the optimized `.docx` file

---

## Resume Formats

| Format | Description | Best For |
|---|---|---|
| **Classic** | Single-column, top-to-bottom | ATS systems, traditional roles |
| **Sidebar** | Dark left panel (skills/contact) + main content | Tech, design roles |
| **Modern** | Bold header banner + two-column body | Startups, creative roles |

---

## Deployment

### Backend (e.g., Railway, Render, Fly.io)
```bash
cd backend
npm start
```
Set environment variables in your platform dashboard.

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
```
Set the `proxy` in `package.json` to your deployed backend URL, or use an environment variable:

```js
// In frontend, replace /api calls with:
const API_BASE = process.env.REACT_APP_API_URL || '';
axios.post(`${API_BASE}/api/analyze`, ...)
```

---

## Customization

- **Change the AI model:** In `backend/services/aiService.js`, update `model: "claude-opus-4-5"` to any available Claude model
- **Add more formats:** Extend `docxGenerator.js` with new layout functions and add them to `FormatSelector.js`
- **Add Discord/WhatsApp bot:** Create `discordBot.js` or `whatsappBot.js` following the same pattern as `telegramBot.js`
- **Adjust scoring prompt:** Edit the prompt in `aiService.js → analyzeResumeWithAI()` to change scoring criteria

---

## License

MIT
