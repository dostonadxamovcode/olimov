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

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Unit Tests</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Manage grammar unit tests by level</p>
        </div>
        <button
          onClick={() => navigate('/admin/unit-tests/add')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', cursor: 'pointer',
            color: '#fff', fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s',
          }}
        >
          <Plus size={16} />
          Create Unit
        </button>
      </div>

      {/* Level Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => {
              if (level.active) {
                setActiveLevel(level.id)
              }
            }}
            disabled={!level.active}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              cursor: level.active ? 'pointer' : 'not-allowed',
              background: activeLevel === level.id && level.active
                ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                : level.active
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.02)',
              color: activeLevel === level.id && level.active
                ? '#fff'
                : level.active
                ? '#94a3b8'
                : '#475569',
              fontWeight: activeLevel === level.id && level.active ? 600 : 500,
              fontSize: 13,
              border: level.active ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
              opacity: level.active ? 1 : 0.5,
            }}
          >
            {level.label}
            {!level.active && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>(Coming Soon)</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          minWidth: 280,
          maxWidth: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '10px 14px',
        }}>
          <Search size={15} color="#475569" />
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#e2e8f0',
              fontSize: 13,
              flex: 1,
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}>
          <LoadingSpinner size="lg" text="Loading units..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUnits.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 14,
        }}>
          <FileText size={48} color="#475569" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#f1f5f9' }}>
            No Units Found
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {searchQuery
              ? 'No units match your search'
              : `No units in ${activeLevelConfig.label} level yet`}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/admin/unit-tests/add')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Plus size={16} />
              Create First Unit
            </button>
          )}
        </div>
      )}

      {/* Units Grid */}
      {!loading && filteredUnits.length > 0 && (
        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))',
        }}>
          {filteredUnits.map((unit) => {
            const unitLevel = unit.level || 'beginner'
            const levelConfig = LEVEL_CONFIG[unitLevel] || LEVEL_CONFIG.beginner
            
            return (
              <div
                key={unit.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '20px',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#fff',
                    }}>
                      {unit.unitNumber || unit.order || '—'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
                        {unit.title || 'Untitled'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          ...levelConfig.color,
                        }}>
                          {levelConfig.label}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {unit.exercises?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  margin: '0 0 16px',
                  fontSize: 13,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {unit.description || 'No description provided'}
                </p>

                {/* Instructions Preview */}
                {unit.instructions && (
                  <div style={{
                    marginBottom: 16,
                    padding: '10px 12px',
                    background: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.1)',
                    borderRadius: 8,
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: 11,
                      color: '#60a5fa',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {unit.instructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => handleManageQuestions(unit)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
                    }}
                  >
                    <FileText size={14} />
                    Questions
                  </button>
                  <button
                    onClick={() => handleEdit(unit)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(unit)}
                    disabled={deletingId === unit.id}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: deletingId === unit.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === unit.id ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== unit.id) {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
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
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 220,
          right: 0,
          height: 64,
          padding: '0 24px',
          background: 'rgba(13,27,42,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 13,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Total Units</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{units.length}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Showing</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{filteredUnits.length}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Level</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{activeLevelConfig.label}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Total Questions</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
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
