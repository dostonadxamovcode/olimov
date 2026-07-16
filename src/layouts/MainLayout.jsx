import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Loader';

export default function MainLayout() {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen w-full site-bg">
      {loading ? (
        <PageLoader />
      ) : (
        <>
          <ScrollToTop />
          <div className="flex flex-col w-full">
            <Header />
            <main className="w-full flex-grow">
              <Outlet />
            </main>
            <Footer />
          </div>
        </>
      )}
    </div>
  );
}
