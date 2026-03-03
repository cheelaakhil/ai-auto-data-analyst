// src/lib/storage.js
// ─────────────────────────────────────────────────────────────────
// History stored in localStorage (metadata)
// Full analysis results stored in IndexedDB (large JSON)
// ─────────────────────────────────────────────────────────────────

const DB_NAME = 'ai-analyst-db'
const DB_VERSION = 1
const STORE_NAME = 'analyses'
const HISTORY_KEY = 'ai-analyst-history'

// ── IndexedDB ────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveAnalysis(id, analysis) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ id, analysis })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadAnalysis(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(id)
    req.onsuccess = () => resolve(req.result?.analysis || null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteAnalysis(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── localStorage History Index ───────────────────────────────────
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch { return [] }
}

export function addToHistory(entry) {
  // entry: { id, fileName, title, domain, rowCount, colCount, createdAt }
  const history = getHistory()
  history.unshift(entry)
  // Keep last 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
}

export function removeFromHistory(id) {
  const history = getHistory().filter((h) => h.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

// ── Chat history per analysis ────────────────────────────────────
export function getChatHistory(analysisId) {
  try {
    return JSON.parse(localStorage.getItem(`chat-${analysisId}`) || '[]')
  } catch { return [] }
}

export function saveChatHistory(analysisId, messages) {
  localStorage.setItem(`chat-${analysisId}`, JSON.stringify(messages.slice(-50)))
}

export function clearChatHistory(analysisId) {
  localStorage.removeItem(`chat-${analysisId}`)
}
