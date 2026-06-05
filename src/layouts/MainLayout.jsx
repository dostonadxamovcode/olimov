import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

export default function MainLayout() {
  return (
    <div className="min-h-screen w-full site-bg">
      <ScrollToTop />
      <div className="flex flex-col w-full">
        <Header />
        <main className="w-full flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
