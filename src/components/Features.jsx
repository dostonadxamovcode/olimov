import { memo } from 'react';
import { Timer, Zap, ChartBar as BarChart2, TrendingUp, Globe, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { useSiteContent } from '../services/siteContentService';

const iconMap = { Timer, Zap, BarChart2, TrendingUp, Globe, ShieldCheck };

// Memoized card — only re-renders when its own props change
const FeatureCard = memo(function FeatureCard({ feat, index, visible }) {
  const { t } = useTranslation();
  const Icon = iconMap[feat.icon];
  return (
    <div
      className="premium-card premium-card-hover group p-3.5 sm:p-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${index * 60}ms, transform 0.55s ease ${index * 60}ms`,
      }}
    >
      <div className="mb-2 sm:mb-3 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/15 group-hover:scale-105 transition-transform duration-200">
        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0ea5e9]" />}
      </div>
      <h3 className="text-white font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 leading-snug">
        {t(`features.${feat.id}.title`)}
      </h3>
      <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-none">
        {t(`features.${feat.id}.description`)}
      </p>
    </div>
  );
});

export default function Features() {
  const { t } = useTranslation();
  const [ref, inView] = useInView(0.07);
  const features = useSiteContent('features');

  return (
    <section id="features" className="section-panel py-10 sm:py-14" ref={ref}>
      <div className="absolute right-0 top-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[#0ea5e9]/08 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[#8b5cf6]/06 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-center">

          {/* Left */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="gold-badge mb-3 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span>{t('features.badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {t('features.title')}{' '}
              <span className="gradient-text">{t('features.highlight')}</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              {t('features.subtitle')}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="premium-card premium-card-hover p-3 sm:p-4">
                <div className="mb-0.5 sm:mb-1 text-xl sm:text-2xl font-bold text-[#0ea5e9]">98%</div>
                <div className="text-gray-400 text-[10px] sm:text-xs">{t('features.satisfaction')}</div>
              </div>
              <div className="premium-card premium-card-hover p-3 sm:p-4">
                <div className="mb-0.5 sm:mb-1 text-xl sm:text-2xl font-bold text-[#8b5cf6]">3 mo</div>
                <div className="text-gray-400 text-[10px] sm:text-xs">{t('features.avgTime')}</div>
              </div>
            </div>
          </div>

          {/* Right — 2×2 on mobile, 2×3 on desktop */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:gap-4">
            {features.map((feat, i) => (
              <FeatureCard key={feat.id ?? i} feat={feat} index={i} visible={inView} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
