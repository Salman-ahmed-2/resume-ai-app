import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Crown, LogOut, Settings, Share2, ChevronDown, Coffee } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UsageMeter from './UsageMeter'

export default function UserMenu({ onUpgradeClick }) {
  const { user, profile, isPro, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const COFFEE_URL = import.meta.env.VITE_LEMONSQUEEZY_COFFEE_URL || '#'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
        style={{ border: '1px solid var(--border)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = 'var(--border)')}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: isPro ? 'var(--accent)' : 'var(--border)', color: isPro ? '#0d1117' : 'var(--text-muted)' }}>
          {initials}
        </div>
        {isPro && <Crown size={11} style={{ color: 'var(--accent)' }} />}
        <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-lg z-50 overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* User info */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name || 'User'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {profile?.email || user.email}
            </div>
            {isPro ? (
              <div className="flex items-center gap-1 mt-2 text-xs font-mono"
                style={{ color: 'var(--accent)' }}>
                <Crown size={10} /> Pro plan · {profile?.lifetime_deal ? 'Lifetime' : 'Monthly'}
              </div>
            ) : (
              <div className="mt-2">
                <UsageMeter />
              </div>
            )}
          </div>

          {/* Upgrade prompt for free */}
          {!isPro && (
            <button onClick={() => { setOpen(false); onUpgradeClick?.() }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Crown size={14} /> Upgrade to Pro — $9/mo
            </button>
          )}

          {/* Referral */}
          {profile?.referral_code && (
            <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referral_code}`)
              setOpen(false)
            }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Share2 size={14} /> Copy referral link (+2 free uses)
            </button>
          )}

          {/* Buy Coffee Support */}
          {COFFEE_URL !== '#' && (
            <a href={COFFEE_URL} target="_blank" rel="noopener noreferrer"
              className="block w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Coffee size={14} /> Buy Coffee ☕
            </a>
          )}

          {/* Sign out */}
          <button onClick={() => { signOut(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
            <LogOut size={14} /> Sign out
            </button>
        </div>
      )}
    </div>
  )
}
