import { createContext, useContext, useEffect, useState } from 'react'
import { isSuperAdmin } from '../utils/roles'
import { initializePresence, setUserOffline, cleanupPresence } from '../services/presenceService'

const AuthContext = createContext(null)
let authClientPromise

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
          // Clean up presence when user logs out
          await cleanupPresence()
          return
        }

        setCurrentUser(user)
        setLoading(true)

        // Initialize presence tracking for logged in user
        await initializePresence(user.uid)

        if (unsubscribeRole) unsubscribeRole()

        // Check Firestore for role field first
        unsubscribeRole = onSnapshot(
          doc(db, 'users', user.uid),
          (snap) => {
            if (cancelled) return

            let role = 'user'

            // Check if Firestore has role === 'superadmin'
            if (snap.exists() && snap.data()?.role === 'superadmin') {
              role = 'superadmin'
            }
            // Fallback: check if email is superAdmin@gmail.com
            else if (user.email.toLowerCase() === 'superadmin@gmail.com') {
              role = 'superadmin'
            }

            setUserRole(role)
            setLoading(false)
          },
          () => {
            // On error, check email as fallback
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
      // Clean up presence tracking on unmount
      cleanupPresence()
    }
  }, [])

  // 🔐 LOGIN
  const login = async (email, password) => {
    const {
      auth,
      signInWithEmailAndPassword,
      setPersistence,
      browserLocalPersistence,
    } = await loadAuthClient()

    await setPersistence(auth, browserLocalPersistence)
    return signInWithEmailAndPassword(auth, email, password)
  }

  // 📝 REGISTER
  const register = async (email, password) => {
    const {
      auth,
      db,
      createUserWithEmailAndPassword,
      setPersistence,
      browserLocalPersistence,
      doc,
      setDoc,
      serverTimestamp,
    } = await loadAuthClient()

    await setPersistence(auth, browserLocalPersistence)

    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Set role to superadmin if email is superAdmin@gmail.com
    const role = email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'

    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      role,
      createdAt: serverTimestamp(),
    })

    return cred
  }

  // 🔥 GOOGLE LOGIN (FIXED + SAFE)
  const googleLogin = async () => {
    const {
      auth,
      db,
      GoogleAuthProvider,
      signInWithPopup,
      doc,
      setDoc,
      serverTimestamp,
    } = await loadAuthClient()

    const provider = new GoogleAuthProvider()

    const result = await signInWithPopup(auth, provider)

    const user = result.user

    // Set role to superadmin if email is superAdmin@gmail.com
    const role = user.email.toLowerCase() === 'superadmin@gmail.com' ? 'superadmin' : 'user'

    await setDoc(
      doc(db, 'users', user.uid),
      {
        email: user.email,
        role,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )

    return result
  }

  // 🚪 LOGOUT
  const logout = async () => {
    const { auth, signOut } = await loadAuthClient()
    
    // Mark user as offline before signing out
    if (currentUser) {
      await setUserOffline(currentUser.uid)
    }
    
    await signOut(auth)

    setCurrentUser(null)
    setUserRole(null)
  }

  const isSuperadmin = userRole === 'superadmin'

  const user = currentUser
    ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        role: userRole || 'user',
      }
    : null

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user,
        userRole,
        isSuperadmin,
        loading,
        login,
        register,
        logout,
        googleLogin, // 🔥 ADDED
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)