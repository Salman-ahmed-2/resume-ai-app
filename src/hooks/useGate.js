/**
 * useGate — usage limit + upgrade modal management for any page.
 *
 * Usage:
 *   const { gate, GateModal } = useGate('resumes_created')
 *
 *   // Before starting an AI action:
 *   const allowed = await gate()
 *   if (!allowed) return   // upgrade modal shown
 *
 *   // After completing action:
 *   await gate.complete()  // increments DB counter
 */
import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export function useGate(field) {
  const { isLoggedIn, incrementUsage, checkLimit } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [pendingResolve, setPendingResolve] = useState(null)
  const [limitInfo, setLimitInfo] = useState(null)

  /**
   * gate() — call BEFORE an action.
   * Returns true if allowed (and increments counter).
   * Returns false if at limit (shows upgrade modal).
   */
  const gate = useCallback(async () => {
    // Not logged in → always allow (unauthenticated preview mode)
    if (!isLoggedIn) return true

    const result = await incrementUsage(field)
    if (result.allowed) return true

    // At limit — show modal
    setLimitInfo({ field, current: result.current, limit: result.limit })
    setShowModal(true)
    return false
  }, [isLoggedIn, field, incrementUsage])

  /**
   * checkBeforeStart() — check WITHOUT incrementing (for soft gate on page load).
   * Returns true if user can proceed.
   */
  const checkBeforeStart = useCallback(() => {
    if (!isLoggedIn) return true
    const { atLimit } = checkLimit(field)
    if (atLimit) {
      setLimitInfo(checkLimit(field))
      setShowModal(true)
      return false
    }
    return true
  }, [isLoggedIn, field, checkLimit])

  const closeModal = () => setShowModal(false)

  return {
    gate,
    checkBeforeStart,
    showUpgradeModal: showModal,
    limitField: limitInfo?.field,
    closeUpgradeModal: closeModal,
  }
}
