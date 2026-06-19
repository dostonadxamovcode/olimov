import { useTranslation } from 'react-i18next'
import { ArrowLeft, PenTool } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const WRITING_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "CEFR Writing Coaching",
  "description": "Master CEFR writing with Task 1 & 2 coaching, sample essays, grammar feedback, and band score tips from expert instructors.",
  "url": "https://olimov.vercel.app/services/writing",
  "provider": {
    "@type": "EducationalOrganization",
    "@id": "https://olimov.vercel.app/#organization",
    "name": "Olimov CEFR"
  },
  "educationalLevel": "A1-C2",
  "teaches": "CEFR Academic Writing",
  "inLanguage": "en"
})

export default function Writing() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <SEO
        title="Writing Coaching"
        description="Master CEFR writing with Task 1 & 2 coaching, sample essays, grammar feedback, and band score tips from expert instructors."
        canonical="https://olimov.vercel.app/services/writing"
        schema={WRITING_SCHEMA}
      />
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-4xl mx-auto">
        <div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> {t('underConstruction.backHome')}
          </button>

          <div className="premium-card p-12">
            <PenTool className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            <h1 className="text-3xl font-bold text-white mb-2">Writing Page</h1>
            <p className="text-gray-400">{t('underConstruction.comingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
