import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// Firebase configuration with validation
const getFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDu4uPEzawNOHD7u27NEeTy9vypT5G1rg8',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'olimov-a5528.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'olimov-a5528',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'olimov-a5528.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '224698298994',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:224698298994:web:1cbc46884f4d34f87248eb',
  }

  // Validate required fields
  if (!config.projectId || config.projectId === 'fallback') {
    console.error('CRITICAL: Firebase projectId is missing or invalid!')
    console.error('Current projectId:', config.projectId)
    console.error('Please check VITE_FIREBASE_PROJECT_ID environment variable')
  }

  if (!config.apiKey || config.apiKey === 'fallback') {
    console.error('CRITICAL: Firebase apiKey is missing or invalid!')
    console.error('Please check VITE_FIREBASE_API_KEY environment variable')
  }

  return config
}

const firebaseConfig = getFirebaseConfig()

let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('FIREBASE APP INITIALIZATION FAILED:', error)
  throw error
}

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
})