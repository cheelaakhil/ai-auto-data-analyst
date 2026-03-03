// src/components/HistorySidebar.jsx
import { useState } from 'react'
import { Trash2, Clock, ChevronRight, Database, BarChart2 } from 'lucide-react'
import { fmt } from '@/lib/utils'

export default function HistorySidebar({ history, onSelect, onDelete, onClear, activeId }) {
  const [confirmClear, setConfirmClear] = useState(false)

  if (history.length === 0) {
    return (
      <div style={{
        width: 260, background: '#0a0e18', borderRight: '1px solid #1e2d45',
        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12,
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6080', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Analysis History
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <Clock size={28} color="#1e2d45" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: '#4a6080' }}>No analyses yet</div>
            <div style={{ fontSize: 11, color: '#2a3a50', marginTop: 4 }}>Upload a file to get started</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: 260, background: '#0a0e18', borderRight: '1px solid #1e2d45',
      display: 'flex', flexDirection: 'column', minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid #1e2d45' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6080', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            History ({history.length})
          </div>
          {confirmClear ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { onClear(); setConfirmClear(false) }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
              <button onClick={() => setConfirmClear(false)} style={{ fontSize: 11, color: '#4a6080', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a3a50' }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
              background: activeId === item.id ? 'rgba(37,99,235,0.12)' : 'transparent',
              border: `1px solid ${activeId === item.id ? 'rgba(37,99,235,0.3)' : 'transparent'}`,
              transition: 'all 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (activeId !== item.id) e.currentTarget.style.background = '#0f1623' }}
            onMouseLeave={(e) => { if (activeId !== item.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: activeId === item.id ? '#3b82f6' : '#dde4f0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title || item.fileName}
                </div>
                <div style={{ fontSize: 10, color: '#4a6080', marginBottom: 2 }}>{item.fileName}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#2a3a50' }}>
                    <Database size={9} style={{ display: 'inline', marginRight: 3 }} />
                    {item.rowCount?.toLocaleString()} rows
                  </span>
                  {item.qualityScore && (
                    <span style={{ fontSize: 10, color: item.qualityScore >= 80 ? '#10b981' : '#f59e0b' }}>
                      Q:{item.qualityScore}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#2a3a50', marginTop: 3 }}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a3a50', padding: 4, flexShrink: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2a3a50'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
