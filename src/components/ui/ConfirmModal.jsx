import { useEffect } from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ButtonSpinner } from '../common/Loader';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Tasdiqlash',
  variant = 'danger', // 'danger' | 'default'
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const { t } = useTranslation();
  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-scaleIn"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

        <div className="p-6">
          {/* Icon + close */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                border: isDanger ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(99,102,241,0.25)',
              }}
            >
              {isDanger
                ? <AlertTriangle className="w-5 h-5 text-red-400" />
                : <LogOut className="w-5 h-5 text-indigo-400" />
              }
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Text */}
          <h2 className="text-base font-semibold text-slate-100 mb-1.5">{title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 bg-white/4 hover:bg-white/8 hover:text-slate-200 transition-all duration-200 disabled:opacity-50"
            >
              {t('confirmModal.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: isDanger
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: isDanger
                  ? '0 4px 16px rgba(220,38,38,0.3)'
                  : '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  {t('confirmModal.waiting')}
                </span>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
