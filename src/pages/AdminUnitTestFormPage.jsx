import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'pre-intermediate', label: 'Pre-Intermediate' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper-intermediate', label: 'Upper-Intermediate' },
]

const QUESTION_TYPES = [
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
]

export default function AdminUnitTestFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  
  const [formData, setFormData] = useState({
    unitNumber: '',
    title: '',
    description: '',
    level: 'beginner',
    order: 1,
    exercises: [],
  })

  const [questionForm, setQuestionForm] = useState({
    type: 'fill_blank',
    question: '',
    answer: '',
    options: ['', '', '', ''],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const isEdit = location.pathname.includes('/edit/')

    if (isEdit && location.state?.unit) {
      const unit = location.state.unit
      setFormData({
        unitNumber: unit.unitNumber || '',
        title: unit.title || '',
        description: unit.description || '',
        level: unit.level || 'beginner',
        order: unit.order || 1,
        exercises: unit.exercises || [],
      })
    }
  }, [location])

  const validateUnitForm = () => {
    const newErrors = {}

    if (!formData.unitNumber || formData.unitNumber.trim() === '') {
      newErrors.unitNumber = 'Unit number is required'
    }

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required'
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required'
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'Order must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateQuestionForm = () => {
    if (!questionForm.question.trim()) {
      toastError('Question is required')
      return false
    }
    
    if (!questionForm.answer.trim()) {
      toastError('Answer is required')
      return false
    }
    
    if (questionForm.type === 'multiple_choice') {
      const validOptions = questionForm.options.filter(opt => opt.trim() !== '')
      if (validOptions.length < 2) {
        toastError('Please provide at least 2 options for multiple choice')
        return false
      }
      if (!validOptions.includes(questionForm.answer.trim())) {
        toastError('The correct answer must be one of the options')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateUnitForm()) {
      return
    }

    setSaving(true)
    const isEdit = location.pathname.includes('/edit/')
    const unitId = location.pathname.split('/').pop()

    try {
      const { addDoc, updateDoc, doc, collection } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')

      const unitData = {
        unitNumber: parseInt(formData.unitNumber),
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: formData.level,
        order: parseInt(formData.order),
        exercises: formData.exercises || [],
        updatedAt: new Date(),
      }

      if (isEdit) {
        await updateDoc(doc(firestoreDb, 'unitTests', unitId), unitData)
        toastSuccess('Unit updated successfully')
      } else {
        await addDoc(collection(firestoreDb, 'unitTests'), {
          ...unitData,
          createdAt: new Date(),
        })
        toastSuccess('Unit created successfully')
      }

      navigate('/admin/unit-tests')
    } catch (error) {
      console.error('Error saving unit:', error)
      toastError(isEdit ? 'Failed to update unit' : 'Failed to create unit')
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = () => {
    if (!validateQuestionForm()) return

    setSaving(true)
    
    let newExercise
    
    if (questionForm.type === 'fill_blank') {
      newExercise = {
        id: `q_${Date.now()}`,
        type: 'fill_blank',
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
      }
    } else if (questionForm.type === 'multiple_choice') {
      newExercise = {
        id: `q_${Date.now()}`,
        type: 'multiple_choice',
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
        options: questionForm.options.filter(opt => opt.trim() !== ''),
      }
    } else if (questionForm.type === 'true_false') {
      newExercise = {
        id: `q_${Date.now()}`,
        type: 'true_false',
        question: questionForm.question.trim(),
        answer: questionForm.answer.toLowerCase() === 'true',
      }
    }

    setFormData(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), newExercise],
    }))

    resetQuestionForm()
    setShowQuestionModal(false)
    setSaving(false)
    toastSuccess('Question added')
  }

  const handleEditQuestion = (exercise) => {
    setEditingQuestion(exercise)
    
    if (exercise.type === 'multiple_choice') {
      setQuestionForm({
        type: exercise.type,
        question: exercise.question,
        answer: exercise.answer,
        options: exercise.options || ['', '', '', ''],
      })
    } else if (exercise.type === 'true_false') {
      setQuestionForm({
        type: exercise.type,
        question: exercise.question,
        answer: exercise.answer ? 'true' : 'false',
        options: ['', '', '', ''],
      })
    } else {
      setQuestionForm({
        type: exercise.type,
        question: exercise.question,
        answer: exercise.answer,
        options: ['', '', '', ''],
      })
    }
    
    setShowQuestionModal(true)
  }

  const handleUpdateQuestion = () => {
    if (!validateQuestionForm()) return

    setSaving(true)
    
    let updatedExercise
    
    if (questionForm.type === 'fill_blank') {
      updatedExercise = {
        id: editingQuestion.id,
        type: 'fill_blank',
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
      }
    } else if (questionForm.type === 'multiple_choice') {
      updatedExercise = {
        id: editingQuestion.id,
        type: 'multiple_choice',
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
        options: questionForm.options.filter(opt => opt.trim() !== ''),
      }
    } else if (questionForm.type === 'true_false') {
      updatedExercise = {
        id: editingQuestion.id,
        type: 'true_false',
        question: questionForm.question.trim(),
        answer: questionForm.answer.toLowerCase() === 'true',
      }
    }

    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === editingQuestion.id ? updatedExercise : ex
      ),
    }))

    resetQuestionForm()
    setShowQuestionModal(false)
    setEditingQuestion(null)
    setSaving(false)
    toastSuccess('Question updated')
  }

  const handleDeleteQuestion = (exerciseId) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId),
    }))
    toastSuccess('Question deleted')
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      type: 'fill_blank',
      question: '',
      answer: '',
      options: ['', '', '', ''],
    })
  }

  const getQuestionTypeLabel = (type) => {
    return QUESTION_TYPES.find(t => t.value === type)?.label || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button
          onClick={() => navigate('/admin/unit-tests')}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={16} />
          Back to Units
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            {location.pathname.includes('/edit/') ? 'Edit Unit' : 'Create New Unit'}
          </h1>
          <p className="text-sm text-slate-400">
            {location.pathname.includes('/edit/') ? 'Update unit information' : 'Add a new grammar unit'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Unit Information Card */}
        <div className="card bg-base-100 shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Unit Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Unit Number */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Unit Number *</span>
                </label>
                <input
                  type="number"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                  min="1"
                  className={`input input-bordered input-sm w-full ${errors.unitNumber ? 'input-error' : ''}`}
                  placeholder="1"
                />
                {errors.unitNumber && (
                  <span className="label-text-alt text-error text-xs">{errors.unitNumber}</span>
                )}
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`input input-bordered input-sm w-full ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g., Present Simple"
                />
                {errors.title && (
                  <span className="label-text-alt text-error text-xs">{errors.title}</span>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`textarea textarea-bordered textarea-sm w-full ${errors.description ? 'textarea-error' : ''}`}
                  placeholder="Brief description of the unit content"
                  rows={2}
                />
                {errors.description && (
                  <span className="label-text-alt text-error text-xs">{errors.description}</span>
                )}
              </div>

              {/* Level */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Level *</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="select select-bordered select-sm w-full"
                >
                  {LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Order *</span>
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                  min="1"
                  className={`input input-bordered input-sm w-full ${errors.order ? 'input-error' : ''}`}
                  placeholder="1"
                />
                {errors.order && (
                  <span className="label-text-alt text-error text-xs">{errors.order}</span>
                )}
                <span className="label-text-alt text-xs">Used to sort units within the same level</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/admin/unit-tests')}
                  disabled={saving}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary gap-2"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {location.pathname.includes('/edit/') ? 'Update Unit' : 'Create Unit'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Questions Card */}
        <div className="card bg-base-100 shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div className="card-body overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="card-title text-lg">
                Questions ({formData.exercises?.length || 0})
              </h2>
              <button
                onClick={() => {
                  resetQuestionForm()
                  setEditingQuestion(null)
                  setShowQuestionModal(true)
                }}
                className="btn btn-primary"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              {(!formData.exercises || formData.exercises.length === 0) ? (
                <div className="text-center py-12 text-slate-400">
                  <Plus size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-1">No questions yet</p>
                  <p className="text-xs opacity-70">Click "Add Question" to get started</p>
                </div>
              ) : (
                formData.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="card bg-base-200 border border-base-300/50 hover:border-primary/50 transition-all duration-200 rounded-lg"
                  >
                    <div className="card-body p-3">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle & Number */}
                        <div className="flex flex-col items-center gap-1 mt-0.5 shrink-0">
                          <button
                            className="btn btn-xs btn-ghost cursor-move hover:bg-base-300 opacity-30 hover:opacity-100 transition-opacity p-1"
                            title="Drag to reorder"
                          >
                            <GripVertical size={14} />
                          </button>
                          <span className="text-xs font-medium text-slate-500 opacity-70">
                            #{index + 1}
                          </span>
                        </div>
                        
                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="badge badge-primary badge-xs opacity-80">
                              {getQuestionTypeLabel(exercise.type)}
                            </span>
                            
                            {/* Actions */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditQuestion(exercise)}
                                className="btn btn-xs btn-ghost hover:bg-base-200 p-1"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(exercise.id)}
                                className="btn btn-xs btn-ghost text-error hover:bg-error/10 p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Question Text */}
                          <p className="text-sm text-base-content mb-2 leading-snug">
                            {exercise.question}
                          </p>
                          
                          {/* Answer */}
                          <div className="flex items-center gap-1.5">
                            <span className="badge badge-success badge-xs opacity-70">
                              Answer
                            </span>
                            <span className="text-xs text-base-content">
                              {exercise.type === 'true_false' 
                                ? (exercise.answer ? 'True' : 'False')
                                : exercise.answer}
                            </span>
                          </div>

                          {/* Multiple Choice Options */}
                          {exercise.type === 'multiple_choice' && exercise.options && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exercise.options.map((option, i) => (
                                <span
                                  key={i}
                                  className={`badge badge-xs ${
                                    option === exercise.answer 
                                      ? 'badge-success opacity-80' 
                                      : 'badge-outline badge-neutral opacity-50'
                                  }`}
                                >
                                  {option} {option === exercise.answer && ' ✓'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>
            
            <div className="space-y-4">
              {/* Question Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Question Type</span>
                </label>
                <select
                  value={questionForm.type}
                  onChange={(e) => {
                    setQuestionForm(prev => ({ ...prev, type: e.target.value, answer: '', options: ['', '', '', ''] }))
                  }}
                  className="select select-bordered w-full"
                >
                  {QUESTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Question *</span>
                </label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              {/* Answer */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    {questionForm.type === 'true_false' ? 'Correct Answer (True/False)' : 'Correct Answer *'}
                  </span>
                </label>
                {questionForm.type === 'true_false' ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQuestionForm(prev => ({ ...prev, answer: 'true' }))}
                      className={`btn flex-1 ${questionForm.answer === 'true' ? 'btn-success' : 'btn-outline'}`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionForm(prev => ({ ...prev, answer: 'false' }))}
                      className={`btn flex-1 ${questionForm.answer === 'false' ? 'btn-error' : 'btn-outline'}`}
                    >
                      False
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={questionForm.answer}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, answer: e.target.value }))}
                    className="input input-bordered w-full"
                    placeholder="Enter the correct answer"
                  />
                )}
              </div>

              {/* Options for Multiple Choice */}
              {questionForm.type === 'multiple_choice' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Options (at least 2)</span>
                  </label>
                  <div className="space-y-2">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options]
                            newOptions[index] = e.target.value
                            setQuestionForm(prev => ({ ...prev, options: newOptions }))
                          }}
                          className={`input input-bordered input-sm flex-1 ${option === questionForm.answer ? 'input-success' : ''}`}
                          placeholder={`Option ${index + 1}`}
                        />
                        {option === questionForm.answer && (
                          <span className="badge badge-success badge-sm self-center">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="label-text-alt">
                    Enter the correct answer in the Answer field above and match it here
                  </span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  setEditingQuestion(null)
                  resetQuestionForm()
                }}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  editingQuestion ? 'Update Question' : 'Add Question'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setShowQuestionModal(false)
              setEditingQuestion(null)
              resetQuestionForm()
            }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
