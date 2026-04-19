import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID || ''
const BANNER_SLOT = import.meta.env.VITE_ADSENSE_SLOT_BANNER || ''

/**
 * AdBanner — renders Google AdSense ad for free users only.
 * Props:
 *   slot?       — override slot id
 *   format?     — 'banner' | 'rectangle'
 *   dismissible — show X button
 *   className?
 */
export default function AdBanner({ slot, format = 'banner', dismissible = false, className = '' }) {
  const { profile, isPro, isLoggedIn } = useAuth()
  const adRef = useRef(null)
  const [dismissed, setDismissed] = useState(false)
  const [adLoaded, setAdLoaded] = useState(false)

  // Only show for free users
  const shouldShow = !isPro && profile?.ads_enabled !== false && !dismissed

  useEffect(() => {
    if (!shouldShow || !ADSENSE_CLIENT || ADSENSE_CLIENT === 'ca-pub-your-publisher-id') {
      setAdLoaded(false)
      return
    }

    try {
      // Load AdSense script once
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const script = document.createElement('script')
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
        script.async = true
        script.crossOrigin = 'anonymous'
        document.head.appendChild(script)
      }

      // Push the ad
      const timer = setTimeout(() => {
      try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          setAdLoaded(true)
        } catch (e) {
          // AdSense push failed silently
        }
      }, 300)

      return () => clearTimeout(timer)
    } catch (e) {
      // Script load failed silently
    }
  }, [shouldShow])

  if (!shouldShow) return null

  // If no real AdSense configured, show placeholder (dev mode)
  const isDevMode = !ADSENSE_CLIENT || ADSENSE_CLIENT === 'ca-pub-your-publisher-id'

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      {dismissible && (
        <button onClick={() => setDismissed(true)}
          className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded flex items-center justify-center"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
          <X size={10} />
        </button>
      )}

      <div className="px-3 py-1 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sponsored</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ad · Free plan</span>
      </div>

      {isDevMode ? (
        // Dev placeholder
        <div className="flex items-center justify-center py-6 px-4 gap-3">
          <div className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }} />
          <div className="flex-1">
            <div className="h-2.5 rounded mb-2" style={{ background: 'var(--border)', width: '70%' }} />
            <div className="h-2 rounded" style={{ background: 'var(--border)', width: '50%' }} />
          </div>
          <span className="text-xs px-3 py-1 rounded-lg flex-shrink-0"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            Configure AdSense
          </span>
        </div>
      ) : (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: format === 'rectangle' ? 250 : 90 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot || BANNER_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}

/**
 * PostActionAd — shown after resume generation / interview completion.
 * Fades in after a 1.5s delay so it feels natural, not intrusive.
 */
export function PostActionAd({ show, onDismiss }) {
  const { isPro } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show || isPro) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [show, isPro])

  if (!visible || isPro) return null

  return (
    <div className="transition-all duration-500" style={{ opacity: visible ? 1 : 0 }}>
      <AdBanner dismissible onDismiss={() => { setVisible(false); onDismiss?.() }} className="mt-4" />
    </div>
  )
}
