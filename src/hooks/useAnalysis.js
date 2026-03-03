// src/hooks/useAnalysis.js
import { useState, useCallback } from 'react'
import { ANALYST_SYSTEM_PROMPT, buildUserPrompt } from '@/lib/analyst-prompt'
import { saveAnalysis, addToHistory } from '@/lib/storage'
import { nanoid } from '@/lib/utils'

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

export function useAnalysis() {
  const [status, setStatus]     = useState('idle') // idle | running | done | error
  const [progress, setProgress] = useState('')
  const [error, setError]       = useState(null)
  const [result, setResult]     = useState(null)
  const [currentId, setCurrentId] = useState(null)

  const analyze = useCallback(async (profile, fileName) => {
    const provider = getProvider()
    if (!provider) {
      setError('Missing API key. Add VITE_GROQ_API_KEY (free at console.groq.com), VITE_GEMINI_API_KEY, or VITE_ANTHROPIC_API_KEY to .env')
      setStatus('error')
      return
    }

    setStatus('running')
    setError(null)
    setResult(null)

    const steps = [
      'Profiling data structure…',
      'Inferring business context…',
      'Generating insights…',
      'Designing KPIs…',
      'Building visualization plan…',
      'Composing executive summary…',
    ]
    let stepIdx = 0
    setProgress(steps[0])
    const ticker = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1)
      setProgress(steps[stepIdx])
    }, 3000)

    try {
      let rawText = ''
      if (provider.provider === 'groq') {
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 4096,
            messages: [
              { role: 'system', content: ANALYST_SYSTEM_PROMPT },
              { role: 'user', content: buildUserPrompt(profile) },
            ],
            response_format: { type: 'json_object' },
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `Groq API error ${res.status}`)
        }
        const data = await res.json()
        rawText = data.choices?.[0]?.message?.content || ''
      } else if (provider.provider === 'gemini') {
        const res = await fetch(`${GEMINI_URL}?key=${provider.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildUserPrompt(profile) }] }],
            systemInstruction: { parts: [{ text: ANALYST_SYSTEM_PROMPT }] },
            generationConfig: { maxOutputTokens: 4096, responseMimeType: 'application/json' },
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `Gemini API error ${res.status}`)
        }
        const data = await res.json()
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
            max_tokens: 4096,
            system: ANALYST_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: buildUserPrompt(profile) }],
          }),
        })
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `API error ${response.status}`)
        }
        const data = await response.json()
        rawText = data.content?.[0]?.text || ''
      }

      clearInterval(ticker)

      // Strip any accidental markdown fences
      const clean = rawText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Persist
      const id = nanoid()
      await saveAnalysis(id, { profile, result: parsed, fileName })
      addToHistory({
        id,
        fileName,
        title: parsed.meta?.title || fileName,
        domain: parsed.meta?.domain || 'Unknown',
        rowCount: profile.rowCount,
        colCount: profile.colCount,
        qualityScore: profile.dataQualityScore,
        createdAt: new Date().toISOString(),
      })

      setCurrentId(id)
      setResult(parsed)
      setStatus('done')
      return { id, result: parsed }
    } catch (err) {
      clearInterval(ticker)
      setError(err.message)
      setStatus('error')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress('')
    setError(null)
    setResult(null)
    setCurrentId(null)
  }, [])

  return { status, progress, error, result, currentId, analyze, reset }
}
