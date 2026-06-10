import { useState, useEffect } from 'react'
import { Search, Mail, Calendar, User, Clock } from '../lib/icons'
import { ShieldCheck, ShieldOff, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toastError } from '../utils/errorHandler'
import { LoadingSpinner } from './ui/SkeletonLoader'
import { getStudents } from '../services/students'
import { changeUserRole } from '../services/roleManagement'
import { useAuth } from '../context/AuthContext'

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ modal, onConfirm, onCancel, loading }) {
  if (!modal.open) return null
  const isPromote = modal.action === 'promote'
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1e30] p-6 shadow-2xl animate-fadeInUp">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto
          ${isPromote ? 'bg-blue-500/15' : 'bg-orange-500/15'}`}>
          {isPromote
            ? <ShieldCheck className="w-6 h-6 text-blue-400" />
            : <ShieldOff   className="w-6 h-6 text-orange-400" />}
        </div>
        <h3 className="text-center text-base font-bold text-white mb-2">
          {isPromote ? 'Make Admin?' : 'Remove Admin?'}
        </h3>
        <p className="text-center text-sm text-slate-400 mb-6">
          {isPromote
            ? <>Are you sure you want to give <span className="text-white font-semibold">{modal.userName}</span> admin privileges?</>
            : <>Are you sure you want to remove admin privileges from <span className="text-white font-semibold">{modal.userName}</span>?</>}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-50
              ${isPromote
                ? 'bg-gradient-to-r from-blue-500 to-violet-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
          >
            {loading ? 'Saving…' : isPromote ? 'Make Admin' : 'Remove Admin'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  if (role === 'superadmin') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20">
      <Shield className="w-3 h-3" /> Superadmin
    </span>
  )
  if (role === 'admin') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
      <ShieldCheck className="w-3 h-3" /> Admin
    </span>
  )
  return (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 text-slate-500 border border-white/[0.06]">
      User
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudentsList() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const isSuperadmin = currentUser?.role === 'superadmin'

  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modal,       setModal]       = useState({ open: false, userId: null, userName: null, action: null })
  const [roleLoading, setRoleLoading] = useState(false)
  const [toast,       setToast]       = useState(null)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      setStudents(await getStudents())
    } catch (error) {
      toastError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const openModal = (student, action) => {
    const name = student.displayName || student.name || student.email?.split('@')[0] || 'this user'
    setModal({ open: true, userId: student.id, userName: name, action })
  }

  const handleConfirm = async () => {
    setRoleLoading(true)
    try {
      const newRole = modal.action === 'promote' ? 'admin' : 'user'
      await changeUserRole(modal.userId, newRole, currentUser)
      setStudents(prev =>
        prev.map(s => s.id === modal.userId ? { ...s, role: newRole } : s)
      )
      showToast('ok', modal.action === 'promote' ? 'User promoted to admin' : 'Admin demoted to user')
      setModal({ open: false })
    } catch (e) {
      showToast('err', e.message || 'You don\'t have permission')
    } finally {
      setRoleLoading(false)
    }
  }

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase()
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.displayName?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q)
    )
  })

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getLastLogin = (student) => {
    if (student.lastLogin) return formatDate(student.lastLogin)
    if (student.createdAt) return formatDate(student.createdAt)
    return 'N/A'
  }

  return (
    <div className="pb-20">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.type === 'ok' ? '#86efac' : '#fca5a5',
          fontSize: 13, fontWeight: 500, backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        modal={modal}
        onConfirm={handleConfirm}
        onCancel={() => setModal({ open: false })}
        loading={roleLoading}
      />

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('studentsList.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('studentsList.subtitle')}</p>
        </div>
      </div>

      <div className="mb-6 max-w-sm">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/[0.04]">
          <Search className="w-[14px] h-[14px] text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={t('studentsList.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-slate-200 text-sm flex-1 placeholder-slate-600 min-w-0"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text={t('studentsList.loading')} />
        </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          <User className="w-10 h-10 text-slate-600 mb-4" />
          <h3 className="text-base font-semibold text-slate-300 mb-1.5">
            {t('studentsList.noFound')}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? t('studentsList.noMatch') : t('studentsList.noRegistered')}
          </p>
        </div>
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
          {filteredStudents.map((student, index) => {
            const isAdmin      = student.role === 'admin'
            const isSuperAdmin = student.role === 'superadmin'
            const isCurrentUser = student.id === currentUser?.uid

            return (
              <div
                key={student.id || index}
                className="rounded-2xl bg-white/[0.04] border border-white/8 p-5 hover:border-white/12 transition-colors animate-fadeInUp"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white border-2 border-blue-500/25 overflow-hidden shrink-0">
                    {(student.photoBase64 || student.photoURL) ? (
                      <img
                        src={student.photoBase64 || student.photoURL}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      (student.name || student.displayName || student.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {student.displayName || student.name || student.username || student.email?.split('@')[0] || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{student.email || t('studentsList.noEmail')}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{student.email || t('studentsList.noEmail')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{formatDate(student.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{getLastLogin(student)}</span>
                  </div>
                </div>

                {/* Badges + Role action */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1.5">
                    <RoleBadge role={student.role} />
                    {student.level && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                        {student.level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Role management — only superadmin sees this, not on own account or another superadmin */}
                  {isSuperadmin && !isCurrentUser && !isSuperAdmin && (
                    isAdmin ? (
                      <button
                        onClick={() => openModal(student, 'demote')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-orange-500/25 bg-orange-500/[0.08] text-orange-400 hover:bg-orange-500/15 transition-colors"
                      >
                        <ShieldOff className="w-3.5 h-3.5" />
                        Remove Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(student, 'promote')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/25 bg-blue-500/[0.08] text-blue-400 hover:bg-blue-500/15 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Make Admin
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 h-14 flex items-center gap-3 px-6 bg-[#0d1b2a]/95 backdrop-blur-md border-t border-white/[0.04] z-[100]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-xs">
            <span className="text-slate-500 font-medium">{t('adminTests.total')}</span>
            <span className="text-slate-100 font-semibold">{students.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-xs">
            <span className="text-slate-500 font-medium">{t('adminTests.showing')}</span>
            <span className="text-slate-100 font-semibold">{filteredStudents.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
