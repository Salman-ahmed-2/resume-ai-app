import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

// Parses simple markdown into HTML-like JSX
function parseMarkdown(text) {
  if (!text) return []

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push({ type: 'h3', text: line.slice(4), key: i })
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', text: line.slice(3), key: i })
    } else if (line.startsWith('# ')) {
      elements.push({ type: 'h1', text: line.slice(2), key: i })
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push({ type: 'strong', text: line.slice(2, -2), key: i })
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push({ type: 'li', text: line.slice(2), key: i })
    } else if (line.startsWith('---')) {
      elements.push({ type: 'hr', key: i })
    } else if (line.trim() === '') {
      elements.push({ type: 'br', key: i })
    } else {
      elements.push({ type: 'p', text: line, key: i })
    }
    i++
  }
  return elements
}

function renderInline(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} style={{ color: 'var(--accent)' }}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function AIOutput({ content, className = '' }) {
  const [copied, setCopied] = useState(false)

  if (!content) return null

  const elements = parseMarkdown(content)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
        style={{
          color: copied ? 'var(--accent)' : 'var(--text-muted)',
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <div className="ai-prose pt-2 pr-16">
        {elements.map(el => {
          switch (el.type) {
            case 'h1': return <h1 key={el.key}>{renderInline(el.text)}</h1>
            case 'h2': return <h2 key={el.key}>{renderInline(el.text)}</h2>
            case 'h3': return <h3 key={el.key}>{renderInline(el.text)}</h3>
            case 'strong': return <p key={el.key}><strong>{el.text}</strong></p>
            case 'li': return (
              <div key={el.key} className="flex gap-2 mb-1">
                <span style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }}>▸</span>
                <span style={{ color: 'var(--text-secondary)' }}>{renderInline(el.text)}</span>
              </div>
            )
            case 'hr': return <hr key={el.key} style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />
            case 'br': return <div key={el.key} className="h-2" />
            default: return <p key={el.key}>{renderInline(el.text)}</p>
          }
        })}
      </div>
    </div>
  )
}
