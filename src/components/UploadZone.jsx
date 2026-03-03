// src/components/UploadZone.jsx
import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { parseFile } from '@/lib/parser'
import { profileDataset } from '@/lib/profiler'

export default function UploadZone({ onProfileReady }) {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing]   = useState(false)
  const [parseError, setParseError] = useState(null)
  const inputRef = useRef()

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setParseError(null)
    setParsing(true)
    try {
      const { data, fields } = await parseFile(file)
      if (data.length === 0) throw new Error('Dataset is empty.')
      const profile = profileDataset(data, fields, file.name)
      onProfileReady(profile, file.name)
    } catch (err) {
      setParseError(err.message)
    } finally {
      setParsing(false)
    }
  }, [onProfileReady])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#080c14' }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #1d3a6e, #2563eb)',
            marginBottom: 20, fontSize: 28,
          }}>🧠</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#dde4f0', marginBottom: 8 }}>
            AI Auto Data Analyst
          </h1>
          <p style={{ color: '#4a6080', fontSize: 15 }}>
            Drop any CSV or Excel file. Claude analyzes it and builds a full dashboard automatically.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#2563eb' : '#1e2d45'}`,
            borderRadius: 16,
            padding: '48px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(37,99,235,0.06)' : '#0f1623',
            transition: 'all 0.2s',
          }}
        >
          {parsing ? (
            <div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
              <p style={{ color: '#3b82f6', fontWeight: 600 }}>Parsing your dataset…</p>
            </div>
          ) : (
            <>
              <Upload size={36} color={dragging ? '#2563eb' : '#4a6080'} style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#dde4f0', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                Drag & drop your file here
              </p>
              <p style={{ color: '#4a6080', fontSize: 13 }}>or click to browse — CSV, XLS, XLSX supported</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Error */}
        {parseError && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontSize: 13
          }}>
            <AlertCircle size={16} />
            {parseError}
          </div>
        )}

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 32 }}>
          {[
            { icon: '🔍', label: 'Auto Profiling', desc: 'Types, nulls, outliers, correlations' },
            { icon: '💡', label: 'AI Insights', desc: 'Business-focused, decision-oriented' },
            { icon: '📊', label: 'Live Dashboard', desc: 'Charts, KPIs, executive summary' },
          ].map((f) => (
            <div key={f.label} style={{
              background: '#0f1623', border: '1px solid #1e2d45',
              borderRadius: 10, padding: '14px 16px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ color: '#dde4f0', fontWeight: 600, fontSize: 12 }}>{f.label}</div>
              <div style={{ color: '#4a6080', fontSize: 11, marginTop: 3 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
