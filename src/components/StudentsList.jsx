import { useState, useEffect } from 'react'
import { Search, Mail, Calendar, User, Clock } from '../lib/icons'
import { useTranslation } from 'react-i18next'
import { toastError } from '../utils/errorHandler'
import { LoadingSpinner } from './ui/SkeletonLoader'
import { getStudents } from '../services/students'

export default function StudentsList() {
  const { t } = useTranslation()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const studentsData = await getStudents()
      setStudents(studentsData)
    } catch (error) {
      toastError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase()
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.displayName?.toLowerCase().includes(searchLower) ||
      student.username?.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getLastLogin = (student) => {
    if (student.lastLogin) return formatDate(student.lastLogin)
    if (student.createdAt) return formatDate(student.createdAt)
    return 'N/A'
  }

  return (
    <div className="pb-20">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('studentsList.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('studentsList.subtitle')}</p>
        </div>
      </div>

      <div className="mb-6 max-w-sm">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8">
          <Search className="w-[14px] h-[14px] text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={t('studentsList.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {searchQuery ? t('studentsList.noFound') : t('studentsList.noFound')}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? t('studentsList.noMatch') : t('studentsList.noRegistered')}
          </p>
        </div>
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
          {filteredStudents.map((student, index) => (
            <div
              key={student.id || index}
              className="rounded-2xl bg-white/[0.04] border border-white/8 p-5 hover:border-white/12 transition-colors animate-fadeInUp"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white border-2 border-blue-500/25 overflow-hidden shrink-0">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt="" className="w-full h-full object-cover" />
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

              <div className="flex flex-wrap gap-1.5">
                {student.level && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    {student.level.toUpperCase()}
                  </span>
                )}
                {student.role && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {student.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 h-14 flex items-center gap-3 px-6 bg-[#0d1b2a]/95 backdrop-blur-md border-t border-white/8 z-[100]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs">
            <span className="text-slate-500 font-medium">{t('adminTests.total')}</span>
            <span className="text-slate-100 font-semibold">{students.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs">
            <span className="text-slate-500 font-medium">{t('adminTests.showing')}</span>
            <span className="text-slate-100 font-semibold">{filteredStudents.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
