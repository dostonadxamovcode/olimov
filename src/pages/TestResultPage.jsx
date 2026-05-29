import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft, House as Home, ArrowCounterClockwise as RotateCcw, CaretDown as ChevronDown, CaretUp as ChevronUp } from '@phosphor-icons/react'
import { useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

function norm(str) {
  return (str || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function checkAnswer(question, answer) {
  if (answer === undefined || answer === null) return false
  if (!question.type) return answer === question.correctAnswer  // old format
  if (question.type === 'multiple_choice') {
    if (typeof answer === 'number') {
      return norm(question.options?.[answer]) === norm(question.correct_answer)
    }
    return norm(answer) === norm(question.correct_answer)
  }
  if (question.type === 'word_order') {
    if (!Array.isArray(answer) || !answer.length) return false
    return norm(answer.map(i => question.scrambled_words[i]).join(' ')) === norm(question.correct_answer)
  }
  return norm(answer) === norm(question.correct_answer)
}

function getDisplayAnswer(question, answer) {
  if (answer === undefined || answer === null) return '(bo\'sh)'
  if (!question.type) {
    return question.options?.[answer] ?? String(answer)
  }
  if (question.type === 'multiple_choice') {
    if (typeof answer === 'number') return question.options?.[answer] ?? String(answer)
    return String(answer)
  }
  if (question.type === 'word_order') {
    if (!Array.isArray(answer) || !answer.length) return '(bo\'sh)'
    return answer.map(i => question.scrambled_words[i]).join(' ')
  }
  return String(answer) || '(bo\'sh)'
}

export default function TestResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const { score, total, questions, answers, testTitle, level, testId } = location.state || {}

  if (!questions || !answers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
          <p className="text-slate-400 mb-6">Please complete a test to see your results.</p>
          <button 
            onClick={() => navigate('/tests')}
            className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Go to Tests
          </button>
        </div>
      </div>
    )
  }

  const correctCount = score
  const incorrectCount = total - score
  const percentage = Math.round((correctCount / total) * 100)

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-emerald-400'
    if (percentage >= 60) return 'text-blue-400'
    if (percentage >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-500/20 border-emerald-500/30'
    if (percentage >= 60) return 'bg-blue-500/20 border-blue-500/30'
    if (percentage >= 40) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  const handleRetakeTest = () => {
    if (testId === 'practice') {
      navigate('/tests/practice', {
        state: {
          levelId: level,
          testTitle,
          questions,
        },
      })
    } else {
      navigate(`/tests/${testId}`, {
        state: { levelId: level },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Test <span className="gradient-text">Results</span>
            </h1>
            <p className="text-gray-400">{testTitle || 'Test'}</p>
            <p className="text-sm text-slate-500 mt-1">Level: {level?.toUpperCase()}</p>
          </div>
        </div>

        {/* Score Summary Card */}
        <div className={`premium-card p-8 border ${getScoreBg(percentage)} mb-8`}>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
              {percentage}%
            </div>
            <p className="text-white text-lg font-semibold mb-6">
              {correctCount} to'g'ri / {incorrectCount} noto'g'ri
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-sm text-gray-400">Jami Savollar</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                <div className="text-sm text-gray-400">To'g'ri</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">{incorrectCount}</div>
                <div className="text-sm text-gray-400">Noto'g'ri</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/level')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                <Home className="w-4 h-4" /> Testlar
              </button>
              <button
                onClick={handleRetakeTest}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="w-4 h-4" /> Qayta yechish
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Batafsil Natijalar</h2>
          
          {questions.map((question, index) => {
            const selectedAnswer = answers[index]
            const isCorrect      = checkAnswer(question, selectedAnswer)
            const isExpanded     = expandedQuestions[index]
            const isNewFmt       = !!question.type

            return (
              <div
                key={index}
                className={`premium-card border transition-all duration-300 ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                {/* Question Header */}
                <div
                  className="p-5 cursor-pointer flex items-start gap-4"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-400">
                        Savol {index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {isCorrect ? "To'g'ri" : "Noto'g'ri"}
                      </span>
                    </div>
                    <p className="text-white font-medium line-clamp-2">
                      {question.text || question.title || question.question}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/10 pt-4">
                    {/* Multiple Choice options (old format OR new MC format) */}
                    {question.options && (
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => {
                          const correctIdx  = isNewFmt
                            ? question.options.indexOf(question.correct_answer)
                            : question.correctAnswer
                          const isSelected     = selectedAnswer === optIndex
                          const isCorrectOption = correctIdx === optIndex

                          let optionClass = "p-4 rounded-xl border-2 "
                          if (isCorrectOption)          optionClass += "border-emerald-500 bg-emerald-500/20"
                          else if (isSelected && !isCorrect) optionClass += "border-red-500 bg-red-500/20"
                          else                          optionClass += "border-slate-600 bg-slate-700/30"

                          return (
                            <div key={optIndex} className={optionClass}>
                              <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  isCorrectOption          ? 'bg-emerald-500 text-white'
                                  : isSelected && !isCorrect ? 'bg-red-500 text-white'
                                  : 'bg-slate-600 text-slate-300'
                                }`}>
                                  {LETTERS[optIndex]}
                                </span>
                                <span className={`font-medium ${
                                  isCorrectOption          ? 'text-emerald-300'
                                  : isSelected && !isCorrect ? 'text-red-300'
                                  : 'text-slate-300'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectOption && (
                                  <span className="ml-auto text-xs font-semibold text-emerald-400">To'g'ri javob</span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="ml-auto text-xs font-semibold text-red-400">Siz tanlagan</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Text / Translation / Word Order — show answer as text */}
                    {isNewFmt && !question.options && (
                      <div className="space-y-2">
                        <div className={`p-3 rounded-xl border text-sm ${
                          isCorrect ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'
                        }`}>
                          <span className="text-slate-400 text-xs">Sizning javobingiz: </span>
                          <span className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                            {getDisplayAnswer(question, selectedAnswer)}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm">
                            <span className="text-slate-400 text-xs">To'g'ri javob: </span>
                            <span className="font-semibold text-emerald-300">{question.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Old format explanation */}
                    {!isNewFmt && !isCorrect && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-300">
                          <span className="font-semibold">Tushuntirish:</span> To'g'ri javob{' '}
                          <span className="font-bold">{LETTERS[question.correctAnswer]}</span> varianti.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}