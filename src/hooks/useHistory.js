// src/hooks/useHistory.js
import { useState, useEffect, useCallback } from 'react'
import { getHistory, removeFromHistory, clearHistory, deleteAnalysis } from '@/lib/storage'

export function useHistory() {
  const [history, setHistory] = useState([])

  const refresh = useCallback(() => setHistory(getHistory()), [])

  useEffect(() => {
    refresh()
    // Refresh when storage changes from another tab
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [refresh])

  const remove = useCallback(async (id) => {
    await deleteAnalysis(id)
    removeFromHistory(id)
    refresh()
  }, [refresh])

  const clear = useCallback(async () => {
    // Delete all analyses from IndexedDB too
    const all = getHistory()
    await Promise.all(all.map((h) => deleteAnalysis(h.id)))
    clearHistory()
    refresh()
  }, [refresh])

  return { history, refresh, remove, clear }
}
