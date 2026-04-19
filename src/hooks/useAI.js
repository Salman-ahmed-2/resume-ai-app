import { useState, useCallback, useRef } from 'react'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY_1
const GROK_KEY      = import.meta.env.VITE_GROK_KEY_1
const GEMINI_KEY    = import.meta.env.VITE_GEMINI_KEY_1
const GROQ_KEY      = import.meta.env.VITE_GROQ_KEY_1

// ── Provider registry ────────────────────────────────────────────────────────
// Order = priority. First available (has a key) is tried first.
// On rate-limit / quota errors the hook skips to the next one automatically.
const PROVIDERS = [
  { id: 'gemini',    key: () => GEMINI_KEY    },
  { id: 'anthropic', key: () => ANTHROPIC_KEY },
  { id: 'groq',      key: () => GROQ_KEY      },
  { id: 'grok',      key: () => GROK_KEY      },
]

// HTTP status codes / error strings that mean "quota/rate-limit" → try next
const RATE_LIMIT_STATUSES = new Set([429, 529])
const RATE_LIMIT_MSGS     = ['rate limit', 'quota', 'too many requests', 'overloaded']

function isRateLimit(status, message = '') {
  return (
    RATE_LIMIT_STATUSES.has(status) ||
    RATE_LIMIT_MSGS.some(s => message.toLowerCase().includes(s))
  )
}

// ── Per-provider request builders ────────────────────────────────────────────

function buildGemini(key, systemPrompt, messages) {
  const contents = [
    { role: 'user',  parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these instructions exactly.' }] },
    ...messages.map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ]
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 4000 } }),
    },
  }
}

function buildAnthropic(key, systemPrompt, messages, stream) {
  return {
    url: 'https://api.anthropic.com/v1/messages',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: systemPrompt,
        messages,
        stream: !!stream,
      }),
    },
  }
}

function buildGroq(key, systemPrompt, messages, stream) {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',   // fast + capable; swap to 'mixtral-8x7b-32768' if preferred
        max_tokens: 4000,
        stream: !!stream,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    },
  }
}

function buildGrok(key, systemPrompt, messages, stream) {
  return {
    url: 'https://api.x.ai/v1/chat/completions',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        max_tokens: 4000,
        stream: !!stream,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    },
  }
}

// ── Response parsers ─────────────────────────────────────────────────────────

function parseNonStreaming(providerId, data) {
  switch (providerId) {
    case 'gemini':    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    case 'anthropic': return data.content?.[0]?.text || ''
    case 'groq':
    case 'grok':      return data.choices?.[0]?.message?.content || ''
    default:          return ''
  }
}

function parseStreamDelta(providerId, parsed) {
  switch (providerId) {
    case 'anthropic': return parsed.type === 'content_block_delta' ? (parsed.delta?.text || '') : ''
    case 'groq':
    case 'grok':      return parsed.choices?.[0]?.delta?.content || ''
    default:          return ''
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAI() {
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState(null)
  const [activeProvider,   setActiveProvider]   = useState(null)  // which provider is currently in use
  const [skippedProviders, setSkippedProviders] = useState([])    // providers bypassed due to rate limits

  // Persist skipped set across calls within the same session
  const skippedRef = useRef(new Set())

  /**
   * generate(systemPrompt, userInput, onChunk?)
   *
   * userInput:
   *   • string → single-turn  [{ role:'user', content }]
   *   • array  → multi-turn   [{ role:'user'|'assistant', content }]
   *
   * Auto-failover: if a provider returns a rate-limit error the hook
   * marks it as skipped for the rest of the session and retries with
   * the next available provider. Call resetProviders() to clear.
   */
  const generate = useCallback(async (systemPrompt, userInput, onChunk) => {
    const messages = Array.isArray(userInput)
      ? userInput
      : [{ role: 'user', content: userInput }]

    // Build ordered list of providers that have keys AND aren't skipped
    const candidates = PROVIDERS.filter(
      p => !!p.key() && !skippedRef.current.has(p.id)
    )

    if (candidates.length === 0) {
      const msg = skippedRef.current.size
        ? 'All configured providers hit rate limits. Call resetProviders() or wait.'
        : 'No API keys found. Add at least one key to your .env file.'
      setError(msg)
      return null
    }

    setLoading(true)
    setError(null)

    for (const provider of candidates) {
      const key = provider.key()

      try {
        let req
        switch (provider.id) {
          case 'gemini':    req = buildGemini(key, systemPrompt, messages); break
          case 'anthropic': req = buildAnthropic(key, systemPrompt, messages, onChunk); break
          case 'groq':      req = buildGroq(key, systemPrompt, messages, onChunk); break
          case 'grok':      req = buildGrok(key, systemPrompt, messages, onChunk); break
          default: continue
        }

        const response = await fetch(req.url, req.options)

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const msg     = errData?.error?.message || `HTTP ${response.status}`

          if (isRateLimit(response.status, msg)) {
            // Mark this provider as exhausted and try the next one
            skippedRef.current.add(provider.id)
            setSkippedProviders([...skippedRef.current])
            console.warn(`[useAI] ${provider.id} rate-limited, switching to next provider…`)
            continue
          }

          throw new Error(`[${provider.id}] ${msg}`)
        }

        // ── Success — note which provider responded ───────────────────────────
        setActiveProvider(provider.id)

        // ── Streaming (Anthropic / Groq / Grok only — Gemini is non-streaming) ─
        if (onChunk && provider.id !== 'gemini') {
          const reader   = response.body.getReader()
          const decoder  = new TextDecoder()
          let   fullText = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const lines = decoder.decode(value).split('\n')
            for (const line of lines) {
              const payload = line.replace(/^data:\s*/, '').trim()
              if (!payload || payload.toLowerCase() === '[done]') continue
              try {
                const delta = parseStreamDelta(provider.id, JSON.parse(payload))
                if (delta) { fullText += delta; onChunk(fullText) }
              } catch { /* ignore SSE parse errors */ }
            }
          }

          setLoading(false)
          return fullText
        }

        // ── Non-streaming / Gemini ────────────────────────────────────────────
        const data = await response.json()
        const text = parseNonStreaming(provider.id, data)
        if (onChunk) onChunk(text)
        setLoading(false)
        return text

      } catch (err) {
        // Network-level errors (e.g. CORS on Grok) → try next provider
        if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
          skippedRef.current.add(provider.id)
          setSkippedProviders([...skippedRef.current])
          console.warn(`[useAI] ${provider.id} unreachable, switching to next provider…`)
          continue
        }
        // All other errors are surfaced to the caller
        setError(err.message)
        setLoading(false)
        return null
      }
    }

    // All candidates exhausted
    const msg = 'All providers failed or are rate-limited.'
    setError(msg)
    setLoading(false)
    return null
  }, [])

  /** Clear the skipped-providers set so all providers are retried again. */
  const resetProviders = useCallback(() => {
    skippedRef.current.clear()
    setSkippedProviders([])
    setActiveProvider(null)
    setError(null)
  }, [])

  return {
    generate,
    resetProviders,
    loading,
    error,
    activeProvider,   // e.g. 'gemini' | 'anthropic' | 'groq' | 'grok'
    skippedProviders, // array of provider ids currently bypassed
  }
}