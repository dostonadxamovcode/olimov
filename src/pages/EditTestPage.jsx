import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { Plus, Save, ArrowLeft, AlertCircle, X, CheckCircle } from '../lib/icons'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { ButtonSpinner } from '../components/common/Loader'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'
import CustomSelect from '../components/ui/CustomSelect'

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

// Derive display label from collection name
const levelLabel = (col) => {
  if (!col) return ''
  if (col.endsWith('Tests')) return col.replace('Tests', '').toUpperCase()
  return col.toUpperCase()
}

export default function EditTestPage() {
  const { t } = useTranslation()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { id: paramId } = useParams()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})

  // Test identity
  const [testId,         setTestId]         = useState(null)
  const [collectionName, setCollectionName] = useState(null)

  // General fields
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('')
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

  // ── Load test (state first, Firebase fallback) ────────────────────────────────

  useEffect(() => {
    const fill = (test) => {
      setTestId(test.id)
      setCollectionName(test.collectionName)
      setTitle(test.title || '')
      setCategory(test.category || '')
      setTestType(test.type === 'text_input' ? 'translation' : (test.type || 'multiple_choice'))

      if (test.type === 'multiple_choice') {
        const opts = test.options || ['', '', '', '']
        setOptions([...opts, ...Array(4).fill('')].slice(0, 4))
        const idx = opts.findIndex(o => o === test.correct_answer)
        setCorrectOptionIdx(idx >= 0 ? idx : 0)
      } else if (test.type === 'word_order') {
        setCorrectSentence(test.correct_answer || '')
        setScrambledWords(test.scrambled_words || [])
      } else {
        // Migration: acceptedAnswers array → joined string; fallback to legacy correct_answer
        if (test.acceptedAnswers?.length) {
          setAcceptedAnswers(test.acceptedAnswers.join(', '))
        } else {
          setAcceptedAnswers(test.correct_answer || '')
        }
      }

      setLoading(false)
    }

    const stateTest = location.state?.test
    if (stateTest) {
      fill(stateTest)
      return
    }

    // Fallback: fetch from Firebase using URL params
    const col = searchParams.get('col')
    const id  = paramId
    if (!col || !id) {
      toastError("Test ma'lumotlari topilmadi.")
      navigate('/admin/tests')
      return
    }

    getDoc(doc(db, col, id))
      .then(snap => {
        if (!snap.exists()) {
          toastError("Test ma'lumotlar bazasida topilmadi.")
          navigate('/admin/tests')
          return
        }
        fill({ id: snap.id, collectionName: col, ...snap.data() })
      })
      .catch(() => {
        toastError("Testni ma'lumotlar bazasidan yuklashda xatolik.")
        navigate('/admin/tests')
      })
  }, [location.state, paramId, searchParams, navigate])

  // ── Helpers ───────────────────────────────────────────────────────────────────

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

  // ── Validation ────────────────────────────────────────────────────────────────

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

  // ── Build updated doc ─────────────────────────────────────────────────────────

  const buildDoc = () => {
    const base = {
      type:     testType,
      title:    title.trim(),
      category: category.trim().toUpperCase(),
    }
    if (testType === 'multiple_choice') {
      return { ...base, options: options.map(o => o.trim()), correct_answer: options[correctOptionIdx].trim() }
    }
    if (testType === 'word_order') {
      return { ...base, correct_answer: correctSentence.trim(), scrambled_words: scrambledWords }
    }
    const answers = acceptedAnswers.split(',').map(s => s.trim()).filter(Boolean)
    return { ...base, acceptedAnswers: answers }
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toastError("Saqlashdan oldin xatolarni to'g'rilang.")
      return
    }
    setSaving(true)
    try {
      await updateDoc(doc(db, collectionName, testId), {
        ...buildDoc(),
        updatedAt: serverTimestamp(),
      })
      toastSuccess("Test muvaffaqiyatli yangilandi.")
      setTimeout(() => navigate('/admin/tests'), 1000)
    } catch (err) {
      console.error('Error updating test:', err)
      toastError(err)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen site-bg flex items-center justify-center mt-[60px]">
        <LoadingSpinner text={t('profile.loading')} />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Edit Question</h1>
          <p className="text-slate-400">
            Update the fields below — saving will overwrite the existing document.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp">

          {/* ── General Info ── */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">General Information</h2>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category Badge *</label>
              <input
                type="text"
                value={category}
                onChange={e => { setCategory(e.target.value); clearErr('category') }}
                placeholder="e.g., DAYS, VOCABULARY, GRAMMAR"
                className={fieldCls(errors.category)}
              />
              {errors.category && <Err>{errors.category}</Err>}
            </div>

            {/* Level (read-only) + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level (Collection)</label>
                <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm">
                  {levelLabel(collectionName)}
                </div>
                <p className="mt-1 text-xs text-slate-500">Collection cannot be changed when editing</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Test Type *</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Question Text *</label>
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
                      {correctOptionIdx === idx ? <CheckCircle className="w-4 h-4" /> : OPTION_LABELS[idx]}
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Accepted Translations *</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Correct Sentence *</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Scrambled Words *</label>
                  <p className="text-xs text-slate-500 mb-3">Type each word and press Enter or click Add.</p>

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

          {/* ── Actions ── */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/tests')}
              className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <ButtonSpinner />
                  Yangilanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Update Test
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
