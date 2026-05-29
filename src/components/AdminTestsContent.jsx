import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Clock,
  FileText,
} from 'lucide-react'
import { toastError, toastSuccess } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'
import CustomSelect from '../components/ui/CustomSelect'
import ConfirmModal from '../components/ui/ConfirmModal'

const ADMIN_LEVEL_OPTIONS = [
  { value: 'all',   label: 'All Levels' },
  { value: 'a1',    label: 'A1 — Beginner' },
  { value: 'a2',    label: 'A2 — Elementary' },
  { value: 'b1',    label: 'B1 — Intermediate' },
  { value: 'b2',    label: 'B2 — Upper-Intermediate' },
  { value: 'c1',    label: 'C1 — Advanced' },
  { value: 'c2',    label: 'C2 — Proficient' },
  { value: 'ielts', label: 'IELTS' },
]

const COLLECTIONS = [
  'a1Tests', 'a2Tests', 'b1Tests', 'b2Tests', 'c1Tests', 'c2Tests', 'ielts',
]

const LEVEL_CONFIG = {
  a1: { label: 'A1', name: 'Beginner',          color: { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' } },
  a2: { label: 'A2', name: 'Elementary',         color: { background: 'rgba(6, 182, 212, 0.2)',  color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.3)'  } },
  b1: { label: 'B1', name: 'Intermediate',       color: { background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' } },
  b2: { label: 'B2', name: 'Pre-Intermediate',   color: { background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' } },
  c1: { label: 'C1', name: 'Advanced',           color: { background: 'rgba(244, 63, 94, 0.2)',  color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)'  } },
  c2:    { label: 'C2',    name: 'Proficient',       color: { background: 'rgba(234, 179, 8, 0.2)',  color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)'  } },
  ielts: { label: 'IELTS', name: 'IELTS',            color: { background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' } },
}

const TYPE_BADGE = {
  multiple_choice: { label: 'Multiple Choice', bg: 'rgba(249,115,22,0.2)',  color: '#fdba74' },
  text_input:      { label: 'Text Input',       bg: 'rgba(16,185,129,0.2)', color: '#6ee7b7' },
  translation:     { label: 'Translation',      bg: 'rgba(236,72,153,0.2)', color: '#f9a8d4' },
  word_order:      { label: 'Word Order',       bg: 'rgba(59,130,246,0.2)', color: '#93c5fd' },
}

// Derive lowercase level key from collection name
const levelKeyOf = (col) =>
  col.endsWith('Tests') ? col.replace('Tests', '').toLowerCase() : col.toLowerCase()

export default function AdminTestsContent() {
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    fetchAllTests()
  }, [])

  const fetchAllTests = async () => {
    setLoading(true)
    try {
      const { getDocs, collection } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')

      const allTests = []

      for (const collectionName of COLLECTIONS) {
        try {
          const querySnapshot = await getDocs(collection(firestoreDb, collectionName))
          const testsFromCollection = querySnapshot.docs.map(doc => ({
            id: doc.id,
            collectionName,
            levelKey: levelKeyOf(collectionName),
            ...doc.data(),
          }))
          allTests.push(...testsFromCollection)
        } catch (error) {
          // Collection may not exist yet — skip silently
        }
      }

      setTests(allTests)
    } catch (error) {
      toastError("Testlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    const test = pendingDelete;
    setDeletingId(test.id);

    try {
      const { deleteDoc, doc } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')

      await deleteDoc(doc(firestoreDb, test.collectionName, test.id))

      toastSuccess("Test muvaffaqiyatli o'chirildi.")
      setPendingDelete(null)
      await fetchAllTests()
    } catch (error) {
      toastError("O'chirishda xatolik yuz berdi.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (test) => {
    navigate(`/admin/edit-test/${test.id}?col=${encodeURIComponent(test.collectionName)}`, { state: { test } })
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch =
      test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || test.levelKey === levelFilter
    return matchesSearch && matchesLevel
  })

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Tests Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Manage all level tests</p>
        </div>
        <button
          onClick={() => navigate('/admin/add-test')}
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
          Add New Test
        </button>
      </div>
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', gap: 16, marginBottom: 24, 
        flexWrap: 'wrap', alignItems: 'center' 
      }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 280, maxWidth: 400,
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <Search size={15} color="#475569" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#e2e8f0', fontSize: 13, flex: 1, width: '100%'
            }}
          />
        </div>

        {/* Level Filter */}
        <CustomSelect
          value={levelFilter}
          onValueChange={setLevelFilter}
          options={ADMIN_LEVEL_OPTIONS}
          className="w-44"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: 400, 
        }}>
          <LoadingSpinner size="lg" text="Testlar yuklanmoqda..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTests.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 14,
        }}>
          <FileText size={48} color="#475569" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#f1f5f9' }}>
            No tests available
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {searchQuery || levelFilter !== 'all' 
              ? 'No tests match your search criteria' 
              : 'Get started by creating your first test'}
          </p>
          {!searchQuery && levelFilter === 'all' && (
            <button
              onClick={() => navigate('/admin/add-test')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none', cursor: 'pointer',
                color: '#fff', fontWeight: 600, fontSize: 14,
              }}
            >
              <Plus size={16} />
              Create Your First Test
            </button>
          )}
        </div>
      )}

      {/* Tests List */}
      {!loading && filteredTests.length > 0 && (
        <div className="tests-grid" style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))',
        }}>
          {filteredTests.map((test) => {
            const levelConfig = LEVEL_CONFIG[test.levelKey] || LEVEL_CONFIG.a1
            const isNewFormat  = !!test.type   // new individual-question docs have a `type` field
            const typeBadge    = isNewFormat ? (TYPE_BADGE[test.type] || TYPE_BADGE.text_input) : null

            return (
              <div
                key={`${test.collectionName}-${test.id}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, padding: '20px',
                  position: 'relative',
                }}
                className="animate-fadeInUp"
              >
                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {/* Level badge */}
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, ...levelConfig.color }}>
                    {levelConfig.label}
                  </span>

                  {/* Type badge (new format) */}
                  {isNewFormat && typeBadge && (
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: typeBadge.bg, color: typeBadge.color,
                    }}>
                      {typeBadge.label}
                    </span>
                  )}

                  {/* Category badge (new format) */}
                  {isNewFormat && test.category && (
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'rgba(139,92,246,0.2)', color: '#c4b5fd',
                      border: '1px solid rgba(139,92,246,0.3)',
                    }}>
                      {test.category}
                    </span>
                  )}

                  {/* Published badge (old format) */}
                  {!isNewFormat && (
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: test.isPublished ? 'rgba(34,197,94,0.2)'   : 'rgba(251,191,36,0.2)',
                      color:                         test.isPublished ? '#22c55e'              : '#fbbf24',
                      border:                        test.isPublished ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(251,191,36,0.3)',
                    }}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {test.title || 'Untitled'}
                </h3>

                {/* Subtitle */}
                <p style={{
                  margin: '0 0 12px', fontSize: 13, color: '#64748b',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4',
                }}>
                  {isNewFormat
                    ? (test.correct_answer ? `✓ ${test.correct_answer}` : 'No answer set')
                    : (test.description || 'No description')
                  }
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', marginBottom: 16, alignItems: 'center' }}>
                  {!isNewFormat && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={12} />
                      {test.questions?.length || 0} questions
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {formatDate(test.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(test)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                      color: '#60a5fa', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(test)}
                    disabled={deletingId === test.id}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171', fontSize: 12, fontWeight: 500,
                      cursor: deletingId === test.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === test.id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === test.id ? (
                      <>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(248,113,113,0.3)', borderTopColor: '#f87171', animation: 'spin 1s linear infinite' }} />
                        Deleting...
                      </>
                    ) : (
                      <><Trash2 size={12} /> Delete</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats */}
      {!loading && tests.length > 0 && (
        <div className="admin-stats-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 220,
          right: 0,
          height: 64,
          padding: '0 24px',
          background: 'rgba(13,27,42,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Total</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{tests.length}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Showing</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{filteredTests.length}</span>
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
        title="Testni o'chirish"
        message={`"${pendingDelete?.title || 'Bu test'}" ni rostan ham o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
      />
    </div>
  )
}