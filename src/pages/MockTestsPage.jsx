import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { useTranslation } from 'react-i18next'
import { Sprout, BookOpen, TrendingUp, BarChart2, Trophy, Star, Loader2, AlertCircle, Play, ArrowLeft } from 'lucide-react'

const LEVELS = [
  { key: 'a1', col: 'a1Tests', label: 'A1', name: 'Beginner',         icon: Sprout,      gradient: 'from-emerald-500 to-teal-400',  glow: 'shadow-emerald-500/30', border: 'hover:border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300' },
  { key: 'a2', col: 'a2Tests', label: 'A2', name: 'Elementary',        icon: BookOpen,    gradient: 'from-cyan-500 to-blue-400',     glow: 'shadow-cyan-500/30',    border: 'hover:border-cyan-500/50',    badge: 'bg-cyan-500/20 text-cyan-300'       },
  { key: 'b1', col: 'b1Tests', label: 'B1', name: 'Pre-Intermediate',  icon: TrendingUp,  gradient: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/30',  border: 'hover:border-violet-500/50',  badge: 'bg-violet-500/20 text-violet-300'   },
  { key: 'b2', col: 'b2Tests', label: 'B2', name: 'Intermediate',      icon: BarChart2,   gradient: 'from-orange-500 to-amber-400',  glow: 'shadow-orange-500/30',  border: 'hover:border-orange-500/50',  badge: 'bg-orange-500/20 text-orange-300'   },
  { key: 'c1', col: 'c1Tests', label: 'C1', name: 'Advanced',          icon: Trophy,      gradient: 'from-rose-500 to-pink-400',     glow: 'shadow-rose-500/30',    border: 'hover:border-rose-500/50',    badge: 'bg-rose-500/20 text-rose-300'       },
  { key: 'c2', col: 'c2Tests', label: 'C2', name: 'Proficient',        icon: Star,        gradient: 'from-yellow-400 to-amber-300',  glow: 'shadow-yellow-400/30',  border: 'hover:border-yellow-400/50',  badge: 'bg-yellow-400/20 text-yellow-300'   },
]

const BATCH = 30

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MockTestsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [counts,   setCounts]   = useState({})
  const [loading,  setLoading]  = useState(true)
  const [starting, setStarting] = useState(null)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const results = await Promise.all(
          LEVELS.map(async ({ key, col }) => {
            const snap = await getDocs(collection(db, col))
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.type)
            return [key, docs]
          })
        )
        const map = {}
        results.forEach(([key, docs]) => { map[key] = docs })
        setCounts(map)
      } catch {
        setError('Failed to load tests.')
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  const handleStart = async (level) => {
    const docs = counts[level.key]
    if (!docs || docs.length === 0) return

    setStarting(level.key)
    const questions = shuffle(docs).slice(0, BATCH)
    navigate('/tests/practice', {
      state: {
        levelId:   level.key,
        questions,
        testTitle: `${level.label} ${level.name} — ${questions.length} ${t('levels.questions') || 'Questions'}`,
      },
    })
    setStarting(null)
  }

  return (
    <div className="relative min-h-screen site-bg overflow-hidden flex flex-col items-center px-4 py-16 mt-[80px]">
      {/* bg glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-cyan-700/20 blur-[120px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-slate-400">
            Practice Tests
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Level</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Each exam loads <span className="text-white font-semibold">{BATCH} random questions</span> from the selected level.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEVELS.map((level) => {
            const Icon  = level.icon
            const docs  = counts[level.key] || []
            const count = docs.length
            const empty = !loading && count === 0

            return (
              <div
                key={level.key}
                className={`group relative rounded-2xl border border-white/10 ${level.border} bg-white/[0.04] p-6 transition-all duration-200 hover:shadow-2xl ${level.glow} flex flex-col gap-4`}
              >
                <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${level.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="flex items-start justify-between">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${level.gradient} shadow-lg`}>
                    <Icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                  {loading ? (
                    <div className="w-12 h-5 rounded-md bg-white/10 animate-pulse" />
                  ) : (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${level.badge}`}>
                      {count} Q
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${level.badge}`}>{level.label}</span>
                    <h3 className="text-white font-semibold text-base">{level.name}</h3>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {loading ? 'Loading...' : empty ? 'No questions yet' : `${Math.min(BATCH, count)} questions per exam`}
                  </p>
                </div>

                <button
                  onClick={() => handleStart(level)}
                  disabled={loading || empty || starting === level.key}
                  className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
                    ${empty || loading
                      ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                      : `bg-gradient-to-r ${level.gradient} text-white hover:opacity-90 shadow-lg`
                    }`}
                >
                  {starting === level.key
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    : <><Play className="w-4 h-4" /> Start Exam</>
                  }
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
