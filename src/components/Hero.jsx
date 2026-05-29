import { memo, useEffect, useState } from 'react';
import { Play, ArrowRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stats } from '../data/siteData';

// Defined outside component — never recreated on re-render
const WORDS = ['mastery.', 'success.', 'precision.', 'fluency.'];

const HeroStatCard = memo(function HeroStatCard({ stat, index }) {
  return (
    <div className="premium-card premium-card-hover min-w-0 p-2 text-center animate-fade-in-up sm:p-5 sm:text-left" style={{ animationDelay: `${index * 100}ms` }}>
      <div className={`truncate text-xl font-bold sm:text-3xl ${index === 0 ? 'text-[#0ea5e9]' : index === 1 ? 'text-[#8b5cf6]' : 'text-[#f43f5e]'}`}>{stat.value}</div>
      <div className="truncate text-[10px] leading-4 text-gray-400 sm:text-sm">{stat.label}</div>
    </div>
  )
})

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const interval = setInterval(() => {
      if (document.hidden) return;
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []); // stable — WORDS is module-level constant

  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16 animate-hero-fade">

      {/* BACKGROUND */}
      <div className="absolute inset-0" style={{ background: '#080c14' }} />

      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[130px] opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', top: '-10%', left: '20%' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '0%', right: '10%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[90px] opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '20%', left: '5%' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl space-y-6">

          {/* TITLE */}
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Master CEFR{' '}
            <span className="inline-block">
              with{' '}
              <span className="relative inline-block">
                <span className="gradient-text">
                  {WORDS[wordIndex]}
                </span>

                {/* Premium underline */}
                <span className="wave-underline">
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M0 8 Q75 2 150 8 Q225 14 300 8" stroke="url(#underline)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <defs>
                      <linearGradient id="underline" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </span>
          </h1>

          {/* TEXT */}
          <p className="max-w-2xl text-base leading-7 text-gray-400">
            Comprehensive CEFR preparation with mock tests, expert feedback,
            vocabulary tools, and real-time progress tracking.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary group px-6 py-3">
              Start Free Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link to="/result" className="btn-secondary px-6 py-3 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              My Results
            </Link>

            <button className="btn-secondary px-6 py-3">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-2 pt-1 sm:gap-3 sm:pt-2">
            {stats.map((stat, i) => (
              <HeroStatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>

        </div>

        <div className="relative mx-auto w-full max-w-[400px] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {/* Reduced to 2 glow divs (was 3) */}
          <div className="absolute -left-4 top-10 h-24 w-24 rounded-full bg-[#0ea5e9]/30 blur-2xl animate-pulse-glow" />
          <div className="absolute -right-5 bottom-16 h-28 w-28 rounded-full bg-[#8b5cf6]/25 blur-2xl animate-pulse-glow" style={{ animationDelay: '0.5s' }} />

          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#0ea5e9]/20 via-[#8b5cf6]/15 to-[#f43f5e]/10 p-1.5 shadow-2xl">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/50 to-transparent" />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/5 bg-[#030712]">
              <img
                src="/IMG_0723.JPG"
                alt="CEFRPro mentor"
                loading="eager"
                decoding="async"
                className="h-[300px] w-full object-cover object-[55%_54%] sm:h-[370px] lg:h-[430px]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0ea5e9]/30 via-transparent to-[#8b5cf6]/25" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-[#0ea5e9] via-[#8b5cf6] to-[#f43f5e]" />
            </div>
          </div>
        </div>
        </div>

      </div>
    </section>
  );
}
