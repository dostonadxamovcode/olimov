import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Loader';

function PageWithFooter() {
  return (
    <>
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function MainLayout() {
  const { loading } = useAuth();
  const location = useLocation();
  const hideHeader = (
    /^\/unit-tests\/[^/]+\/[^/]+$/.test(location.pathname) ||
    location.pathname.startsWith('/skill-tests') ||
    location.pathname.startsWith('/tests') ||
    location.pathname.startsWith('/exam') ||
    location.pathname.startsWith('/practice-session')
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full site-bg">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full site-bg flex flex-col">
      <ScrollToTop />
      <div className="flex flex-col flex-1 min-h-screen w-full">
        {!hideHeader && <Header />}
        {/* Footer only mounts after the route chunk resolves — hidden during refresh/lazy load */}
        <Suspense fallback={<PageLoader />}>
          <PageWithFooter />
        </Suspense>
      </div>
    </div>
  );
}
