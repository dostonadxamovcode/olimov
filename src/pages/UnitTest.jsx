import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, BookOpen, ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { SectionLoader } from '../components/common/Loader'

export default function UnitTest() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    async function fetchUnit() {
      try {
        setLoading(true)
        setError(null)
        const unitRef = doc(db, 'unitTests', unitId)
        const unitDoc = await getDoc(unitRef)
        
        if (unitDoc.exists()) {
          setUnit({ id: unitDoc.id, ...unitDoc.data() })
        } else {
          setError('Unit not found')
        }
      } catch (err) {
        console.error('Error fetching unit:', err)
        setError('Failed to load unit. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUnit()
  }, [unitId])

  const handleAnswerChange = (exerciseId, value) => {
    setAnswers(prev => ({
      ...prev,
      [exerciseId]: value
    }))
  }

  const handleSubmit = () => {
    if (!unit) return

    let correct = 0
    const detailedResults = []

    unit.exercises.forEach((exercise, index) => {
      const userAnswer = answers[exercise.id]
      let isCorrect = false
      
      if (exercise.type === 'true_false') {
        isCorrect = userAnswer === (exercise.answer ? 'true' : 'false')
      } else {
        isCorrect = userAnswer?.trim().toLowerCase() === exercise.answer.toString().trim().toLowerCase()
      }
      
      if (isCorrect) correct++

      detailedResults.push({
        id: exercise.id,
        type: exercise.type,
        question: exercise.question,
        userAnswer: userAnswer,
        correctAnswer: exercise.answer,
        isCorrect: isCorrect,
        index: index
      })
    })

    setResults({
      total: unit.exercises.length,
      correct: correct,
      percentage: Math.round((correct / unit.exercises.length) * 100),
      details: detailedResults
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
        <SEO
          title="Unit Test"
          description="Practice grammar exercises"
          canonical="https://olimov.vercel.app/unit-test"
        />
        <div className="min-h-screen site-bg">
          <SectionLoader text="Loading unit test..." minH="100vh" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEO
          title="Unit Test"
          description="Practice grammar exercises"
          canonical="https://olimov.vercel.app/unit-test"
        />
        <div className="min-h-screen site-bg flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        </div>
      </>
    )
  }

  const allAnswered = unit.exercises.every(ex => answers[ex.id])

  return (
    <>
      <SEO
        title={`${unit.title} - Grammar Test`}
        description={`Practice ${unit.description} grammar exercises`}
        canonical={`https://olimov.vercel.app/unit-test/${unitId}`}
      />
      <div className="min-h-screen site-bg">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/practice-session')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <h1 className="text-xl font-bold text-white hidden sm:block">{unit.title}</h1>
              <h1 className="text-base font-bold text-white sm:hidden">{unit.title}</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {submitted && results ? (
            /* Results View */
            <div className="space-y-6">
              <div className="premium-card p-6 text-center">
                <div className="mb-4">
                  <div className={`text-6xl font-bold ${results.percentage >= 70 ? 'text-green-400' : results.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {results.percentage}%
                  </div>
                  <p className="text-slate-400 text-lg">
                    {results.correct} / {results.total} correct
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/practice-session')}
                    className="px-6 py-3 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    Back to Units
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {results.details.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      result.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <span className="text-slate-400 text-sm w-6 flex-shrink-0">{result.index + 1}.</span>
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm mb-1">{result.question}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-slate-400">
                          Your answer: <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                            {result.userAnswer || 'Not answered'}
                          </span>
                        </span>
                        {!result.isCorrect && (
                          <span className="text-slate-400">
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
            /* Questions View - Workbook Style */
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{unit.title}</h2>
                <p className="text-slate-400 mb-4">{unit.description}</p>
                <p className="text-slate-500 text-sm">{unit.exercises.length} exercises • Beginner</p>
              </div>

              <div className="space-y-4">
                {unit.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-start gap-3">
                    <span className="text-slate-400 text-sm w-6 flex-shrink-0">{index + 1}.</span>
                    
                    {exercise.type === 'fill_blank' && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-slate-300 text-base flex-wrap">
                          {exercise.question.split('____').map((part, i, arr) => (
                            <React.Fragment key={`${exercise.id}-part-${i}`}>
                              <span>{part}</span>
                              {i < arr.length - 1 && (
                                <input
                                  type="text"
                                  value={answers[exercise.id] || ''}
                                  onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                                  placeholder="____"
                                  className="w-32 px-2 py-1 rounded bg-white/5 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {exercise.type === 'multiple_choice' && (
                      <div className="flex-1">
                        <p className="text-slate-300 text-base mb-3">{exercise.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {exercise.options.map((option) => (
                            <label
                              key={`${exercise.id}-option-${option}`}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                answers[exercise.id] === option
                                  ? 'bg-blue-500/20 border-blue-500/50'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`exercise-${exercise.id}`}
                                value={option}
                                checked={answers[exercise.id] === option}
                                onChange={() => handleAnswerChange(exercise.id, option)}
                                className="w-4 h-4 text-blue-400 focus:ring-blue-500/50"
                              />
                              <span className="text-slate-300 text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {exercise.type === 'true_false' && (
                      <div className="flex-1">
                        <p className="text-slate-300 text-base mb-3">{exercise.question}</p>
                        <div className="flex gap-4">
                          <label
                            key={`${exercise.id}-true`}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                              answers[exercise.id] === 'true'
                                ? 'bg-blue-500/20 border-blue-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`exercise-${exercise.id}`}
                              value="true"
                              checked={answers[exercise.id] === 'true'}
                              onChange={() => handleAnswerChange(exercise.id, 'true')}
                              className="w-4 h-4 text-blue-400 focus:ring-blue-500/50"
                            />
                            <span className="text-slate-300 text-sm">True</span>
                          </label>
                          <label
                            key={`${exercise.id}-false`}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                              answers[exercise.id] === 'false'
                                ? 'bg-blue-500/20 border-blue-500/50'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`exercise-${exercise.id}`}
                              value="false"
                              checked={answers[exercise.id] === 'false'}
                              onChange={() => handleAnswerChange(exercise.id, 'false')}
                              className="w-4 h-4 text-blue-400 focus:ring-blue-500/50"
                            />
                            <span className="text-slate-300 text-sm">False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {exercise.type === 'negative' && (
                      <div className="flex-1">
                        <p className="text-slate-300 text-base mb-3">{exercise.question}</p>
                        <input
                          type="text"
                          value={answers[exercise.id] || ''}
                          onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                          placeholder="Type the negative sentence..."
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                      </div>
                    )}

                    {exercise.type === 'question' && (
                      <div className="flex-1">
                        <p className="text-slate-300 text-base mb-3">{exercise.question}</p>
                        <input
                          type="text"
                          value={answers[exercise.id] || ''}
                          onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                          placeholder="Type the question..."
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-[#030712]/95 backdrop-blur-sm border-t border-white/10 p-4">
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    allAnswered
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-90'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
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