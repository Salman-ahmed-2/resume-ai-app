import { useAuth, FREE_LIMITS } from '../context/AuthContext'
import { Crown, Zap } from 'lucide-react'

const FIELD_LABELS = {
  resumes_created:         { label: 'Resumes', icon: '📄' },
  interviews_completed:    { label: 'Interviews', icon: '🎙' },
  cover_letters_generated: { label: 'Cover Letters', icon: '✉️' },
}

export default function UsageMeter({ compact = false }) {
  const { profile, isPro } = useAuth()
  if (!profile) return null

  if (isPro) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono"
        style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
        <Crown size={11} /> Pro · Unlimited
      </div>
    )
  }

  const fields = Object.keys(FIELD_LABELS)

  if (compact) {
    // Compact: just a single usage summary for the navbar
    const totalUsed = fields.reduce((acc, f) => acc + (profile[f] || 0), 0)
    const totalLimit = fields.reduce((acc, f) => acc + FREE_LIMITS[f], 0)
    const pct = Math.round((totalUsed / totalLimit) * 100)
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#f87171' : 'var(--accent)' }} />
        </div>
        <span style={{ color: pct >= 90 ? '#f87171' : 'var(--text-muted)' }}>{pct}% used</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {fields.map(f => {
        const current = profile[f] || 0
        const limit = FREE_LIMITS[f]
        const pct = Math.min((current / limit) * 100, 100)
        const atLimit = current >= limit
        const { label, icon } = FIELD_LABELS[f]
        return (
          <div key={f}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {icon} {label}
              </span>
              <span className="text-xs font-mono" style={{ color: atLimit ? '#f87171' : 'var(--text-muted)' }}>
                {current} / {limit}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: atLimit ? '#f87171' : pct >= 70 ? '#f59e0b' : 'var(--accent)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
