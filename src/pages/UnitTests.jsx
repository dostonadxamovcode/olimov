import { Clock3, Sparkles, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import headwayGrammarCover from '../assets/headway-grammar-cover.jpg'


export default function UnitTests() {
  const navigate = useNavigate()
  return (
    <>
      <SEO
        title="Unit Tests"
        description="Practice English unit tests and track your progress."
        canonical="https://olimov.vercel.app/unit-tests"
      />

      <section className="min-h-screen site-bg pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Main Container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="gold-badge mb-4">
                    <Sparkles className="h-4 w-4" />
                    <span>Practice workspace</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">Unit Tests</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
                    Focused practice sets will appear here. Choose a unit, complete the questions, and review your progress.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 sm:self-auto">
                  <Clock3 className="h-4 w-4 text-sky-400" />
                  New tests coming soon
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="premium-card premium-card-hover group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={headwayGrammarCover}
                    alt="Headway Grammar book cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1023] via-transparent to-transparent opacity-60" />
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base sm:text-lg leading-snug">Headway beginner</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-400 font-medium">Grammar</span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-xs text-gray-400">50+ units</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
                    Comprehensive grammar exercises and practice tests to improve your English language skills.
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => navigate('/practice-session')}
                    className="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 text-white opacity-90 hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    Start Practice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
