import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mail, Wand2, Copy, Download, Check, RefreshCw,
  Sparkles, AlertCircle, Bold, Italic, AlignLeft, AlignCenter
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import { useAI } from '../hooks/useAI.js'
import html2pdf from 'html2pdf.js'

const TONES = [
  { value: 'professional', label: 'Professional', icon: '🎯', desc: 'Polished & confident' },
  { value: 'conversational', label: 'Conversational', icon: '💬', desc: 'Warm & approachable' },
  { value: 'bold', label: 'Bold', icon: '⚡', desc: 'Assertive & memorable' },
]

const WORD_TARGET = 300

function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function StreamingSkeleton() {
  const rows = [1, 0.9, 0.85, 0, 0.95, 0.88, 0.78, 0.9, 0, 0.82, 0.72, 0.6]
  return (
    <div className="p-6 space-y-2.5">
      <div className="flex items-center gap-2 mb-4">
        {[0, 1, 2].map(i => (
          <span key={i} className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'var(--accent)', animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
        <span className="text-xs font-mono ml-1" style={{ color: 'var(--accent)' }}>
          Claude is writing your cover letter...
        </span>
      </div>
      {rows.map((w, i) => w === 0
        ? <div key={i} className="h-3" />
        : <div key={i} className="h-3.5 rounded-full shimmer-bg" style={{ width: `${w * 100}%`, animationDelay: `${i * 0.07}s` }} />
      )}
    </div>
  )
}

function RichToolbar({ editorRef }) {
  const cmd = (c, v) => { editorRef.current?.focus(); document.execCommand(c, false, v) }
  const tools = [
    { Icon: Bold, action: () => cmd('bold'), title: 'Bold' },
    { Icon: Italic, action: () => cmd('italic'), title: 'Italic' },
    { Icon: AlignLeft, action: () => cmd('justifyLeft'), title: 'Left' },
    { Icon: AlignCenter, action: () => cmd('justifyCenter'), title: 'Center' },
  ]
  return (
    <div className="flex items-center gap-1 px-4 py-2"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs font-mono mr-2" style={{ color: 'var(--text-muted)' }}>Format</span>
      {tools.map(({ Icon, action, title }) => (
        <button key={title} onMouseDown={e => { e.preventDefault(); action() }} title={title}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          <Icon size={13} />
        </button>
      ))}
      <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />
      <select onMouseDown={e => e.stopPropagation()}
        onChange={e => { editorRef.current?.focus(); document.execCommand('fontSize', false, e.target.value) }}
        className="text-xs rounded px-1.5 py-1 outline-none" defaultValue="3"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <option value="2">Small</option>
        <option value="3">Normal</option>
        <option value="4">Large</option>
      </select>
    </div>
  )
}

function WordCountBadge({ count }) {
  const pct = Math.min((count / WORD_TARGET) * 100, 100)
  const over = count > WORD_TARGET + 30
  const color = over ? '#f87171' : count >= WORD_TARGET - 20 ? '#4ade80' : 'var(--accent)'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{count} / {WORD_TARGET} words</span>
    </div>
  )
}

export default function CoverLetter() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: '', company: '',
    jobDesc: '', tone: 'professional', background: '', whyCompany: '',
  })
  const [letterText, setLetterText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const editorRef = useRef(null)
  const { generate, loading, error } = useAI()
  const { isLoggedIn } = useAuth()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleEditorInput = useCallback(() => {
    setWordCount(countWords(editorRef.current?.innerText || ''))
  }, [])

  useEffect(() => {
    if (!isStreaming || !editorRef.current) return
    const html = letterText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
    editorRef.current.innerHTML = html
    setWordCount(countWords(letterText))
    editorRef.current.scrollTop = editorRef.current.scrollHeight
  }, [letterText, isStreaming])

  const handleGenerate = async () => {
    if (!form.role.trim() || !form.company.trim()) return
    if (!isLoggedIn) {
      setApiError('Sign in to generate and track usage.')
      setShowAuthModal(true)
      setIsStreaming(false)
      return
    }

    setLetterText('')
    setIsStreaming(true)
    if (editorRef.current) editorRef.current.innerHTML = ''

    const toneLabel = TONES.find(t => t.value === form.tone)?.label || 'Professional'
    const system = `You are an expert cover letter writer. Write compelling, personal cover letters that feel human and specific. Return plain text only — no markdown, no asterisks, no bullet symbols, no formatting characters of any kind.`
    const prompt = `Write a compelling cover letter for ${form.name || 'the applicant'} applying for ${form.role} at ${form.company}.
Tone: ${toneLabel}
${form.jobDesc ? `Job Description:\n${form.jobDesc}` : ''}
${form.background ? `Candidate Background: ${form.background}` : ''}
${form.whyCompany ? `Why This Company: ${form.whyCompany}` : ''}
${form.email ? `Email: ${form.email}` : ''}${form.phone ? ` | Phone: ${form.phone}` : ''}

Requirements:
- Start with a powerful hook — NOT "Dear Sir/Madam" and NOT "I am writing to apply"
- Make it personal and specific to ${form.company}
- Reference specific details from the job description if provided
- Highlight 2-3 concrete achievements with numbers from the background
- Keep it under ${WORD_TARGET} words
- End with a clear, confident call to action
- ${toneLabel} tone throughout
- Plain text ONLY — no asterisks, dashes, bullets, or markdown`

    const result = await generate(system, prompt, accumulated => setLetterText(accumulated))
    setIsStreaming(false)
    if (result && editorRef.current) {
      const finalHtml = result.split('\n\n').filter(p => p.trim()).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
      editorRef.current.innerHTML = finalHtml
      setWordCount(countWords(result))
    }
  }

  const handleCopy = async () => {
    const text = editorRef.current?.innerText || ''
    if (!text.trim()) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadPDF = async () => {
    const text = editorRef.current?.innerText || ''
    if (!text.trim()) return
    setPdfLoading(true)
    try {
      const contact = [form.email, form.phone].filter(Boolean).join('  ·  ')
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const paragraphs = text.split('\n\n').filter(p => p.trim())
        .map(p => `<p style="margin:0 0 12px 0;line-height:1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
        .join('')

      const html = `
        <div style="font-family:Georgia,serif;padding:40px 48px;color:#1a1a1a;max-width:700px;">
          ${form.name ? `<h2 style="margin:0 0 4px 0;font-size:20px;font-weight:700;">${form.name}</h2>` : ''}
          ${contact ? `<p style="margin:0 0 6px 0;font-size:11px;color:#847a5a;">${contact}</p>` : ''}
          <hr style="border:none;border-top:1px solid #c8a96e;margin:10px 0 16px 0;"/>
          <p style="margin:0 0 16px 0;font-size:11px;color:#847a5a;">${date}</p>
          <div style="font-size:12px;">${paragraphs}</div>
          <p style="margin:32px 0 0 0;font-size:10px;color:#aaa;text-align:center;">
            Cover Letter · ${form.role || 'Position'} at ${form.company || 'Company'}
          </p>
        </div>`

      const el = document.createElement('div')
      el.innerHTML = html
      document.body.appendChild(el)

      const filename = [form.name?.replace(/\s+/g, '_'), form.company?.replace(/\s+/g, '_')].filter(Boolean).join('_') + '.pdf'
      await html2pdf().set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save()

      document.body.removeChild(el)
    } catch (e) { console.error(e) }
    setPdfLoading(false)
  }

  const hasLetter = (editorRef.current?.innerText?.trim().length || letterText.length) > 0

  return (
    <div className="pt-16 min-h-screen">
      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        .editor-area { outline:none; caret-color:var(--accent); font-family:'Playfair Display',Georgia,serif;
          font-size:14.5px; line-height:1.85; color:var(--text-primary); min-height:360px; padding:1.5rem; }
        .editor-area p { margin-bottom:1.1em; }
        .editor-area:empty::before { content:attr(data-placeholder); color:var(--text-muted);
          font-family:'DM Sans',sans-serif; font-size:13px; line-height:1.7; pointer-events:none; }
        .tone-btn { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
        .tone-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-12">
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="signin" />
        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-2">AI-Powered</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Cover Letter <span className="italic" style={{ color: 'var(--accent)' }}>Generator</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            One form, one click — a letter that actually sounds like you.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          {/* ── LEFT: Form ── */}
          <div className="flex flex-col gap-5">

            {/* Personal Details */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Your Details</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input className="input-field" placeholder="Alex Johnson" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Email</label>
                    <input className="input-field" placeholder="alex@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Phone</label>
                    <input className="input-field" placeholder="+1 234 567 8901" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* The Role */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>The Role</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
                      Job Title <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <input className="input-field" placeholder="Senior Product Manager" value={form.role} onChange={e => set('role', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
                      Company <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <input className="input-field" placeholder="Stripe, OpenAI..." value={form.company} onChange={e => set('company', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Job Description</label>
                  <textarea className="input-field resize-none" rows={4}
                    placeholder="Paste key requirements — the more detail, the more tailored your letter..."
                    value={form.jobDesc} onChange={e => set('jobDesc', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Tone */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tone</h2>
              <div className="grid grid-cols-3 gap-3">
                {TONES.map(tone => {
                  const active = form.tone === tone.value
                  return (
                    <button key={tone.value} onClick={() => set('tone', tone.value)}
                      className="tone-btn p-4 rounded-xl text-left"
                      style={{
                        background: active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        boxShadow: active ? '0 4px 16px var(--accent-glow)' : 'none',
                      }}>
                      <div className="text-xl mb-2">{tone.icon}</div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>{tone.label}</div>
                      <div className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{tone.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Background */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Your Background</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Relevant Experience & Achievements</label>
                  <textarea className="input-field resize-none" rows={4}
                    placeholder="5 years at fintech startup, grew revenue 3x, led team of 8, shipped features used by 500K users..."
                    value={form.background} onChange={e => set('background', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>Why This Company?</label>
                  <textarea className="input-field resize-none" rows={2}
                    placeholder="I've admired their approach to developer tooling since 2020..."
                    value={form.whyCompany} onChange={e => set('whyCompany', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate}
              disabled={loading || !form.role.trim() || !form.company.trim() || !isLoggedIn}
              className="flex items-center justify-center gap-2.5 py-4 rounded-xl font-body font-semibold text-sm transition-all duration-200"
              style={{
                background: loading || !form.role.trim() || !form.company.trim() || !isLoggedIn ? 'var(--border)' : 'var(--accent)',
                color: loading || !form.role.trim() || !form.company.trim() || !isLoggedIn ? 'var(--text-muted)' : '#0d1117',
                cursor: loading || !form.role.trim() || !form.company.trim() || !isLoggedIn ? 'not-allowed' : 'pointer',
              }}>
              <Wand2 size={17} />
              {loading ? 'Writing your letter...' : 'Generate Cover Letter'}
            </button>
            {(!form.role.trim() || !form.company.trim()) && (
              <p className="text-xs text-center -mt-2" style={{ color: 'var(--text-muted)' }}>
                Job title and company are required
              </p>
            )}
            {!isLoggedIn && (
              <p className="text-xs text-center -mt-2" style={{ color: 'var(--text-muted)' }}>
                Sign in to generate and track cover letter usage.
              </p>
            )}
          </div>

          {/* ── RIGHT: Output ── */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            {/* Output card */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                    <Mail size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>Cover Letter</h2>
                    {(form.role || form.company) && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {[form.role, form.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {hasLetter && !loading && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleGenerate()} title="Regenerate"
                      disabled={!isLoggedIn}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        border: '1px solid var(--border)',
                        color: !isLoggedIn ? 'var(--text-muted)' : 'var(--text-muted)',
                        cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                      <RefreshCw size={13} />
                    </button>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
                        color: copied ? 'var(--accent)' : 'var(--text-muted)',
                        background: copied ? 'var(--accent-glow)' : 'transparent',
                      }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleDownloadPDF} disabled={pdfLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: pdfLoading ? 'var(--border)' : 'var(--accent)',
                        color: pdfLoading ? 'var(--text-muted)' : '#0d1117',
                        cursor: pdfLoading ? 'wait' : 'pointer',
                      }}>
                      <Download size={12} />
                      {pdfLoading ? 'Saving...' : 'PDF'}
                    </button>
                  </div>
                )}
              </div>

              {/* Rich text toolbar */}
              {hasLetter && !loading && <RichToolbar editorRef={editorRef} />}

              {/* Error */}
              {error && (
                <div className="mx-5 mt-5 p-4 rounded-lg flex items-start gap-3 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#f87171' }}>API Error</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{error}</p>
                  </div>
                </div>
              )}

              {/* Streaming skeleton */}
              {loading && !letterText && <StreamingSkeleton />}

              {/* ContentEditable rich text area */}
              <div
                ref={editorRef}
                contentEditable={!loading}
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="editor-area"
                data-placeholder={loading ? '' : 'Your cover letter will appear here — fully editable after generation.'}
                style={{ opacity: loading && letterText ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
                spellCheck
              />
            </div>

            {/* Word count + tone */}
            {hasLetter && (
              <div className="flex items-center justify-between px-2">
                <WordCountBadge count={wordCount} />
                <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  <Sparkles size={10} />
                  {TONES.find(t => t.value === form.tone)?.label}
                </span>
              </div>
            )}

            {/* Writing tips — shown before generation */}
            {!hasLetter && !loading && !error && (
              <div className="card p-5" style={{ border: '1px dashed var(--border)' }}>
                <p className="section-label mb-3">Writing tips</p>
                <div className="flex flex-col gap-3">
                  {[
                    ['🎯', 'Be specific', 'Mention the company by name in the opening'],
                    ['⚡', 'Lead with value', 'Open with what you bring, not what you want'],
                    ['📊', 'Use numbers', 'Quantified achievements stand out instantly'],
                    ['✂️', 'Stay concise', 'Under 300 words — recruiters spend 30 seconds'],
                  ].map(([icon, title, body]) => (
                    <div key={title} className="flex gap-3 items-start">
                      <span className="text-base leading-none mt-0.5">{icon}</span>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title} — </span>
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}