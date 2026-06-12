import { useEffect, useRef, useState } from 'react';
import { Loader } from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import {
  Mic, BookOpen, PenLine, Headphones,
  ArrowRight, Clock, Layers, Focus, TrendingUp, Award, Brain, CheckCircle2, X, ChevronRight,
} from 'lucide-react';

import { readingTests } from '../data/readingTests';

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const SKILLS = [
  {
    icon: Mic,
    title: 'Speaking',
    description: 'Develop fluency and confidence with structured speaking tasks, pronunciation drills, and timed responses that mirror the real exam format.',
    href: '/services/speaking',
    stats: [
      { icon: Clock,  label: '10–15 min', sub: 'Per session' },
      { icon: Layers, label: '3 parts',   sub: 'Exam format' },
      { icon: CheckCircle2, label: '20+ tasks', sub: 'Practice set' },
    ],
    from: '#a855f7', to: '#7c3aed',
    iconColor: '#c084fc',
    border: 'border-purple-500/20 hover:border-purple-400/50',
    btnGrad: 'from-purple-500 to-violet-600',
    glow: 'rgba(168,85,247,0.12)',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    delay: 0,
  },
  {
    icon: BookOpen,
    title: 'Reading',
    description: 'Master comprehension strategies, speed-reading techniques, and all question types across academic and general training passages.',
    href: '/services/reading',
    stats: [
      { icon: Clock,  label: '60 min',    sub: 'Full test' },
      { icon: Layers, label: '3 passages', sub: 'Per test' },
      { icon: CheckCircle2, label: '40 questions', sub: 'Total' },
    ],
    from: '#3b82f6', to: '#06b6d4',
    iconColor: '#60a5fa',
    border: 'border-blue-500/20 hover:border-blue-400/50',
    btnGrad: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.12)',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    delay: 100,
  },
  {
    icon: PenLine,
    title: 'Writing',
    description: 'Refine your essays and reports with guided templates, band-score criteria, and task-specific strategies for Task 1 and Task 2.',
    href: '/services/writing',
    stats: [
      { icon: Clock,  label: '60 min',    sub: 'Full test' },
      { icon: Layers, label: '2 tasks',   sub: 'Task 1 & 2' },
      { icon: CheckCircle2, label: '30+ prompts', sub: 'Practice set' },
    ],
    from: '#f59e0b', to: '#f43f5e',
    iconColor: '#fbbf24',
    border: 'border-amber-500/20 hover:border-amber-400/50',
    btnGrad: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.12)',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    delay: 200,
  },
  {
    icon: Headphones,
    title: 'Listening',
    description: 'Train your ear with authentic audio clips, improve note-taking speed, and tackle all question types under timed exam conditions.',
    href: '/services/listening',
    stats: [
      { icon: Clock,  label: '30 min',    sub: 'Full test' },
      { icon: Layers, label: '4 sections', sub: 'Per test' },
      { icon: CheckCircle2, label: '40 questions', sub: 'Total' },
    ],
    from: '#10b981', to: '#0ea5e9',
    iconColor: '#34d399',
    border: 'border-emerald-500/20 hover:border-emerald-400/50',
    btnGrad: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.12)',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    delay: 300,
  },
];

const BENEFITS = [
  {
    icon: Focus,
    title: 'Targeted Improvement',
    desc: 'Zero in on your weakest skill instead of retaking full tests. Fix the gap, not everything.',
    color: 'text-purple-400',
    bg: 'from-purple-500/15 to-violet-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Faster Progress',
    desc: 'Skill-specific drills build muscle memory faster. You improve in days, not months.',
    color: 'text-blue-400',
    bg: 'from-blue-500/15 to-cyan-500/10',
  },
  {
    icon: Brain,
    title: 'Deeper Understanding',
    desc: 'Each module comes with strategy guides, common pitfalls, and examiner insights.',
    color: 'text-amber-400',
    bg: 'from-amber-500/15 to-orange-500/10',
  },
  {
    icon: Award,
    title: 'Track Band Score',
    desc: 'Get per-skill band score estimates after every session so you always know where you stand.',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/15 to-teal-500/10',
  },
];

// ── Skill Card ────────────────────────────────────────────────────────────────
function SkillCard({ skill, visible, onCardClick }) {
  const Icon = skill.icon;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        transitionDelay: visible ? `${skill.delay + 150}ms` : '0ms',
      }}
    >
      <div
        className={`premium-card group h-full flex flex-col p-6 sm:p-7 ${skill.border} transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-2 cursor-pointer`}
        style={{ boxShadow: `0 0 60px ${skill.glow}, var(--shadow-lg)` }}
        onClick={() => onCardClick(skill)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onCardClick(skill)}
        aria-label={`Go to ${skill.title} practice`}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${skill.from}28, ${skill.to}18)`,
            border: `1px solid ${skill.from}35`,
          }}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: skill.iconColor }} />
        </div>

        {/* Badge */}
        <div className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${skill.badge}`}>
          {skill.title}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">{skill.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          {skill.stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <StatIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold text-white">{stat.label}</span>
                <span className="text-[10px] text-gray-500 leading-tight">{stat.sub}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onCardClick(skill); }}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r ${skill.btnGrad} shadow-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
        >
          Start Practicing
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Level badge colour ────────────────────────────────────────────────────────
const LEVEL_COLORS = {
  'A2':  'bg-green-500/15  text-green-300  border-green-500/25',
  'B1':  'bg-blue-500/15   text-blue-300   border-blue-500/25',
  'B1+': 'bg-cyan-500/15   text-cyan-300   border-cyan-500/25',
  'B2':  'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'B2+': 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  'C1':  'bg-red-500/15    text-red-300    border-red-500/25',
};

// ── Part-selector confirmation modal ─────────────────────────────────────────
function StartModal({ skill, onClose, onConfirm }) {
  const [selected,       setSelected]       = useState(null);
  const [firestoreTests, setFirestoreTests] = useState([]);
  const [loadingTests,   setLoadingTests]   = useState(true);

  const Icon = skill?.icon;

  // Load Firestore tests when modal opens
  useEffect(() => {
    if (!skill) return;
    setLoadingTests(true);
    setFirestoreTests([]);
    setSelected(null);
    const load = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDocs(
          query(collection(db, 'skillReadingTests'), orderBy('part', 'asc'))
        );
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Deduplicate by part — keep one representative per part number,
        // but track total count so the card can show it.
        const partMap = {};
        all.forEach(t => {
          if (!partMap[t.part]) partMap[t.part] = { rep: t, count: 0 };
          partMap[t.part].count += 1;
        });
        const deduped = Object.values(partMap)
          .sort((a, b) => a.rep.part - b.rep.part)
          .map(({ rep, count }) => ({ ...rep, _count: count }));

        setFirestoreTests(deduped);
      } catch (e) {
        console.error('Modal Firestore load:', e);
      } finally {
        setLoadingTests(false);
      }
    };
    load();
  }, [skill?.title]);

  if (!skill) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-scaleIn"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }} />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${skill.from}28, ${skill.to}18)`,
                  border: `1px solid ${skill.from}35`,
                }}
              >
                {Icon && <Icon className="w-4 h-4" style={{ color: skill.iconColor }} />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 leading-none">Choose a Part</h2>
                <p className="text-xs text-slate-500 mt-0.5">{skill.title} · Fill in the Blanks</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Part grid */}
          {loadingTests ? (
            <div className="py-8 mb-5">
              <Loader size="sm" text="Loading tests…" />
            </div>
          ) : firestoreTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 mb-5 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01]">
              <BookOpen className="w-8 h-8 text-slate-700" />
              <p className="text-sm font-semibold text-slate-600">No tests added yet</p>
              <p className="text-xs text-slate-700">Add tests from the Admin → Skill Tests panel</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {firestoreTests.map((test) => {
              const isSelected = selected === test.part;
              const levelColor = LEVEL_COLORS[test.level] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/25';
              return (
                <button
                  key={test.part}
                  type="button"
                  onClick={() => setSelected(test.part)}
                  className={`group relative flex flex-col justify-between gap-3 rounded-xl p-4 text-left border transition-[background-color,border-color,box-shadow] duration-200 ${
                    isSelected
                      ? 'bg-blue-500/[0.08] border-blue-400/50 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
                      : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14]'
                  }`}
                  style={{ minHeight: 96 }}
                >
                  {/* Selected tick */}
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}

                  {/* Part number + random badge */}
                  <div className="flex items-center justify-between pr-5">
                    <p className={`text-[11px] font-black uppercase tracking-[0.12em] leading-none ${
                      isSelected ? 'text-blue-300' : 'text-slate-500'
                    }`}>
                      Part {test.part}
                    </p>
                    {test._count > 1 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                          : 'bg-white/[0.05] text-slate-600 border-white/[0.08]'
                      }`}>
                        {test._count} variants
                      </span>
                    )}
                  </div>

                  {/* Level badge */}
                  <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-md border ${levelColor}`}>
                    {test.level}
                  </span>

                  {/* Blanks · time */}
                  <p className={`text-[11px] font-medium ${isSelected ? 'text-slate-400' : 'text-slate-600'}`}>
                    {test.answers.length} Blanks · {test.timeLimit} min
                  </p>
                </button>
              );
            })}
          </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onConfirm(selected)}
              disabled={!selected}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${skill.btnGrad} shadow-lg transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
            >
              Start Test
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillTestsPage() {
  const navigate = useNavigate();
  const [confirmSkill, setConfirmSkill] = useState(null);
  const [cardsRef, cardsInView] = useInView(0.05);
  const [benefitsRef, benefitsInView] = useInView(0.1);

  const handleCardClick = (skill) => {
    if (skill.title === 'Reading') {
      setConfirmSkill(skill);
    } else {
      navigate(skill.href);
    }
  };

  const handleConfirm = (part) => {
    navigate(`/skill-tests/reading?part=${part}`);
    setConfirmSkill(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #030712 0%, #0a0f1c 50%, #030712 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 h-[300px] w-[300px] rounded-full bg-emerald-600/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 h-[300px] w-[300px] rounded-full bg-amber-600/[0.04] blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="gold-badge mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Skill-Specific Practice</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
            Practice by{' '}
            <span className="gradient-text-accent">Skill</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Target your weakest areas. Choose a skill, dive deep, and build confidence
            exactly where you need it most.
          </p>
        </div>

        {/* ── 4 Skill cards ───────────────────────────────────────────────── */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20"
        >
          {SKILLS.map((skill) => (
            <SkillCard key={skill.title} skill={skill} visible={cardsInView} onCardClick={handleCardClick} />
          ))}
        </div>

        {/* ── Why Practice by Skill? ───────────────────────────────────────── */}
        <div ref={benefitsRef}>
          {/* Section heading */}
          <div
            className="text-center mb-10"
            style={{
              opacity: benefitsInView ? 1 : 0,
              transform: benefitsInView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Why Practice by{' '}
              <span className="gradient-text">Skill?</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Focused practice outperforms generic test-taking every time.
            </p>
          </div>

          {/* Benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => {
              const BIcon = b.icon;
              return (
                <div
                  key={i}
                  style={{
                    opacity: benefitsInView ? 1 : 0,
                    transform: benefitsInView ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    transitionDelay: benefitsInView ? `${i * 80 + 200}ms` : '0ms',
                  }}
                >
                  <div className="premium-card premium-card-hover group p-5 h-full flex flex-col gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${b.bg} border border-white/[0.08] flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <BIcon className={`w-5 h-5 ${b.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1.5">{b.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Confirmation modal */}
      <StartModal
        skill={confirmSkill}
        onClose={() => setConfirmSkill(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
