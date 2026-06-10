import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { navLinks } from '../data/siteData';
import { useAuth } from '../context/AuthContext';
import { toastSuccess } from '../utils/errorHandler';
import ConfirmModal from './ui/ConfirmModal';
import LanguageSwitcher from './LanguageSwitcher';
import { scrollToSection } from '../utils/scrollToSection';

const NavItem = memo(function NavItem({ link, className, onClick }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashLink = useCallback((e) => {
    e.preventDefault();
    const [path, hash] = link.href.split('#');
    const targetPath  = path || '/';
    const targetHash  = `#${hash}`;
    if (location.pathname === targetPath && location.hash === targetHash) {
      scrollToSection(hash);
    } else {
      navigate(`${targetPath}${targetHash}`);
    }
    onClick?.();
  }, [link.href, location.pathname, location.hash, navigate, onClick]);

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
      className={({ isActive }) => `${className}${isActive ? ' text-white bg-white/10' : ''}`}
    >
      {t(link.label)}
    </NavLink>
  );
});

export default function Header() {
  const { t } = useTranslation();
  const [isOpen,          setIsOpen]          = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const [isProfileOpen,   setIsProfileOpen]   = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { currentUser, user, userRole, isSuperadmin, logout, loading } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const profileRef  = useRef(null);

  // Ref-mirror keeps the scroll handler always up-to-date without re-registering it
  const isProfileOpenRef = useRef(false);
  isProfileOpenRef.current = isProfileOpen;

  const handleLogout = useCallback(async () => {
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
  }, [logout, t, navigate]);

  // ── Single consolidated scroll listener ──────────────────────────────────
  // One rAF-throttled handler covers: header bg, profile close.
  // Previously there were 3 separate useEffects adding scroll listeners.
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
        if (isProfileOpenRef.current) setIsProfileOpen(false);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []); // runs once — ref keeps it current

  // Close mobile menu on any scroll (once)
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll',    close, { passive: true, once: true });
    window.addEventListener('wheel',     close, { passive: true, once: true });
    window.addEventListener('touchmove', close, { passive: true, once: true });
    return () => {
      window.removeEventListener('scroll',    close);
      window.removeEventListener('wheel',     close);
      window.removeEventListener('touchmove', close);
    };
  }, [isOpen]);

  // Close profile dropdown on route change
  useEffect(() => { setIsProfileOpen(false); }, [location.pathname]);

  // Outside-click / Escape for profile dropdown
  useEffect(() => {
    if (!isProfileOpen) return;
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setIsProfileOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown',   onKey);
    };
  }, [isProfileOpen]);

  const closeMobileMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu      = useCallback(() => setIsOpen(o => !o), []);
  const toggleProfile   = useCallback(() => setIsProfileOpen(o => !o), []);

  return (
    <>
    <header
      data-app-header
      className={`fixed top-0 left-0 right-0 z-[100] h-14 sm:h-16 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || isOpen
          ? 'bg-[#050810]/85 backdrop-blur-xl border-b border-white/7 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {scrolled && (
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center h-full gap-2 overflow-visible">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2 sm:mr-4 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] shadow-lg shadow-indigo-500/50 transition-[transform,box-shadow] duration-300 relative overflow-hidden group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-xl group-hover:shadow-indigo-500/70">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              <span className="text-white font-bold text-lg sm:text-xl relative z-10">O</span>
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-100">Olimov</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center px-2 sm:px-4">
            {navLinks.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                className="relative px-3 sm:px-4 py-2 text-sm font-medium text-slate-400 rounded-xl transition-[color,background-color] duration-200 hover:text-slate-200 hover:bg-white/5 whitespace-nowrap"
              />
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0 pr-1 sm:pr-2">
            <LanguageSwitcher />
            {loading ? (
              <div className="h-10 w-[120px] rounded-xl bg-white/10 animate-pulse" />
            ) : currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/9 hover:border-white/18 transition-[background-color,border-color] duration-200"
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
                        <p className="m-0.5 mt-0.5 text-xs text-slate-600 truncate">{currentUser.email}</p>
                      </div>
                      <div className="h-px bg-white/6 mb-2" />
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-[color,background-color] duration-150 w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/12 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        {t('header.profile')}
                      </Link>
                      <div className="h-px bg-white/6 my-2" />
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-[color,background-color] duration-150 w-full text-left"
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
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/12 bg-white/3 hover:text-white hover:border-white/22 hover:bg-white/7 transition-[color,background-color,border-color] duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/65 hover:-translate-y-px transition-[transform,box-shadow] duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {t('header.signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden ml-auto w-10 h-10 rounded-xl border border-white/10 bg-white/4 hover:bg-white/9 flex items-center justify-center transition-[background-color] duration-200 text-slate-200"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile backdrop — no backdrop-blur since bg-black/65 is sufficient */}
      <div
        onClick={closeMobileMenu}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 top-14 sm:top-16 z-[70] bg-black/65 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile menu
          - transition-[opacity,transform] instead of transition-all avoids
            animating max-height which triggers expensive layout reflow
          - backdrop-blur removed: bg-[#060912]/97 is 97% opaque, blurring behind
            a nearly-solid panel is wasted GPU work */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed left-4 right-4 sm:left-6 sm:right-6 top-[66px] sm:top-[76px] z-[90] rounded-2xl border border-white/9 bg-[#060912]/97 shadow-2xl max-h-[82vh] overflow-y-auto transition-[opacity,transform] duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-3.5 scale-95 pointer-events-none'
        }`}
      >
        <div className="sticky top-0 h-px z-2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="p-4 sm:p-5 space-y-2">
          <div className="pb-1">
            <LanguageSwitcher className="w-full" />
          </div>

          <div className="border-t border-white/6 pt-2" />

          {navLinks.map((link) => (
            <NavItem
              key={link.label}
              link={link}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-[color,background-color] duration-150 w-full text-left whitespace-nowrap"
            />
          ))}

          <div className="border-t border-white/6 pt-4 sm:pt-5 mt-4 sm:mt-5 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[20, 24, 16, 18].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                    <div className={`h-4 w-${w} rounded bg-white/10 animate-pulse`} />
                  </div>
                ))}
              </div>
            ) : currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-[color,background-color] duration-200 w-full"
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
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-[color,background-color] duration-200 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block w-full px-5 py-3 text-center text-sm font-medium text-slate-400 rounded-xl hover:text-white hover:bg-white/5 transition-[color,background-color] duration-200"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block w-full px-5 py-3 text-center text-sm font-medium text-white bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/65 transition-[box-shadow] duration-200"
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
