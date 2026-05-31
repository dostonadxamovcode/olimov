import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

export default function ExamTerminated() {
  const navigate = useNavigate()

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
        <button
          onClick={() => navigate('/level')}
          className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  )
}
