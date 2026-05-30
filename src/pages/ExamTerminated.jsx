import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldAlert, Home, AlertTriangle } from 'lucide-react'

export default function ExamTerminated() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #080c14 0%, #0d1220 50%, #080c14 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)', top: '20%', left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(239,68,68,0.08)',
          }}
        >
          {/* Top shimmer */}
          <div className="h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)' }} />

          <div className="p-8 sm:p-10 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 8px 32px rgba(239,68,68,0.2)',
                }}
              >
                <ShieldAlert className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              {t('examTerminated.title')}
            </h1>

            {/* Main message */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-2">
              {t('examTerminated.message')}
            </p>

            {/* Reason badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-2 mb-8"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-xs font-medium text-red-300">{t('examTerminated.reason')}</span>
            </div>

            {/* Divider */}
            <div className="h-px mb-8"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

            {/* Note */}
            <p className="text-gray-500 text-xs leading-relaxed mb-8">
              {t('examTerminated.note')}
            </p>

            {/* Button */}
            <button
              onClick={() => navigate('/', { replace: true })}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}
            >
              <Home className="w-4 h-4" />
              {t('examTerminated.backHome')}
            </button>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-center text-gray-600 text-xs mt-6">
          {t('examTerminated.caption')}
        </p>
      </div>
    </div>
  )
}
