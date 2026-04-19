const ANTHROPIC_MODEL = 'claude-3-5-sonnet-20240620'
const GROK_MODEL      = 'grok-beta'
const GEMINI_MODEL    = 'gemini-1.5-flash'

// Provider priority order: Gemini → Grok → Anthropic

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
    }
  }

  const { provider = 'ai', systemPrompt, userMessage, messages, stream = false } = body
  const effectiveUserMessage = userMessage || messages?.[messages.length - 1]?.content

  if (!systemPrompt || !effectiveUserMessage) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'provider, systemPrompt, and userMessage are required',
      }),
    }
  }


// Support generic 'ai' provider (fallback/mock - customize with your preferred backend)
  if (provider === 'ai') {
    // Mock response for demo (replace with actual AI call, e.g. OpenAI, or fallback to grok if key available)
    const mockText = `${systemPrompt}\n\nGenerated AI response for: ${userMessage || messages?.[messages.length-1]?.content || 'query'}.`;
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, text: mockText }),
    }
  }

  const keys = {
    gemini:    process.env.GEMINI_API_KEY    || process.env.VITE_GEMINI_API_KEY,
    grok:      process.env.GROK_API_KEY      || process.env.VITE_GROK_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY,
  }

  const key = keys[provider]
  if (!key) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: `${provider} API key not configured on server` }),
    }
  }

  try {
    let response

    if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 4000,
          stream: false,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })
    } else if (provider === 'grok') {
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          max_tokens: 4000,
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage },
          ],
        }),
      })
    } else if (provider === 'gemini') {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
          }),
        }
      )
    } else if (provider === 'ai') {
      // Handled above
    } else {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: `Unsupported provider: ${provider}` }),
      }
    }

    const raw = await response.text()
    if (!response.ok) {
      let errMessage = raw
      try { errMessage = JSON.parse(raw)?.error?.message || raw } catch {}
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, error: `${provider} error: ${errMessage}` }),
      }
    }

    const data = JSON.parse(raw)
    let text = ''
    if (provider === 'anthropic') text = data.content?.[0]?.text ?? ''
    else if (provider === 'grok')  text = data.choices?.[0]?.message?.content ?? ''
    else if (provider === 'gemini') text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, text }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: err.message || 'AI proxy fetch failed' }),
    }
  }
}
