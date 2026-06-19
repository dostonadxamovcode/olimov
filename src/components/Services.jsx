import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChartBar as BarChart3, BookOpen, Dot, FilePenLine, Headphones, Mic, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';
import { useSiteContent } from '../services/siteContentService';

const icons = [Headphones, BookOpen, FilePenLine, Mic, Trophy, BarChart3];

const gradientColors = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-blue-600',
];

const bulletColors = [
  'text-green-400', 'text-blue-400', 'text-purple-400',
  'text-orange-400', 'text-red-400', 'text-indigo-400',
];

const ServiceCard = memo(function ServiceCard({ s, index, visible }) {
  const { t } = useTranslation();
  const Icon       = icons[index % icons.length];
  const gradient   = gradientColors[index % gradientColors.length];
  const bulletColor = bulletColors[index % bulletColors.length];
  const sFeatures  = t(`services.${s.id}.features`, { returnObjects: true });

  return (
    // Outer: scroll-enter animation (opacity + translateY)
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.55s ease ${index * 70}ms, transform 0.55s ease ${index * 70}ms`,
      }}
    >
      {/* Inner: hover lift — separate div so inline style doesn't clash with CSS hover */}
      <div className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-indigo-500/20 bg-[#0b1023] p-3 sm:rounded-3xl sm:p-5 hover:-translate-y-1.5 hover:border-indigo-500/40 transition-[transform,border-color] duration-300">

        <div className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform duration-200 sm:mb-5 sm:h-14 sm:w-14`}>
          <Icon className="h-4 w-4 sm:h-7 sm:w-7" />
        </div>

        <h3 className="mb-1 text-xs font-bold leading-snug text-white sm:mb-2 sm:text-base">
          {t(`services.${s.id}.title`)}
        </h3>
        <p className="mb-2.5 text-[10px] leading-relaxed text-gray-400 sm:text-xs sm:mb-4">
          {t(`services.${s.id}.description`)}
        </p>

        <ul className="mb-4 hidden space-y-2 sm:block">
          {Array.isArray(sFeatures) && sFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-2 flex-shrink-0`} />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          to={`/services/${s.slug}`}
          className={`mt-auto block w-full rounded-lg sm:rounded-xl bg-gradient-to-r ${gradient} px-2 py-2 sm:px-4 sm:py-2.5 text-center text-[10px] sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity duration-200`}
        >
          {t('services.getStarted')}
        </Link>
      </div>
    </div>
  );
});

export default function Services() {
  const { t } = useTranslation();
  const [ref, inView] = useInView(0.05);
  const services = useSiteContent('services');

  return (
    <section id="services" className="relative overflow-hidden bg-[#050816] py-10 sm:py-16" ref={ref}>
      {/* pointer-events-none on all blobs — without it they sit above grid cards in
          stacking order (abs-pos beats normal-flow) and intercept hover/click events */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          className="mb-6 text-center sm:mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.65s ease, transform 0.65s ease',
          }}
        >
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
          <p className="mx-auto max-w-2xl text-xs text-gray-400 sm:text-sm">{t('services.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} visible={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
