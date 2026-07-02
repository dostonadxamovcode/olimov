import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, BookOpen, PenLine, Headphones,
  ArrowRight, Clock, Layers, Focus, TrendingUp, Award, Brain, CheckCircle2, X, ChevronRight,
} from 'lucide-react';
import SEO from '../components/SEO';

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

// ── Skill data ────────────────────────────────────────────────────────────────
const SKILLS = [
  {
    icon: Mic,
    title: 'Speaking',
    description: 'Develop fluency and confidence with structured speaking tasks, pronunciation drills, and timed responses that mirror the real exam format.',
    stats: [
      { icon: Clock,        label: '10–15 min', sub: 'Per session'  },
      { icon: Layers,       label: '3 parts',   sub: 'Exam format'  },
      { icon: CheckCircle2, label: '20+ tasks', sub: 'Practice set' },
    ],
    from: '#a855f7', to: '#7c3aed', iconColor: '#c084fc',
    border:  'border-purple-500/20 hover:border-purple-400/50',
    btnGrad: 'from-purple-500 to-violet-600',
    glow:    'rgba(168,85,247,0.12)',
    badge:   'bg-purple-500/15 text-purple-300 border-purple-500/25',
    delay: 0,
  },
  {
    icon: BookOpen,
    title: 'Reading',
    description: 'Master comprehension strategies, speed-reading techniques, and all question types across academic and general training passages.',
    stats: [
      { icon: Clock,        label: '60 min',      sub: 'Full test'  },
      { icon: Layers,       label: '3 passages',  sub: 'Per test'   },
      { icon: CheckCircle2, label: '40 questions', sub: 'Total'     },
    ],
    from: '#3b82f6', to: '#06b6d4', iconColor: '#60a5fa',
    border:  'border-blue-500/20 hover:border-blue-400/50',
    btnGrad: 'from-blue-500 to-cyan-500',
    glow:    'rgba(59,130,246,0.12)',
    badge:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
    delay: 100,
  },
  {
    icon: PenLine,
    title: 'Writing',
    description: 'Refine your essays and reports with guided templates, band-score criteria, and task-specific strategies for Task 1 and Task 2.',
    stats: [
      { icon: Clock,        label: '60 min',     sub: 'Full test'    },
      { icon: Layers,       label: '2 tasks',    sub: 'Task 1 & 2'   },
      { icon: CheckCircle2, label: '30+ prompts', sub: 'Practice set' },
    ],
    from: '#f59e0b', to: '#f43f5e', iconColor: '#fbbf24',
    border:  'border-amber-500/20 hover:border-amber-400/50',
    btnGrad: 'from-amber-500 to-orange-500',
    glow:    'rgba(245,158,11,0.12)',
    badge:   'bg-amber-500/15 text-amber-300 border-amber-500/25',
    delay: 200,
  },
  {
    icon: Headphones,
    title: 'Listening',
    description: 'Train your ear with authentic audio clips, improve note-taking speed, and tackle all question types under timed exam conditions.',
    stats: [
      { icon: Clock,        label: '30 min',      sub: 'Full test' },
      { icon: Layers,       label: '4 sections',  sub: 'Per test'  },
      { icon: CheckCircle2, label: '40 questions', sub: 'Total'    },
    ],
    from: '#10b981', to: '#0ea5e9', iconColor: '#34d399',
    border:  'border-emerald-500/20 hover:border-emerald-400/50',
    btnGrad: 'from-emerald-500 to-teal-500',
    glow:    'rgba(16,185,129,0.12)',
    badge:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    delay: 300,
  },
];

const BENEFITS = [
  { icon: Focus,     title: 'Targeted Improvement', desc: 'Zero in on your weakest skill instead of retaking full tests. Fix the gap, not everything.', color: 'text-purple-400', bg: 'from-purple-500/15 to-violet-500/10' },
  { icon: TrendingUp, title: 'Faster Progress',      desc: 'Skill-specific drills build muscle memory faster. You improve in days, not months.',          color: 'text-blue-400',   bg: 'from-blue-500/15 to-cyan-500/10'    },
  { icon: Brain,      title: 'Deeper Understanding', desc: 'Each module comes with strategy guides, common pitfalls, and examiner insights.',               color: 'text-amber-400',  bg: 'from-amber-500/15 to-orange-500/10' },
  { icon: Award,      title: 'Track Band Score',     desc: 'Get per-skill band score estimates after every session so you always know where you stand.',     color: 'text-emerald-400', bg: 'from-emerald-500/15 to-teal-500/10' },
];

// ── Skill card — memo prevents re-render when modal state changes ─────────────
const SkillCard = memo(function SkillCard({ skill, visible, onCardClick }) {
  const Icon = skill.icon;
  return (
    <div
      className="h-full"
      style={{
        opacity:         visible ? 1 : 0,
        transform:       visible ? 'translateY(0)' : 'translateY(32px)',
        transition:      'opacity 0.7s ease, transform 0.7s ease',
        transitionDelay: visible ? `${skill.delay + 150}ms` : '0ms',
      }}
    >
      <div
        className={`premium-card group h-full flex flex-col p-4 sm:p-6 lg:p-7 ${skill.border} transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer`}
        style={{ boxShadow: `0 0 40px ${skill.glow}, var(--shadow-lg)` }}
        onClick={() => onCardClick(skill)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onCardClick(skill)}
        aria-label={`Start ${skill.title} practice`}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `linear-gradient(135deg, ${skill.from}28, ${skill.to}18)`, border: `1px solid ${skill.from}35` }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: skill.iconColor }} />
        </div>

        {/* Badge */}
        <div className={`inline-flex items-center self-start px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border mb-2 sm:mb-3 ${skill.badge}`}>
          {skill.title}
        </div>

        {/* Description — 2 lines on mobile, full on desktop */}
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed flex-1 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
          {skill.description}
        </p>

        {/* Stats — compact on mobile */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/[0.06] bg-white/[0.025]">
          {skill.stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center text-center gap-1 sm:gap-1.5 min-h-[52px] sm:min-h-[66px]">
                <StatIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-white leading-snug">{stat.label}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-500 leading-tight hidden xs:block sm:block">{stat.sub}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onCardClick(skill); }}
          className={`w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r ${skill.btnGrad} shadow-md sm:shadow-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
        >
          <span className="hidden sm:inline">Start Practicing</span>
          <span className="sm:hidden">Practice</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
});

// ── Modal helpers ─────────────────────────────────────────────────────────────

// Collection name for each skill
const SKILL_COL = {
  Reading:   'skillReadingTests',
  Listening: 'skillListeningTests',
  Writing:   'skillWritingTests',
  Speaking:  'skillSpeakingTests',
};

// Part/task slots per skill
const SKILL_SLOTS = {
  Reading:   [1, 2, 3, 4, 5, 6],
  Listening: [1, 2, 3, 4],
  Writing:   [1, 2],
  Speaking:  [1, 2, 3],
};

// "Part" vs "Task" label
const partLabel = (skillTitle) => skillTitle === 'Writing' ? 'Task' : 'Part';

// Footer meta text shown in each slot card
function slotMeta(test, skillTitle) {
  if (skillTitle === 'Writing') {
    return `${test.wordLimit ?? 150}+ words · ${test.timeLimit} min`;
  }
  if (skillTitle === 'Speaking') {
    if (test.part === 2) return `Cue card · ${test.timeLimit} min`;
    return `${test.questions?.length ?? 0} Questions · ${test.timeLimit} min`;
  }
  // Reading, Listening — fill-in-blanks
  return `${test.answers?.length ?? 0} Blanks · ${test.timeLimit} min`;
}

// Reading Part 2 is a fixed static test (not in skillReadingTests)
const READING_P2 = { part: 2, type: 'matching', questions: 8, timeLimit: 20 };

// ── Part-selector modal ───────────────────────────────────────────────────────
function StartModal({ skill, onClose, onConfirm }) {
  const [selected,    setSelected]    = useState(null);
  const [loadedTests, setLoadedTests] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const Icon       = skill?.icon;
  const label      = partLabel(skill?.title);
  const slots      = SKILL_SLOTS[skill?.title] ?? [];
  const isReading  = skill?.title === 'Reading';

  useEffect(() => {
    if (!skill) return;
    setLoading(true);
    setLoadedTests([]);
    setSelected(null);

    const load = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDocs(
          query(collection(db, SKILL_COL[skill.title]), orderBy('part', 'asc'))
        );
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Deduplicate by part — keep one representative, track total count
        const partMap = {};
        all.forEach(t => {
          const p = t.part;
          if (!partMap[p]) partMap[p] = { rep: t, count: 0 };
          partMap[p].count += 1;
        });

        setLoadedTests(
          Object.values(partMap)
            .sort((a, b) => a.rep.part - b.rep.part)
            .map(({ rep, count }) => ({ ...rep, _count: count }))
        );
      } catch (e) {
        console.error('StartModal load:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [skill?.title]);

  if (!skill) return null;

  const handleStart = () => {
    if (!selected) return;
    onConfirm({ ...selected, skillTitle: skill.title });
  };

  // ── Render a single part slot ─────────────────────────────────────────────
  const renderSlot = (part) => {
    // Reading Part 2 — always a fixed static "Matching" card
    if (isReading && part === 2) {
      const isSel = selected?.part === 2;
      return (
        <button
          key={part}
          type="button"
          onClick={() => setSelected({ part: 2, type: 'matching' })}
          className={`group relative flex flex-col justify-between gap-3 rounded-xl p-4 text-left border transition-[background-color,border-color,box-shadow] duration-200 ${
            isSel
              ? 'bg-blue-500/[0.08] border-blue-400/50 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
              : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14]'
          }`}
          style={{ minHeight: 96 }}
        >
          {isSel && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          )}
          <div className="flex items-center justify-between pr-5">
            <p className={`text-[11px] font-black uppercase tracking-[0.12em] leading-none ${isSel ? 'text-blue-300' : 'text-slate-500'}`}>
              Part 2
            </p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
              isSel ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : 'bg-white/[0.05] text-slate-600 border-white/[0.08]'
            }`}>
              Matching
            </span>
          </div>
          <p className={`text-[11px] font-medium ${isSel ? 'text-slate-400' : 'text-slate-600'}`}>
            {READING_P2.questions} Questions · {READING_P2.timeLimit} min
          </p>
        </button>
      );
    }

    // Reading Parts 3–6 — coming soon
    if (isReading && part > 2) {
      return (
        <div
          key={part}
          className="relative flex flex-col justify-between gap-3 rounded-xl p-4 border border-white/[0.05] bg-white/[0.02] opacity-50"
          style={{ minHeight: 96 }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.12em] leading-none text-slate-600">
            Part {part}
          </p>
          <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-500/10 text-slate-600 border-slate-500/15">
            Coming Soon
          </span>
          <p className="text-[11px] font-medium text-slate-700">—</p>
        </div>
      );
    }

    // Loading skeleton
    if (loading) {
      return (
        <div
          key={part}
          className="flex flex-col justify-between gap-3 rounded-xl p-4 border border-white/[0.07] bg-white/[0.03] animate-pulse"
          style={{ minHeight: 96 }}
        >
          <div className="h-2.5 w-12 rounded bg-white/10" />
          <div className="h-4 w-8 rounded bg-white/10" />
          <div className="h-2.5 w-24 rounded bg-white/10" />
        </div>
      );
    }

    const test  = loadedTests.find(t => t.part === part);
    const isSel = selected?.part === part && selected?.type === 'fill';

    if (!test) {
      return (
        <div
          key={part}
          className="relative flex flex-col justify-between gap-3 rounded-xl p-4 border border-white/[0.05] bg-white/[0.02] opacity-40"
          style={{ minHeight: 96 }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.12em] leading-none text-slate-600">
            {label} {part}
          </p>
          <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-500/10 text-slate-600 border-slate-500/15">
            Not added yet
          </span>
          <p className="text-[11px] font-medium text-slate-700">Admin panel →</p>
        </div>
      );
    }

    return (
      <button
        key={part}
        type="button"
        onClick={() => setSelected({ part, type: 'fill' })}
        className={`group relative flex flex-col justify-between gap-3 rounded-xl p-4 text-left border transition-[background-color,border-color,box-shadow] duration-200 ${
          isSel
            ? 'bg-blue-500/[0.08] border-blue-400/50 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
            : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14]'
        }`}
        style={{ minHeight: 96 }}
      >
        {isSel && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </span>
        )}
        <div className="flex items-center justify-between pr-5">
          <p className={`text-[11px] font-black uppercase tracking-[0.12em] leading-none ${isSel ? 'text-blue-300' : 'text-slate-500'}`}>
            {label} {part}
          </p>
          {test._count > 1 && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
              isSel ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : 'bg-white/[0.05] text-slate-600 border-white/[0.08]'
            }`}>
              {test._count} variants
            </span>
          )}
        </div>
        <p className={`text-[11px] font-medium ${isSel ? 'text-slate-400' : 'text-slate-600'}`}>
          {slotMeta(test, skill.title)}
        </p>
      </button>
    );
  };

  const gridCols = slots.length <= 2 ? 'grid-cols-2' : 'grid-cols-2';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-scaleIn"
        style={{
          background:    'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border:        '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow:     '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }} />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${skill.from}28, ${skill.to}18)`, border: `1px solid ${skill.from}35` }}
              >
                {Icon && <Icon className="w-4 h-4" style={{ color: skill.iconColor }} />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 leading-none">Choose a {label}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{skill.title} · Select your test</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Part/task grid */}
          <div className={`grid ${gridCols} gap-2.5 mb-5`}>
            {slots.map(part => renderSlot(part))}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
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
  const [confirmSkill,  setConfirmSkill]  = useState(null);
  const [cardsRef,    cardsInView]    = useInView(0.05);
  const [benefitsRef, benefitsInView] = useInView(0.1);

  // ALL skills now open the part-selector modal
  // useCallback gives SkillCard a stable prop reference → memo works correctly
  const handleCardClick = useCallback((skill) => {
    setConfirmSkill(skill);
  }, []);

  const handleConfirm = (selection) => {
    const { skillTitle, part, type } = selection;
    if (skillTitle === 'Reading') {
      if (type === 'matching') navigate('/skill-tests/reading-part2');
      else navigate(`/skill-tests/reading?part=${part}`);
    } else if (skillTitle === 'Listening') {
      navigate(`/skill-tests/listening?part=${part}`);
    } else if (skillTitle === 'Writing') {
      navigate(`/skill-tests/writing?task=${part}`);
    } else if (skillTitle === 'Speaking') {
      navigate(`/skill-tests/speaking?part=${part}`);
    }
    setConfirmSkill(null);
  };

  return (
    <>
      <SEO
        title="Skill Tests"
        description="Targeted CEFR skill tests for listening, reading, writing, and speaking. Identify weak areas and track improvement over time."
        canonical="https://olimov.vercel.app/skill-tests"
      />
      <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #030712 0%, #0a0f1c 50%, #030712 100%)' }}>

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.05] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 h-[300px] w-[300px] rounded-full bg-emerald-600/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 h-[300px] w-[300px] rounded-full bg-amber-600/[0.04] blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">

          {/* Hero header */}
          <div className="text-center mb-8 sm:mb-14 animate-fade-in-up">
            <div className="gold-badge mb-3 sm:mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span>Skill-Specific Practice</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-5 leading-tight tracking-tight">
              Practice by{' '}
              <span className="gradient-text-accent">Skill</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
              Target your weakest areas. Choose a skill, dive deep, and build confidence
              exactly where you need it most.
            </p>
          </div>

          {/* 4 Skill cards — 2×2 on mobile, 4-col on desktop */}
          <div
            ref={cardsRef}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-10 sm:mb-16 items-stretch"
          >
            {SKILLS.map((skill) => (
              <SkillCard key={skill.title} skill={skill} visible={cardsInView} onCardClick={handleCardClick} />
            ))}
          </div>

          {/* Why Practice by Skill? */}
          <div ref={benefitsRef}>
            <div
              className="text-center mb-6 sm:mb-10"
              style={{
                opacity:    benefitsInView ? 1 : 0,
                transform:  benefitsInView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                Why Practice by{' '}
                <span className="gradient-text">Skill?</span>
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto">
                Focused practice outperforms generic test-taking every time.
              </p>
            </div>

            {/* Benefits — also 2×2 on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {BENEFITS.map((b, i) => {
                const BIcon = b.icon;
                return (
                  <div
                    key={i}
                    style={{
                      opacity:         benefitsInView ? 1 : 0,
                      transform:       benefitsInView ? 'translateY(0)' : 'translateY(20px)',
                      transition:      'opacity 0.6s ease, transform 0.6s ease',
                      transitionDelay: benefitsInView ? `${i * 80 + 200}ms` : '0ms',
                    }}
                  >
                    <div className="premium-card premium-card-hover group p-4 sm:p-5 h-full flex flex-col gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br ${b.bg} border border-white/[0.08] flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <BIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${b.color}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-1.5">{b.title}</h3>
                        <p className="text-gray-500 text-[10px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-none">{b.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Part-selector modal (all skills) */}
        <StartModal
          skill={confirmSkill}
          onClose={() => setConfirmSkill(null)}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  );
}
