import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSuperAdmin } from '../utils/roles'
import {
  Moon, Sun, LogOut, User, Settings,
  ShieldCheck as Shield, Bell, LayoutDashboard,
  Camera, Trash2, Loader2,
} from 'lucide-react'
import { toastSuccess, toastError } from '../utils/errorHandler'
import { LoadingSpinner } from '../components/ui/SkeletonLoader'
import ConfirmModal from '../components/ui/ConfirmModal'

// Compress image to ~256x256 JPEG and return base64 data URL (~15-40 KB)
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const MAX = 256
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)
    img.onload = () => {
      let { width: w, height: h } = img
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else       { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(blobUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.78))
    }
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('Image load failed')) }
    img.src = blobUrl
  })
}

const tabs = [
  { id: 'account',       label: 'Account Settings', icon: User },
  { id: 'security',      label: 'Login & Security',  icon: Shield },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
  { id: 'interface',     label: 'Interface',          icon: Settings },
]

const MAX_IMAGE_MB = 5
const USERNAME_RE  = /^[a-zA-Z0-9_]{3,20}$/
const PHONE_RE     = /^[+\d\s\-(]{7,20}$/

export default function Profile() {
  const { currentUser, user, logout, updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const [activeTab,  setActiveTab]  = useState('account')
  const [avatar,     setAvatar]     = useState(null)
  const [theme,      setTheme]      = useState(() => localStorage.getItem('theme') || 'dark')

  const [form, setForm] = useState({ fullName: '', email: '', username: '', phone: '', bio: '' })
  const [errors, setErrors]       = useState({})
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing,  setRemoving]  = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const fileRef = useRef()

  // ── Load Firebase Auth data ──────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    const emailUser = currentUser.email?.split('@')[0] || ''
    setForm(f => ({
      ...f,
      fullName: currentUser.displayName || emailUser,
      email:    currentUser.email || '',
      username: f.username || emailUser,
    }))
    if (currentUser.photoURL) setAvatar(currentUser.photoURL)
  }, [currentUser?.uid])

  // ── Load extra fields from Firestore (bio, phone, username, photoURL) ─
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false

    const load = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore')
        const { db } = await import('../firebase')
        const snap = await getDoc(doc(db, 'users', currentUser.uid))
        if (cancelled) return
        if (snap.exists()) {
          const d = snap.data()
          const emailUser = currentUser.email?.split('@')[0] || ''
          setForm(f => ({
            ...f,
            username: d.username  || f.username,
            phone:    d.phone     || '',
            bio:      d.bio       || '',
            // displayName: Firestore > Auth > email prefix
            fullName: d.displayName || currentUser.displayName || emailUser || f.fullName,
          }))
          // photoBase64 (Firestore upload) > photoURL (Google/Auth)
          if (d.photoBase64)      setAvatar(d.photoBase64)
          else if (d.photoURL)    setAvatar(d.photoURL)
        }
      } catch {
        // Auth data already loaded above — Firestore failure is non-critical
      } finally {
        if (!cancelled) setProfileLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [currentUser?.uid])

  // ── Theme ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.fullName.trim())                    e.fullName = 'Ism bo\'sh bo\'lishi mumkin emas'
    if (form.username && !USERNAME_RE.test(form.username))
      e.username = 'Username: 3-20 ta harf, raqam yoki _'
    if (form.phone && !PHONE_RE.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Telefon raqami noto\'g\'ri formatda'
    return e
  }

  // ── Image upload — Firestore base64 (no Storage/CORS needed) ──
  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toastError(`Rasm hajmi ${MAX_IMAGE_MB}MB dan oshmasin`)
      return
    }
    if (!file.type.startsWith('image/')) {
      toastError('Faqat rasm fayllari qabul qilinadi')
      return
    }

    setUploading(true)

    try {
      // Compress → base64 (~15-40 KB, safe for Firestore)
      const base64 = await compressImage(file)

      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      await setDoc(doc(db, 'users', currentUser.uid), {
        photoBase64: base64,
        updatedAt:   serverTimestamp(),
      }, { merge: true })

      setAvatar(base64)
      toastSuccess('Profil rasmi yangilandi')
    } catch {
      toastError('Rasmni saqlashda xatolik yuz berdi')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Image remove ─────────────────────────────────────────────
  const handleRemove = async () => {
    if (!avatar) return
    setRemoving(true)
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      await setDoc(doc(db, 'users', currentUser.uid), {
        photoBase64: null,
        photoURL:    null,
        updatedAt:   serverTimestamp(),
      }, { merge: true })

      // Clear Auth photoURL too (no-op if already null)
      if (currentUser.photoURL) {
        await updateUserProfile({ photoURL: null })
      }

      setAvatar(null)
      toastSuccess("Profil rasmi o'chirildi")
    } catch {
      toastError("Rasmni o'chirishda xatolik yuz berdi")
    } finally {
      setRemoving(false)
    }
  }

  // ── Save profile ─────────────────────────────────────────────
  const handleUpdate = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Ensure displayName is never null/empty — fallback to email prefix
    const emailUser = currentUser.email?.split('@')[0] || 'user'
    const displayName = form.fullName.trim() || currentUser.displayName || emailUser

    setSaving(true)
    try {
      await updateUserProfile({
        displayName,
        username: form.username.trim(),
        phone:    form.phone.trim(),
        bio:      form.bio.trim(),
      })
      // Sync local form to show the saved value
      setForm(f => ({ ...f, fullName: displayName }))
      toastSuccess('Profil muvaffaqiyatli yangilandi')
      setErrors({})
    } catch {
      toastError('Profilni yangilashda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logout()
      toastSuccess('Tizimdan muvaffaqiyatli chiqdingiz.')
      navigate('/')
    } catch {
      toastError('Chiqishda xatolik yuz berdi')
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <LoadingSpinner size="md" text="Yuklanmoqda..." />
      </div>
    )
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
  const isSuperAdminUser = user?.role === 'superadmin' ||
                           isSuperAdmin(currentUser.email) ||
                           currentUser.email?.toLowerCase() === 'superadmin@gmail.com'

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-4 pt-[88px] pb-12">
      <div className="max-w-4xl mx-auto">

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/15 bg-white/5 flex items-center justify-center">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User className="w-9 h-9 text-gray-500" />
                }
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[#0a0a1a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">{displayName}</h1>
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

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isSuperAdminUser && (
                <button
                  onClick={() => navigate('/admin')}
                  className="h-10 px-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition flex items-center gap-2 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition flex items-center justify-center"
              >
                <ThemeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center gap-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
                activeTab === id
                  ? 'border border-b-0 border-blue-500/50 text-white bg-blue-500/10 -mb-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Account Settings ──────────────────────────── */}
        {activeTab === 'account' && (
          <div className="space-y-5">

            {/* Profile Picture */}
            <GlassCard>
              <p className="text-gray-400 text-xs mb-3">Profile Picture</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shrink-0 relative">
                  {avatar
                    ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <User className="w-6 h-6 text-gray-500" />
                  }
                  {(uploading || removing) && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || removing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                  </button>
                  {avatar && (
                    <button
                      onClick={handleRemove}
                      disabled={uploading || removing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 text-sm font-medium transition"
                    >
                      {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      {removing ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Full Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="To'liq ism *"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Ismingizni kiriting"
                error={errors.fullName}
              />
              <Field
                label="Email manzil"
                value={form.email}
                placeholder="Email"
                type="email"
                disabled
                hint="Email o'zgartirib bo'lmaydi"
              />
            </div>

            {/* Username + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Username"
                value={form.username}
                onChange={set('username')}
                placeholder="username (3-20 ta belgi)"
                error={errors.username}
              />
              <Field
                label="Telefon raqami"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+998 90 000 00 00"
                type="tel"
                error={errors.phone}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={4}
                maxLength={300}
                placeholder="O'zingiz haqida yozing..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
              />
              <p className="text-gray-600 text-xs mt-1 text-right">{form.bio.length}/300</p>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleUpdate}
                disabled={saving || uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saqlanmoqda...' : 'Profilni saqlash'}
              </button>
              {!profileLoaded && (
                <span className="text-gray-500 text-xs">Ma'lumotlar yuklanmoqda...</span>
              )}
            </div>
          </div>
        )}

        {/* ── Interface Tab ──────────────────────────────── */}
        {activeTab === 'interface' && (
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Dark Mode</h3>
                  <p className="text-gray-400 text-sm">Mavzuni almashtirish</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition flex items-center justify-center"
                >
                  <ThemeIcon className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Joriy mavzu</h3>
                  <p className="text-gray-400 text-sm capitalize">{theme === 'dark' ? 'Qorong\'i' : 'Yorug\''} rejim faol</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 capitalize">
                  {theme}
                </span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── Security & Notifications (coming soon) ─────── */}
        {(activeTab === 'security' || activeTab === 'notifications') && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {activeTab === 'security'
                ? <Shield className="w-6 h-6 text-gray-500" />
                : <Bell className="w-6 h-6 text-gray-500" />
              }
            </div>
            <p className="text-gray-500 text-sm">
              {tabs.find(t => t.id === activeTab)?.label} — tez orada
            </p>
          </div>
        )}

      </div>

      {/* Logout Modal */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        variant="default"
        title="Tizimdan chiqish"
        message="Hisobingizdan chiqmoqchimisiz?"
        confirmLabel="Chiqish"
      />
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

function Field({ label, disabled = false, error, hint, ...props }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 outline-none transition-all text-sm ${
          error
            ? 'border-red-500/60 focus:border-red-500/80'
            : disabled
              ? 'border-white/10 opacity-40 cursor-not-allowed'
              : 'border-white/10 focus:border-blue-500/50'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </div>
  )
}
