// src/lib/utils.js
export const nanoid = (len = 12) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, len)

export const fmt = {
  number: (n) => {
    if (n === null || n === undefined) return '—'
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B'
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n.toLocaleString()
  },
  date: (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  pct: (n) => `${n}%`,
}

export const CHART_COLORS = [
  '#2563eb', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
]

export const TREND_COLOR = {
  up: '#10b981',
  down: '#ef4444',
  neutral: '#64748b',
}

export const CARD_COLOR = {
  success: '#10b981',
  danger:  '#ef4444',
  warn:    '#f59e0b',
  accent:  '#2563eb',
  purple:  '#8b5cf6',
  cyan:    '#06b6d4',
}
