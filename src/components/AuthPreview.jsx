import { LockKeyhole, Mail, UserPlus } from 'lucide-react';

export default function AuthPreview() {
  return (
    <section id="auth" className="section-panel py-14">
      <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-[#8b5cf6]/06 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="animate-fade-in-up">
          <div className="gold-badge mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Login / Register</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Secure access with a{' '}
            <span className="gradient-text">clean SaaS feel</span>
          </h2>
          <p className="max-w-xl text-sm leading-7 text-gray-400">
            Authentication screens follow the same premium color system, with dark-mode fields,
            clear focus states, and modern active accents.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <form className="premium-card p-5 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f59e0b]">Welcome back</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Log in</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">Email</label>
            <input className="field mb-4" type="email" placeholder="you@example.com" />

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">Password</label>
            <input className="field mb-5" type="password" placeholder="Password" />

            <button className="btn-primary w-full" type="button">
              <Mail className="h-4 w-4" />
              Continue
            </button>
          </form>

          <form className="premium-card p-5 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f59e0b]">New account</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Register</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b5cf6]/20 text-[#8b5cf6]">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">Full name</label>
            <input className="field mb-4" type="text" placeholder="Azizbek Karimov" />

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">Email</label>
            <input className="field mb-5" type="email" placeholder="student@cefrpro.uz" />

            <button className="btn-secondary w-full" type="button">
              Create account
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
