import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'
import ConfirmModal from '../components/ui/ConfirmModal'

const LEVELS = [
  { id: 'beginner', label: 'Beginner', active: true },
  { id: 'elementary', label: 'Elementary', active: true },
  { id: 'pre-intermediate', label: 'Pre-Intermediate', active: true },
  { id: 'intermediate', label: 'Intermediate', active: true },
  { id: 'upper-intermediate', label: 'Upper-Intermediate', active: true },
  { id: 'advanced', label: 'Advanced', active: true },
]

const LEVEL_CONFIG = {
  beginner: { label: 'Beginner', color: { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' } },
  elementary: { label: 'Elementary', color: { background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.3)' } },
  'pre-intermediate': { label: 'Pre-Intermediate', color: { background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' } },
  intermediate: { label: 'Intermediate', color: { background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' } },
  'upper-intermediate': { label: 'Upper-Intermediate', color: { background: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)' } },
  advanced: { label: 'Advanced', color: { background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' } },
}

export default function AdminUnitTestsContent() {
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLevel, setActiveLevel] = useState('beginner')
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    fetchUnits()
  }, [activeLevel])

  const fetchUnits = async () => {
    setLoading(true)
    try {
      const { getDocs, collection } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')

      // Fetch all units first to see what exists
      const querySnapshot = await getDocs(collection(firestoreDb, 'unitTests'))
      const unitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      
      // Filter by level if activeLevel is set, otherwise show all
      const filteredUnits = activeLevel 
        ? unitsData.filter(unit => {
            const unitLevel = unit.level || 'beginner' // Default to beginner if no level
            return unitLevel === activeLevel
          })
        : unitsData
      
      // Sort by order in JavaScript instead of Firestore
      filteredUnits.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      setUnits(filteredUnits)
    } catch (error) {
      console.error('Error fetching units:', error)
      toastError('Failed to load unit tests')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    const unit = pendingDelete
    setDeletingId(unit.id)

    try {
      const { deleteDoc, doc } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')

      await deleteDoc(doc(firestoreDb, 'unitTests', unit.id))

      toastSuccess('Unit deleted successfully')
      setPendingDelete(null)
      await fetchUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
      toastError('Failed to delete unit')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (unit) => {
    navigate(`/admin/unit-tests/edit/${unit.id}`, { state: { unit } })
  }

  const handleManageQuestions = (unit) => {
    navigate(`/admin/unit-tests/edit/${unit.id}`, { state: { unit } })
  }

  const filteredUnits = units.filter(unit => {
    const matchesSearch =
      unit.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const activeLevelConfig = LEVEL_CONFIG[activeLevel] || LEVEL_CONFIG.beginner
  const primaryBtn = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:opacity-95'
  const secondaryBtn = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] hover:border-white/20'
  const dangerBtn = 'inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20'
  const tabBtn = 'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200'

  return (
    <div className="pb-24">
      {/* Page Title */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-100 sm:text-[24px]">Unit Tests</h1>
          <p className="mt-1 text-sm text-slate-500">Manage grammar unit tests by level</p>
        </div>
        <button onClick={() => navigate('/admin/unit-tests/add')} className={`${primaryBtn} w-full sm:w-auto`}>
          <Plus size={16} />
          Create Unit
        </button>
      </div>

      {/* Level Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => {
              if (level.active) {
                setActiveLevel(level.id)
              }
            }}
            disabled={!level.active}
            className={`${tabBtn} ${
              activeLevel === level.id && level.active
                ? 'border-blue-500/30 bg-blue-500/15 text-white shadow-lg shadow-blue-500/10'
                : level.active
                ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:border-white/20'
                : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600 opacity-60'
            }`}
          >
            {level.label}
            {!level.active && (
              <span className="ml-1 text-[11px] opacity-70">(Coming Soon)</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 sm:max-w-md">
          <Search size={15} color="#475569" />
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading units..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUnits.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-20 text-center">
          <FileText size={48} color="#475569" style={{ marginBottom: 16 }} />
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Units Found
          </h3>
          <p className="mb-6 text-sm text-slate-400">
            {searchQuery
              ? 'No units match your search'
              : `No units in ${activeLevelConfig.label} level yet`}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/admin/unit-tests/add')}
              className={primaryBtn}
            >
              <Plus size={16} />
              Create First Unit
            </button>
          )}
        </div>
      )}

      {/* Units Grid */}
      {!loading && filteredUnits.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredUnits.map((unit) => {
            const unitLevel = unit.level || 'beginner'
            const levelConfig = LEVEL_CONFIG[unitLevel] || LEVEL_CONFIG.beginner
            
            return (
              <div
                key={unit.id}
                className="premium-card flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-lg font-bold text-white shadow-lg shadow-blue-500/20">
                      {unit.unitNumber || unit.order || '—'}
                    </div>
                    <div>
                      <h3 className="m-0 text-base font-semibold text-white">
                        {unit.title || 'Untitled'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase" style={levelConfig.color}>
                          {levelConfig.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {unit.exercises?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {unit.description || 'No description provided'}
                </p>

                {/* Instructions Preview */}
                {unit.instructions && (
                  <div className="mb-4 rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-2">
                    <p className="truncate text-[11px] text-blue-300">
                      {unit.instructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    onClick={() => handleManageQuestions(unit)}
                    className={`${secondaryBtn} min-w-[110px] flex-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'
                    }}
                  >
                    <FileText size={14} />
                    Questions
                  </button>
                  <button
                    onClick={() => handleEdit(unit)}
                    className={`${secondaryBtn} min-w-[110px] flex-1 border-blue-500/20 bg-blue-500/10 text-sky-300 hover:bg-blue-500/15`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'
                    }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(unit)}
                    disabled={deletingId === unit.id}
                    className={`${dangerBtn} min-w-[110px] flex-1 ${deletingId === unit.id ? 'cursor-not-allowed opacity-60' : ''}`}
                    onMouseEnter={(e) => {
                      if (deletingId !== unit.id) {
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
                    }}
                  >
                    {deletingId === unit.id ? (
                      <>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(248,113,113,0.3)', borderTopColor: '#f87171', animation: 'spin 1s linear infinite' }} />
                      </>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats Bar */}
      {!loading && units.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 bg-[#0b1220]/95 px-4 py-3 backdrop-blur-md sm:left-[220px] sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm sm:justify-start">
              <span className="font-medium text-slate-500">Total Units</span>
              <span className="font-semibold text-slate-100">{units.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm sm:justify-start">
              <span className="font-medium text-slate-500">Showing</span>
              <span className="font-semibold text-slate-100">{filteredUnits.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm sm:justify-start">
              <span className="font-medium text-slate-500">Level</span>
              <span className="font-semibold text-slate-100">{activeLevelConfig.label}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm sm:justify-start">
              <span className="font-medium text-slate-500">Total Questions</span>
              <span className="font-semibold text-slate-100">
                {filteredUnits.reduce((sum, unit) => sum + (unit.exercises?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={!!deletingId}
        variant="danger"
        title="Delete Unit"
        message={`Are you sure you want to delete "${pendingDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
