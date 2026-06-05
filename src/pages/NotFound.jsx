import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full site-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold gradient-text mb-4">{t('notFound.title')}</h1>
        <h2 className="text-2xl font-bold text-white mb-4">{t('notFound.subtitle')}</h2>
        <p className="text-gray-400 mb-8">{t('notFound.desc')}</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          <Home className="w-4 h-4" />
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}
