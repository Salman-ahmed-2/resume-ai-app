// pages/Builder.jsx  ── Pro Resume Builder with Live Template Preview
import { useState, useCallback } from 'react'
import {
  FileText, Wand2, Sparkles, User, Loader2, X,
  CheckCircle2, AlertCircle, RefreshCw, Eye, Layout, Target
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import { useAI } from '../hooks/useAI.js'
import ResumeForm      from '../components/ResumeForm'
import AISuggestionsPanel from '../components/AISuggestionsPanel'
import TemplateChooser from '../components/TemplateChooser'
import ResumePreview   from '../components/ResumePreview'
import ATSScorer       from '../components/ATSScorer'

// ─── Prompt constants ────────────────────────────────────────────────────────

const GEMINI_SYSTEM = `You are an expert resume writer and career coach. Rewrite the user's experience bullets using strong action verbs, quantified achievements, and ATS-friendly language. Return JSON with exactly these keys:
- "summary": a compelling 2-sentence professional summary string
- "bullets": array of objects, one per job, each with "company" (string), "role" (string), and "bullets" (array of 3-5 improved bullet point strings starting with strong past-tense action verbs)
- "skills": array of skill strings ranked by relevance to the target role (most relevant first, max 12)
- "improvements": array of 3 short strings describing what was improved
Return ONLY valid JSON. No markdown. No explanation.`

const TONES = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'creative',     label: 'Creative',     emoji: '🎨' },
  { value: 'technical',    label: 'Technical',    emoji: '⚙️'  },
  { value: 'executive',    label: 'Executive',    emoji: '🏆' },
]

const STEPS = [
  { id: 'form',     label: 'Fill Info',   Icon: User     },
  { id: 'enhance',  label: 'AI Enhance',  Icon: Sparkles },
  { id: 'preview',  label: 'Preview',     Icon: Eye      },
  { id: 'ats',      label: 'ATS Score',   Icon: Target   },
]

// ─── Small UI components ─────────────────────────────────────────────────────

function StepIndicator({ currentStep, resumeData, geminiDone }) {
  const idx = STEPS.findIndex(s => s.id === currentStep)
  return (
    <div className="flex items-center mb-8">
      {STEPS.map(({ id, label, Icon }, i) => {
        const done   = (id === 'form' && !!resumeData) || (id === 'enhance' && geminiDone)
        const active = id === currentStep
        return (
          <div key={id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? 'var(--accent)' : active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  border: `1.5px solid ${done || active ? 'var(--accent)' : 'var(--border)'}`,
                  color: done ? '#0d1117' : active ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
              </div>
              <span className="text-xs font-mono font-medium whitespace-nowrap"
                style={{ color: active ? 'var(--accent)' : done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5 transition-all duration-300"
                style={{ background: done ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatusBanner({ type, message, onDismiss, onRetry }) {
  if (!message) return null
  const styles = {
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', Icon: AlertCircle  },
    success: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', color: '#4ade80', Icon: CheckCircle2 },
  }[type] || {}
  const { bg, border, color, Icon } = styles
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl text-sm mb-4"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <Icon size={15} className="mt-0.5 flex-shrink-0" />
      <span className="flex-1 text-xs leading-relaxed">{message}</span>
      <div className="flex items-center gap-1">
        {onRetry   && <button onClick={onRetry}   className="p-1 rounded hover:opacity-80"><RefreshCw size={12} /></button>}
        {onDismiss && <button onClick={onDismiss} className="p-1 rounded hover:opacity-80"><X size={12} /></button>}
      </div>
    </div>
  )
}

function ToneSelector({ tone, setTone }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TONES.map(t => (
        <button key={t.value} onClick={() => setTone(t.value)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all duration-200"
          style={{
            background: tone === t.value ? 'var(--accent-glow)' : 'var(--bg-secondary)',
            color: tone === t.value ? 'var(--accent)' : 'var(--text-secondary)',
            border: `1px solid ${tone === t.value ? 'var(--accent)' : 'var(--border)'}`,
            transform: tone === t.value ? 'scale(1.02)' : 'scale(1)',
          }}>
          <span>{t.emoji}</span>{t.label}
          {tone === t.value && <CheckCircle2 size={11} style={{ marginLeft: 'auto' }} />}
        </button>
      ))}
    </div>
  )
}

// ─── Main Builder component ──────────────────────────────────────────────────

export default function Builder() {
  // Form / context state
  const [targetRole, setTargetRole] = useState('')
  const [industry,   setIndustry]   = useState('')
  const [tone,       setTone]       = useState('professional')

  // Resume data (raw form output + AI enrichments merged in)
  const [resumeData,       setResumeData]       = useState(null)
  const [geminiSuggestions,setGeminiSuggestions]= useState(null)
  const [geminiError,      setGeminiError]      = useState('')
  const [claudeError,      setClaudeError]      = useState('')
  const [successMsg,       setSuccessMsg]       = useState('')
  const [showAuthModal,    setShowAuthModal]    = useState(false)
  const { isLoggedIn } = useAuth()

  // Template + view
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [activePanel,      setActivePanel]      = useState('form') // 'form' | 'preview'

  // API hooks
  const { generate: claudeGenerate, generateJSON, loading: claudeLoading, loading: geminiLoading } = useAI()

  // ── Build the data object fed into templates ─────────────────────────────


  const buildTemplateData = useCallback((rawData, suggestions) => {
    if (!rawData) return null
    const gemBullets = suggestions?.bullets || []
    const experience = (rawData.experience || []).map(e => {
      const match = gemBullets.find(g =>
        g.company?.toLowerCase() === e.company?.toLowerCase() ||
        g.role?.toLowerCase()    === e.role?.toLowerCase()
      )
      return { ...e, bullets: match?.bullets || [] }
    })
    return {
      ...rawData,
      experience,
      targetRole,
      aiSummary: suggestions?.summary || rawData.personal?.summary || '',
      aiSkills:  suggestions?.skills  || [],
    }
  }, [targetRole])

  // ── Validate helper ─────────────────────────────────────────────────────

  const validateHasExp = (data) => {
    if (!data) return 'Please fill in the resume form first.'
    const ok = data.experience?.some(e => e.company || e.role || e.description)
    return ok ? null : 'Add at least one work experience entry for AI enhancement.'
  }

  // ── Build Gemini prompt ─────────────────────────────────────────────────

  const buildGeminiPrompt = useCallback((data) => {
    const p    = data.personal || {}
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
    const exp  = (data.experience || [])
      .filter(e => e.company || e.role || e.description)
      .map((e, i) => {
        const dur = e.startDate ? `${e.startDate} – ${e.current ? 'Present' : e.endDate || ''}` : ''
        return `Job ${i+1}:\n  Company: ${e.company||''}\n  Role: ${e.role||''}\n  Duration: ${dur}\n  Description: ${e.description||''}`
      }).join('\n\n')
    const skillsRaw = [data.skills?.technical, data.skills?.soft, data.skills?.languages, data.skills?.certifications].filter(Boolean).join(', ')
    return `Target Role: ${targetRole||'Not specified'}\nIndustry: ${industry||'Not specified'}\nName: ${name}\n\nWork Experience:\n${exp||'None'}\n\nSkills: ${skillsRaw||'None'}\nSummary: ${p.summary||''}`
  }, [targetRole, industry])

  // ── Handle form submit — triggers Gemini enhance ─────────────────────────

  const handleResumeSubmit = useCallback(async (data) => {
    if (!isLoggedIn) {
      setGeminiError('Sign in to generate and track usage.')
      setShowAuthModal(true)
      return
    }

    setResumeData(data)
    setGeminiSuggestions(null)
    setGeminiError('')
    setClaudeError('')
    setSuccessMsg('')

    const err = validateHasExp(data)
    if (err) { setGeminiError(err); return }

    const result = await generateJSON(GEMINI_SYSTEM, buildGeminiPrompt(data))
    if (result) {
      setGeminiSuggestions(result)
      setSuccessMsg('✨ AI enhancement complete — your resume preview is ready.')
      setActivePanel('preview')
    } else {
      setGeminiError('AI enhancement failed. Check your API key and try again.')
    }
  }, [generateJSON, buildGeminiPrompt])

  const handleReEnhance = useCallback(() => {
    if (!isLoggedIn) {
      setGeminiError('Sign in to generate and track usage.')
      setShowAuthModal(true)
      return
    }
    if (resumeData) handleResumeSubmit(resumeData)
  }, [resumeData, handleResumeSubmit, isLoggedIn])

  // ── Generate full resume with Claude (updates preview via aiSummary/bullets) ─

  const handleGenerateResume = useCallback(async () => {
    if (!isLoggedIn) {
      setClaudeError('Sign in to generate and track usage.')
      setShowAuthModal(true)
      return
    }
    if (!resumeData) return
    const err = validateHasExp(resumeData)
    if (err) { setClaudeError(err); return }

    const p    = resumeData.personal || {}
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
    const expLines = (resumeData.experience || []).filter(e => e.company || e.role).map((e, i) => {
      const when = e.current ? 'Present' : `${e.startDate||''} – ${e.endDate||''}`.trim()
      return `${i+1}. ${e.role||''} at ${e.company||''}${when ? ` (${when})` : ''}\n   ${e.description||''}`
    }).join('\n')
    const eduLines = (resumeData.education || []).filter(e => e.school||e.degree).map(e =>
      `${e.degree||''} — ${e.school||''}${e.year ? ` (${e.year})` : ''}`
    ).join('\n')
    const skillsText = [resumeData.skills?.technical, resumeData.skills?.soft, resumeData.skills?.languages, resumeData.skills?.certifications].filter(Boolean).join(' | ')

    const appliedBullets = geminiSuggestions?.bullets
      ? '\n\nAI-Enhanced Bullets (use these):\n' + geminiSuggestions.bullets.map(j =>
          `${j.role} at ${j.company}:\n${j.bullets.map(b => `• ${b}`).join('\n')}`
        ).join('\n\n')
      : ''

    const system = `You are an expert resume writer. Return ONLY a valid JSON object (no markdown, no code fences) with this exact shape:
{
  "summary": "2-3 sentence professional summary",
  "experience": [
    { "company": "", "role": "", "startDate": "", "endDate": "", "current": false, "bullets": ["bullet1","bullet2","bullet3"] }
  ],
  "skills": ["skill1", "skill2"],
  "education": [ { "school": "", "degree": "", "field": "", "year": "" } ]
}
Use strong action verbs, quantified achievements, ATS-optimized language. Tone: ${tone}.`

    const prompt = `Name: ${name} | Email: ${p.email||''} | Phone: ${p.phone||''} | Location: ${p.location||''}
Target Role: ${targetRole||'N/A'} | Industry: ${industry||'N/A'}
Current Summary: ${p.summary || geminiSuggestions?.summary || ''}
Experience:\n${expLines}
Education:\n${eduLines}
Skills: ${skillsText}${appliedBullets}`

    setClaudeError('')
    setSuccessMsg('')

    let accumulated = ''
    const ok = await claudeGenerate(system, prompt, (chunk) => {
      accumulated += chunk
      // Parse final JSON from proxy (non-streaming)
      try {
        const parsed = JSON.parse(accumulated)
        if (parsed && typeof parsed === 'object') {
          // Merge Claude's structured output into resumeData for template rendering
          setResumeData(prev => ({
            ...prev,
            experience: parsed.experience
              ? parsed.experience.map((ce, i) => ({
                  ...(prev.experience?.[i] || {}),
                  company:   ce.company   || prev.experience?.[i]?.company || '',
                  role:      ce.role      || prev.experience?.[i]?.role    || '',
                  startDate: ce.startDate || prev.experience?.[i]?.startDate || '',
                  endDate:   ce.endDate   || prev.experience?.[i]?.endDate   || '',
                  current:   ce.current   ?? prev.experience?.[i]?.current  ?? false,
                  bullets:   ce.bullets   || [],
                }))
              : prev.experience,
            skills: parsed.skills
              ? { ...prev.skills, _aiList: parsed.skills }
              : prev.skills,
          }))
          if (parsed.summary) {
            setGeminiSuggestions(prev => ({ ...(prev || {}), summary: parsed.summary, skills: parsed.skills || prev?.skills || [] }))
          }
        }
      } catch (e) {
        // Note: Non-streaming proxy - updates on completion
      }
    });

    if (ok) {
      setSuccessMsg('🎉 Resume generated and preview updated!')
      setActivePanel('preview')
    } else {
      setClaudeError('AI generation failed. Please try again.')
    }
  }, [resumeData, geminiSuggestions, tone, targetRole, industry, claudeGenerate])

  // ── Derived ──────────────────────────────────────────────────────────────

  const templateData   = buildTemplateData(resumeData, geminiSuggestions)
  const geminiDone     = !!geminiSuggestions
  const currentStep    = !resumeData ? 'form' : !geminiDone ? 'enhance' : 'preview'
  const previewLoading = claudeLoading || geminiLoading

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="pt-16 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="section-label">Pro</p>
            <span className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
              <Sparkles size={9} /> AI
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Resume <span className="italic" style={{ color: 'var(--accent)' }}>Builder</span>
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Fill your details → AI enhances bullets & summary → choose a template → download or print.
          </p>
        </header>

        <StepIndicator currentStep={currentStep} resumeData={resumeData} geminiDone={geminiDone} />

        {/* ── Global banners ── */}
        {successMsg && (
          <StatusBanner type="success" message={successMsg} onDismiss={() => setSuccessMsg('')} />
        )}

        <div className="grid xl:grid-cols-[420px_1fr] gap-8">

          {/* ════ LEFT: Controls ════ */}
          <div className="flex flex-col gap-5">

            {/* Panel toggle */}
            <div className="flex rounded-xl p-1 gap-1"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              {[
                { id: 'form',    label: 'Edit Form',       Icon: User   },
                { id: 'preview', label: 'Template & Preview', Icon: Layout },
              ].map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActivePanel(id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activePanel === id ? 'var(--bg-card)' : 'transparent',
                    color: activePanel === id ? 'var(--accent)' : 'var(--text-muted)',
                    border: activePanel === id ? '1px solid var(--border)' : '1px solid transparent',
                  }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* ── Form panel ── */}
            {activePanel === 'form' && (
              <>
                <section className="card overflow-hidden p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                      <User size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Your Information
                    </h2>
                  </div>
                  <ResumeForm onSubmit={handleResumeSubmit} />
                </section>

                <section className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                      <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AI Context</h3>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>optional</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-mono font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Role</label>
                      <input className="input-field w-full" placeholder="e.g. Senior Software Engineer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Industry</label>
                      <input className="input-field w-full" placeholder="e.g. FinTech / Healthcare / SaaS" value={industry} onChange={e => setIndustry(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Resume Tone</label>
                      <ToneSelector tone={tone} setTone={setTone} />
                    </div>
                  </div>
                </section>

                {geminiError && (
                  <StatusBanner type="error" message={geminiError}
                    onDismiss={() => setGeminiError('')}
                    onRetry={resumeData ? handleReEnhance : null} />
                )}
                {claudeError && (
                  <StatusBanner type="error" message={claudeError}
                    onDismiss={() => setClaudeError('')}
                    onRetry={handleGenerateResume} />
                )}
              </>
            )}

            {/* ── Template & AI panel ── */}
            {activePanel === 'preview' && (
              <>
                <section className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                      <Layout size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Template Design
                    </h3>
                  </div>
                  <TemplateChooser
                    selected={selectedTemplate}
                    onChange={setSelectedTemplate}
                  />
                </section>

                {/* AI suggestions summary */}
                {geminiSuggestions && (
                  <section className="card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                      <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        AI Enhancements Applied
                      </h3>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                        Active
                      </span>
                    </div>
                    {geminiSuggestions.improvements?.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={11} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        {imp}
                      </div>
                    ))}
                    <button onClick={handleReEnhance} disabled={geminiLoading || !isLoggedIn}
                      className="flex items-center gap-1.5 mt-3 text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: geminiLoading || !isLoggedIn ? 'var(--border)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: geminiLoading || !isLoggedIn ? 'var(--text-muted)' : 'var(--text-muted)',
                        cursor: geminiLoading || !isLoggedIn ? 'not-allowed' : 'pointer',
                      }}>
                      {geminiLoading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                      Re-enhance
                    </button>
                  </section>
                )}
              </>
            )}

            {/* ── Action Buttons (always visible) ── */}
            <div className="flex flex-col gap-3">
              {/* Primary: Enhance */}
              {resumeData && (
                <button onClick={handleReEnhance} disabled={geminiLoading || !isLoggedIn}
                  className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-body font-semibold text-sm transition-all duration-200"
                  style={{
                    background: geminiLoading || !isLoggedIn ? 'var(--border)' : 'var(--accent)',
                    color: geminiLoading || !isLoggedIn ? 'var(--text-muted)' : '#0d1117',
                    cursor: geminiLoading || !isLoggedIn ? 'not-allowed' : 'pointer',
                    opacity: geminiLoading || !isLoggedIn ? 0.65 : 1,
                  }}>
                  {geminiLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Enhancing with AI…</>
                    : <><Sparkles size={16} /> {geminiDone ? 'Re-Enhance with AI' : 'Enhance with AI'}</>}
                </button>
              )}

              {/* Secondary: Generate full resume with Claude */}
              {resumeData && (
                <button onClick={handleGenerateResume} disabled={claudeLoading || !isLoggedIn}
                  className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-body font-semibold text-sm transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: claudeLoading || !isLoggedIn ? 'var(--text-muted)' : 'var(--text-secondary)',
                    cursor: claudeLoading || !isLoggedIn ? 'not-allowed' : 'pointer',
                    opacity: claudeLoading || !isLoggedIn ? 0.65 : 1,
                  }}>
                  {claudeLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Generating with AI…</>
                    : <><Wand2 size={16} /> Deep Generate with Claude</>}
                </button>
              )}

              {geminiDone && !claudeLoading && (
                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  💡 Use "Deep Generate" for a fully rewritten, Claude-polished resume
                </p>
              )}
            </div>

            {!isLoggedIn && (
              <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,244,229,0.9)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Sign in to enhance and generate resumes so your usage is tracked and saved to your account.
              </div>
            )}

            <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="signin" />
          </div>

          {/* ════ RIGHT: Live Preview + ATS Score ─═══ */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-24 h-fit">

            {/* Live Preview */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <Eye size={14} style={{ color: 'var(--accent)' }} />
                <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Live Preview
                </h2>
                {previewLoading && (
                  <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    <Loader2 size={11} className="animate-spin" /> Updating…
                  </span>
                )}
              </div>
              <ResumePreview
                resumeData={templateData}
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                loading={previewLoading && !templateData}
              />
            </div>

            {/* ATS Score Analyzer */}
            <ATSScorer
              resumeData={templateData}
              geminiSuggestions={geminiSuggestions}
              generateFn={claudeGenerate}
            />

          </div>

        </div>
      </div>
    </div>
  )
}