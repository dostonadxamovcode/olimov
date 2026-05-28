import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Clock, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'
import { useLevelTests } from '../hooks/useLevelTests'

export default function BeginnerPage() {
  // 'a1' maps to 'a1Tests' collection inside the hook
  const { tests: allDocs, loading, error } = useLevelTests('a1')
  // Show only published full-exam tests (have questions[] and isPublished flag)
  const tests = allDocs.filter(d => !d.type && d.isPublished)

  const [selectedTest, setSelectedTest] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const navigate = useNavigate()

  const handleStartTest = (test) => {
    setSelectedTest(test)
    setShowConfirmation(true)
  }

  const handleConfirmStart = () => {
    if (selectedTest) {
      navigate(`/tests/${selectedTest.id}`)
    }
  }

  const handleCancelStart = () => {
    setSelectedTest(null)
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/level')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Levels
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="inline-block mb-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                A1
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Beginner Tests
              </h1>
            </div>
          </div>
          <p className="text-slate-400">
            Test your English skills with our beginner level tests
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <LoadingSpinner size="lg" text="Testlar yuklanmoqda..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tests.length === 0 && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Tests Available</h3>
            <p className="text-slate-400">
              There are no published tests for beginner level yet. Check back later!
            </p>
          </div>
        )}

        {/* Tests List */}
        {!loading && !error && tests.length > 0 && (
          <div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tests.map((test, index) => (
              <div
                key={test.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                }}
                className="premium-card p-5 flex flex-col gap-3 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-2 text-xs text-slate-500">
                    {test.questions?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {test.questions.length} questions
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base mb-1">
                    {test.title}
                  </h3>
                  {test.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleStartTest(test)}
                  className="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 text-white opacity-90 hover:opacity-100 transition-opacity"
                >
                  Boshlash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedTest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Testni Boshlash?</h2>
              <p className="text-slate-400">
                Are you ready to start <span className="text-emerald-400 font-semibold">{selectedTest.title}</span>?
              </p>
              {selectedTest.description && (
                <p className="text-slate-500 text-sm mt-2">{selectedTest.description}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm">{selectedTest.questions?.length || 0} questions</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm">60 minutes time limit</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm">Level: A1 (Beginner)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelStart}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmStart}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              >
                Boshlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}