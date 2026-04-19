import { useState } from 'react'
import { Sparkles, Check, X, RotateCcw, Wand2 } from 'lucide-react'

function SuggestionCard({ title, children, onAccept, onReject, accepted }) {
  const [localAccepted, setLocalAccepted] = useState(accepted || false)

  const handleAccept = () => {
    setLocalAccepted(true)
    onAccept()
  }

  return (
    <div className="p-4 rounded-lg border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h4>
        <div className="flex gap-1">
          <button onClick={handleAccept} disabled={localAccepted}
            className="p-1.5 rounded transition-colors"
            style={{ color: localAccepted ? 'var(--accent)' : 'var(--text-muted)', opacity: localAccepted ? 1 : 0.6 }}>
            <Check size={14} />
          </button>
          <button onClick={onReject} className="p-1.5 rounded transition-colors hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function AISuggestionsPanel({ suggestions, streamPartial, loading, error, onApplyToForm, onRetry }) {
  const [accepted, setAccepted] = useState({ summary: false, jobs: [], skills: false })

  const handleAcceptSummary = () => {
    setAccepted(prev => ({ ...prev, summary: true }))
  }

  const handleAcceptJob = (jobIndex, bullets) => {
    setAccepted(prev => ({
      ...prev,
      jobs: [...prev.jobs, { index: jobIndex, bullets }]
    }))
  }

  const handleAcceptSkills = () => {
    setAccepted(prev => ({ ...prev, skills: true }))
  }

  const handleApplyAll = () => {
    const toApply = {
      summary: accepted.summary ? suggestions.summary : null,
      jobs: accepted.jobs,
      skills: accepted.skills ? suggestions.skills : null
    }
    onApplyToForm(toApply)
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <X size={16} style={{ color: '#f87171' }} />
          </div>
AI Enhancement Failed
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: '#0d1117' }}>
          <RotateCcw size={14} /> Try Again
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-6 min-h-[500px]">
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
          </div>
AI is Enhancing
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border)' }}>
            <Sparkles size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Gemini is analyzing your experience and generating<br />improved bullets, summary, and skills...
          </p>
        </div>
      </div>
    )
  }

  if (!suggestions) {
    return (
      <div className="card p-6 min-h-[500px]">
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Enhancement Ready</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border)' }}>
            <Sparkles size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
"Enhance with AI"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
          <Sparkles size={15} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
AI Suggestions
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review and apply AI-enhanced content</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {suggestions.summary && (
          <SuggestionCard title="Professional Summary" onAccept={handleAcceptSummary} accepted={accepted.summary}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{suggestions.summary}</p>
          </SuggestionCard>
        )}

        {suggestions.bullets?.map((job, i) => (
          <SuggestionCard key={i} title={`${job.company} - ${job.role}`} onAccept={() => handleAcceptJob(i, job.bullets)} accepted={accepted.jobs.some(j => j.index === i)}>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
              {job.bullets.map((bullet, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </SuggestionCard>
        ))}

        {suggestions.skills?.length > 0 && (
          <SuggestionCard title="Recommended Skills" onAccept={handleAcceptSkills} accepted={accepted.skills}>
            <div className="flex flex-wrap gap-1">
              {suggestions.skills.map((skill, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </SuggestionCard>
        )}
      </div>

      {(accepted.summary || accepted.jobs.length > 0 || accepted.skills) && (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleApplyAll} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all"
            style={{ background: 'var(--accent)', color: '#0d1117' }}>
            <Wand2 size={14} /> Apply Selected to Form
          </button>
        </div>
      )}
    </div>
  )
}