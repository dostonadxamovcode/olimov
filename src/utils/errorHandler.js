import toast from 'react-hot-toast'
import { createElement } from 'react'
import i18n from '../i18n/i18n'

const ToastIcon = ({ type }) => {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
  return createElement('div', { className: `toast-icon ${type}` }, icons[type])
}

const CustomToast = ({ message, type, visible }) =>
  createElement('div', { className: `custom-toast ${!visible ? 'toast-exit' : ''}` },
    createElement(ToastIcon, { type }),
    createElement('div', { className: 'toast-content' },
      createElement('p', { className: 'toast-message' }, message)
    ),
    createElement('div', { className: `toast-progress ${type}` })
  )

const showToast = (message, type) => {
  toast.custom((t) => createElement(CustomToast, { message, type, visible: t.visible }), { duration: 4000 })
}

const t = (key) => i18n.t(key)

// ── Structured auth/firestore error logger ────────────────────────────────────
// Logs code + message together. Does NOT log credential tokens (security risk).
function logFirebaseError(label, error) {
  console.error(`[${label}]`, error?.code ?? 'no-code', '|', error?.message ?? error)
}

export const getErrorMessage = (error) => {
  const code = error?.code || error?.message || ''

  // Log all auth errors with full context — credential is intentionally excluded
  if (code && code.includes('auth/')) {
    console.error('[Firebase Auth Error]', {
      code:    error?.code,
      message: error?.message,
      email:   error?.customData?.email,
    })
  }

  // ── Auth errors ─────────────────────────────────────────────────────────────

  // Firebase v10+ collapses wrong-password + user-not-found into this single code
  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/invalid-login-credentials') ||
    code.includes('INVALID_LOGIN_CREDENTIALS') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found')
  )
    return t('errors.invalidCredential')

  if (code.includes('auth/email-already-in-use'))
    return t('errors.emailInUse')

  if (code.includes('auth/weak-password'))
    return t('errors.weakPassword')

  if (code.includes('auth/invalid-email'))
    return t('errors.invalidEmail')

  if (code.includes('auth/user-disabled'))
    return t('errors.userDisabled')

  if (code.includes('auth/too-many-requests'))
    return t('errors.tooManyRequests')

  if (code.includes('auth/requires-recent-login'))
    return t('errors.requiresRecentLogin')

  if (code.includes('auth/popup-closed-by-user'))
    return t('errors.popupClosed')

  if (code.includes('auth/cancelled-popup-request'))
    return t('errors.popupCancelled')

  if (code.includes('auth/account-exists-with-different-credential'))
    return t('errors.differentCredential')

  if (code.includes('auth/unauthorized-domain'))
    return t('errors.unauthorizedDomain')

  if (code.includes('auth/operation-not-allowed'))
    return t('errors.operationNotAllowed')

  if (code.includes('auth/popup-blocked'))
    return t('errors.popupBlocked')

  // API key invalid or restricted (HTTP referrer block, wrong key)
  if (
    code.includes('auth/api-key-not-valid') ||
    code.includes('auth/invalid-api-key') ||
    code.includes('API_KEY_INVALID')
  ) {
    console.error('[Firebase] Invalid API key — check VITE_FIREBASE_API_KEY in .env.local')
    return t('errors.internalError')
  }

  if (code.includes('auth/internal-error'))
    return t('errors.internalError')

  // ── Firestore errors ─────────────────────────────────────────────────────────
  if (code.includes('permission-denied'))
    return t('errors.permissionDenied')

  if (code.includes('not-found'))
    return t('errors.notFound')

  if (code.includes('already-exists'))
    return t('errors.alreadyExists')

  if (code.includes('resource-exhausted'))
    return t('errors.resourceExhausted')

  if (code.includes('unavailable'))
    return t('errors.unavailable')

  if (code.includes('deadline-exceeded'))
    return t('errors.deadlineExceeded')

  if (code.includes('aborted'))
    return t('errors.aborted')

  // ── Network errors ───────────────────────────────────────────────────────────
  if (
    code.includes('network-request-failed') ||
    code.includes('NetworkError') ||
    code.includes('Failed to fetch') ||
    code.includes('ERR_INTERNET_DISCONNECTED') ||
    code.includes('ERR_CONNECTION') ||
    code.includes('ERR_NETWORK')
  )
    return t('errors.networkError')

  // ── Storage errors ───────────────────────────────────────────────────────────
  if (code.includes('storage/unauthorized'))
    return t('errors.storageUnauthorized')

  if (code.includes('storage/object-not-found'))
    return t('errors.storageNotFound')

  if (code.includes('storage/quota-exceeded'))
    return t('errors.storageQuota')

  return t('errors.default')
}

export const toastError   = (error) => {
  const message = typeof error === 'string' ? error : getErrorMessage(error)
  showToast(message, 'error')
}

export const toastSuccess = (message) => showToast(message, 'success')
export const toastWarning = (message) => showToast(message, 'warning')
export const toastInfo    = (message) => showToast(message, 'info')

// Named re-export so callers that already import logFirebaseError keep working
export { logFirebaseError }
