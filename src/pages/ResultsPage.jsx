import { useState, useEffect, useMemo, memo } from 'react'
import { Trophy, Search, ArrowLeft, User, Headphones, BookOpen, PenTool, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'

// Memoized Student Row Component
const StudentRow = memo(function StudentRow({ student, getScoreColor, getLevelColor }) {
  const avgScore = Math.round((student.listening + student.reading + student.speaking + student.writing) / 4)

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {student.initials}
          </div>
          <div>
            <p className="text-white font-medium">{student.name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getLevelColor(student.overallScore)}`}>
          {student.overallScore}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`font-semibold ${getScoreColor(student.listening)}`}>{student.listening}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`font-semibold ${getScoreColor(student.reading)}`}>{student.reading}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`font-semibold ${getScoreColor(student.writing)}`}>{student.writing}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`font-semibold ${getScoreColor(student.speaking)}`}>{student.speaking}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-lg font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</span>
      </td>
    </tr>
  )
})

// Memoized Student Card Component
const StudentCard = memo(function StudentCard({ student, getScoreColor, getLevelColor, getScoreBg, index }) {
  const avgScore = Math.round((student.listening + student.reading + student.speaking + student.writing) / 4)

  return (
    <div
      className={`premium-card p-5 border ${getScoreBg(avgScore)} animate-fadeInUp`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {student.initials}
          </div>
          <div>
            <h3 className="text-white font-semibold">{student.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getLevelColor(student.overallScore)}`}>
            {student.overallScore}
          </span>
          <p className={`text-2xl font-bold mt-1 ${getScoreColor(avgScore)}`}>{avgScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
          <Headphones className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-500">Listening</p>
            <p className={`font-semibold ${getScoreColor(student.listening)}`}>{student.listening}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
          <BookOpen className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-gray-500">Reading</p>
            <p className={`font-semibold ${getScoreColor(student.reading)}`}>{student.reading}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
          <PenTool className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-gray-500">Writing</p>
            <p className={`font-semibold ${getScoreColor(student.writing)}`}>{student.writing}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
          <MessageCircle className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-xs text-gray-500">Speaking</p>
            <p className={`font-semibold ${getScoreColor(student.speaking)}`}>{student.speaking}</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function ResultsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    const q = query(collection(db, 'students'), orderBy('name'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const studentsData = snapshot.docs.map(doc => {
          const data = doc.data()
          const name = data.name || 'Unknown'
          return {
            id: doc.id,
            name,
            initials: data.initials || getInitials(name),
            listening: Number(data.listening) || 0,
            reading: Number(data.reading) || 0,
            speaking: Number(data.speaking) || 0,
            writing: Number(data.writing) || 0,
            overallScore: data.overallScore || 'N/A',
          }
        })
        setStudents(studentsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching students:', err)
        setError(t('results.loadError'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30'
    if (score >= 60) return 'bg-blue-500/10 border-blue-500/30'
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  const getLevelColor = (level) => {
    const colors = {
      'A1': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'A2': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'B1': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      'B2': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'C1': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'C2': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
    return colors[level] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const filteredStudents = useMemo(() =>
    students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [students, searchQuery]
  )

  const averageScore = useMemo(() =>
    students.length > 0
      ? Math.round(students.reduce((sum, s) => {
          const avg = (s.listening + s.reading + s.speaking + s.writing) / 4
          return sum + avg
        }, 0) / students.length)
      : 0
  , [students])

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {t('results.backHome')}
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                Student <span className="gradient-text">Results</span>
              </h1>
              <p className="text-gray-400">View student performance from Firestore</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl ${getScoreBg(averageScore)} border`}>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-semibold">{t('results.avg')}: {averageScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{students.length}</span>
            </div>
            <p className="text-gray-400 text-sm">{t('results.totalStudents')}</p>
          </div>
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</span>
            </div>
            <p className="text-gray-400 text-sm">{t('results.averageScore')}</p>
          </div>
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-white">
                {students.filter(s => (s.listening + s.reading + s.speaking + s.writing) / 4 >= 70).length}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{t('results.passed')}</p>
          </div>
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.overallScore !== 'N/A' ? 1 : 0, 0) / students.length * 100) : 0}%
              </span>
            </div>
            <p className="text-gray-400 text-sm">{t('results.withLevel')}</p>
          </div>
        </div>

        {/* Search */}
        <div
          className="mb-8 animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('results.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20 animate-fadeIn">
            <LoadingSpinner size="lg" text={t('results.loading')} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20 animate-fadeIn">
            <div className="text-center text-red-400">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredStudents.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('results.noFound')}</h3>
            <p className="text-gray-400">
              {searchQuery ? t('results.noMatch') : t('results.noData')}
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && filteredStudents.length > 0 && (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <div
                className="premium-card overflow-hidden animate-fadeIn"
                style={{ animationDelay: '0.3s' }}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">{t('results.tableHeaders.student')}</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">{t('results.tableHeaders.level')}</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">
                        <Headphones className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">
                        <BookOpen className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">
                        <PenTool className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">
                        <MessageCircle className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">{t('results.tableHeaders.average')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        getScoreColor={getScoreColor}
                        getLevelColor={getLevelColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredStudents.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  getScoreColor={getScoreColor}
                  getLevelColor={getLevelColor}
                  getScoreBg={getScoreBg}
                  index={index}
                />
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  )
}