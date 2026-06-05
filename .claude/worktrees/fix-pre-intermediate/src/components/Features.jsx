import { Timer, Zap, ChartBar as BarChart2, TrendingUp, Globe, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { features } from '../data/siteData';

const iconMap = { Timer, Zap, BarChart2, TrendingUp, Globe, ShieldCheck };

export default function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-panel py-14">
      <div className="absolute right-0 top-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[#0ea5e9]/08 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[#8b5cf6]/06 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="gold-badge mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span>{t('features.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {t('features.title')}{' '}
              <span className="gradient-text">
                {t('features.highlight')}
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('features.subtitle')}
            </p>

            {/* Visual stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="premium-card premium-card-hover p-4">
                <div className="mb-1 text-2xl font-bold text-[#0ea5e9]">98%</div>
                <div className="text-gray-400 text-xs">{t('features.satisfaction')}</div>
              </div>
              <div className="premium-card premium-card-hover p-4">
                <div className="mb-1 text-2xl font-bold text-[#8b5cf6]">3 mo</div>
                <div className="text-gray-400 text-xs">{t('features.avgTime')}</div>
              </div>
            </div>
          </div>

          {/* Right — feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, i) => {
              const Icon = iconMap[feat.icon];
              return (
                <div
                  key={i}
                  className="premium-card premium-card-hover group p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/15 group-hover:scale-105 transition-transform">
                    {Icon && <Icon className="w-5 h-5 text-[#0ea5e9]" />}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {t(`features.${feat.id}.title`)}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {t(`features.${feat.id}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
