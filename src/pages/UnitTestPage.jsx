import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import SEO from '../components/SEO'
import { SectionLoader } from '../components/common/Loader'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { waitForFirestoreReady } from '../utils/waitForFirestoreAuth'

const EXERCISE_INSTRUCTIONS = {
  fill_blank: 'Complete the sentence. Fill in the blank with the correct word or form.',
  multiple_choice: 'Choose the correct option. Select one answer from the choices below.',
  true_false: 'Decide if the statement is True or False.',
}

function getExerciseInstruction(exercise) {
  if (exercise.instruction?.trim()) return exercise.instruction.trim()
  return EXERCISE_INSTRUCTIONS[exercise.type] || 'Read the question carefully and write your answer.'
}

export default function UnitTestPage() {
  const { level, unitId } = useParams()
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function fetchUnit() {
      try {
        setLoading(true)
        setError(null)
        await waitForFirestoreReady()
        if (cancelled) return

        const unitDoc = await getDoc(doc(db, 'unitTests', unitId))

        if (unitDoc.exists()) {
          const data = { id: unitDoc.id, ...unitDoc.data() }
          if ((data.level || 'beginner') !== level) {
            setError('Unit not found')
            return
          }
          setUnit(data)
        } else {
          setError('Unit not found')
        }
      } catch (err) {
        console.error('Failed loading unitTests', err)
        if (!cancelled) setError('Failed to load unit tests')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUnit()
    return () => {
      cancelled = true
    }
  }, [authLoading, level, unitId])

  const handleAnswerChange = (exerciseId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [exerciseId]: value,
    }))
  }

  const handleSubmit = () => {
    if (!unit) return

    const validExercises = (unit.exercises || []).filter((exercise) =>
      ['fill_blank', 'multiple_choice', 'true_false'].includes(exercise.type),
    )

    let correct = 0
    const detailedResults = []

    validExercises.forEach((exercise, index) => {
      const userAnswer = answers[exercise.id]
      const isTrueFalse = exercise.type === 'true_false'
      const isCorrect = isTrueFalse
        ? userAnswer === (exercise.answer ? 'true' : 'false')
        : userAnswer?.trim().toLowerCase() === exercise.answer.toString().trim().toLowerCase()

      if (isCorrect) correct++

      detailedResults.push({
        id: exercise.id,
        type: exercise.type,
        question: exercise.question,
        userAnswer,
        correctAnswer: exercise.answer,
        isCorrect,
        index,
      })
    })

    setResults({
      total: validExercises.length,
      correct,
      percentage: validExercises.length > 0 ? Math.round((correct / validExercises.length) * 100) : 0,
      details: detailedResults,
    })
    setSubmitted(true)
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setResults(null)
  }

  if (loading) {
    return (
      <>
        <SEO title="Unit Test" description="Practice grammar exercises" canonical="https://olimov.vercel.app/unit-tests" />
        <div className="min-h-screen site-bg">
          <SectionLoader text="Loading..." minH="100vh" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEO title="Unit Test" description="Practice grammar exercises" canonical={`https://olimov.vercel.app/unit-tests/${level}/${unitId}`} />
        <div className="min-h-screen site-bg flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => navigate(`/unit-tests/${level}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Level
            </button>
          </div>
        </div>
      </>
    )
  }

  const validExercises = (unit.exercises || []).filter((exercise) =>
    ['fill_blank', 'multiple_choice', 'true_false'].includes(exercise.type),
  )
  const allAnswered = validExercises.every((ex) => answers[ex.id])

  return (
    <>
      <SEO
        title={`${unit.title} - Grammar Test`}
        description={`Practice ${unit.description} grammar exercises`}
        canonical={`https://olimov.vercel.app/unit-tests/${level}/${unitId}`}
      />
      <div className="min-h-screen site-bg">
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#030712]/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate(`/unit-tests/${level}`)}
                className="flex shrink-0 items-center gap-2 text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />
              <h1 className="truncate text-base font-bold text-white sm:text-xl">{unit.title}</h1>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
          {submitted && results ? (
            <div className="space-y-6">
              <div className="premium-card p-4 text-center sm:p-6">
                <div className="mb-4">
                  <div className={`text-5xl font-bold sm:text-6xl ${results.percentage >= 70 ? 'text-green-400' : results.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {results.percentage}%
                  </div>
                  <p className="text-lg text-slate-400">
                    {results.correct} / {results.total} correct
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                  <button
                    onClick={handleReset}
                    className="w-full rounded-lg bg-blue-500/20 px-6 py-3 text-blue-400 transition-colors hover:bg-blue-500/30 sm:w-auto"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate(`/unit-tests/${level}`)}
                    className="w-full rounded-lg bg-white/5 px-6 py-3 text-slate-300 transition-colors hover:bg-white/10 sm:w-auto"
                  >
                    Back to Units
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {results.details.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${result.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}
                  >
                    <span className="w-6 flex-shrink-0 text-sm text-slate-400">{result.index + 1}.</span>
                    {result.isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" /> : <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />}
                    <div className="flex-1">
                      <p className="mb-1 break-words text-sm text-white">{result.question}</p>
                      <div className="flex flex-col gap-1 text-xs sm:flex-row sm:gap-4">
                        <span className="break-words text-slate-400">
                          Your answer: <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>{result.userAnswer || 'Not answered'}</span>
                        </span>
                        {!result.isCorrect && (
                          <span className="break-words text-slate-400">
                            Correct: <span className="text-green-400">{result.correctAnswer}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="premium-card p-4 sm:p-6">
                <h2 className="mb-2 break-words text-xl font-bold text-white sm:text-2xl">{unit.title}</h2>
                <p className="mb-4 break-words text-slate-400">{unit.description}</p>
                {unit.instructions && <p className="mb-3 text-sm leading-relaxed text-blue-300/90">{unit.instructions}</p>}
                <p className="text-sm text-slate-500">{validExercises.length} exercises • {unit.level || 'beginner'}</p>
              </div>

              <div className="space-y-4">
                {validExercises.map((exercise, filteredIndex) => {
                  const prevType = filteredIndex > 0 ? validExercises[filteredIndex - 1].type : null
                  const showTypeInstruction = exercise.type !== prevType

                  return (
                    <div key={exercise.id}>
                      {showTypeInstruction && (
                        <p className="mb-3 mt-2 text-sm font-medium text-blue-400/90 first:mt-0">
                          {getExerciseInstruction(exercise)}
                        </p>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="w-6 flex-shrink-0 text-sm text-slate-400">{filteredIndex + 1}.</span>
                        <div className="min-w-0 flex-1">
                          {exercise.type === 'fill_blank' && (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 sm:text-base">
                              {exercise.question.split('____').map((part, i, arr) => (
                                <React.Fragment key={`${exercise.id}-part-${i}`}>
                                  <span className="break-words">{part}</span>
                                  {i < arr.length - 1 && (
                                    <input
                                      type="text"
                                      value={answers[exercise.id] || ''}
                                      onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                                      placeholder="____"
                                      className="w-full max-w-[10rem] rounded border border-white/20 bg-white/5 px-2 py-1 text-center text-white placeholder-slate-500 transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-32"
                                    />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          )}

                          {exercise.type === 'multiple_choice' && (
                            <>
                              <p className="mb-3 break-words text-base text-slate-300">{exercise.question}</p>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {exercise.options.map((option) => (
                                  <label
                                    key={`${exercise.id}-option-${option}`}
                                    className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all ${answers[exercise.id] === option ? 'border-blue-500/50 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`exercise-${exercise.id}`}
                                      value={option}
                                      checked={answers[exercise.id] === option}
                                      onChange={() => handleAnswerChange(exercise.id, option)}
                                      className="h-4 w-4 text-blue-400 focus:ring-blue-500/50"
                                    />
                                    <span className="min-w-0 break-words text-sm text-slate-300">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </>
                          )}

                          {exercise.type === 'true_false' && (
                            <>
                              <p className="mb-3 break-words text-base text-slate-300">{exercise.question}</p>
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <label className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-all sm:w-auto ${answers[exercise.id] === 'true' ? 'border-blue-500/50 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                  <input
                                    type="radio"
                                    name={`exercise-${exercise.id}`}
                                    value="true"
                                    checked={answers[exercise.id] === 'true'}
                                    onChange={() => handleAnswerChange(exercise.id, 'true')}
                                    className="h-4 w-4 text-blue-400 focus:ring-blue-500/50"
                                  />
                                  <span className="text-sm text-slate-300">True</span>
                                </label>
                                <label className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-all sm:w-auto ${answers[exercise.id] === 'false' ? 'border-blue-500/50 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                  <input
                                    type="radio"
                                    name={`exercise-${exercise.id}`}
                                    value="false"
                                    checked={answers[exercise.id] === 'false'}
                                    onChange={() => handleAnswerChange(exercise.id, 'false')}
                                    className="h-4 w-4 text-blue-400 focus:ring-blue-500/50"
                                  />
                                  <span className="text-sm text-slate-300">False</span>
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="sticky bottom-0 border-t border-white/10 bg-[#030712]/95 p-4 backdrop-blur-sm">
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`w-full rounded-lg py-3 font-semibold transition-all ${
                    allAnswered
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-90'
                      : 'cursor-not-allowed bg-white/5 text-slate-500'
                  }`}
                >
                  Submit Answers
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
