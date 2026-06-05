import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { saveResult } from '../services/firestore'
import { getTestQuestions } from '../services/questionPoolService'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Clock, X, ChevronRight, AlertCircle, Check } from 'lucide-react'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'

function useTimer(initial) {
  const [secs, setSecs] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return { display: `${mm}:${ss}`, secs }
}

const LETTERS = ['A', 'B', 'C', 'D']
const LEVEL_COLLECTIONS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']

const TYPE_CLASSES = {
  multiple_choice: 'bg-orange-500/10 border-orange-500/25 text-orange-300',
  text_input:      'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  translation:     'bg-blue-500/10 border-blue-500/25 text-blue-300',
  word_order:      'bg-violet-500/10 border-violet-500/25 text-violet-300',
}

function norm(str) {
  return (str || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!,?؟]+$/, '')
}

export function calcIsCorrect(question, answer) {
  if (answer === undefined || answer === null) return false
  if (!question.type) return answer === question.correctAnswer
  if (question.type === 'multiple_choice') {
    if (typeof answer === 'number') {
      return norm(question.options?.[answer]) === norm(question.correct_answer)
    }
    return norm(answer) === norm(question.correct_answer)
  }
  if (question.type === 'word_order') {
    if (!Array.isArray(answer) || answer.length === 0) return false
    const sentence = answer.map(i => question.scrambled_words[i]).join(' ')
    return norm(sentence) === norm(question.correct_answer)
  }
  if (question.type === 'translation') {
    const normalizedAnswer = norm(answer)
    const accepted = question.acceptedAnswers?.length
      ? question.acceptedAnswers
      : [question.correct_answer]
    return accepted.some(a => norm(a) === normalizedAnswer)
  }
  return norm(answer) === norm(question.correct_answer)
}

function WordOrderInput({ question, answer, onChange, t }) {
  const arranged  = answer || []
  const remaining = question.scrambled_words
    .map((_, i) => i)
    .filter(i => !arranged.includes(i))

  const add    = idx => onChange([...arranged, idx])
  const remove = pos => { const n = [...arranged]; n.splice(pos, 1); onChange(n) }
  const clear  = ()  => onChange([])

  const preview = arranged.length > 0
    ? arranged.map(i => question.scrambled_words[i]).join(' ')
    : null

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('exam.yourAnswer')}</p>
          {arranged.length > 0 && (
            <button onClick={clear} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
              <X className="w-3 h-3" /> {t('exam.clear')}
            </button>
          )}
        </div>
        <div className={`min-h-[52px] px-4 py-3 rounded-2xl border-2 border-dashed flex flex-wrap gap-2 items-center transition-colors ${
          arranged.length > 0 ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-600 bg-slate-700/30'
        }`}>
          {arranged.length === 0
            ? <span className="text-slate-500 text-sm italic">{t('exam.selectWords')}</span>
            : arranged.map((wordIdx, pos) => (
              <button
                key={`${pos}-${wordIdx}`}
                onClick={() => remove(pos)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all group"
              >
                {question.scrambled_words[wordIdx]}
                <span className="ml-1.5 opacity-40 group-hover:opacity-100">×</span>
              </button>
            ))
          }
        </div>
        {preview && (
          <p className="mt-1.5 text-xs text-slate-500 italic px-1">&ldquo;{preview}&rdquo;</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t('exam.wordBank')}</p>
        <div className="flex flex-wrap gap-2">
          {remaining.length === 0 && arranged.length > 0
            ? <span className="text-slate-500 text-sm italic">{t('exam.allWordsUsed')}</span>
            : remaining.map(idx => (
              <button
                key={idx}
                onClick={() => add(idx)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-sm font-medium hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
              >
                {question.scrambled_words[idx]}
              </button>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default function ExamPage() {
  const { t, i18n } = useTranslation()
  const { testId }  = useParams()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user }    = useAuth()

  const [test,            setTest]            = useState(null)
  const [levelId,         setLevelId]         = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [current,         setCurrent]         = useState(0)
  const [selected,        setSelected]        = useState({})
  const [submitting,      setSubmitting]      = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const { display: timerDisplay, secs } = useTimer(60 * 60)

  // --- EXAM SECURITY ---
  const mountedAtRef = useRef(Date.now())
  const terminatedRef = useRef(false)

  useEffect(() => {
    const terminateExam = () => {
      if (terminatedRef.current) return
      if (Date.now() - mountedAtRef.current < 500) return
      terminatedRef.current = true
      navigate('/exam-terminated')
      // Firestore update in background - don't block navigation
      if (testId && testId !== 'practice') {
        const levelForDoc = levelId || location.state?.levelId || 'a1'
        updateDoc(doc(db, `${levelForDoc}Tests`, testId), {
          status: 'terminated',
          terminatedReason: 'left_exam_environment',
          terminatedAt: serverTimestamp(),
        }).catch(() => {})
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') terminateExam()
    }
    const onPageHide = () => terminateExam()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [testId, levelId, navigate, location.state])
  // --- END EXAM SECURITY ---

  useEffect(() => {
    const fetchTest = async () => {
      if (location.state?.questions?.length > 0) {
        setLevelId(location.state.levelId || 'a1')
        setTest({
          title:     location.state.testTitle || t('exam.question'),
          questions: location.state.questions,
        })
        setLoading(false)
        return
      }

      if (!testId || testId === 'practice') {
        setError(t('exam.notFoundMsg'))
        setLoading(false)
        return
      }

      let detectedLevelId = location.state?.levelId

      if (!detectedLevelId) {
        for (const level of LEVEL_COLLECTIONS) {
          try {
            const snap = await getDoc(doc(db, `${level}Tests`, testId))
            if (snap.exists()) { detectedLevelId = level; break }
          } catch { continue }
        }
      }

      if (!detectedLevelId) {
        setError(t('exam.notFoundMsg'))
        toastError(t('exam.notFound'))
        setLoading(false)
        return
      }

      setLevelId(detectedLevelId)

      try {
        const snap = await getDoc(doc(db, `${detectedLevelId}Tests`, testId))
        if (!snap.exists()) {
          setError(t('exam.notFoundMsg'))
          setLoading(false)
          return
        }

        const testData = { id: snap.id, ...snap.data() }

        if (!testData.questions?.length) {
          setError(t('exam.noRealQuestions'))
          setLoading(false)
          return
        }

        const questionResult = await getTestQuestions(testData, detectedLevelId)
        setTest({ ...testData, questions: questionResult.questions })
      } catch (err) {
        setError(t('exam.loadError'))
        toastError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, location.state])

  const handleAnswer = (questionIndex, value) => {
    setSelected(prev => ({ ...prev, [questionIndex]: value }))
    const q = test?.questions?.[questionIndex]
    const isMC = !q?.type || q.type === 'multiple_choice'
    if (isMC && questionIndex < (test?.questions?.length ?? 0) - 1) {
      setTimeout(() => setCurrent(prev => prev + 1), 150)
    }
  }

  const handleNext = () => {
    if (current < (test?.questions?.length ?? 0) - 1) {
      setCurrent(prev => prev + 1)
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    const questions = test?.questions ?? []
    let score = 0
    questions.forEach((q, i) => {
      if (calcIsCorrect(q, selected[i])) score++
    })

    try {
      await saveResult({
        userId:    user?.uid ?? 'anonymous',
        testId,
        testTitle: test.title,
        level:     levelId,
        score,
        total:     questions.length,
        answers:   selected,
      })
      toastSuccess(t('exam.submitSuccess'))
    } catch {
      toastError(t('exam.submitError'))
    }

    navigate('/test-result', {
      state: { score, total: questions.length, questions, answers: selected, testTitle: test.title, level: levelId, testId },
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <LoadingSpinner />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t('exam.notFound')}</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/level')}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors">
            {t('exam.backToLevels')}
          </button>
          <button onClick={() => navigate('/level')}
            className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors">
            {t('exam.allLevels')}
          </button>
        </div>
      </div>
    </div>
  )

  const questions = test?.questions ?? []
  const total     = questions.length
  const q         = questions[current]

  if (total === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-slate-400 mb-4">{t('exam.noQuestions')}</p>
      </div>
    </div>
  )

  const lang      = i18n.language?.slice(0, 2) || 'en'
  const progress  = ((current + 1) / total) * 100
  const isLow     = secs < 300
  const isNewFmt  = !!q?.type
  const curAnswer = selected[current]
  const isLast    = current === total - 1

  const qText = q[`text_${lang}`] || q.text || q.title || q.question

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 flex-shrink-0"
            title={t('exam.exitModal.title')}
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-400 shrink-0 w-14 tabular-nums">
            {current + 1}<span className="font-normal text-slate-500">/{total}</span>
          </span>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            isLow ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5" /> {timerDisplay}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div key={current} className="animate-fadeIn">
            <div className="bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/50 p-6 sm:p-10 border border-slate-700">
              {isNewFmt && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {q.category && (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-white/[0.06] border border-white/10 text-slate-400">
                      {q.category}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  {t('exam.question')} {current + 1}
                </p>
                {isNewFmt && (
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${TYPE_CLASSES[q.type]}`}>
                    {t('exam.typeInstruction.' + q.type)}
                  </span>
                )}
              </div>

              {q.type !== 'translation' && (
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-snug">
                  {qText}
                </h2>
              )}

              {!isNewFmt && (
                <div className="space-y-3">
                  {q.options?.map((opt, idx) => {
                    const isSelected = curAnswer === idx
                    return (
                      <button key={idx} onClick={() => handleAnswer(current, idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors duration-150 ${
                          isSelected ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/20' : 'border-slate-600 bg-slate-700/50 hover:border-indigo-400 hover:bg-indigo-500/10'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-600 border-2 border-slate-500 text-slate-300'
                        }`}>
                          {isSelected ? <Check className="w-4 h-4" /> : LETTERS[idx]}
                        </span>
                        <span className={`font-medium text-sm sm:text-base ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {q.options?.map((opt, idx) => {
                    const isSelected = curAnswer === idx
                    return (
                      <button key={idx} onClick={() => handleAnswer(current, idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors duration-150 ${
                          isSelected ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/20' : 'border-slate-600 bg-slate-700/50 hover:border-indigo-400 hover:bg-indigo-500/10'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-600 border-2 border-slate-500 text-slate-300'
                        }`}>
                          {isSelected ? <Check className="w-4 h-4" /> : LETTERS[idx]}
                        </span>
                        <span className={`font-medium text-sm sm:text-base ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'text_input' && (
                <input
                  type="text"
                  value={curAnswer || ''}
                  onChange={e => handleAnswer(current, e.target.value)}
                  placeholder={t('exam.writePlaceholder')}
                  autoComplete="off" spellCheck="false"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-base"
                />
              )}

              {q.type === 'translation' && (
                <div className="space-y-5">
                  <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                      {t('exam.translatePhrase')}
                    </p>
                    <p className="text-white font-semibold text-lg leading-relaxed">{q[`title_${lang}`] || q.title}</p>
                  </div>
                  <input
                    type="text"
                    value={curAnswer || ''}
                    onChange={e => handleAnswer(current, e.target.value)}
                    placeholder={t('exam.translatePlaceholder')}
                    autoComplete="off" spellCheck="false"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-base"
                  />
                </div>
              )}

              {q.type === 'word_order' && (
                <WordOrderInput question={q} answer={curAnswer} onChange={val => handleAnswer(current, val)} t={t} />
              )}
            </div>

            <div className="flex items-center justify-end mt-6 px-1">
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {isLast
                  ? (submitting ? t('exam.submitting') : t('exam.finish'))
                  : <> {t('exam.next')} <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        </div>
      </main>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('exam.exitModal.title')}</h2>
            <p className="text-slate-400 text-sm mb-6">{t('exam.exitModal.message')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors">
                {t('exam.exitModal.continue')}
              </button>
              <button onClick={() => navigate('/level')}
                className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-colors">
                {t('exam.exitModal.exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
