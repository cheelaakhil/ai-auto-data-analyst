// src/components/ExportPanel.jsx
import { Download } from 'lucide-react'

export default function ExportPanel({ result, fileName }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.replace(/\.[^.]+$/, '')}-analysis.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportMarkdown = () => {
    const { meta, executiveSummary, insights, kpis } = result
    const lines = [
      `# ${meta?.title || fileName} — Analysis Report`,
      `**Domain:** ${meta?.domain}`,
      `**Generated:** ${new Date().toLocaleDateString()}`,
      '',
      '## Executive Summary',
      executiveSummary?.headline,
      '',
      '### What\'s Happening',
      ...(executiveSummary?.whatsHappening || []).map(b => `- ${b}`),
      '',
      '### Why It Matters',
      ...(executiveSummary?.whyItMatters || []).map(b => `- ${b}`),
      '',
      '### Recommended Actions',
      ...(executiveSummary?.recommendedActions || []).map(a => `- **[${a.priority.toUpperCase()}]** ${a.action}: ${a.detail}`),
      '',
      '## Key Insights',
      ...(insights || []).flatMap(i => [
        `### ${i.title} _(${i.urgency})_`,
        i.finding,
        `> ${i.implication}`,
        ''
      ]),
      '## KPIs to Track',
      ...(kpis || []).flatMap(k => [
        `### ${k.name}`,
        `- **Formula:** ${k.formula}`,
        `- **Target:** ${k.target}`,
        `- **Why:** ${k.importance}`,
        ''
      ]),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.replace(/\.[^.]+$/, '')}-report.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={exportMarkdown} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8,
        background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
        color: '#3b82f6', fontSize: 12, fontWeight: 600, cursor: 'pointer'
      }}>
        <Download size={13} /> Export Report
      </button>
      <button onClick={exportJSON} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8,
        background: '#141d2e', border: '1px solid #1e2d45',
        color: '#8899aa', fontSize: 12, cursor: 'pointer'
      }}>
        <Download size={13} /> JSON
      </button>
    </div>
  )
}
