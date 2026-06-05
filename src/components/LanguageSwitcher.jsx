import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'en';

  return (
    <div className={`flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/4 p-0.5 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 flex-shrink-0" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
            current === lang.code
              ? 'bg-white/12 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
