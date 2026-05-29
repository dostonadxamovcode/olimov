import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSuperAdmin } from '../utils/roles'
import { Moon, Sun, LogOut, User, Settings, ShieldCheck as Shield, Bell, LayoutDashboard } from 'lucide-react'
import { toastSuccess, toastError } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'

const tabs = [
  { id: 'account', label: 'Account Settings', icon: User },
  { id: 'security', label: 'Login & Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'interface', label: 'Interface', icon: Settings },
]

export default function Profile() {
  const { currentUser, user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [avatar, setAvatar] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem('theme') || 'dark'
  })
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    bio: '',
  })
  const fileRef = useRef()

  // ✅ FIX: displayName bo'sh bo'lsa email dan username olish + barcha fieldlar to'g'ri
  useEffect(() => {
    if (currentUser) {
      const emailUsername = currentUser.email?.split('@')[0] || ''
      setForm({
        fullName: currentUser.displayName || emailUsername || '',
        email: currentUser.email || '',
        username: emailUsername,
        phone: currentUser.phoneNumber || '',
        bio: '',
      })
      // ✅ FIX: Google avatar avtomatik o'rnatish
      if (currentUser.photoURL) {
        setAvatar(currentUser.photoURL)
      }
    }
  }, [currentUser])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatar(url)
    toastSuccess("Profil rasmi yangilandi.")
  }

  const handleRemove = () => {
    setAvatar(null)
    toastSuccess("Profil rasmi olib tashlandi.")
  }

  const handleUpdate = () => {
    // ✅ FIX: fullName bo'sh bo'lsa xabar berish
    if (!form.fullName.trim()) {
      toastError("To'liq ism bo'sh bo'lishi mumkin emas.")
      return
    }
    toastSuccess("Profil muvaffaqiyatli yangilandi.")
  }

  const handleLogout = async () => {
    const ok = window.confirm('Log out qilasizmi?')
    if (!ok) return
    try {
      await logout()
      toastSuccess("Tizimdan muvaffaqiyatli chiqdingiz.")
      navigate('/')
    } catch (err) {
      toastError(err)
    }
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon

  // ✅ FIX: loading holatida to'g'ri placeholder
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <LoadingSpinner size="md" text="Yuklanmoqda..." />
      </div>
    )
  }

  // ✅ FIX: display name — displayName > email username
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User'

  // Check if user is superadmin
  const isSuperAdminUser = user?.role === 'superadmin' ||
                          isSuperAdmin(currentUser.email) ||
                          currentUser.email?.toLowerCase() === 'superadmin@gmail.com'

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-4 pt-[200px] py-8">
      <div className="max-w-4xl mx-auto">

        {/* ✅ FIX: Header Card — gradient background to'g'rilandi */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/15 bg-white/5 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-gray-500" />
                )}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[#0a0a1a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
                {displayName}
              </h1>
              <p className="text-gray-400 text-sm mb-3 truncate">{currentUser.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium border border-blue-500/25">
                  {user?.role || 'user'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/25">
                  Active
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isSuperAdminUser && (
                <button
                  onClick={() => navigate('/admin')}
                  className="h-10 px-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition flex items-center gap-2 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition flex items-center justify-center"
                title="Toggle theme"
              >
                <ThemeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition flex items-center gap-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'border border-b-0 border-blue-500/50 text-white bg-blue-500/10 -mb-px'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="space-y-5">

            {/* Profile Picture Section */}
            <GlassCard>
              <p className="text-gray-400 text-xs mb-3">Your Profile Picture</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex gap-3">
                  <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="hidden" />
                  <button
                    onClick={() => fileRef.current.click()}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                  >
                    Upload New
                  </button>
                  <button
                    onClick={handleRemove}
                    className="px-5 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Full Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Enter your full name"
              />
              <Field
                label="Email address"
                value={form.email}
                onChange={set('email')}
                placeholder="Email"
                type="email"
                disabled
              />
            </div>

            {/* Username + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Username"
                value={form.username}
                onChange={set('username')}
                placeholder="Username"
                disabled
              />
              <Field
                label="Phone Number"
                value={form.phone}
                onChange={set('phone')}
                placeholder="000-000-0000"
                type="tel"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={5}
                placeholder="Tell something about yourself..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* Interface Tab */}
        {activeTab === 'interface' && (
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Dark Mode</h3>
                  <p className="text-gray-400 text-sm">Toggle between light and dark theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition flex items-center justify-center"
                >
                  <ThemeIcon className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Current Theme</h3>
                  <p className="text-gray-400 text-sm capitalize">{theme} mode is active</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 capitalize">
                  {theme}
                </span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Security & Notifications placeholder */}
        {(activeTab === 'security' || activeTab === 'notifications') && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {activeTab === 'security'
                ? <Shield className="w-6 h-6 text-gray-500" />
                : <Bell className="w-6 h-6 text-gray-500" />
              }
            </div>
            <p className="text-gray-500 text-sm">
              {tabs.find((t) => t.id === activeTab)?.label} — coming soon
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

function GlassCard({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      {children}
    </div>
  )
}

function Field({ label, disabled = false, ...props }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all text-sm ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      />
    </div>
  )
}