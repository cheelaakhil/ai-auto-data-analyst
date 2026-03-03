// src/components/ChatFollowUp.jsx
import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, X } from 'lucide-react'
import { FOLLOW_UP_SYSTEM_PROMPT } from '@/lib/analyst-prompt'
import { getChatHistory, saveChatHistory } from '@/lib/storage'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

function getProvider() {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (groqKey && groqKey.startsWith('gsk_')) return { provider: 'groq', key: groqKey }
  if (geminiKey && !geminiKey.includes('YOUR_')) return { provider: 'gemini', key: geminiKey }
  if (anthropicKey && !anthropicKey.includes('YOUR_KEY')) return { provider: 'anthropic', key: anthropicKey }
  return null
}

export default function ChatFollowUp({ analysisId, result, profile }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    if (analysisId) setMessages(getChatHistory(analysisId))
  }, [analysisId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const provider = getProvider()
    if (!provider) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Missing API key. Add VITE_GROQ_API_KEY (free), VITE_GEMINI_API_KEY, or VITE_ANTHROPIC_API_KEY to .env' }])
      return
    }

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const context = `
Dataset: ${profile?.fileName} (${profile?.rowCount} rows, ${profile?.colCount} columns)
Analysis Summary: ${result?.executiveSummary?.headline}
Key Insights: ${(result?.insights || []).map(i => i.title).join(', ')}
`

    try {
      let assistantText = ''
      if (provider.provider === 'groq') {
        const groqMessages = [
          { role: 'system', content: FOLLOW_UP_SYSTEM_PROMPT + '\n\nCONTEXT:\n' + context },
          ...newMessages,
        ]
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 512,
            messages: groqMessages,
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `Groq API error ${res.status}`)
        }
        const data = await res.json()
        assistantText = data.choices?.[0]?.message?.content || 'Sorry, I could not answer that.'
      } else if (provider.provider === 'gemini') {
        const contents = newMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
        const res = await fetch(`${GEMINI_URL}?key=${provider.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: FOLLOW_UP_SYSTEM_PROMPT + '\n\nCONTEXT:\n' + context }] },
            generationConfig: { maxOutputTokens: 512 },
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `Gemini API error ${res.status}`)
        }
        const data = await res.json()
        assistantText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not answer that.'
      } else {
        const response = await fetch(ANTHROPIC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': provider.key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 512,
            system: FOLLOW_UP_SYSTEM_PROMPT + '\n\nCONTEXT:\n' + context,
            messages: newMessages,
          }),
        })
        const data = await response.json()
        assistantText = data.content?.[0]?.text || 'Sorry, I could not answer that.'
      }
      const assistantMsg = { role: 'assistant', content: assistantText }
      const updated = [...newMessages, assistantMsg]
      setMessages(updated)
      saveChatHistory(analysisId, updated)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "Which column has the most missing data?",
    "What's the most important KPI to track?",
    "Summarize the top 3 risks in this data",
    "What action should I take first?",
  ]

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 52, height: 52,
          borderRadius: '50%', background: '#2563eb', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(37,99,235,0.4)', zIndex: 100,
          transition: 'transform 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={22} color="#fff" />
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, width: 380, height: 520,
          background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 16,
          display: 'flex', flexDirection: 'column', zIndex: 100,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2d45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#dde4f0' }}>Ask the Analyst</div>
              <div style={{ fontSize: 11, color: '#4a6080' }}>Follow-up questions about your data</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a6080' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {messages.length === 0 && (
              <div>
                <div style={{ fontSize: 12, color: '#4a6080', marginBottom: 12 }}>Try asking:</div>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setInput(s)} style={{
                    display: 'block', width: '100%', textAlign: 'left', marginBottom: 8,
                    padding: '8px 12px', background: '#141d2e', border: '1px solid #1e2d45',
                    borderRadius: 8, color: '#8899aa', fontSize: 12, cursor: 'pointer'
                  }}>{s}</button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                  background: msg.role === 'user' ? '#2563eb' : '#141d2e',
                  color: msg.role === 'user' ? '#fff' : '#dde4f0',
                  border: msg.role === 'assistant' ? '1px solid #1e2d45' : 'none'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#3b82f6',
                    animation: `bounce 1s ease ${i * 0.15}s infinite`
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #1e2d45', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask anything about your data…"
              style={{
                flex: 1, background: '#141d2e', border: '1px solid #1e2d45',
                borderRadius: 8, padding: '8px 12px', color: '#dde4f0',
                fontSize: 13, outline: 'none'
              }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              background: '#2563eb', border: 'none', borderRadius: 8,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', opacity: !input.trim() ? 0.5 : 1
            }}>
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </>
  )
}
