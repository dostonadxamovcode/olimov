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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeAuth = null
    let unsubscribeRole = null
    let cancelled = false

    const init = async () => {
      const {
        auth,
        db,
        onAuthStateChanged,
        onSnapshot,
        doc,
        setPersistence,
        browserLocalPersistence,
      } = await loadAuthClient()

      await setPersistence(auth, browserLocalPersistence)

      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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
            let role = 'user'
            if (snap.exists() && snap.data()?.role === 'superadmin') {
              role = 'superadmin'
            } else if (user.email.toLowerCase() === 'superadmin@gmail.com') {
              role = 'superadmin'
            }
            setUserRole(role)
            setLoading(false)
          },
          () => {
            const role = user.email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'
            setUserRole(role)
            setLoading(false)
          }
        )
      })
    }

    init()

    return () => {
      cancelled = true
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
    }
    await signOut(auth)
    setCurrentUser(null)
    setUserRole(null)
  }

  const isSuperadmin = userRole === 'superadmin'

  const user = currentUser
    ? { uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, role: userRole || 'user' }
    : null

  return (
    <AuthContext.Provider value={{ currentUser, user, userRole, isSuperadmin, loading, login, register, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
