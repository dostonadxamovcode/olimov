import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

export default function ExamTerminated() {
  const navigate = useNavigate()
  const [showInput, setShowInput] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleUnlock = () => {
    if (password === '2026') {
      navigate('/level')
    } else {
      setError("Parol noto'g'ri")
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Imtihon bekor qilindi</h1>
        <p className="text-slate-400 mb-8">
          Siz ko'chirmoqchi bo'ldingiz! Xavfsizlik sababli imtihon avtomatik ravishda to'xtatildi.
        </p>

        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Parolni kiriting"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleUnlock}
              className="w-full px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
            >
              Tasdiqlash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
