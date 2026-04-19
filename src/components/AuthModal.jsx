import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function InputField({ icon: Icon, type, placeholder, value, onChange, showToggle, onToggle, showPass }) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
        <Icon size={15} />
      </div>
      <input
        type={showToggle ? (showPass ? 'text' : 'password') : type}
        className="input-field pl-10 pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        >
          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  )
}

export default function AuthModal({ open, onClose, defaultTab = 'signin' }) {
  const [tab, setTab] = useState(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp, signInWithGoogle, resetPassword, authError, setAuthError } = useAuth()

  if (!open) return null

  const clearMessages = () => { setLocalError(''); setSuccessMsg(''); setAuthError(null) }

  const handleSignIn = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email || !password) { setLocalError('Please fill in all fields'); return }
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (!error) onClose()
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email || !password || !fullName) { setLocalError('Please fill in all fields'); return }
    if (password.length < 8) { setLocalError('Password must be at least 8 characters'); return }
    setSubmitting(true)
    const { error } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (!error) {
      setSuccessMsg('Account created! Check your email to confirm your account.')
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!email) { setLocalError('Enter your email'); return }
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) setLocalError(error.message)
    else setSuccessMsg('Password reset link sent to your email.')
  }

  const err = localError || authError
  const submitLabel = submitting
    ? 'Please wait...'
    : tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="card w-full max-w-md relative overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header strip */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Sparkles size={15} color="#0d1117" />
              </div>
              <span className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                Resume<span style={{ color: 'var(--accent)' }}>AI</span>
              </span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Tab switcher */}
          {tab !== 'reset' && (
            <div className="flex rounded-lg p-1 mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              {['signin', 'signup'].map(t => (
                <button key={t} onClick={() => { setTab(t); clearMessages() }}
                  className="flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200"
                  style={{
                    background: tab === t ? 'var(--bg-card)' : 'transparent',
                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                    border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                  }}>
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {tab === 'signin' ? 'Welcome back' : tab === 'signup' ? 'Join ResumeAI' : 'Reset password'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'signin'
              ? 'Sign in to access your resumes and track your progress.'
              : tab === 'signup'
              ? 'Get 3 free resumes, 5 interview sessions, and 2 cover letters.'
              : "Enter your email and we'll send a reset link."}
          </p>

          {/* Error / Success messages */}
          {err && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {err}
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 text-sm"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {successMsg}
            </div>
          )}

          {/* Google Sign In Button */}
          {tab !== 'reset' && (
            <button
              onClick={signInWithGoogle}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 mb-4 flex items-center justify-center gap-3"
              style={{
                background: submitting ? 'var(--border)' : '#4285f4',
                color: submitting ? 'var(--text-muted)' : 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                border: '1px solid transparent'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {/* Form */}
          <form onSubmit={tab === 'signin' ? handleSignIn : tab === 'signup' ? handleSignUp : handleReset}
            className="flex flex-col gap-3">
            {tab === 'signup' && (
              <InputField icon={User} type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            )}
            <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            {tab !== 'reset' && (
              <InputField icon={Lock} type="password" placeholder="Password (min 8 chars)" value={password}
                onChange={e => setPassword(e.target.value)} showToggle onToggle={() => setShowPass(p => !p)} showPass={showPass} />
            )}
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 mt-2"
              style={{ background: submitting ? 'var(--border)' : 'var(--accent)', color: submitting ? 'var(--text-muted)' : '#0d1117', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitLabel}
            </button>
          </form>

          {tab === 'signin' && (
            <button onClick={() => { setTab('reset'); clearMessages() }}
              className="w-full text-center text-xs mt-3 transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Forgot password?
            </button>
          )}
          {tab === 'reset' && (
            <button onClick={() => { setTab('signin'); clearMessages() }}
              className="w-full text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              ← Back to sign in
            </button>
          )}

          {/* Free plan callout on signup */}
          {tab === 'signup' && (
            <div className="mt-5 p-4 rounded-lg" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>Free plan includes:</p>
              <div className="flex flex-col gap-1">
                {['3 AI resume generations', '5 mock interview sessions', '2 cover letters'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={11} style={{ color: 'var(--accent)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
