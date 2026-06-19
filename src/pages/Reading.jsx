import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const READING_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "CEFR Reading Drills",
  "description": "Improve CEFR reading comprehension with academic texts, timed passages, vocabulary building, and exam-strategy coaching.",
  "url": "https://olimov.vercel.app/services/reading",
  "provider": {
    "@type": "EducationalOrganization",
    "@id": "https://olimov.vercel.app/#organization",
    "name": "Olimov CEFR"
  },
  "educationalLevel": "A1-C2",
  "teaches": "CEFR Reading Comprehension",
  "inLanguage": "en"
})

export default function Reading() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <SEO
        title="Reading Drills"
        description="Improve CEFR reading comprehension with academic texts, timed passages, vocabulary building, and exam-strategy coaching."
        canonical="https://olimov.vercel.app/services/reading"
        schema={READING_SCHEMA}
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
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h1 className="text-3xl font-bold text-white mb-2">Reading Page</h1>
            <p className="text-gray-400">{t('underConstruction.comingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
