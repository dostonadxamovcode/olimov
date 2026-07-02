import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ── Firebase config — values come from .env.local (never hardcode in source) ──
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ── Startup validation ────────────────────────────────────────────────────────
const REQUIRED = ['apiKey', 'authDomain', 'projectId', 'appId']
REQUIRED.forEach((key) => {
  if (!firebaseConfig[key]) {
    console.error(`[Firebase] Missing required config key: ${key}`)
    console.error(`[Firebase] Add VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} to .env.local`)
  }
})

// ── App init ──────────────────────────────────────────────────────────────────
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('[Firebase] initializeApp failed:')
  console.error('code:', error?.code)
  console.error('message:', error?.message)
  throw error
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth           = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// ── Firestore ─────────────────────────────────────────────────────────────────
// memoryLocalCache: keeps fetched docs in memory so the app doesn't hang on
// ERR_INTERNET_DISCONNECTED — cached data is served while offline.
// experimentalForceLongPolling: avoids WebSocket issues behind strict firewalls.
export const db = initializeFirestore(app, {
  localCache:                  memoryLocalCache(),
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties:    true,
})

// ── Storage ───────────────────────────────────────────────────────────────────
export const storage = getStorage(app)
