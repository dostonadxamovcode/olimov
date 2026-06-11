import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronLeft,
  Calendar,
  Menu,
  X,
  Home,
  BookOpen,
  Target,
  GraduationCap,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import AdminTestsContent from '../components/AdminTestsContent'
import StudentsList from '../components/StudentsList'
import AdminSkillTestsContent from '../components/AdminSkillTestsContent'

const navItems = [
  { id: 'overview',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'tests',       label: 'Tests',       icon: BookOpen },
  { id: 'skill-tests', label: 'Skill Tests', icon: Target },
  { id: 'students',    label: 'Students',    icon: Users },
]

const trendData = [
  { month: 'Jan', value: 44 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 67 },
  { month: 'Apr', value: 65 },
  { month: 'May', value: 78 },
  { month: 'Jun', value: 91 },
]

const statusData = [
  { name: 'In Review', value: 20, color: '#facc15' },
  { name: 'Pending', value: 29, color: '#f97316' },
  { name: 'Approved', value: 43, color: '#3b82f6' },
  { name: 'Rejected', value: 8, color: '#ef4444' },
]

const uniData = [
  { name: 'AUB', value: 87 },
  { name: 'TUD', value: 74 },
  { name: 'MIT', value: 61 },
  { name: 'UCL', value: 55 },
  { name: 'NUS', value: 42 },
]

const recentActivity = [
  { title: 'New Application', sub: 'John Doe – University of Auckland', time: '15 min ago', dot: '#3b82f6' },
  { title: 'Document Upload', sub: 'Sara Kim – AUT University', time: '1 hour ago', dot: '#22c55e' },
  { title: 'Application Approved', sub: 'Ali Hassan – Victoria University', time: '2 hours ago', dot: '#f97316' },
  { title: 'New Student', sub: 'Emma Wilson – registered', time: '3 hours ago', dot: '#a855f7' },
  { title: 'Commission Paid', sub: '$1,240 – Partner Agency NZ', time: '5 hours ago', dot: '#facc15' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userRole } = useAuth()
  const [avatarError, setAvatarError] = useState(false)
  const [usersCount, setUsersCount] = useState(0)
  const [usersCountLoading, setUsersCountLoading] = useState(true)
  const [usersCountError, setUsersCountError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Fetch users count from Firestore
  useEffect(() => { setAvatarError(false) }, [user?.avatar])

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        if (!user) {
          setUsersCountLoading(false)
          return
        }

        setUsersCountLoading(true)
        setUsersCountError(null)

        const { getCountFromServer, collection } = await import('firebase/firestore')
        const { db: firestoreDb } = await import('../firebase')

        const snapshot = await getCountFromServer(collection(firestoreDb, 'users'))
        setUsersCount(snapshot.data().count)
      } catch {
        setUsersCountError(true)
        setUsersCount(0)
      } finally {
        setUsersCountLoading(false)
      }
    }

    if (user) {
      fetchUsersCount()
    }
  }, [user])

  useEffect(() => {
    // Set active state based on current route
    if (location.pathname === '/admin/tests') {
      setActive('tests')
    } else if (location.pathname === '/admin/skill-tests') {
      setActive('skill-tests')
    } else if (location.pathname === '/admin/students') {
      setActive('students')
    } else {
      setActive('overview')
    }
  }, [location.pathname])

  // Dynamic stats based on real data
  const stats = [
    {
      label: 'Students Registration',
      value: usersCountLoading ? '...' : usersCount.toString(),
      change: usersCountError ? 'Error loading' : 'Total registered',
      up: true,
      color: '#3b82f6',
      icon: Users,
    },
    {
      label: 'Partner Agencies',
      value: '29',
      change: '3 New this month',
      up: true,
      color: '#a855f7',
      icon: GraduationCap,
    },
    {
      label: 'Approved Applications',
      value: '133',
      change: '+12% from last month',
      up: true,
      color: '#22c55e',
      icon: FileText,
    },
    {
      label: 'Pending Application',
      value: '120',
      change: '5 New today',
      up: false,
      color: '#f97316',
      icon: FileText,
    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'linear-gradient(180deg, #0f2035 0%, #0d1b2a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'fixed',
        top: 0, left: sidebarOpen ? 0 : -220,
        height: '100vh',
        zIndex: 100,
        transition: 'left 0.3s ease',
      }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '16px 16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, color: '#fff'
            }}>C</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>CEFR</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#60a5fa' }}>Pro</span>
            </div>
            {/* Mobile close button */}
            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'none', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', color: '#64748b',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '20px 12px', flex: 1, marginTop: '0' }}>
          {navItems.filter(item => item.id !== 'students' || userRole === 'superadmin').map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (id === 'tests') navigate('/admin/tests')
                else if (id === 'skill-tests') navigate('/admin/skill-tests')
                else if (id === 'students') navigate('/admin/students')
                else setActive(id)
                setSidebarOpen(false)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '12px 14px', borderRadius: 8,
                marginBottom: 2, border: 'none', cursor: 'pointer',
                background: active === id ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: active === id ? '#60a5fa' : '#64748b',
                fontWeight: active === id ? 600 : 500,
                fontSize: 14, textAlign: 'left',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (active !== id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#94a3b8'
                }
              }}
              onMouseLeave={(e) => {
                if (active !== id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748b'
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Landing Page Button */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '16px 12px' }}>
            <button
              onClick={() => { navigate('/'); setSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '12px 14px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                fontWeight: 600,
                fontSize: 14, textAlign: 'left',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
              }}
            >
              <Home size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Landing Page</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 99,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Main */}
      <div className="main-content" style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 16px 0 24px', gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(13,27,42,0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 50,
          flexShrink: 0,
        }}>
          {/* Hamburger — mobile only */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', color: '#94a3b8',
            }}
          >
            <Menu size={18} />
          </button>

          {/* Search — hidden on mobile */}
          <div className="topbar-search" style={{
            flex: 1, maxWidth: 380, display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 14px',
          }}>
            <Search size={15} color="#475569" />
            <input
              placeholder="Search by Name"
              style={{ background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, flex: 1 }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Bell — hidden on mobile */}
            <button className="topbar-bell" style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative',
            }}>
              <Bell size={15} color="#94a3b8" />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444', border: '1.5px solid #0d1b2a',
              }} />
            </button>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: '#fff',
                overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(59,130,246,0.3)',
              }}>
                {user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G'}</span>
                )}
              </div>
              <div className="topbar-userinfo" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>Admin</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', margin: 0, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName || user?.email || 'Guest'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '28px 24px', flex: 1, minWidth: 0 }}>
          {active === 'tests' ? (
            <AdminTestsContent />
          ) : active === 'skill-tests' ? (
            <AdminSkillTestsContent />
          ) : active === 'students' && userRole === 'superadmin' ? (
            <StudentsList />
          ) : (
            <>
              {/* Page Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Overview</h1>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Take a look on all of your important data</p>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13, color: '#94a3b8', cursor: 'pointer',
                }}>
                  <Calendar size={14} />
                  January 2025
                </div>
              </div>

          {/* Stat Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {stats.map(({ label, value, change, up, color, icon: Icon }) => (
              <div key={label} style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '18px 20px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -16, right: -16,
                  width: 80, height: 80, borderRadius: '50%',
                  background: color, opacity: 0.08,
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</p>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                </div>
                <p style={{ margin: '10px 0 6px', fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: up ? '#22c55e' : '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {change}
                </p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 24 }}>

            {/* Line Chart */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '20px 20px 12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Applications Trend</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="value"
                    stroke="#f97316" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Applications by Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 12 }}>
                  <ChevronLeft size={14} /> March 2023 <ChevronRight size={14} />
                </div>
              </div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusData} cx="50%" cy="50%"
                      innerRadius={52} outerRadius={75}
                      dataKey="value" paddingAngle={3}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center', pointerEvents: 'none',
                }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>500</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>Total Application</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8, justifyContent: 'center' }}>
                {statusData.map(({ name, value, color }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block' }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>{name} {value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

            {/* Bar Chart — Top Universities */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '20px',
            }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Top Performing Universities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {uniData.map(({ name, value }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#64748b', width: 32, textAlign: 'right' }}>{name}</span>
                    <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 6,
                        width: `${value}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', width: 28 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '20px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {recentActivity.map(({ title, sub, time, dot }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dot, marginTop: 5, shrink: 0, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{title}</p>
                        <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', marginLeft: 8 }}>{time}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

              </div>
            </>
          )}
        </main>
      </div>


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        button { font-family: 'DM Sans', sans-serif; }
        input { font-family: 'DM Sans', sans-serif; }

        /* ── Desktop: sidebar always visible ── */
        @media (min-width: 768px) {
          .sidebar { left: 0 !important; }
          .sidebar-toggle { display: none !important; }
        }

        /* ── Mobile: sidebar hidden by default, hamburger shown ── */
        @media (max-width: 767px) {
          .main-content { margin-left: 0 !important; }
          .sidebar-toggle { display: flex !important; }
          .sidebar-close { display: flex !important; }
          .topbar-search { display: none !important; }
          .topbar-userinfo { display: none !important; }
          .topbar-bell { display: none !important; }

          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col-grid { grid-template-columns: 1fr !important; }

          .admin-stats-bar { left: 0 !important; padding: 0 16px !important; }
          .tests-grid { grid-template-columns: 1fr !important; }

          .main-content > main { padding: 16px !important; }
        }

        /* ── Very small screens: single column stats ── */
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}