# AI Auto Data Analyst — Architecture

## Stack
- **Frontend**: React 18 + Vite + Recharts + Tailwind CSS
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Storage**: localStorage (history) + IndexedDB (datasets)
- **Hosting**: Vercel (free)
- **Auth**: None required (API key stored in .env)

## Project Structure
```
ai-analyst/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Shell, sidebar, nav
│   │   ├── UploadZone.jsx      # CSV/Excel drag-drop uploader
│   │   ├── AnalysisPanel.jsx   # Streaming AI analysis output
│   │   ├── Dashboard.jsx       # Dynamic chart renderer
│   │   ├── HistorySidebar.jsx  # Past analyses list
│   │   ├── ChatFollowUp.jsx    # Ask follow-up questions
│   │   └── ExportPanel.jsx     # Export JSON/PDF report
│   ├── hooks/
│   │   ├── useAnalysis.js      # Claude API call + streaming
│   │   ├── useHistory.js       # localStorage CRUD
│   │   └── useDataset.js       # CSV parsing + profiling
│   ├── lib/
│   │   ├── analyst-prompt.js   # The master analyst system prompt
│   │   ├── parser.js           # CSV/Excel → JS objects
│   │   ├── profiler.js         # Stats, missing values, types
│   │   └── storage.js          # IndexedDB wrapper
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```
