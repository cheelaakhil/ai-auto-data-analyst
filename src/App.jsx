// src/App.jsx
import { useState, useCallback } from 'react'
import { PlusCircle, Upload } from 'lucide-react'
import UploadZone from '@/components/UploadZone'
import AnalysisPanel from '@/components/AnalysisPanel'
import Dashboard from '@/components/Dashboard'
import HistorySidebar from '@/components/HistorySidebar'
import ChatFollowUp from '@/components/ChatFollowUp'
import ExportPanel from '@/components/ExportPanel'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useHistory } from '@/hooks/useHistory'
import { loadAnalysis } from '@/lib/storage'

export default function App() {
  const { status, progress, error, result, currentId, analyze, reset } = useAnalysis()
  const { history, refresh, remove, clear } = useHistory()

  const [activeId,   setActiveId]   = useState(null)
  const [activeResult, setActiveResult] = useState(null)
  const [activeProfile, setActiveProfile] = useState(null)
  const [activeFile, setActiveFile] = useState(null)
  const [pendingProfile, setPendingProfile] = useState(null)
  const [pendingFile, setPendingFile]       = useState(null)

  // File parsed → kick off Claude
  const onProfileReady = useCallback(async (profile, fileName) => {
    setPendingProfile(profile)
    setPendingFile(fileName)
    const out = await analyze(profile, fileName)
    if (out) {
      setActiveId(out.id)
      setActiveResult(out.result)
      setActiveProfile(profile)
      setActiveFile(fileName)
      refresh()
    }
  }, [analyze, refresh])

  // Load from history
  const onSelectHistory = useCallback(async (id) => {
    const saved = await loadAnalysis(id)
    if (saved) {
      setActiveId(id)
      setActiveResult(saved.result)
      setActiveProfile(saved.profile)
      setActiveFile(saved.fileName)
      reset()
    }
  }, [reset])

  const onDelete = useCallback(async (id) => {
    await remove(id)
    if (id === activeId) {
      setActiveId(null); setActiveResult(null); setActiveProfile(null); setActiveFile(null); reset()
    }
  }, [remove, activeId, reset])

  const startNew = useCallback(() => {
    reset()
    setActiveId(null); setActiveResult(null); setActiveProfile(null); setActiveFile(null)
    setPendingProfile(null); setPendingFile(null)
  }, [reset])

  const displayResult = status === 'done' ? result : activeResult
  const displayId     = status === 'done' ? currentId : activeId
  const displayFile   = status === 'done' ? pendingFile : activeFile
  const displayProfile= status === 'done' ? pendingProfile : activeProfile

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080c14' }}>
      {/* Sidebar — always visible */}
      <HistorySidebar
        history={history}
        onSelect={onSelectHistory}
        onDelete={onDelete}
        onClear={clear}
        activeId={displayId}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Nav */}
        <div style={{
          height: 52, background: '#0a0e18', borderBottom: '1px solid #1e2d45',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          justifyContent: 'space-between', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🧠</span>
            <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 800, color: '#dde4f0' }}>
              AI Auto Data Analyst
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {displayResult && <ExportPanel result={displayResult} fileName={displayFile || 'analysis'} />}
            <button onClick={startNew} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, background: '#141d2e', border: '1px solid #1e2d45',
              color: '#8899aa', fontSize: 12, cursor: 'pointer'
            }}>
              <PlusCircle size={13} /> New Analysis
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {status === 'idle' && !displayResult && (
            <UploadZone onProfileReady={onProfileReady} />
          )}

          {(status === 'running' || status === 'error') && (
            <AnalysisPanel
              fileName={pendingFile}
              progress={progress}
              error={error}
              onRetry={() => pendingProfile && analyze(pendingProfile, pendingFile)}
              onReset={startNew}
            />
          )}

          {displayResult && status !== 'running' && (
            <Dashboard result={displayResult} fileName={displayFile} profile={displayProfile} />
          )}
        </div>
      </div>

      {/* Floating Chat — only when a result exists */}
      {displayResult && (
        <ChatFollowUp
          analysisId={displayId}
          result={displayResult}
          profile={displayProfile}
        />
      )}
    </div>
  )
}
