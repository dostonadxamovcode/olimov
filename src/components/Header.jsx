import { memo, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { navLinks } from '../data/siteData';
import { useAuth } from '../context/AuthContext';
import { toastSuccess } from '../utils/errorHandler';
import ConfirmModal from './ui/ConfirmModal';
import LanguageSwitcher from './LanguageSwitcher';

const NavItem = memo(function NavItem({ link, className, onClick }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashLink = (e) => {
    e.preventDefault();
    const [path, hash] = link.href.split('#');
    const targetPath = path || '/';
    const targetHash = `#${hash}`;
    if (location.pathname === targetPath && location.hash === targetHash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`${targetPath}${targetHash}`);
    }
    onClick?.();
  };

  if (link.href.includes('#')) {
    return (
      <Link to={link.href} onClick={handleHashLink} className={className}>
        {t(link.label)}
      </Link>
    );
  }

  return (
    <NavLink
      to={link.href}
      onClick={onClick}
      className={({ isActive }) =>
        `${className}${isActive ? ' text-white bg-white/10' : ''}`
      }
    >
      {t(link.label)}
    </NavLink>
  );
});

export default function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { currentUser, user, userRole, isSuperadmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      toastSuccess(t('header.logoutSuccess'));
      setIsOpen(false);
      setIsProfileOpen(false);
      setShowLogoutModal(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    let ticking = false;
    let last = window.scrollY > 20;
    setScrolled(last);
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const next = window.scrollY > 20;
        if (next !== last) { last = next; setScrolled(next); }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    window.addEventListener('wheel', close, { passive: true, once: true });
    window.addEventListener('touchmove', close, { passive: true, once: true });
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('wheel', close);
      window.removeEventListener('touchmove', close);
    };
  }, [isOpen]);

  // Close profile dropdown on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on scroll
  useEffect(() => {
    if (!isProfileOpen) return;
    const close = () => setIsProfileOpen(false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  }, [isProfileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileOpen]);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-[100] h-14 sm:h-16 transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-[#050810]/85 backdrop-blur-xl border-b border-white/7 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Top shimmer when scrolled */}
      {scrolled && (
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center h-full gap-2 overflow-visible">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2 sm:mr-4 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] shadow-lg shadow-indigo-500/50 transition-all duration-300 relative overflow-hidden group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-xl group-hover:shadow-indigo-500/70">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              <span className="text-white font-bold text-lg sm:text-xl relative z-10">O</span>
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-100">
              Olimov
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center px-2 sm:px-4">
            {navLinks.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                className="relative px-3 sm:px-4 py-2 text-sm font-medium text-slate-400 rounded-xl transition-all duration-200 hover:text-slate-200 hover:bg-white/5 whitespace-nowrap"
              />
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0 pr-1 sm:pr-2">
            <LanguageSwitcher />
            {loading ? (
              // Auth loading skeleton - matches profile button width (~120px)
              <div className="h-10 w-[120px] rounded-xl bg-white/10 animate-pulse" />
            ) : currentUser ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/9 hover:border-white/18 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-md shadow-indigo-500/45 text-[10px] font-bold text-white flex-shrink-0 overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : (currentUser.email?.[0]?.toUpperCase() || <User className="w-3 h-3" />)
                    }
                  </div>
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[60px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 z-50 w-64 rounded-2xl border border-white/10 bg-[#050810]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <div className="px-3 py-3 mb-1">
                      <p className="m-0 text-sm font-semibold text-slate-200">
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </p>
                      <p className="m-0.5 mt-0.5 text-xs text-slate-600 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="h-px bg-white/6 mb-2" />

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all duration-150 w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/12 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      {t('header.profile')}
                    </Link>

                    <div className="h-px bg-white/6 my-2" />

                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all duration-150 w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-4 h-4 text-red-400" />
                      </div>
                      {t('header.logout')}
                    </button>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/12 bg-white/3 hover:text-white hover:border-white/22 hover:bg-white/7 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/65 hover:-translate-y-px transition-all duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {t('header.signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden ml-auto w-10 h-10 rounded-xl border border-white/10 bg-white/4 hover:bg-white/9 flex items-center justify-center transition-all duration-200 text-slate-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 top-14 sm:top-16 z-[70] bg-black/65 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed left-4 right-4 sm:left-6 sm:right-6 top-[66px] sm:top-[76px] z-[90] rounded-2xl border border-white/9 bg-[#060912]/97 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto max-h-[82vh] overflow-y-auto'
            : 'opacity-0 -translate-y-3.5 scale-95 pointer-events-none max-h-0'
        }`}
      >
        <div className="sticky top-0 h-px z-2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="p-4 sm:p-5 space-y-2">
          {navLinks.map((link) => (
            <NavItem
              key={link.label}
              link={link}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-180 w-full text-left whitespace-nowrap"
            />
          ))}

          <div className="border-t border-white/6 pt-4 sm:pt-5 mt-4 sm:mt-5 space-y-2">

            <div className="px-1 pb-1">
              <LanguageSwitcher className="w-full justify-center" />
            </div>

            {loading ? (
              // Auth loading skeleton for mobile - matches profile menu items count (3-4 items)
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-[72px] rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ) : currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 w-full"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-[9px] font-bold text-white overflow-hidden flex-shrink-0">
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : (currentUser?.email?.[0]?.toUpperCase() || <User className="w-3 h-3" />)
                    }
                  </div>
                  {t('header.profile')}
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-200 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-5 sm:px-5 py-3 sm:py-3 text-center text-sm font-medium text-slate-400 rounded-xl hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-5 sm:px-5 py-3 sm:py-3 text-center text-sm font-medium text-white bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/65 transition-all duration-200"
                >
                  {t('header.signUp')}
                </Link>
              </>
            )}

          </div>
        </div>
      </div>

    </header>

    <ConfirmModal
      open={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
      variant="default"
      title={t('header.logoutTitle')}
      message={t('header.logoutMessage')}
      confirmLabel={t('header.logoutConfirm')}
    />
    </>
  );
}