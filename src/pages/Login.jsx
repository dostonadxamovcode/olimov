import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowLeft, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

import { toastError, toastSuccess, getErrorMessage } from '../utils/errorHandler'
import { ButtonSpinner } from '../components/common/Loader'

export default function Login() {
    const { t } = useTranslation()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { login, googleLogin } = useAuth()

    const set = (k) => (e) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(form.email, form.password)
            toastSuccess(t('login.success'))
        } catch (err) {
            const msg = getErrorMessage(err)
            toastError(msg)
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError('')
        try {
            await googleLogin()
            // googleLogin uses signInWithRedirect — page will reload automatically.
            // Code below this line won't run; result is handled by AuthProvider on reload.
        } catch (err) {
            const msg = getErrorMessage(err)
            toastError(msg)
            setError(msg)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#080c14' }}>

            {/* Animated background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', top: '-10%', left: '20%' }} />
                <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
                    style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '0%', right: '10%' }} />
                <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
                    style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '20%', left: '5%' }} />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div
                className="w-full max-w-md relative z-10 animate-fadeIn"
            >
                {/* Card */}
                <div className="relative rounded-3xl p-8 overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}>

                    {/* Inner glow top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 mb-7 group hover:translate-x-[-2px] transition-transform"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ArrowLeft size={13} color="#94a3b8" />
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#64748b' }}>{t('login.backHome')}</span>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                            <span className="text-white font-black text-base relative z-10">C</span>
                            <div className="absolute inset-0 opacity-30"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)' }} />
                        </div>
                        <div>
                            <p className="font-black text-lg leading-none tracking-tight" style={{ color: '#f1f5f9' }}>
                                CEFR<span style={{ color: '#60a5fa' }}>Pro</span>
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#475569' }}>{t('login.subtitle')}</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold mb-1.5 tracking-tight" style={{ color: '#f1f5f9' }}>{t('login.welcomeBack')}</h1>
                        <p className="text-sm" style={{ color: '#475569' }}>{t('login.credentials')}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">

                        <Field icon={<Mail size={15} />} label={t('login.email')} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                        <Field icon={<Lock size={15} />} label={t('login.password')} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />

                        {error && (
                            <div
                                className="rounded-xl px-4 py-3 flex items-start gap-2.5 animate-fadeIn"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#ef4444' }} />
                                <span className="text-sm" style={{ color: '#f87171' }}>{error}</span>
                            </div>
                        )}

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2.5 relative overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
                        >
                            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)' }} />
                            {loading ? (
                                <span className="flex items-center gap-2.5">
                                    <ButtonSpinner />
                                    {t('login.signingIn')}
                                </span>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    {t('login.signIn')}
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                            <span className="text-xs font-medium px-2" style={{ color: '#334155' }}>{t('login.orContinueWith')}</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        {/* Google button */}
                        <button
                            type="button"
                            onClick={handleGoogle}
                            className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98]"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#e2e8f0',
                            }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t('login.continueGoogle')}
                        </button>

                        <p className="text-center text-sm pt-1" style={{ color: '#475569' }}>
                            {t('login.noAccount')}{' '}
                            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#60a5fa' }}>
                                {t('login.register')}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

function Field({ icon, label, ...props }) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5 ml-0.5" style={{ color: '#64748b' }}>{label}</label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#334155' }}>
                    {icon}
                </span>
                <input
                    {...props}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#e2e8f0',
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = 'rgba(99,102,241,0.5)'
                        e.target.style.background = 'rgba(255,255,255,0.06)'
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.target.style.background = 'rgba(255,255,255,0.04)'
                    }}
                />
            </div>
        </div>
    )
}