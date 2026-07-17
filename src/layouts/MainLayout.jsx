import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
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
        <Header />
        {/* Footer only mounts after the route chunk resolves — hidden during refresh/lazy load */}
        <Suspense fallback={<PageLoader />}>
          <PageWithFooter />
        </Suspense>
      </div>
    </div>
  );
}
