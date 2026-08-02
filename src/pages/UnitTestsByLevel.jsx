import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Clock3, Layers3, UserPlus, LogIn } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import SEO from '../components/SEO'
import { SectionLoader } from '../components/common/Loader'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { waitForFirestoreReady } from '../utils/waitForFirestoreAuth'

const LEVEL_META = {
  beginner: { label: 'Beginner', description: 'English grammar practice for Beginner level.', accent: 'from-emerald-500 to-cyan-500' },
  elementary: { label: 'Elementary', description: 'Build core grammar foundations at Elementary level.', accent: 'from-sky-500 to-blue-500' },
  'pre-intermediate': { label: 'Pre-Intermediate', description: 'Practice practical grammar patterns for everyday English.', accent: 'from-violet-500 to-indigo-500' },
  intermediate: { label: 'Intermediate', description: 'Strengthen your accuracy and sentence control.', accent: 'from-amber-500 to-orange-500' },
  'upper-intermediate': { label: 'Upper-Intermediate', description: 'Advanced grammar practice for more precise English.', accent: 'from-rose-500 to-pink-500' },
  advanced: { label: 'Advanced', description: 'Challenge yourself with high-level grammar units.', accent: 'from-red-500 to-fuchsia-500' },
}

export default function UnitTestsByLevel() {
  const { level } = useParams()
  const navigate = useNavigate()
  const { loading: authLoading, currentUser } = useAuth()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const normalizedLevel = level?.toLowerCase()
  const meta = LEVEL_META[normalizedLevel]

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function fetchUnits() {
      try {
        setLoading(true)
        setError(null)
        await waitForFirestoreReady()
        if (cancelled) return

        const snapshot = await getDocs(collection(db, 'unitTests'))
        const items = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((unit) => (unit.level || 'beginner') === normalizedLevel)
          .sort((a, b) => (a.order || 0) - (b.order || 0) || (a.unitNumber || 0) - (b.unitNumber || 0))

        if (!cancelled) setUnits(items)
      } catch (err) {
        console.error('Failed loading unitTests', err)
        if (!cancelled) setError('Failed to load unit tests')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUnits()
    return () => {
      cancelled = true
    }
  }, [authLoading, normalizedLevel])

  useEffect(() => {
    if (!authLoading && !currentUser && !loading && units.length > 0) {
      setShowAuthModal(true)
    }
  }, [authLoading, currentUser, loading, units.length])

  const title = meta ? `${meta.label} Units` : 'Units'
  const description = meta?.description || 'Browse units by level.'

  const emptyState = useMemo(() => {
    if (!meta) return 'Level not found'
    if (units.length === 0) return 'No units available yet'
    return null
  }, [meta, units.length])

  if (showAuthModal) {
    return (
      <>
        <SEO title="Authentication Required" description="Sign in to view tests" canonical={`https://olimov.vercel.app/unit-tests/${normalizedLevel || ''}`} />
        <div className="min-h-screen site-bg flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="relative z-50 premium-card p-8 max-w-md w-full mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
            <p className="text-slate-400 mb-6">To view and take tests, you need to sign in to your account. Please log in or register to continue.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-90"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-white/5 border border-white/10 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
              <button
                onClick={() => navigate('/unit-tests')}
                className="w-full rounded-lg py-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                Back to Unit Tests
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <SEO title={title} description={description} canonical={`https://olimov.vercel.app/unit-tests/${normalizedLevel || ''}`} />
        <div className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20">
          <SectionLoader text="Loading..." minH="60vh" />
        </div>
      </>
    )
  }

  if (error || !meta) {
    return (
      <>
        <SEO title={title} description={description} canonical={`https://olimov.vercel.app/unit-tests/${normalizedLevel || ''}`} />
        <div className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20 flex items-center justify-center px-4">
          <div className="text-center space-y-3">
            <p className="text-red-400 text-sm sm:text-base">{error || 'Level not found'}</p>
            <button
              onClick={() => navigate('/unit-tests')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Unit Tests
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO title={title} description={description} canonical={`https://olimov.vercel.app/unit-tests/${normalizedLevel}`} />

      <section className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <button onClick={() => navigate('/unit-tests')} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{meta.label} Units</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">{meta.description}</p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 sm:self-auto">
                <Clock3 className="h-4 w-4 text-sky-400" />
                {units.length} {units.length === 1 ? 'Unit' : 'Units'}
              </div>
            </div>

            {emptyState ? (
              <div className="premium-card flex min-h-[280px] items-center justify-center px-6 text-center">
                <div>
                  <p className="text-lg font-semibold text-white">{emptyState}</p>
                  <p className="mt-2 text-sm text-slate-400">Create units in Admin and they will appear here automatically.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {units.map((unit) => (
                  <article key={unit.id} className="premium-card flex flex-col gap-4 p-5 transition-all hover:-translate-y-1 hover:border-white/20">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} text-lg font-bold text-white shadow-lg`}>
                      {unit.unitNumber || unit.order || 0}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">{unit.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-400">{unit.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{unit.exercises?.length || 0} Questions</span>
                      <span>Order {unit.order || unit.unitNumber || 0}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/unit-tests/${normalizedLevel}/${unit.id}`)}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-95"
                    >
                      Start Unit
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
