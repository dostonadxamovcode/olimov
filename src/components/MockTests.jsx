import React, { useEffect, useState } from 'react'
import { ChevronRight, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { mockTestQuestions } from '../data/siteData'
import { getMockTestQuestions } from '../services/questions'
import { LoadingSpinner } from './ui/SkeletonLoader'

export default function MockTests() {
  const { t } = useTranslation()
  const [questions, setQuestions] = useState(mockTestQuestions)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    getMockTestQuestions()
      .then((firebaseQuestions) => {
        if (!active) return

        if (firebaseQuestions.length > 0) {
          setQuestions(firebaseQuestions)
          setCurrent(0)
          setSelected({})
          setSubmitted(false)
        }
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error.message || 'Could not load Firebase questions.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const question = questions[current]
  const total = questions.length

  const handleSelect = (idx) => {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [current]: idx }))
  }

  const handleNext = () => {
    if (current < total - 1) setCurrent((c) => c + 1)
  }

  const handleSubmit = () => setSubmitted(true)

  const handleReset = () => {
    setCurrent(0)
    setSelected({})
    setSubmitted(false)
  }

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (selected[i] === q.correct ? 1 : 0), 0)
    : 0

  const band = submitted ? (score >= 5 ? '7.0–8.0' : score >= 3 ? '5.5–6.5' : '4.0–5.0') : null

  return (
    <section id="mock-tests" tabIndex={-1} data-scroll-highlight className="section-deep py-14 outline-none">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#0ea5e9]/08 blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="gold-badge mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>{t('mockTestComp.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {t('mockTestComp.title')} <span className="gradient-text">{t('mockTestComp.highlight')}</span>
          </h2>
        </div>

        {loading ? (
          <div className="premium-card p-6 text-center animate-scale-in">
            <LoadingSpinner size="md" text={t('mockTestComp.loading')} />
          </div>
        ) : loadError ? (
          <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
            {t('mockTestComp.loadError')}
          </div>
        ) : null}

        {submitted ? (
          <div className="premium-card p-6 text-center animate-scale-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6]">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{score}/{total} {t('mockTestComp.correct')}</h3>
            <p className="text-gray-400 mb-4">{t('mockTestComp.bandScore')}</p>
            <div className="gradient-text mb-8 text-4xl font-bold">{band}</div>
            <button onClick={handleReset} className="btn-primary">
              {t('mockTestComp.tryAgain')}
            </button>
          </div>
        ) : question ? (
          <div className="premium-card p-6 animate-scale-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-[#0ea5e9]">{t('mockTestComp.badge')} {current + 1} / {total}</span>
                <div className="w-full ml-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#f43f5e] transition-[width] duration-300" style={{ width: `${((current + 1) / total) * 100}%` }} />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-6">{question.question}</h3>

            <div className="space-y-3 mb-8">
              {question.options.map((opt, idx) => {
                const isSelected = selected[current] === idx
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-[background-color,border-color] duration-200 ${
                      isSelected
                        ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/10 text-white'
                        : 'border-white/10 bg-[#030712]/55 text-gray-200 hover:border-[#0ea5e9]/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                        isSelected
                          ? 'border-[#0ea5e9] bg-[#0ea5e9] text-[#030712]'
                          : 'border-white/30 text-white'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between gap-3">
              {current > 0 ? (
                <button
                  onClick={() => setCurrent((c) => c - 1)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  {t('mockTestComp.prev')}
                </button>
              ) : <div />}

              {current < total - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selected[current] === undefined}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('mockTestComp.next')} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={selected[current] === undefined}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('mockTestComp.submit')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="premium-card p-6 text-center text-gray-300 animate-scale-in">
            {t('mockTestComp.noQuestions')}
          </div>
        )}
      </div>
    </section>
  )
}
