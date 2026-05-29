import { ArrowRight, Clock as Clock3, Headphones, Search, Signal, Sparkles } from 'lucide-react'
import { listeningPage } from '../data/siteData'

const statIcons = {
  Headphones,
  Clock3,
  Signal,
}

export default function Listening() {
  return (
    <section className="listening-page relative min-h-screen overflow-hidden bg-[#eef3f8] px-4 pb-24 pt-32 text-slate-950 dark:bg-[#040717] dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-violet-300/18 blur-[82px] dark:h-[540px] dark:w-[540px] dark:bg-violet-600/25 dark:blur-[120px]" />
        <div className="absolute left-[-140px] top-48 h-[340px] w-[340px] rounded-full bg-cyan-300/16 blur-[78px] dark:h-[420px] dark:w-[420px] dark:bg-cyan-500/20 dark:blur-[110px]" />
        <div className="absolute bottom-10 right-[-160px] h-[380px] w-[380px] rounded-full bg-blue-300/14 blur-[82px] dark:h-[480px] dark:w-[480px] dark:bg-blue-600/20 dark:blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_34%),linear-gradient(180deg,rgba(238,243,248,0.45),#eef3f8_78%)] dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.12),transparent_34%),linear-gradient(180deg,rgba(4,7,23,0.25),#040717_78%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-[#f8fafc]/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-[0_10px_30px_rgba(14,116,144,0.08)] backdrop-blur-xl dark:border-cyan-300/20 dark:bg-white/[0.06] dark:text-cyan-200 dark:shadow-[0_0_35px_rgba(34,211,238,0.12)]">
            <Sparkles className="h-4 w-4" />
            {listeningPage.badge}
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-normal sm:text-6xl lg:text-7xl">
            {listeningPage.title}
            <span className="block bg-gradient-to-r from-cyan-700 via-blue-700 to-violet-700 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              {listeningPage.highlightedTitle}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            {listeningPage.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            {listeningPage.stats.map((stat) => {
              const Icon = statIcons[stat.icon]

              return (
                <span
                  key={stat.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-[#f8fafc]/75 px-4 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  {stat.label}
                </span>
              )
            })}
          </div>

          <div className="listening-search mt-10 w-full max-w-2xl rounded-2xl border border-slate-300/80 bg-[#f8fafc]/86 p-2 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-600/35 focus-within:shadow-[0_18px_60px_rgba(14,116,144,0.12)] dark:border-white/10 dark:bg-[#070b1f]/80 dark:shadow-[0_0_60px_rgba(59,130,246,0.16)] dark:backdrop-blur-2xl dark:focus-within:border-cyan-300/40 dark:focus-within:shadow-[0_0_75px_rgba(34,211,238,0.20)]">
            <label className="flex items-center gap-3 px-4">
              <Search className="h-5 w-5 shrink-0 text-slate-500" />
              <input
                type="search"
                placeholder={listeningPage.searchPlaceholder}
                className="h-12 w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 dark:text-white"
              />
            </label>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">{listeningPage.sectionEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">{listeningPage.sectionTitle}</h2>
          </div>
          <div className="hidden rounded-2xl border border-slate-300/70 bg-[#f8fafc]/75 px-5 py-3 text-sm text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none sm:block">
            {listeningPage.updateLabel}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listeningPage.tests.map((test) => (
            <article
              key={test.number}
              className="listening-test-card group relative overflow-hidden rounded-2xl border border-slate-300/80 bg-[#f8fafc]/82 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.09)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-600/28 hover:bg-[#fbfcff]/92 hover:shadow-[0_22px_65px_rgba(14,116,144,0.14)] dark:border-blue-300/15 dark:bg-white/[0.055] dark:shadow-[0_20px_80px_rgba(0,0,0,0.28),0_0_45px_rgba(59,130,246,0.08)] dark:backdrop-blur-2xl dark:hover:border-cyan-300/40 dark:hover:bg-white/[0.075] dark:hover:shadow-[0_24px_90px_rgba(0,0,0,0.34),0_0_70px_rgba(34,211,238,0.18)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-70" />
              <div className="absolute right-[-72px] top-[-72px] h-36 w-36 rounded-full bg-violet-300/12 blur-2xl transition-opacity duration-300 group-hover:opacity-70 dark:h-40 dark:w-40 dark:bg-violet-500/20 dark:blur-3xl dark:group-hover:opacity-90" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 text-lg font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.45)]">
                  {test.number}
                </div>
                <span className="rounded-full border border-slate-300/80 bg-slate-100/70 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-slate-300">
                  {test.duration}
                </span>
              </div>

              <div className="relative mt-6">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">{test.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{listeningPage.cardDescription}</p>
              </div>

              <div className="relative mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {test.parts.map((part, index) => (
                  <div
                    key={part.title}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-300/70 bg-slate-100/70 px-2.5 py-2 transition-colors duration-300 group-hover:border-cyan-700/18 dark:border-white/10 dark:bg-[#070b1f]/55 dark:group-hover:border-white/15"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-[11px] font-black text-cyan-800 dark:bg-white/[0.08] dark:text-cyan-200">
                      P{index + 1}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-[13px] font-semibold leading-4 text-slate-800 dark:text-slate-200">{part.title}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-600 dark:text-slate-400">{part.description}</span>
                    </span>
                  </div>
                ))}
              </div>

              <button className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_42px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-950 hover:shadow-[0_18px_48px_rgba(14,116,144,0.22)] dark:bg-white dark:text-[#081026] dark:shadow-[0_16px_45px_rgba(255,255,255,0.12)] dark:hover:bg-cyan-50 dark:hover:shadow-[0_18px_55px_rgba(34,211,238,0.22)]">
                Start Test
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
