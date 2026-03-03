// src/components/Dashboard.jsx
import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, CARD_COLOR, fmt } from '@/lib/utils'

// Normalize chart data to {label, value} and derive from profile if empty
function normalizeChartData(chart, profile) {
  let data = Array.isArray(chart.data) ? [...chart.data] : []
  const labelKeys = ['label', 'name', 'x', 'category', 'key']
  const valueKeys = ['value', 'count', 'y', 'total', 'sum']

  const getLabelKey = (obj) => labelKeys.find((k) => obj && k in obj)
  const getValueKey = (obj) => valueKeys.find((k) => obj && (typeof obj[k] === 'number' || !isNaN(parseFloat(obj[k]))))

  if (data.length > 0) {
    const first = data[0]
    const lk = getLabelKey(first) || 'label'
    const vk = getValueKey(first) || 'value'
    if (lk !== 'label' || vk !== 'value') {
      data = data.map((d) => ({ label: String(d[lk] ?? d.label ?? ''), value: Number(d[vk] ?? d.value ?? 0) }))
    }
  }

  if (data.length === 0 && profile?.columns) {
    const xKey = (chart.xKey || '').toLowerCase()
    const yKey = (chart.yKey || '').toLowerCase()
    const dimCol = profile.columns.find((c) => c.name?.toLowerCase() === xKey || c.inferredType === 'dimension')
    const numCol = profile.columns.find((c) => c.name?.toLowerCase() === yKey || c.inferredType === 'measure')
    if (dimCol?.stats?.topValues?.length) {
      data = dimCol.stats.topValues.map((tv) => ({ label: String(tv.val ?? ''), value: Number(tv.count ?? 0) }))
    } else if (dimCol && numCol && profile.sampleRows?.length) {
      const agg = {}
      profile.sampleRows.forEach((r) => {
        const lbl = String(r[dimCol.name] ?? '')
        const val = parseFloat(r[numCol.name])
        if (!isNaN(val)) agg[lbl] = (agg[lbl] || 0) + val
      })
      data = Object.entries(agg).map(([label, value]) => ({ label, value })).slice(0, 10)
    }
  }
  return data
}

// ─── Custom Tooltip ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#141d2e', border: '1px solid #1e2d45',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#dde4f0'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#3b82f6' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#dde4f0' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? fmt.number(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ─── Chart Renderer ──────────────────────────────────────────────
function ChartRenderer({ chart, normalizedData }) {
  const data = normalizedData ?? chart.data ?? []
  const key = 'value'
  const labelKey = 'label'
  const type = (chart.type || 'bar').toLowerCase().replace(/\s/g, '')

  const commonProps = {
    data,
    margin: { top: 4, right: 8, left: 0, bottom: 4 }
  }

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart {...commonProps} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey={labelKey} tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={key} radius={[4, 4, 0, 0]} name={key}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey={labelKey} tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={key} stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0], r: 3 }} name={key} />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`ag-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey={labelKey} tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={key} stroke={CHART_COLORS[0]} fill={`url(#ag-${chart.id})`} strokeWidth={2} name={key} />
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
              dataKey={key} nameKey={labelKey} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8899aa' }} />
          </PieChart>
        </ResponsiveContainer>
      )

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius={80}>
            <PolarGrid stroke="#1e2d45" />
            <PolarAngleAxis dataKey={labelKey} tick={{ fill: '#4a6080', fontSize: 11 }} />
            <Radar dataKey={key} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.25} name={key} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      )

    case 'histogram':
    default:
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart {...commonProps} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey={labelKey} tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={key} fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} name={key} />
          </BarChart>
        </ResponsiveContainer>
      )
  }
}

// ─── KPI Cards ───────────────────────────────────────────────────
function KpiCards({ cards }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
      {cards.map((card, i) => {
        const col = CARD_COLOR[card.color] || CARD_COLOR.accent
        return (
          <div key={i} style={{
            background: '#0f1623', border: '1px solid #1e2d45',
            borderTop: `3px solid ${col}`, borderRadius: 12, padding: '16px 18px'
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: col, fontFamily: 'JetBrains Mono, monospace' }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#dde4f0', marginTop: 4 }}>{card.label}</div>
            {card.change && (
              <div style={{ fontSize: 11, color: card.trend === 'up' ? '#10b981' : card.trend === 'down' ? '#ef4444' : '#4a6080', marginTop: 4 }}>
                {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→'} {card.change}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Chart Card ──────────────────────────────────────────────────
function ChartCard({ chart, normalizedData }) {
  const data = normalizedData ?? []
  const hasData = data.length > 0
  return (
    <div style={{ background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#dde4f0', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {chart.title}
      </div>
      {chart.description && (
        <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 14 }}>{chart.description}</div>
      )}
      {hasData ? (
        <ChartRenderer chart={chart} normalizedData={data} />
      ) : (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a6080', fontSize: 12 }}>
          No chart data available for this visualization
        </div>
      )}
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────
function Section({ section, charts, chartDataMap }) {
  const sectionCharts = (section.chartIds || [])
    .map((id) => charts.find((c) => c.id === id))
    .filter(Boolean)

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
        {section.title}
      </div>
      {section.type === 'kpi_cards' ? (
        <KpiCards cards={section.cards || []} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: sectionCharts.length === 1 ? '1fr' : '1fr 1fr', gap: 14 }}>
          {sectionCharts.map((chart) => (
            <ChartCard key={chart.id} chart={chart} normalizedData={chartDataMap?.[chart.id]} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Insights List ───────────────────────────────────────────────
function InsightsList({ insights }) {
  const urgencyColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
        Key Insights
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {insights.map((ins) => (
          <div key={ins.id} style={{
            background: '#0f1623', border: '1px solid #1e2d45',
            borderLeft: `4px solid ${urgencyColor[ins.urgency] || '#2563eb'}`,
            borderRadius: 10, padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#dde4f0', marginBottom: 6 }}>{ins.title}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: `${urgencyColor[ins.urgency]}22`, color: urgencyColor[ins.urgency],
                whiteSpace: 'nowrap'
              }}>{ins.urgency}</span>
            </div>
            <div style={{ fontSize: 12, color: '#8899aa', lineHeight: 1.6, marginBottom: 8 }}>{ins.finding}</div>
            <div style={{ fontSize: 11, color: '#3b82f6', lineHeight: 1.5 }}>→ {ins.implication}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Executive Summary ───────────────────────────────────────────
function ExecutiveSummary({ summary }) {
  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
        Executive Summary
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #0f1e3d, #0f1623)',
        border: '1px solid #2563eb', borderRadius: 14, padding: 24, marginBottom: 16
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#dde4f0', lineHeight: 1.6 }}>
          {summary.headline}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {[
          { label: "What's Happening", items: summary.whatsHappening, icon: '📍', color: '#3b82f6' },
          { label: "Why It Matters",   items: summary.whyItMatters,    icon: '💡', color: '#f59e0b' },
        ].map((panel) => (
          <div key={panel.label} style={{
            background: '#0f1623', border: '1px solid #1e2d45',
            borderLeft: `4px solid ${panel.color}`, borderRadius: 10, padding: '16px 18px'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: panel.color, marginBottom: 12 }}>
              {panel.icon} {panel.label}
            </div>
            {(panel.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: panel.color, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 12, color: '#8899aa', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: '#0f1623', border: '1px solid #1e2d45', borderLeft: '4px solid #10b981', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>⚡ Recommended Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(summary.recommendedActions || []).map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginTop: 1,
                background: `${priorityColor[a.priority]}22`, color: priorityColor[a.priority]
              }}>{a.priority}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#dde4f0' }}>{a.action}</div>
                <div style={{ fontSize: 11, color: '#4a6080', marginTop: 3, lineHeight: 1.5 }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────
const TABS = ['Dashboard', 'Insights', 'Columns', 'Summary']

export default function Dashboard({ result, fileName, profile }) {
  const [tab, setTab] = useState('Dashboard')
  const { meta, dashboardLayout, charts: rawCharts = [], insights = [], columns = [], executiveSummary, kpis = [], dataQuality } = result

  const { charts, chartDataMap, sections } = useMemo(() => {
    let charts = [...rawCharts]
    const chartDataMap = {}
    charts.forEach((c) => {
      chartDataMap[c.id] = normalizeChartData(c, profile)
    })
    if (charts.length === 0 && profile?.columns?.length) {
      const dimCols = profile.columns.filter((c) => c.stats?.topValues?.length)
      dimCols.slice(0, 4).forEach((col, i) => {
        const id = `chart_${i + 1}`
        const data = col.stats.topValues.map((tv) => ({ label: String(tv.val), value: Number(tv.count) }))
        charts.push({ id, title: `Top ${col.name}`, type: i === 0 ? 'pie' : 'bar', description: `Distribution of ${col.name}`, data })
        chartDataMap[id] = data
      })
    }
    let secs = dashboardLayout?.sections || []
    if (secs.length === 0 && charts.length > 0) {
      secs = [
        { id: 'kpis', title: 'Key Metrics', type: 'kpi_cards', cards: kpis?.slice(0, 4).map((k, i) => ({ label: k.name, value: '—', color: 'accent' })) || [] },
        { id: 'charts', title: 'Data Distribution', type: 'charts', chartIds: charts.map((c) => c.id) },
      ]
    }
    return { charts, chartDataMap, sections: secs }
  }, [rawCharts, profile, dashboardLayout?.sections, kpis])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: '#dde4f0' }}>
            {meta?.title || fileName}
          </h1>
          {meta?.domain && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(37,99,235,0.15)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.3)'
            }}>{meta.domain}</span>
          )}
          {dataQuality && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: dataQuality.score >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: dataQuality.score >= 80 ? '#10b981' : '#f59e0b',
              border: `1px solid ${dataQuality.score >= 80 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
            }}>Quality: {dataQuality.score}/100</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#4a6080' }}>📁 {fileName} · {result._profile?.rowCount || '—'} rows</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #1e2d45', paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', padding: '8px 16px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: tab === t ? '#3b82f6' : '#4a6080',
            borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s'
          }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Dashboard' && (
        <>
          {sections.map((section) => (
            <Section key={section.id} section={section} charts={charts} chartDataMap={chartDataMap} />
          ))}
        </>
      )}

      {tab === 'Insights' && <InsightsList insights={insights} />}

      {tab === 'Columns' && (
        <div style={{ background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2d45' }}>
                {['Column', 'Type', 'Null %', 'Unique', 'Sample Values'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((col, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#dde4f0' }}>{col.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4,
                      background: col.type === 'measure' ? 'rgba(37,99,235,0.15)' : col.type === 'datetime' ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.15)',
                      color: col.type === 'measure' ? '#3b82f6' : col.type === 'datetime' ? '#06b6d4' : '#8b5cf6'
                    }}>{col.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: col.nullPct > 20 ? '#ef4444' : '#4a6080' }}>
                    {col.nullPct}%
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#8899aa' }}>{col.uniqueCount?.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a6080' }}>
                    {(col.sampleValues || []).slice(0, 3).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Summary' && executiveSummary && <ExecutiveSummary summary={executiveSummary} />}
    </div>
  )
}
