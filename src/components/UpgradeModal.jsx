import { X, Zap, Check, Crown, Star, Users, ArrowRight } from 'lucide-react'
import { Infinity as InfinityIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MONTHLY_URL = import.meta.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_URL || '#'
const LIFETIME_URL = import.meta.env.VITE_LEMONSQUEEZY_PRO_LIFETIME_URL || '#'

const PRO_FEATURES = [
  'Unlimited resumes, interviews & cover letters',
  'No ads — ever',
  'Premium resume templates',
  'Faster AI with enhanced prompts',
  'Priority email support',
  'PDF export without watermark',
]

// scoreMap tells us what "score boost" to show per feature
const SCORE_MSGS = {
  resumes_created:         { score: 78, boost: 95, label: 'resume score' },
  interviews_completed:    { score: 62, boost: 94, label: 'interview confidence' },
  cover_letters_generated: { score: 71, boost: 93, label: 'cover letter impact' },
}

export default function UpgradeModal({ open, onClose, limitField, onContinueFree }) {
  const { profile } = useAuth()
  if (!open) return null

  const msg = limitField ? SCORE_MSGS[limitField] : null

  const openCheckout = (checkoutUrl) => {
    if (!checkoutUrl || checkoutUrl === '#') {
      console.error('Checkout URL not configured')
      return
    }

    const url = new URL(checkoutUrl)

    // 1. Pre-fill the email field on the checkout page (Better UX)
    if (profile?.email) {
      url.searchParams.set('checkout[email]', profile.email)

      // 2. Attach the custom data for your Webhook/Database
      url.searchParams.set('checkout[custom][user_email]', profile.email)
    }

    window.open(url.toString(), '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card w-full max-w-lg relative overflow-hidden" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center z-10"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <X size={13} />
        </button>

        {/* Top gradient badge */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold"
              style={{ background: 'var(--accent)', color: '#0d1117' }}>
              <Crown size={11} /> Pro Plan
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Trusted by 12,000+ job seekers</div>
          </div>

          {/* Value prop headline */}
          {msg ? (
            <div>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your {msg.label} is{' '}
                <span style={{ color: '#f59e0b' }}>{msg.score}%</span>
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Unlock Pro to reach{' '}
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{msg.boost}%</span>
                {' '}with enhanced AI, recruiter optimization, and unlimited usage.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Upgrade to Pro for{' '}
                <span className="italic" style={{ color: 'var(--accent)' }}>unlimited access</span>
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Better AI results, no ads, and no limits — everything you need to land your dream job.
              </p>
            </div>
          )}

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-2 mb-6">
            {PRO_FEATURES.map(feat => (
              <div key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                  <Check size={9} style={{ color: 'var(--accent)' }} />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Monthly */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-xs font-mono font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Monthly</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>$3</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/mo</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Cancel anytime</p>
              </div>
              <button onClick={() => openCheckout(MONTHLY_URL)}
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#0d1117' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Get Pro Monthly
              </button>
            </div>

            {/* Lifetime — featured */}
            <div className="rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden"
              style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent)' }}>
              {/* Best value badge */}
              <div className="absolute top-0 right-0">
                <div className="px-2 py-1 text-xs font-bold rounded-bl-lg"
                  style={{ background: 'var(--accent)', color: '#0d1117' }}>
                  BEST VALUE
                </div>
              </div>
              <div>
                <p className="text-xs font-mono font-medium mb-1" style={{ color: 'var(--accent)' }}>Lifetime Deal</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>$29</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>one-time</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>Pay once, own forever</p>
              </div>
              <button onClick={() => openCheckout(LIFETIME_URL, true)}
                className="w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                style={{ background: 'var(--accent)', color: '#0d1117' }}>
<InfinityIcon size={12} /> Get Lifetime Access
              </button>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <div className="flex -space-x-1.5">
              {['#f59e0b','#4ade80','#60a5fa','#f472b6'].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2"
                  style={{ background: c, borderColor: 'var(--bg-card)' }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Join 12,847 people who upgraded this month
            </span>
          </div>

          {/* Skip / continue free */}
          <button onClick={onContinueFree || onClose}
            className="w-full text-center text-xs py-2 transition-all rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            Continue with free plan →
          </button>

          {/* Referral callout */}
          <div className="mt-4 p-3 rounded-lg flex items-start gap-2.5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <Users size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Refer a friend</span> — get +2 extra free uses per referral. Share your code from your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
