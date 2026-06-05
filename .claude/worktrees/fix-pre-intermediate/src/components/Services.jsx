import React from 'react'
import { Link } from 'react-router-dom'
import { ChartBar as BarChart3, BookOpen, Dot, FilePenLine, Headphones, Mic, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { services } from '../data/siteData'

const icons = [Headphones, BookOpen, FilePenLine, Mic, Trophy, BarChart3]

const gradientColors = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-blue-600'
]

const bulletColors = [
  'text-green-400',
  'text-blue-400',
  'text-purple-400',
  'text-orange-400',
  'text-red-400',
  'text-indigo-400'
]

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="relative overflow-hidden bg-[#050816] py-10 sm:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-indigo-300 text-xs font-medium">{t('services.badge')}</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white sm:mb-3 sm:text-4xl">
            {t('services.title')}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent block">
              {t('services.highlight')}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-gray-400 sm:text-sm">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[i % icons.length]
            const gradient = gradientColors[i % gradientColors.length]
            const bulletColor = bulletColors[i % bulletColors.length]
            const sFeatures = t(`services.${s.id}.features`, { returnObjects: true })

            return (
              <div
                key={s.id}
                className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-indigo-500/20 bg-[#0b1023] p-3 transition-all duration-300 ease-in-out hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] sm:rounded-3xl sm:p-5"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white transition-transform group-hover:scale-110 sm:mb-6 sm:h-14 sm:w-14`}>
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>

                <h3 className="mb-1.5 text-xs font-bold leading-tight text-white sm:mb-2 sm:text-base">
                  {t(`services.${s.id}.title`)}
                </h3>
                <p className="mb-2 text-[10px] leading-4 text-gray-400 sm:mb-4 sm:text-xs sm:leading-relaxed">
                  {t(`services.${s.id}.description`)}
                </p>

                <ul className="mb-6 hidden space-y-3 sm:block">
                  {Array.isArray(sFeatures) && sFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-2 flex-shrink-0`} />
                      <span className="text-gray-300 text-sm flex align-center"><Dot/> {feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/services/${s.slug}`}
                  className={`mt-auto block w-full rounded-xl bg-gradient-to-r ${gradient} px-3 py-2 text-center text-xs font-semibold text-white transition-all duration-300 hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm`}
                >
                  {t('services.getStarted')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
