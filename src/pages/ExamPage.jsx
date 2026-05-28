import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { saveResult } from '../services/firestore'
import { getTestQuestions } from '../services/questionPoolService'
import { useAuth } from '../context/AuthContext'
import { Clock, X, ChevronRight, AlertCircle } from 'lucide-react'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'

// ── Timer ────────────────────────────────────────────────────────────────────
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

export default function ExamPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [test, setTest] = useState(null)
  const [levelId, setLevelId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const { display: timerDisplay, secs } = useTimer(60 * 60)

  useEffect(() => {
    const fetchTest = async () => {
      // Practice mode: questions passed directly via navigation state
      if (location.state?.questions?.length > 0) {
        setLevelId(location.state.levelId || 'a1')
        setTest({
          title: location.state.testTitle || 'Mashq',
          questions: location.state.questions,
        })
        setLoading(false)
        return
      }

      if (!testId || testId === 'practice') {
        setError('Test ID is required')
        setLoading(false)
        return
      }

      // Get levelId from navigation state or try to detect it
      let detectedLevelId = location.state?.levelId

      if (!detectedLevelId) {
        // Try to detect level by searching through all level collections
        for (const level of LEVEL_COLLECTIONS) {
          const collectionName = `${level}Tests`

          try {
            const docRef = doc(db, collectionName, testId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
              detectedLevelId = level
              break
            }
          } catch (err) {
            console.warn(`Failed to check ${collectionName}:`, err)
            continue
          }
        }
      }

      if (!detectedLevelId) {
        setError("Test topilmadi. Darajalar sahifasiga qaytib urinib ko'ring.")
        toastError("Test topilmadi.")
        setLoading(false)
        return
      }

      setLevelId(detectedLevelId)

      const collectionName = `${detectedLevelId}Tests`

      try {
        const docRef = doc(db, collectionName, testId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          setError("Test topilmadi. Darajalar sahifasiga qaytib urinib ko'ring.")
          toastError("Test topilmadi.")
          setLoading(false)
          return
        }

        const testData = { id: docSnap.id, ...docSnap.data() }

        if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
          setError("Bu testda haqiqiy savollar mavjud emas.")
          toastError("Test strukturasi noto'g'ri.")
          setLoading(false)
          return
        }

        // Use question pool if available, otherwise use test's own questions
        const questionResult = await getTestQuestions(testData, detectedLevelId)
        const finalTestData = {
          ...testData,
          questions: questionResult.questions,
          questionSource: questionResult.source,
          poolSize: questionResult.poolSize
        }

        setTest(finalTestData)
      } catch (err) {
        setError("Testni yuklashda xatolik yuz berdi.")
        toastError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, location.state])

  // Handle answer selection with auto-advance
  const handleSelectAnswer = (questionIndex, answerIndex) => {
    setSelected(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))

    // Auto-advance to next question
    if (current < test.questions.length - 1) {
      setTimeout(() => {
        setCurrent(prev => prev + 1)
      }, 150)
    }
  }

  // Handle next question
  const handleNext = () => {
    if (current < test.questions.length - 1) {
      setCurrent(prev => prev + 1)
    } else {
      // All questions answered, submit final result
      handleFinalSubmit()
    }
  }

  // Handle previous question
  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(prev => prev - 1)
    }
  }

  // Final submission
  const handleFinalSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    const questions = test?.questions ?? []

    // Calculate all results at the end
    let score = 0
    const results = {}

    questions.forEach((question, index) => {
      const selectedAnswer = selected[index]
      const isCorrect = selectedAnswer === question.correctAnswer

      if (isCorrect) {
        score++
      }

      results[index] = {
        selected: selectedAnswer,
        correct: question.correctAnswer,
        isCorrect: isCorrect
      }
    })

    try {
      await saveResult({
        userId: user?.uid ?? 'anonymous',
        testId,
        testTitle: test.title,
        level: levelId,
        score,
        total: questions.length,
        answers: selected,
      })
      toastSuccess("Test muvaffaqiyatli topshirildi.")
    } catch (err) {
      toastError("Natijani saqlashda xatolik, lekin natijangiz ko'rsatilmoqda.")
      // Continue to results page even if save fails
    }

    navigate('/test-result', {
      state: {
        score,
        total: questions.length,
        questions,
        answers: selected,
        testTitle: test.title,
        level: levelId,
        testId,
      },
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
        <h2 className="text-xl font-bold text-white mb-2">Test Not Found</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => navigate(`/levels/${levelId || 'a1'}`)}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Back to Level
          </button>
          <button 
            onClick={() => navigate('/level')}
            className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
          >
            All Levels
          </button>
        </div>
      </div>
    </div>
  )

  const questions = test?.questions ?? []
  const total = questions.length
  const q = questions[current]

  if (total === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-slate-400 mb-4">This test has no questions yet.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:underline text-sm">← Go back</button>
      </div>
    </div>
  )

  const progress = ((current + 1) / total) * 100
  const isLow = secs < 300

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 shrink-0 w-14">
            {current + 1}<span className="font-normal text-slate-500">/{total}</span>
          </span>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              style={{ width: `${progress}%` }} />
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
            <Clock className="w-3.5 h-3.5" /> {timerDisplay}
          </div>
          {!loading && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div key={current}
            className="animate-fadeIn">

              <div className="bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/50 p-6 sm:p-10 border border-slate-700">
                {/* Question number + text */}
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  {current + 1}-savol
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-snug">
                  {q.text || q.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {q.options?.map((opt, idx) => {
                    const isSelected = selected[current] === idx

                    const buttonClass = `w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-indigo-400 hover:bg-indigo-500/10'
                    }`

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(current, idx)}
                        className={buttonClass}
                      >
                        <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-600 border-2 border-slate-500 text-slate-300'
                        }`}>
                          {LETTERS[idx]}
                        </span>
                        <span className={`font-medium text-sm sm:text-base ${
                          isSelected ? 'text-indigo-300' : 'text-slate-200'
                        }`}>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end mt-6 px-1">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
                >
                  {current < total - 1 ? (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    'Finish Test'
                  )}
                </button>
              </div>
            </div>
        </div>
      </main>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Testdan chiqasizmi?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Jarayoningiz saqlanmaydi. Darajalar sahifasiga qaytasiz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Davom etish
              </button>
              <button
                onClick={() => navigate('/level')}
                className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-colors"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}