import { useTranslation } from 'react-i18next'
import { ArrowLeft, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Tools() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center animate-fadeIn">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> {t('underConstruction.backHome')}
          </button>

          <div className="premium-card p-12">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h1 className="text-3xl font-bold text-white mb-2">Tools Page</h1>
            <p className="text-gray-400">{t('underConstruction.comingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
