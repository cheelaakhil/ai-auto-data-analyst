// src/components/AnalysisPanel.jsx
import { AlertCircle, RefreshCw } from 'lucide-react'

const STEPS = [
  { label: 'Data Profiling',        icon: '🔍', desc: 'Detecting types, nulls, outliers' },
  { label: 'Business Context',      icon: '🏢', desc: 'Inferring domain & stakeholders' },
  { label: 'Insight Generation',    icon: '💡', desc: 'Finding meaningful patterns' },
  { label: 'KPI Design',            icon: '📊', desc: 'Selecting key metrics to track' },
  { label: 'Visualization Plan',    icon: '📈', desc: 'Choosing optimal chart types' },
  { label: 'Executive Summary',     icon: '📝', desc: 'Distilling to actionable narrative' },
]

export default function AnalysisPanel({ fileName, progress, error, onRetry, onReset }) {
  const currentStep = STEPS.findIndex((s) =>
    progress.toLowerCase().includes(s.label.toLowerCase().split(' ')[0])
  )
  const activeIdx = currentStep === -1 ? 0 : currentStep

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 32 }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'Syne', fontSize: 22, color: '#dde4f0', marginBottom: 12 }}>Analysis Failed</h2>
          <p style={{ color: '#4a6080', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onRetry} style={{
              padding: '10px 24px', borderRadius: 8, background: '#2563eb',
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <RefreshCw size={14} /> Retry
            </button>
            <button onClick={onReset} style={{
              padding: '10px 24px', borderRadius: 8, background: '#141d2e',
              color: '#8899aa', border: '1px solid #1e2d45', cursor: 'pointer', fontSize: 14
            }}>
              Upload Different File
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' }}>
      <div style={{ maxWidth: 520, width: '100%', padding: 32 }}>
        {/* File badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8,
          padding: '6px 14px', marginBottom: 32, fontSize: 13, color: '#8899aa'
        }}>
          📁 {fileName}
        </div>

        <h2 style={{ fontFamily: 'Syne', fontSize: 24, color: '#dde4f0', marginBottom: 8 }}>
          Analyzing your data…
        </h2>
        <p style={{ color: '#4a6080', fontSize: 14, marginBottom: 36 }}>
          Claude is performing a full 8-stage analysis. This takes 15–30 seconds.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step, i) => {
            const done    = i < activeIdx
            const active  = i === activeIdx
            const pending = i > activeIdx
            return (
              <div key={step.label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10,
                background: active ? 'rgba(37,99,235,0.08)' : done ? 'rgba(16,185,129,0.05)' : '#0f1623',
                border: `1px solid ${active ? '#2563eb' : done ? 'rgba(16,185,129,0.2)' : '#1e2d45'}`,
                opacity: pending ? 0.5 : 1,
                transition: 'all 0.3s',
              }}>
                <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>
                  {done ? '✅' : active ? step.icon : step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#3b82f6' : done ? '#10b981' : '#dde4f0' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>{step.desc}</div>
                </div>
                {active && (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid #2563eb', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                )}
                {done && <div style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>Done</div>}
              </div>
            )
          })}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
