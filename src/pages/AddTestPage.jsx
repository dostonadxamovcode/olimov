import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { Plus, Save, ArrowLeft, AlertCircle, X, CheckCircle, Trash2 } from '../lib/icons'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { ButtonSpinner } from '../components/common/Loader'
import CustomSelect from '../components/ui/CustomSelect'

const LEVELS = [
  { value: 'A1',    label: 'A1 - Beginner',          description: 'Basic words and simple phrases.' },
  { value: 'A2',    label: 'A2 - Elementary',         description: 'Simple conversations on familiar topics.' },
  { value: 'B1',    label: 'B1 - Pre-Intermediate',   description: 'Fluent interaction with native speakers.' },
  { value: 'B2',    label: 'B2 - Intermediate',       description: 'Handle most travel situations and describe experiences.' },
  { value: 'C1',    label: 'C1 - Advanced',           description: 'Fluent expression for social and professional use.' },
  { value: 'C2',    label: 'C2 - Proficient',         description: 'Near-native precision and fluency.' },
  { value: 'IELTS', label: 'IELTS' },
]

// "A1" → "a1Tests" | "IELTS" → "ielts"
const toCollection = (level) => {
  const l = level.toLowerCase()
  return l === 'ielts' ? 'ielts' : `${l}Tests`
}

const TEST_TYPES = [
  { value: 'multiple_choice', label: 'Type 1 — Multiple Choice' },
  { value: 'translation',     label: 'Type 2 — Translation' },
  { value: 'word_order',      label: 'Type 3 — Word Order' },
]

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const fieldCls = (hasErr) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    hasErr ? 'border-red-500/50' : 'border-white/10'
  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`

function Err({ children }) {
  return (
    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" /> {children}
    </p>
  )
}

export default function AddTestPage() {
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [errors,  setErrors]    = useState({})
  const [queue,   setQueue]     = useState([])

  // General fields (all types)
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('')
  const [level,    setLevel]    = useState('A1')
  const [testType, setTestType] = useState('multiple_choice')

  // Multiple choice
  const [options,          setOptions]          = useState(['', '', '', ''])
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0)

  // Translation — comma-separated accepted answers
  const [acceptedAnswers, setAcceptedAnswers] = useState('')

  // Word order
  const [correctSentence, setCorrectSentence] = useState('')
  const [scrambledWords,  setScrambledWords]  = useState([])
  const [wordInput,       setWordInput]       = useState('')

  const clearErr = (key) => setErrors(prev => ({ ...prev, [key]: '' }))

  const handleTypeChange = (newType) => {
    setTestType(newType)
    setOptions(['', '', '', ''])
    setCorrectOptionIdx(0)
    setAcceptedAnswers('')
    setCorrectSentence('')
    setScrambledWords([])
    setWordInput('')
    setErrors({})
  }

  const updateOption = (idx, val) => {
    setOptions(prev => prev.map((o, i) => (i === idx ? val : o)))
    clearErr(`option${idx}`)
  }

  const addWord = () => {
    const w = wordInput.trim()
    if (!w) return
    setScrambledWords(prev => [...prev, w])
    setWordInput('')
    clearErr('scrambledWords')
  }

  const removeWord = (idx) =>
    setScrambledWords(prev => prev.filter((_, i) => i !== idx))

  const validate = () => {
    const errs = {}
    if (!title.trim())    errs.title    = 'Title is required'
    if (!category.trim()) errs.category = 'Category is required'

    if (testType === 'multiple_choice') {
      options.forEach((o, i) => {
        if (!o.trim()) errs[`option${i}`] = `Option ${OPTION_LABELS[i]} is required`
      })
    } else if (testType === 'word_order') {
      if (!correctSentence.trim()) errs.correctSentence = 'Correct sentence is required'
      if (scrambledWords.length < 2) errs.scrambledWords = 'Add at least 2 scrambled words'
    } else {
      const answers = acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean)
      if (answers.length === 0) errs.acceptedAnswers = 'At least one accepted answer is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildDoc = () => {
    const base = {
      type:     testType,
      title:    title.trim(),
      category: category.trim().toUpperCase(),
    }
    if (testType === 'multiple_choice') {
      return {
        ...base,
        options:        options.map(o => o.trim()),
        correct_answer: options[correctOptionIdx].trim(),
      }
    }
    if (testType === 'word_order') {
      return {
        ...base,
        correct_answer:  correctSentence.trim(),
        scrambled_words: scrambledWords,
      }
    }
    const answers = acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean)
    return { ...base, acceptedAnswers: answers }
  }

  const resetForm = () => {
    setTitle('')
    setCategory('')
    setOptions(['', '', '', ''])
    setCorrectOptionIdx(0)
    setAcceptedAnswers('')
    setCorrectSentence('')
    setScrambledWords([])
    setWordInput('')
    setErrors({})
  }

  // Add current question to the queue (without saving to Firestore yet)
  const handleAddToQueue = () => {
    if (!validate()) {
      toastError("Saqlashdan oldin xatolarni to'g'rilang.")
      return
    }
    setQueue(prev => [...prev, { ...buildDoc(), _level: level }])
    setTitle('')
    setOptions(['', '', '', ''])
    setCorrectOptionIdx(0)
    setAcceptedAnswers('')
    setCorrectSentence('')
    setScrambledWords([])
    setWordInput('')
    setErrors({})
    toastSuccess("Savol ro'yxatga qo'shildi.")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // If queue has items, save everything (queue + current form if filled)
    const hasCurrent = title.trim()
    if (queue.length > 0 && !hasCurrent) {
      // Save only queued questions
      setLoading(true)
      try {
        await Promise.all(
          queue.map(q => {
            const { _level, ...doc } = q
            return addDoc(collection(db, toCollection(_level)), { ...doc, createdAt: serverTimestamp() })
          })
        )
        toastSuccess(`${queue.length} ta savol saqlandi.`)
        setQueue([])
        resetForm()
      } catch (err) {
        toastError(err)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!validate()) {
      toastError("Saqlashdan oldin xatolarni to'g'rilang.")
      return
    }
    setLoading(true)
    try {
      const allDocs = queue.length > 0
        ? [...queue, { ...buildDoc(), _level: level }]
        : [{ ...buildDoc(), _level: level }]

      await Promise.all(
        allDocs.map(q => {
          const { _level, ...doc } = q
          return addDoc(collection(db, toCollection(_level)), { ...doc, createdAt: serverTimestamp() })
        })
      )
      toastSuccess(`${allDocs.length} ta savol muvaffaqiyatli saqlandi.`)
      setQueue([])
      resetForm()
    } catch (err) {
      toastError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Add New Question</h1>
          <p className="text-slate-400">
            Fill in the fields and choose a type — the document will be saved to the selected level collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp">

          {/* ── General Info ── */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">General Information</h2>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category Badge *
              </label>
              <input
                type="text"
                value={category}
                onChange={e => { setCategory(e.target.value); clearErr('category') }}
                placeholder="e.g., DAYS, VOCABULARY, GRAMMAR"
                className={fieldCls(errors.category)}
              />
              {errors.category && <Err>{errors.category}</Err>}
            </div>

            {/* Level + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Level (Firestore Collection) *
                </label>
                <CustomSelect
                  value={level}
                  onValueChange={setLevel}
                  options={LEVELS}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Saves to <span className="text-blue-400 font-medium">"{toCollection(level)}"</span> collection
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Type *
                </label>
                <CustomSelect
                  value={testType}
                  onValueChange={handleTypeChange}
                  options={TEST_TYPES}
                />
              </div>
            </div>
          </div>

          {/* ── Type-specific Fields ── */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">
              {TEST_TYPES.find(t => t.value === testType)?.label}
            </h2>

            {/* Question Text — always visible */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Question Text *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); clearErr('title') }}
                placeholder="e.g., What day comes after Monday?"
                className={fieldCls(errors.title)}
              />
              {errors.title && <Err>{errors.title}</Err>}
            </div>

            {/* Multiple Choice */}
            {testType === 'multiple_choice' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Options — click the circle to mark the correct answer
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectOptionIdx(idx)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        correctOptionIdx === idx
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-white/30 text-slate-400 hover:border-white/60'
                      }`}
                    >
                      {correctOptionIdx === idx
                        ? <CheckCircle className="w-4 h-4" />
                        : OPTION_LABELS[idx]
                      }
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(idx, e.target.value)}
                      placeholder={`Option ${OPTION_LABELS[idx]}`}
                      className={`flex-1 px-4 py-2.5 rounded-lg bg-white/5 border ${
                        errors[`option${idx}`] ? 'border-red-500/50' : 'border-white/10'
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                    />
                    {correctOptionIdx === idx && (
                      <span className="text-xs text-green-400 w-16 flex-shrink-0">✓ Correct</span>
                    )}
                  </div>
                ))}
                {OPTION_LABELS.some((_, i) => errors[`option${i}`]) && (
                  <Err>All 4 options are required</Err>
                )}
              </div>
            )}

            {/* Translation */}
            {testType === 'translation' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Accepted Translations *
                </label>
                <input
                  type="text"
                  value={acceptedAnswers}
                  onChange={e => { setAcceptedAnswers(e.target.value); clearErr('acceptedAnswers') }}
                  placeholder="e.g., maktab, school, Maktab"
                  className={fieldCls(errors.acceptedAnswers)}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Vergul bilan ajrating — har biri to'g'ri javob hisoblanadi.{' '}
                  <span className="text-slate-400">Masalan: chiroyli, go'zal, husnli</span>
                </p>
                {errors.acceptedAnswers && <Err>{errors.acceptedAnswers}</Err>}
                {acceptedAnswers.trim() && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean).map((ans, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        {ans}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Word Order */}
            {testType === 'word_order' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Correct Sentence *
                  </label>
                  <input
                    type="text"
                    value={correctSentence}
                    onChange={e => { setCorrectSentence(e.target.value); clearErr('correctSentence') }}
                    placeholder="e.g., she is a teacher"
                    className={fieldCls(errors.correctSentence)}
                  />
                  {errors.correctSentence && <Err>{errors.correctSentence}</Err>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Scrambled Words *
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Type each word and press Enter or click Add.
                  </p>

                  {scrambledWords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {scrambledWords.map((word, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30"
                        >
                          {word}
                          <button
                            type="button"
                            onClick={() => removeWord(idx)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={wordInput}
                      onChange={e => setWordInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addWord() } }}
                      placeholder="Type a word, then press Enter"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={addWord}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {errors.scrambledWords && <Err>{errors.scrambledWords}</Err>}
                </div>
              </>
            )}
          </div>

          {/* ── Queue list ── */}
          {queue.length > 0 && (
            <div className="premium-card p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Added questions
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-400">{queue.length}</span>
              </p>
              {queue.map((q, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500 shrink-0">{i + 1}.</span>
                    <span className="text-sm text-white truncate">{q.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 shrink-0">{q.type?.replace('_', ' ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQueue(prev => prev.filter((_, j) => j !== i))}
                    className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Add Question button ── */}
          <button
            type="button"
            onClick={handleAddToQueue}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-white/15 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ButtonSpinner />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {queue.length > 0 ? `Save All (${queue.length + 1})` : 'Save Test'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
