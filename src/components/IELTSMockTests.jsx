import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Target, Timer, ChartBar, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const TEST_CARDS = [
  {
    icon: FileText,
    title: 'Full CEFR Mock',
    description: 'Complete 3-hour CEFR simulation covering all four skills with strict timing.',
    stats: [
      { label: 'Duration',  value: '3 hours' },
      { label: 'Sections',  value: '4 Skills' },
      { label: 'Questions', value: '160'      },
    ],
    iconFrom: '#a855f7', iconTo: '#7c3aed', iconColor: '#c084fc',
    borderClass:      'border-purple-500/20',
    hoverBorderClass: 'hover:border-purple-400/45',
    statColor: 'text-purple-400',
    btnGrad:   'from-purple-500 to-violet-600',
    glow:      'rgba(168, 85, 247, 0.10)',
    delay: 0,
  },
  {
    icon: Clock,
    title: 'Quick Practice',
    description: 'Focused practice sessions on specific question types or mini-tests.',
    stats: [
      { label: 'Duration',  value: '45 mins'  },
      { label: 'Sections',  value: '1 Section' },
      { label: 'Questions', value: '40'        },
    ],
    iconFrom: '#3b82f6', iconTo: '#06b6d4', iconColor: '#60a5fa',
    borderClass:      'border-blue-500/20',
    hoverBorderClass: 'hover:border-blue-400/45',
    statColor: 'text-blue-400',
    btnGrad:   'from-blue-500 to-cyan-500',
    glow:      'rgba(59, 130, 246, 0.10)',
    delay: 100,
  },
  {
    icon: Target,
    title: 'Skill-Specific',
    description: 'Target specific weaknesses. Individual tests for Reading, Listening, Writing, or Speaking.',
    stats: [
      { label: 'Duration',  value: '30–60 min' },
      { label: 'Sections',  value: 'Single'    },
      { label: 'Questions', value: 'Varies'    },
    ],
    iconFrom: '#10b981', iconTo: '#059669', iconColor: '#34d399',
    borderClass:      'border-emerald-500/20',
    hoverBorderClass: 'hover:border-emerald-400/45',
    statColor: 'text-emerald-400',
    btnGrad:   'from-emerald-500 to-green-600',
    glow:      'rgba(16, 185, 129, 0.10)',
    delay: 200,
  },
];

const FEATURE_CARDS = [
  { icon: Timer,    title: 'Timed Practice', subtitle: 'Real Exam',      iconColor: 'text-amber-400',  iconBg: 'from-amber-500/20 to-orange-500/15',  delay: 0   },
  { icon: ChartBar, title: 'Deep Analysis',  subtitle: 'Skill Breakdown', iconColor: 'text-blue-400',   iconBg: 'from-blue-500/20 to-indigo-500/15',   delay: 80  },
  { icon: Sparkles, title: 'AI Prediction',  subtitle: 'Score Estimate',  iconColor: 'text-violet-400', iconBg: 'from-violet-500/20 to-purple-500/15', delay: 160 },
  { icon: Zap,      title: 'Fast Feedback',  subtitle: 'Instant Results', iconColor: 'text-emerald-400', iconBg: 'from-emerald-500/20 to-teal-500/15', delay: 240 },
];

// ── Memoized sub-components — stable between inView frames ───────────────────
const TestCardItem = memo(function TestCardItem({ card, inView, onStart }) {
  const Icon = card.icon;
  return (
    <div
      style={{
        opacity:         inView ? 1 : 0,
        transform:       inView ? 'translateY(0)' : 'translateY(28px)',
        transition:      'opacity 0.7s ease, transform 0.7s ease',
        transitionDelay: inView ? `${card.delay + 200}ms` : '0ms',
      }}
    >
      <div
        className={`premium-card group h-full p-4 sm:p-6 flex flex-col ${card.borderClass} ${card.hoverBorderClass} transition-[transform,border-color] duration-300 hover:-translate-y-1`}
        style={{ boxShadow: `0 0 50px ${card.glow}, var(--shadow-lg)` }}
      >
        <div
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `linear-gradient(135deg, ${card.iconFrom}28, ${card.iconTo}18)`, border: `1px solid ${card.iconFrom}35` }}
        >
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: card.iconColor }} />
        </div>
        <h3 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 leading-snug">{card.title}</h3>
        <p className="text-gray-400 text-[11px] sm:text-sm leading-relaxed mb-3 sm:mb-5 flex-1 line-clamp-2 sm:line-clamp-none">{card.description}</p>
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-5 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/[0.06] bg-white/[0.025]">
          {card.stats.map((stat, j) => (
            <div key={j} className="text-center">
              <div className={`text-[9px] sm:text-sm font-bold leading-snug ${card.statColor}`}>{stat.value}</div>
              <div className="text-[8px] sm:text-[11px] text-gray-500 mt-0.5 leading-none">{stat.label}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onStart}
          className={`w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-white bg-gradient-to-r ${card.btnGrad} shadow-md sm:shadow-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
        >
          <span className="sm:hidden">Start</span>
          <span className="hidden sm:inline">Start Test</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
});

const FeatureItem = memo(function FeatureItem({ feat, inView }) {
  const Icon = feat.icon;
  return (
    <div
      style={{
        opacity:         inView ? 1 : 0,
        transform:       inView ? 'translateY(0)' : 'translateY(20px)',
        transition:      'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: inView ? `${550 + feat.delay}ms` : '0ms',
      }}
    >
      <div className="premium-card premium-card-hover group p-3.5 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 h-full">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.iconBg} border border-white/[0.08] group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feat.iconColor}`} />
        </div>
        <div>
          <div className="text-white font-semibold text-xs sm:text-sm leading-snug">{feat.title}</div>
          <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{feat.subtitle}</div>
        </div>
      </div>
    </div>
  );
});

export default function MockTests() {
  const navigate = useNavigate();
  const [sectionRef, inView] = useInView(0.1);

  return (
    <section
      id="ielts-mock-tests"
      tabIndex={-1}
      data-scroll-highlight
      className="section-deep py-10 sm:py-20 outline-none"
      ref={sectionRef}
    >
      {/* Ambient blobs */}
      <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-purple-600/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-blue-600/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-emerald-600/[0.05] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          className="text-center mb-8 sm:mb-14"
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="gold-badge mb-3 sm:mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Premium Practice</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight tracking-tight">
            CEFR <span className="gradient-text-accent">MOCK</span> Tests
          </h2>
          <p className="text-gray-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Practice with authentic CEFR simulations. Get detailed feedback, track your progress,
            and experience the real exam environment.
          </p>
        </div>

        {/* 3 test cards — memo components, 2 cols mobile, 3 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-8">
          {TEST_CARDS.map((card, i) => (
            <div key={i} className={i === 2 ? 'col-span-2 lg:col-span-1' : ''}>
              <TestCardItem
                card={card}
                inView={inView}
                onStart={i === 2 ? () => navigate('/skill-tests') : undefined}
              />
            </div>
          ))}
        </div>

        {/* 4 feature cards — memo components, 2×2 mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {FEATURE_CARDS.map((feat, i) => (
            <FeatureItem key={i} feat={feat} inView={inView} />
          ))}
        </div>

      </div>
    </section>
  );
}
