import { createContext, useContext, useEffect, useState } from 'react'
import { isSuperAdmin } from '../utils/roles'

const AuthContext = createContext(null)
let authClientPromise
let presencePromise

function loadAuthClient() {
  if (!authClientPromise) {
    authClientPromise = Promise.all([
      import('firebase/auth'),
      import('firebase/firestore'),
      import('../firebase'),
    ]).then(([authModule, firestoreModule, firebase]) => ({
      ...authModule,
      ...firestoreModule,
      auth: firebase.auth,
      db: firebase.db,
    }))
  }
  return authClientPromise
}

function loadPresence() {
  if (!presencePromise) presencePromise = import('../services/presenceService')
  return presencePromise
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userAvatar, setUserAvatar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeAuth = null
    let unsubscribeRole = null
    let cancelled = false
    let safetyTimer = null

    const clearSafety = () => {
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null }
    }

    const failSafe = () => {
      clearSafety()
      if (cancelled) return
      setCurrentUser(null)
      setUserRole(null)
      setLoading(false)
    }

    const init = async () => {
      // If Firebase can't reach its servers (ERR_CONNECTION_CLOSED etc.) within
      // 8 s, treat the user as logged-out so the app doesn't hang forever.
      safetyTimer = setTimeout(failSafe, 8000)

      try {
        const {
          auth,
          db,
          onAuthStateChanged,
          onSnapshot,
          doc,
          setPersistence,
          browserLocalPersistence,
        } = await loadAuthClient()

        try {
          await setPersistence(auth, browserLocalPersistence)
        } catch {
          // Non-fatal — continue without explicit persistence setting
        }

        unsubscribeAuth = onAuthStateChanged(
          auth,
          async (user) => {
            clearSafety()
            if (cancelled) return

            if (!user) {
              setCurrentUser(null)
              setUserRole(null)
              setLoading(false)
              if (unsubscribeRole) unsubscribeRole()
              const { cleanupPresence } = await loadPresence()
              await cleanupPresence()
              return
            }

            setCurrentUser(user)
            setLoading(true)

            const { initializePresence } = await loadPresence()
            await initializePresence(user.uid)

            if (unsubscribeRole) unsubscribeRole()

            unsubscribeRole = onSnapshot(
              doc(db, 'users', user.uid),
              (snap) => {
                if (cancelled) return
                const data = snap.exists() ? snap.data() : {}
                let role = 'user'
                if (data?.role === 'superadmin' || user.email.toLowerCase() === 'superadmin@gmail.com') {
                  role = 'superadmin'
                }
                setUserRole(role)
                // photoBase64 (uploaded) > photoURL from Firestore > Auth photoURL
                setUserAvatar(data.photoBase64 || data.photoURL || user.photoURL || null)
                setLoading(false)
              },
              () => {
                const role = user.email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'
                setUserRole(role)
                setUserAvatar(user.photoURL || null)
                setLoading(false)
              }
            )
          },
          // Auth error callback — fires on network failures during token refresh
          (error) => {
            console.warn('Firebase Auth error:', error?.code ?? error)
            failSafe()
          }
        )
      } catch (error) {
        console.warn('Firebase Auth init error:', error?.message ?? error)
        failSafe()
      }
    }

    init()

    return () => {
      cancelled = true
      clearSafety()
      if (unsubscribeAuth) unsubscribeAuth()
      if (unsubscribeRole) unsubscribeRole()
      loadPresence().then(({ cleanupPresence }) => cleanupPresence())
    }
  }, [])

  const login = async (email, password) => {
    const { auth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } = await loadAuthClient()
    await setPersistence(auth, browserLocalPersistence)
    return signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email, password) => {
    const { auth, db, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, doc, setDoc, serverTimestamp } = await loadAuthClient()
    await setPersistence(auth, browserLocalPersistence)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const role = email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'
    await setDoc(doc(db, 'users', cred.user.uid), { email, role, createdAt: serverTimestamp() })
    return cred
  }

  const googleLogin = async () => {
    const { auth, db, GoogleAuthProvider, signInWithPopup, doc, setDoc, serverTimestamp } = await loadAuthClient()
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const role = user.email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'
    await setDoc(doc(db, 'users', user.uid), { email: user.email, role, createdAt: serverTimestamp() }, { merge: true })
    return result
  }

  const logout = async () => {
    const { auth, signOut } = await loadAuthClient()
    if (currentUser) {
      const { setUserOffline } = await loadPresence()
      await setUserOffline(currentUser.uid)
      sessionStorage.removeItem(`admin_tour_done_${currentUser.uid}`)
    }
    await signOut(auth)
    setCurrentUser(null)
    setUserRole(null)
  }

  // Update Firebase Auth profile + Firestore users doc, then sync React state
  const updateUserProfile = async ({ displayName, photoURL, username, phone, bio }) => {
    const { auth, db, doc, setDoc, serverTimestamp, updateProfile } = await loadAuthClient()
    const u = auth.currentUser
    if (!u) throw new Error('Not authenticated')

    // 1. Firebase Auth update (displayName & photoURL only)
    const authUpdates = {}
    // Only update displayName if it's a non-empty string
    if (displayName !== undefined && displayName !== null && displayName !== '')
      authUpdates.displayName = displayName
    if (photoURL !== undefined) authUpdates.photoURL = photoURL ?? null
    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(u, authUpdates)
    }

    // 2. Firestore update (all profile fields)
    const firestoreData = { updatedAt: serverTimestamp() }
    if (displayName !== undefined) firestoreData.displayName = displayName
    if (photoURL !== undefined) firestoreData.photoURL = photoURL ?? null
    if (username !== undefined) firestoreData.username = username
    if (phone !== undefined) firestoreData.phone = phone
    if (bio !== undefined) firestoreData.bio = bio
    await setDoc(doc(db, 'users', u.uid), firestoreData, { merge: true })

    // 3. Sync React state so Header/Avatar updates immediately
    setCurrentUser(prev => prev ? { ...prev, ...authUpdates } : prev)
    // userAvatar is kept in sync via onSnapshot — no manual update needed
  }

  const isSuperadmin = userRole === 'superadmin'

  const user = currentUser
    ? {
        uid:         currentUser.uid,
        email:       currentUser.email,
        displayName: currentUser.displayName,
        role:        userRole || 'user',
        avatar:      userAvatar || currentUser.photoURL || null,
      }
    : null

  return (
    <AuthContext.Provider value={{ currentUser, user, userRole, isSuperadmin, loading, login, register, logout, googleLogin, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
