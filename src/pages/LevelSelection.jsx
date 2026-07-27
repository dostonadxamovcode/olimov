import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { useTranslation } from 'react-i18next'
import { Sprout, BookOpen, TrendingUp, ChartBar as BarChart2, Trophy as Award, Star } from 'lucide-react'
import { Spinner } from '../components/common/Loader'
import SEO from '../components/SEO'

const QUESTION_COUNT = 50

const toCollection = (code) => code === 'ielts' ? 'ielts' : `${code}Tests`

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LEVELS = [
  { code: 'a1', label: 'A1', icon: Sprout,     gradient: 'from-emerald-500 to-teal-400',   glow: 'shadow-emerald-500/25', border: 'hover:border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300' },
  { code: 'a2', label: 'A2', icon: BookOpen,   gradient: 'from-cyan-500 to-blue-400',      glow: 'shadow-cyan-500/25',    border: 'hover:border-cyan-500/50',    badge: 'bg-cyan-500/20 text-cyan-300'       },
  { code: 'b1', label: 'B1', icon: TrendingUp, gradient: 'from-violet-500 to-purple-400',  glow: 'shadow-violet-500/25',  border: 'hover:border-violet-500/50',  badge: 'bg-violet-500/20 text-violet-300'   },
  { code: 'b2', label: 'B2', icon: BarChart2,  gradient: 'from-orange-500 to-amber-400',   glow: 'shadow-orange-500/25',  border: 'hover:border-orange-500/40',  badge: 'bg-orange-500/20 text-orange-300'   },
  { code: 'c1', label: 'C1', icon: Award,      gradient: 'from-rose-500 to-pink-400',      glow: 'shadow-rose-500/25',    border: 'hover:border-rose-500/50',    badge: 'bg-rose-500/20 text-rose-300'       },
  { code: 'c2', label: 'C2', icon: Star,       gradient: 'from-yellow-400 to-amber-300',   glow: 'shadow-yellow-400/25',  border: 'hover:border-yellow-400/50',  badge: 'bg-yellow-400/20 text-yellow-300'   },
]

export default function LevelSelection() {
  const { t } = useTranslation()
  const navigate   = useNavigate()
  const [selected,   setSelected]   = useState(null)
  const [fetching,   setFetching]   = useState(false)
  const [fetchError, setFetchError] = useState('')

  const handleCardClick = (level) => { setFetchError(''); setSelected(level) }

  const handleConfirm = async () => {
    if (!selected) return
    setFetching(true)
    setFetchError('')
    try {
      const snap = await getDocs(collection(db, toCollection(selected.code)))
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.type)

      if (docs.length === 0) {
        setFetchError(t('levels.noTests'))
        return
      }

      const questions = shuffle(docs).slice(0, QUESTION_COUNT)

      navigate('/tests/practice', {
        state: {
          levelId: selected.code,
          questions,
          testTitle: `${t('levels.' + selected.code + '.name')} — ${questions.length} ${t('levels.questions')}`,
        },
      })
      setSelected(null)
    } catch {
      setFetchError(t('levels.loadError'))
    } finally {
      setFetching(false)
    }
  }

  const handleCancel = () => { if (fetching) return; setSelected(null); setFetchError('') }

  return (
    <>
      <SEO
        title="Choose Your CEFR Level"
        description="Select your English proficiency level — A1 to C2 — and start practicing with CEFR-aligned tests designed for your exact skill level."
        canonical="https://olimov.vercel.app/level"
      />
    <div className="level-selection-page relative min-h-screen site-bg overflow-hidden flex flex-col items-center px-4 py-16 mt-[80px]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-violet-700/20 blur-[60px] md:blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-cyan-700/20 blur-[60px] md:blur-[120px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="animate-fadeIn">
          <div className="mt-8 mb-12 text-center animate-fadeInUp">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-slate-400">
              {t('levels.badge')}
            </span>
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              {t('levels.title')}{' '}
              <span className="text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text">{t('levels.highlight')}</span>
            </h1>
            <p className="max-w-xl mx-auto text-base text-slate-400 sm:text-lg">
              {t('levels.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((level) => {
              const Icon = level.icon
              return (
                <button
                  key={level.code}
                  onClick={() => handleCardClick(level)}
                  className={`group relative text-left rounded-2xl border border-white/10 ${level.border} bg-white/[0.04] p-6 transition-colors duration-200 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 animate-fadeInUp`}
                >
                  <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${level.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${level.gradient} mb-4 shadow-lg`}>
                    <Icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${level.badge}`}>{level.label}</span>
                    <h3 className="text-base font-semibold text-white">{t('levels.' + level.code + '.name')}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{t('levels.' + level.code + '.desc')}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium transition-colors duration-200 text-slate-500 group-hover:text-white">
                    {t('levels.viewTests')}
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={!fetching ? handleCancel : undefined}
          />
          <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${selected.gradient} p-px shadow-2xl`}>
            <div className={`rounded-3xl bg-gradient-to-br ${selected.gradient} p-8 overflow-hidden`}>
              <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-10 -right-10 bg-white/10 blur-2xl" />
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 shadow-xl rounded-2xl bg-white/20 backdrop-blur-sm">
                  {(() => { const Icon = selected.icon; return <Icon size={36} className="text-white" strokeWidth={1.8} /> })()}
                </div>
              </div>
              <div className="mb-6 text-center">
                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest uppercase rounded-full bg-white/20 text-white/80">
                  {selected.label}
                </span>
                <h2 className="text-3xl font-bold text-white">{t('levels.' + selected.code + '.name')}</h2>
                <p className="mt-1 text-sm text-white/70">{t('levels.' + selected.code + '.desc')}</p>
              </div>
              <div className="flex gap-3 mb-6">
                <div className="flex-1 px-4 py-3 text-center rounded-2xl bg-black/20 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">30</p>
                  <p className="text-white/60 text-xs mt-0.5">{t('levels.questions')}</p>
                </div>
                <div className="flex-1 px-4 py-3 text-center rounded-2xl bg-black/20 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">4</p>
                  <p className="text-white/60 text-xs mt-0.5">{t('levels.questionTypes')}</p>
                </div>
              </div>
              {fetchError && (
                <p className="px-4 py-3 mb-4 text-xs text-center text-white/90 bg-black/20 rounded-xl">{fetchError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={fetching}
                  className="flex-1 py-3.5 rounded-2xl bg-black/20 backdrop-blur-sm text-white/80 font-semibold hover:bg-black/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('levels.cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={fetching}
                  className="flex-1 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-white/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fetching
                    ? <><Spinner size="xs" /> {t('levels.loading')}</>
                    : t('levels.start')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
