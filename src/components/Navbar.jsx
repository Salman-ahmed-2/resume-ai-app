import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, FileText, Mic, Mail, Home, Sparkles, Crown, LogIn, Coffee } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import UpgradeModal from './UpgradeModal'
import UserMenu from './UserMenu'
import UsageMeter from './UsageMeter'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/builder', label: 'Resume Builder', icon: FileText },
  { to: '/coach', label: 'Interview Coach', icon: Mic },
  { to: '/cover-letter', label: 'Cover Letter', icon: Mail },
]

const COFFEE_URL = import.meta.env.VITE_LEMONSQUEEZY_COFFEE_URL || '#'

export default function Navbar({ dark, setDark }) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [authTab, setAuthTab] = useState('signin')
  const { isLoggedIn, isPro } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const openSignIn = () => { setAuthTab('signin'); setShowAuth(true) }
  const openSignUp = () => { setAuthTab('signup'); setShowAuth(true) }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? dark ? 'rgba(13,17,23,0.92)' : 'rgba(245,244,240,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'var(--accent)' }}>
              <Sparkles size={16} color="#0d1117" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Resume<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', background: active ? 'var(--accent-glow)' : 'transparent' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <Icon size={15} />{label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Usage meter (compact, free users only) */}
{isLoggedIn && !isPro && (
              <div className="hidden md:block">
                <UsageMeter compact />
              </div>
            )}

            {/* Coffee button - centered */}
            <a href={COFFEE_URL} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-glow)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#0d1117' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.color = 'var(--accent)' }}
              aria-label="Buy Coffee ☕ Support the project" title="☕ Buy Coffee - Support ResumeAI">
              <Coffee size="18" />
            </a>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
              aria-label="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth buttons / user menu */}
            {isLoggedIn ? (
              <>
                {!isPro && (
                  <button onClick={() => setShowUpgrade(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--accent)';
                      e.currentTarget.style.color = '#0d1117';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--accent-glow)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}>
                    <Crown size={12} /> Upgrade
                  </button>
                )}
                <UserMenu onUpgradeClick={() => setShowUpgrade(true)} />
              </>
            ) : (
              <>
                <button onClick={openSignIn}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <LogIn size={14} /> Sign in
                </button>
                <button onClick={openSignUp}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent)', color: '#0d1117' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Get Started Free
                </button>
              </>
            )}

            {/* Mobile toggle */}
            <button className="md:hidden w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)} style={{ border: '1px solid var(--border)' }}>
              {[0,1,2].map(i => (
                <span key={i} className="block h-0.5 w-4 transition-all duration-200 rounded"
                  style={{
                    background: 'var(--text-secondary)',
                    transform: i === 0 && mobileOpen ? 'rotate(45deg) translate(3px,3px)'
                              : i === 2 && mobileOpen ? 'rotate(-45deg) translate(3px,-3px)' : 'none',
                    opacity: i === 1 && mobileOpen ? 0 : 1,
                  }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: mobileOpen ? '400px' : '0',
            borderTop: mobileOpen ? '1px solid var(--border)' : 'none',
            background: dark ? 'rgba(13,17,23,0.98)' : 'rgba(245,244,240,0.98)',
          }}>
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', background: active ? 'var(--accent-glow)' : 'transparent' }}>
                  <Icon size={16} />{label}
                </Link>
              )
            })}
            <div className="pt-2 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              {isLoggedIn ? (
                <button onClick={() => { setShowUpgrade(true); setMobileOpen(false) }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--accent)', color: '#0d1117' }}>
                  <Crown size={14} /> Upgrade to Pro
                </button>
              ) : (
                <>
                  <button onClick={() => { openSignIn(); setMobileOpen(false) }}
                    className="py-2.5 rounded-lg text-sm font-medium text-center transition-all"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    Sign in
                  </button>
                  <button onClick={() => { openSignUp(); setMobileOpen(false) }}
                    className="py-2.5 rounded-lg text-sm font-semibold text-center"
                    style={{ background: 'var(--accent)', color: '#0d1117' }}>
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}