import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronRight, Clock3, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import SEO from '../components/SEO'
import { SectionLoader } from '../components/common/Loader'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { waitForFirestoreReady } from '../utils/waitForFirestoreAuth'

const LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'English grammar practice for Beginner level.', gradient: 'from-emerald-500/20 to-cyan-500/10' },
  { id: 'elementary', label: 'Elementary', description: 'Build core grammar foundations at Elementary level.', gradient: 'from-sky-500/20 to-blue-500/10' },
  { id: 'pre-intermediate', label: 'Pre-Intermediate', description: 'Practice practical grammar patterns for everyday English.', gradient: 'from-violet-500/20 to-indigo-500/10' },
  { id: 'intermediate', label: 'Intermediate', description: 'Strengthen your accuracy and sentence control.', gradient: 'from-amber-500/20 to-orange-500/10' },
  { id: 'upper-intermediate', label: 'Upper-Intermediate', description: 'Advanced grammar practice for more precise English.', gradient: 'from-rose-500/20 to-pink-500/10' },
  { id: 'advanced', label: 'Advanced', description: 'Challenge yourself with high-level grammar units.', gradient: 'from-red-500/20 to-fuchsia-500/10' },
]

export default function UnitTests() {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
  }, [authLoading])

  const levelStats = useMemo(() => {
    const counts = Object.fromEntries(LEVELS.map((level) => [level.id, 0]))
    for (const unit of units) {
      const levelId = unit.level || 'beginner'
      if (counts[levelId] !== undefined) counts[levelId] += 1
    }
    return LEVELS.map((level) => ({ ...level, count: counts[level.id] || 0 }))
  }, [units])

  if (loading) {
    return (
      <>
        <SEO title="Unit Tests" description="Practice English unit tests and track your progress." canonical="https://olimov.vercel.app/unit-tests" />
        <div className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20">
          <SectionLoader text="Loading..." minH="60vh" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEO title="Unit Tests" description="Practice English unit tests and track your progress." canonical="https://olimov.vercel.app/unit-tests" />
        <div className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20 flex items-center justify-center px-4">
          <p className="text-red-400 text-sm sm:text-base">{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Unit Tests"
        description="Practice English unit tests and track your progress."
        canonical="https://olimov.vercel.app/unit-tests"
      />

      <section className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="gold-badge mb-4">
                    <Sparkles className="h-4 w-4" />
                    <span>Practice workspace</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">Unit Tests</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                    Browse grammar levels, see real unit counts from Firestore, and open the units for each level.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 sm:self-auto">
                  <Clock3 className="h-4 w-4 text-sky-400" />
                  Live from Firestore
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {levelStats.map((level) => (
                <div
                  key={level.id}
                  className="premium-card premium-card-hover group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${level.gradient}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%),linear-gradient(135deg,rgba(3,7,18,0.1),rgba(3,7,18,0.8))]" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                      <BookOpen className="h-3.5 w-3.5" />
                      Grammar
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{level.label}</h3>
                          <p className="mt-1 text-sm text-white/80">{level.count} {level.count === 1 ? 'Unit' : 'Units'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
                          <span className="text-lg font-bold text-white">{level.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">Grammar</p>
                    <p className="min-h-12 text-sm leading-relaxed text-gray-400">{level.description}</p>
                    <button
                      onClick={() => navigate(`/unit-tests/${level.id}`)}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:opacity-95"
                    >
                      {level.count > 0 ? 'View Units' : 'Open Units'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
