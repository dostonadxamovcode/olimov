import { ClipboardCheck, Clock3, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'


export default function UnitTests() {
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
            <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="hover-3d">
  {/* content */}
  <figure className="max-w-100 rounded-2xl">
    <img src="https://img.daisyui.com/images/stock/creditcard.webp" alt="3D card" />
  </figure>
  {/* 8 empty divs needed for the 3D effect */}
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
