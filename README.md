# 🧠 AI Auto Data Analyst

A fully autonomous, AI-powered data analyst web app. Upload any CSV or Excel file and get a complete business analysis, interactive dashboard, KPIs, insights, and executive summary — powered by Claude.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Auto Profiling | Detects types, nulls, outliers, duplicates, correlations |
| 🧠 AI Analysis | Claude performs 8-stage analysis and returns structured JSON |
| 📊 Live Dashboard | Dynamic charts rendered from Claude's output |
| 💡 Insights | Decision-oriented business findings |
| 📈 KPIs | Suggested metrics with formulas and targets |
| 🗂️ History | All past analyses saved in IndexedDB + localStorage |
| 💬 Chat Follow-up | Ask follow-up questions about your data |
| 📤 Export | Download analysis as Markdown report or JSON |

---

## 🚀 Quick Start (Local)

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/ai-auto-data-analyst
cd ai-auto-data-analyst
npm install
```

### 2. Set up your API key
```bash
cp .env.example .env
```
Edit `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Get your free key:** https://console.anthropic.com
> New accounts receive **$5 free credits** — enough for 100+ analyses.

### 3. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## ☁️ Deploy to Vercel (Free)

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts. Set VITE_ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

### Option B — GitHub + Vercel UI
1. Push this repo to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Set environment variable: `VITE_ANTHROPIC_API_KEY = sk-ant-...`
4. Click Deploy

**Your app will be live at:** `https://your-app-name.vercel.app` ✅

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── UploadZone.jsx        # Drag-drop file uploader
│   ├── AnalysisPanel.jsx     # Loading screen with step progress
│   ├── Dashboard.jsx         # Chart + KPI renderer
│   ├── HistorySidebar.jsx    # Past analyses with load/delete
│   ├── ChatFollowUp.jsx      # Floating chat for follow-up Q&A
│   └── ExportPanel.jsx       # Export to MD or JSON
├── hooks/
│   ├── useAnalysis.js        # Claude API call logic
│   └── useHistory.js         # localStorage history management
└── lib/
    ├── analyst-prompt.js     # Master analyst system prompt ← THE BRAIN
    ├── parser.js             # CSV/Excel → JS objects
    ├── profiler.js           # Statistical profiling
    ├── storage.js            # IndexedDB + localStorage
    └── utils.js              # Helpers
```

---

## 🔧 Customization

### Change the AI model
In `src/hooks/useAnalysis.js`:
```js
const MODEL = 'claude-opus-4-20250514'  // More powerful, slower
```

### Extend the analyst prompt
In `src/lib/analyst-prompt.js` — edit `ANALYST_SYSTEM_PROMPT` to add:
- Industry-specific analysis rules
- Custom KPI formulas
- Specific chart preferences
- Your company's business context

### Add more chart types
In `src/components/Dashboard.jsx` → `ChartRenderer` — add new cases to the switch.

---

## 💰 Cost Estimate

| Usage | Estimated Cost |
|---|---|
| 1 analysis (~500 rows) | ~$0.01–0.03 |
| 100 analyses | ~$1–3 |
| Free credits on signup | ~100–500 analyses |

---

## 🛡️ Security Note

The API key is stored in `.env` and called directly from the browser (Vite exposes `VITE_` vars). This is fine for personal use. For a **production multi-user app**, route API calls through a backend (Next.js API routes, Express, etc.) to keep the key server-side.

---

## 📄 License

MIT — free to use, modify, and deploy.
