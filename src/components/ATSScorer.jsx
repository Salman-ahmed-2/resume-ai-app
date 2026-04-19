
import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import {
  Target, ChevronDown, ChevronUp, Loader2, AlertCircle,
  CheckCircle2, XCircle, Lightbulb, RefreshCw, ClipboardPaste
} from 'lucide-react'

// ─── Animated circular progress ─────────────────────────────────────────────

function CircularScore({ score, loading }) {
  const [displayed, setDisplayed] = useState(0)
  const [strokeOffset, setStrokeOffset] = useState(314)
  const R   = 50
  const C   = 2 * Math.PI * R   // ≈ 314

  // Animate on score change
  useEffect(() => {
    if (loading) { setDisplayed(0); setStrokeOffset(C); return }
    if (score == null) return

    let start = null
    const from = displayed
    const to   = score
    const duration = 1100

    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      const cur = Math.round(from + (to - from) * eased)
      setDisplayed(cur)
      setStrokeOffset(C - (C * cur) / 100)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [score, loading])

  const color = score == null ? '#888'
    : score >= 75 ? '#22c55e'
    : score >= 55 ? '#f59e0b'
    : '#ef4444'

  const label = score == null ? '—'
    : score >= 75 ? 'Strong'
    : score >= 55 ? 'Average'
    : 'Weak'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={R}
          fill="none" stroke="var(--color-border-tertiary)" strokeWidth="10" />
        {/* Progress arc */}
        <circle cx="60" cy="60" r={R}
          fill="none"
          stroke={loading ? 'var(--color-border-secondary)' : color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={loading ? C * 0.75 : strokeOffset}
          transform="rotate(-90 60 60)"
          style={{ transition: loading ? 'none' : 'stroke 0.4s ease' }}
        />
        {/* Pulse ring when loading */}
        {loading && (
          <circle cx="60" cy="60" r={R}
            fill="none" stroke="var(--color-border-secondary)" strokeWidth="10"
            strokeDasharray={`${C * 0.25} ${C * 0.75}`}
            transform="rotate(-90 60 60)"
            style={{ animation: 'spin 1.2s linear infinite' }}
          />
        )}
        {/* Center text */}
        {loading ? (
          <text x="60" y="64" textAnchor="middle"
            style={{ fontSize: '13px', fill: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
            …
          </text>
        ) : (
          <>
            <text x="60" y="56" textAnchor="middle"
              style={{ fontSize: '26px', fontWeight: '500', fill: color, fontFamily: 'var(--font-sans)' }}>
              {displayed}
            </text>
            <text x="60" y="70" textAnchor="middle"
              style={{ fontSize: '11px', fill: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
              / 100
            </text>
          </>
        )}
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg) translate(-60px,-60px) translate(60px,60px); } }`}</style>
      {!loading && score != null && (
        <span style={{
          fontSize: '12px', fontWeight: '500', padding: '3px 12px',
          borderRadius: '20px',
          background: score >= 75 ? 'rgba(34,197,94,0.12)' : score >= 55 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
          color,
          border: `1px solid ${color}33`,
        }}>
          {label} ATS Match
        </span>
      )}
    </div>
  )
}

// ─── Keyword chip ────────────────────────────────────────────────────────────

function KeywordChip({ word, type }) {
  const isMatch = type === 'match'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
      background: isMatch ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
      color: isMatch ? '#16a34a' : '#dc2626',
      border: `1px solid ${isMatch ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      fontFamily: 'var(--font-mono)',
    }}>
      {isMatch
        ? <CheckCircle2 size={11} />
        : <XCircle size={11} />}
      {word}
    </span>
  )
}

// ─── Suggestion card ─────────────────────────────────────────────────────────

function SuggestionCard({ text, index }) {
  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '12px',
      background: 'var(--color-background-secondary)',
      borderRadius: 'var(--border-radius-md)',
      border: '0.5px solid var(--color-border-tertiary)',
    }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '500', color: '#b45309',
      }}>
        {index + 1}
      </div>
      <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-primary)', margin: 0 }}>
        {text}
      </p>
    </div>
  )
}

// ─── ATSScorer component ─────────────────────────────────────────────────────

const ATS_PROMPT = `You are a strict ATS (Applicant Tracking System) evaluator. Compare the resume to the job description and return ONLY a valid JSON object with no markdown, no code fences, no explanation. Be strict — most resumes score between 40 and 70. Only well-tailored resumes score above 75.

Return exactly this JSON shape:
{
  "score": <integer 0-100>,
  "matched_keywords": <array of strings — keywords/phrases from the JD that appear in the resume>,
  "missing_keywords": <array of strings — important keywords/phrases from the JD missing from the resume>,
  "suggestions": <array of exactly 3 specific, actionable improvement strings>
}`

export default function ATSScorer({ resumeData, geminiSuggestions, generateFn }) {
  const { isLoggedIn } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [jd,       setJd]       = useState('')
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [expanded, setExpanded] = useState(true)
  const textareaRef = useRef(null)

  // Build plain-text resume from data
  const buildResumeText = useCallback(() => {
    if (!resumeData) return ''
    const p = resumeData.personal || {}
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
    const lines = []

    if (name) lines.push(name)
    if (p.email || p.phone || p.location) lines.push([p.email, p.phone, p.location].filter(Boolean).join(' | '))
    lines.push('')

    const summary = resumeData.aiSummary || p.summary || ''
    if (summary) { lines.push('SUMMARY'); lines.push(summary); lines.push('') }

    const exp = (resumeData.experience || []).filter(e => e.company || e.role)
    if (exp.length) {
      lines.push('EXPERIENCE')
      exp.forEach(e => {
        lines.push(`${e.role || ''} at ${e.company || ''}`)
        const buls = e.bullets?.length ? e.bullets : (e.description || '').split('\n').filter(Boolean)
        buls.forEach(b => lines.push(`• ${b}`))
        lines.push('')
      })
    }

    const skills = resumeData.aiSkills?.length
      ? resumeData.aiSkills
      : [resumeData.skills?.technical, resumeData.skills?.soft, resumeData.skills?.languages, resumeData.skills?.certifications].filter(Boolean)
    if (skills.length) { lines.push('SKILLS'); lines.push(skills.join(', ')); lines.push('') }

    const edu = (resumeData.education || []).filter(e => e.school || e.degree)
    if (edu.length) {
      lines.push('EDUCATION')
      edu.forEach(e => lines.push(`${e.degree || ''} — ${e.school || ''}${e.year ? ` (${e.year})` : ''}`))
    }

    return lines.join('\n')
  }, [resumeData])

  const handleAnalyze = useCallback(async () => {
    if (!isLoggedIn) {
      setError('Sign in to analyze and track usage.')
      setShowAuthModal(true)
      return
    }
    if (!jd.trim()) { setError('Please paste a job description first.'); return }
    if (!resumeData) { setError('No resume data found. Fill in the resume form first.'); return }

    setLoading(true)
    setResult(null)
    setError('')

    const resumeText = buildResumeText()
    const userMsg = `=== RESUME ===\n${resumeText}\n\n=== JOB DESCRIPTION ===\n${jd}`

    let accumulated = ''
    try {
      await generateFn(ATS_PROMPT, userMsg, chunk => { accumulated += chunk })
      // Strip potential markdown fences
      const clean = accumulated.replace(/```json|```/gi, '').trim()
      const parsed = JSON.parse(clean)
      if (typeof parsed.score !== 'number') throw new Error('Invalid response shape')
      setResult(parsed)
    } catch (err) {
      setError('Analysis failed — AI returned an unexpected response. Try again.')
      console.error('ATS parse error:', err, accumulated)
    } finally {
      setLoading(false)
    }
  }, [jd, resumeData, buildResumeText, generateFn])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setJd(text)
    } catch {
      textareaRef.current?.focus()
    }
  }, [])

  return (<>
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 'var(--border-radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '0.5px solid var(--color-border-tertiary)' : 'none',
        }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: 'var(--border-radius-md)',
          background: 'rgba(99,153,34,0.10)', border: '1px solid rgba(99,153,34,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Target size={14} color="#3B6D11" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
            ATS Score Analyzer
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {result ? `Score: ${result.score}/100 · ${result.matched_keywords?.length || 0} matched keywords` : 'Paste a job description to check your match'}
          </div>
        </div>
        {result && (
          <span style={{
            fontSize: '12px', padding: '2px 10px', borderRadius: '20px', fontWeight: '500',
            background: result.score >= 75 ? 'rgba(34,197,94,0.12)' : result.score >= 55 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
            color: result.score >= 75 ? '#16a34a' : result.score >= 55 ? '#b45309' : '#dc2626',
            border: `1px solid ${result.score >= 75 ? 'rgba(34,197,94,0.25)' : result.score >= 55 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {result.score}/100
          </span>
        )}
        {expanded ? <ChevronUp size={14} color="var(--color-text-secondary)" /> : <ChevronDown size={14} color="var(--color-text-secondary)" />}
      </button>

      {expanded && (
        <div style={{ padding: '16px' }}>

          {/* JD input */}
          <div style={{ marginBottom: '12px', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                Job description
              </label>
              <button onClick={handlePaste}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                }}>
                <ClipboardPaste size={11} /> Paste
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here — requirements, responsibilities, qualifications…"
              rows={6}
              style={{
                width: '100%', resize: 'vertical', fontSize: '13px',
                fontFamily: 'var(--font-sans)', lineHeight: '1.5',
                padding: '10px 12px', borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-primary)',
                boxSizing: 'border-box',
               
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', borderRadius: 'var(--border-radius-md)',
              background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.25)',
              color: '#dc2626', fontSize: '12px', marginBottom: '12px',
            }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !jd.trim()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '11px', borderRadius: 'var(--border-radius-md)',
              background: loading || !jd.trim() ? 'var(--color-background-secondary)' : 'var(--gold)',
              color: loading || !jd.trim() ? 'var(--color-text-secondary)' : 'black',
              border: 'none', cursor: loading || !jd.trim() ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.2s',
              marginBottom: result ? '20px' : '0',
            }}
          >
            {loading
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with AI…</>
              : result
              ? <><RefreshCw size={14} /> Re-analyze</>
              : <><Target size={14} /> Analyze ATS Match</>}
          </button>
          {!isLoggedIn && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Sign in to analyze and track ATS usage.
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Results */}
          {(loading || result) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Score ring */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CircularScore score={result?.score ?? null} loading={loading} />
              </div>

              {/* Keywords */}
              {result && (
                <>
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                      fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)',
                    }}>
                      <CheckCircle2 size={13} color="#16a34a" />
                      Matched keywords
                      <span style={{
                        fontSize: '11px', padding: '1px 7px', borderRadius: '20px',
                        background: 'rgba(34,197,94,0.10)', color: '#16a34a',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}>
                        {result.matched_keywords?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.matched_keywords?.length
                        ? result.matched_keywords.map((k, i) => <KeywordChip key={i} word={k} type="match" />)
                        : <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>None found</span>}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                      fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)',
                    }}>
                      <XCircle size={13} color="#dc2626" />
                      Missing keywords
                      <span style={{
                        fontSize: '11px', padding: '1px 7px', borderRadius: '20px',
                        background: 'rgba(239,68,68,0.10)', color: '#dc2626',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}>
                        {result.missing_keywords?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.missing_keywords?.length
                        ? result.missing_keywords.map((k, i) => <KeywordChip key={i} word={k} type="missing" />)
                        : <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>None — great match!</span>}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {result.suggestions?.length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px',
                        fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)',
                      }}>
                        <Lightbulb size={13} color="#b45309" />
                        Suggested improvements
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.suggestions.map((s, i) => <SuggestionCard key={i} text={s} index={i} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="signin" />
    </>
  )
}