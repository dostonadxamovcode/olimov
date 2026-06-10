import { memo } from 'react';
import { Users, Star, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';

const milestones = [
  { icon: Users, value: '500+', key: 'm0' },
  { icon: Star,  value: '7.0',  key: 'm1' },
  { icon: Clock, value: '24/7', key: 'm2' },
  { icon: CheckCircle, value: '30+', key: 'm3' },
];

const MilestoneCard = memo(function MilestoneCard({ m, index, visible }) {
  const { t } = useTranslation();
  const Icon = m.icon;
  return (
    <div
      className="premium-card premium-card-hover group p-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`,
      }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] shadow-lg shadow-[#0ea5e9]/20 group-hover:scale-105 transition-transform duration-200">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="gradient-text mb-1 text-2xl font-bold">{m.value}</div>
      <div className="text-gray-400 text-xs">{t('about.' + m.key)}</div>
    </div>
  );
});

export default function About() {
  const { t } = useTranslation();
  const [ref, inView] = useInView(0.07);
  const values = t('about.values', { returnObjects: true });

  return (
    <section id="about" className="section-deep py-14" ref={ref}>
      {/* Blob: pointer-events-none prevents event interception */}
      <div className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0ea5e9]/08 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="gold-badge mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span>{t('about.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {t('about.title')}{' '}
              <span className="gradient-text">{t('about.highlight')}</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{t('about.desc1')}</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('about.desc2')}</p>

            <ul className="space-y-3">
              {Array.isArray(values) && values.map((val, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0ea5e9]">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  {val}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — staggered milestone cards */}
          <div className="grid grid-cols-2 gap-3">
            {milestones.map((m, i) => (
              <MilestoneCard key={m.key} m={m} index={i} visible={inView} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
