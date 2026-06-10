import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uz', label: 'UZ', name: "O'zbek" },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === i18n.language?.slice(0, 2)) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onMouse = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey   = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open]);

  return (
    <div className={`relative flex-shrink-0 ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-200"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-300 flex-1 text-left">{current.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-[200] w-44 rounded-2xl border border-white/10 bg-[#050810]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-1.5">
            {LANGUAGES.map(lang => {
              const isActive = current.code === lang.code;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                  className={`flex items-center justify-between w-full gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.07] text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-slate-500 w-5 leading-none">{lang.label}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
