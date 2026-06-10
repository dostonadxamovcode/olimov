import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Target, Timer, ChartBar, Sparkles, Zap, ArrowRight } from 'lucide-react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const TEST_CARDS = [
  {
    icon: FileText,
    title: 'Full CEFR Mock',
    description: 'Complete 3-hour CEFR simulation covering all four skills with strict timing.',




    stats: [
      { label: 'Duration', value: '3 hours' },
      { label: 'Sections', value: '4 Skills' },
      { label: 'Questions', value: '160' },
    ],
    iconFrom: '#a855f7',
    iconTo: '#7c3aed',
    iconColor: '#c084fc',
    borderClass: 'border-purple-500/20',
    hoverBorderClass: 'hover:border-purple-400/45',
    statColor: 'text-purple-400',
    btnGrad: 'from-purple-500 to-violet-600',
    glow: 'rgba(168, 85, 247, 0.10)',
    delay: 0,
  },
  {
    icon: Clock,
    title: 'Quick Practice',
    description: 'Focused practice sessions on specific question types or mini-tests.',
    stats: [
      { label: 'Duration', value: '45 mins' },
      { label: 'Sections', value: '1 Section' },
      { label: 'Questions', value: '40' },
    ],
    iconFrom: '#3b82f6',
    iconTo: '#06b6d4',
    iconColor: '#60a5fa',
    borderClass: 'border-blue-500/20',
    hoverBorderClass: 'hover:border-blue-400/45',
    statColor: 'text-blue-400',
    btnGrad: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59, 130, 246, 0.10)',
    delay: 100,
  },
  {
    icon: Target,
    title: 'Skill-Specific',
    description: 'Target specific weaknesses. Individual tests for Reading, Listening, Writing, or Speaking.',
    stats: [
      { label: 'Duration', value: '30–60 mins' },
      { label: 'Sections', value: 'Single' },
      { label: 'Questions', value: 'Varies' },
    ],
    iconFrom: '#10b981',
    iconTo: '#059669',
    iconColor: '#34d399',
    borderClass: 'border-emerald-500/20',
    hoverBorderClass: 'hover:border-emerald-400/45',
    statColor: 'text-emerald-400',
    btnGrad: 'from-emerald-500 to-green-600',
    glow: 'rgba(16, 185, 129, 0.10)',
    delay: 200,
  },
];

const FEATURE_CARDS = [
  {
    icon: Timer,
    title: 'Timed Practice',
    subtitle: 'Real Exam Simulation',
    iconColor: 'text-amber-400',
    iconBg: 'from-amber-500/20 to-orange-500/15',
    delay: 0,
  },
  {
    icon: ChartBar,
    title: 'Deep Analysis',
    subtitle: 'Skill Breakdown',
    iconColor: 'text-blue-400',
    iconBg: 'from-blue-500/20 to-indigo-500/15',
    delay: 80,
  },
  {
    icon: Sparkles,
    title: 'AI Prediction',
    subtitle: 'Score Estimation',
    iconColor: 'text-violet-400',
    iconBg: 'from-violet-500/20 to-purple-500/15',
    delay: 160,
  },
  {
    icon: Zap,
    title: 'Fast Feedback',
    subtitle: 'Instant Results',
    iconColor: 'text-emerald-400',
    iconBg: 'from-emerald-500/20 to-teal-500/15',
    delay: 240,
  },
];

export default function 



MockTests() {
  const navigate = useNavigate();
  const [sectionRef, inView] = useInView(0.1);

  return (
    <section
      id="ielts-mock-tests"
      tabIndex={-1}
      data-scroll-highlight
      className="section-deep py-20 outline-none"
      ref={sectionRef}
    >
      {/* Ambient blobs */}
      <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-purple-600/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-blue-600/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-emerald-600/[0.05] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          className="text-center mb-14"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="gold-badge mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Premium Practice</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            CEFR{' '}
            <span className="gradient-text-accent">MOCK</span>
            {' '}Tests
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Practice with authentic CEFR simulations. Get detailed feedback, track your progress,




            and experience the real exam environment.
          </p>
        </div>

        {/* 3 main test cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {TEST_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(28px)',
                  transition: 'opacity 0.7s ease, transform 0.7s ease',
                  transitionDelay: inView ? `${card.delay + 200}ms` : '0ms',
                }}
              >
                <div
                  className={`premium-card group h-full p-6 flex flex-col ${card.borderClass} ${card.hoverBorderClass} transition-all duration-300 hover:-translate-y-1.5`}
                  style={{ boxShadow: `0 0 50px ${card.glow}, var(--shadow-lg)` }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${card.iconFrom}28, ${card.iconTo}18)`,
                      border: `1px solid ${card.iconFrom}35`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">{card.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl border border-white/[0.06] bg-white/[0.025]">
                    {card.stats.map((stat, j) => (
                      <div key={j} className="text-center">
                        <div className={`text-xs sm:text-sm font-bold ${card.statColor}`}>{stat.value}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => { if (i === 2) navigate('/skill-tests'); }}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r ${card.btnGrad} shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
                  >
                    Start Test
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 compact feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_CARDS.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  transitionDelay: inView ? `${550 + feat.delay}ms` : '0ms',
                }}
              >
                <div className="premium-card premium-card-hover group p-5 flex flex-col items-center text-center gap-3 h-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.iconBg} border border-white/[0.08] group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{feat.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{feat.subtitle}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
