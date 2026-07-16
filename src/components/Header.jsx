import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LogOut, User, ChevronDown, LayoutDashboard, ChevronRight,
  Home, Layers, FileText, Trophy, Mail, Info, GraduationCap, ClipboardCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../services/siteContentService';
import { useAuth } from '../context/AuthContext';
import { toastSuccess } from '../utils/errorHandler';
import ConfirmModal from './ui/ConfirmModal';
import LanguageSwitcher from './LanguageSwitcher';
import { scrollToSection } from '../utils/scrollToSection';

const NAV_META = {
  'nav.home':      { Icon: Home,          color: '#0ea5e9' },
  'nav.services':  { Icon: Layers,        color: '#8b5cf6' },
  'nav.mockTests': { Icon: FileText,      color: '#f59e0b' },
  'nav.results':   { Icon: Trophy,        color: '#10b981' },
  'nav.contact':   { Icon: Mail,          color: '#f43f5e' },
  'nav.about':     { Icon: Info,          color: '#6366f1' },
  'nav.levels':    { Icon: GraduationCap, color: '#a855f7' },
  'nav.unitTests': { Icon: ClipboardCheck, color: '#38bdf8' },
};

const CARD_BASE        = 'flex items-center gap-2 px-2.5 py-2 min-h-[40px] rounded-xl border w-full text-left transition-all duration-150';
const CARD_HOVER       = 'hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]';
const CARD_ACTIVE_ONLY = 'active:scale-[0.98]';

function cardStyle(active, color) {
  return active
    ? { background: `${color}0d`, borderColor: `${color}38` }
    : { background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' };
}

function MobileCardContent({ label, Icon, color, isActive }) {
  return (
    <>
      {Icon && (
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors duration-150"
          style={{
            background:  isActive ? `${color}1c` : 'rgba(255,255,255,0.04)',
            borderColor: isActive ? `${color}42` : 'rgba(255,255,255,0.07)',
          }}
        >
          <Icon className="w-3 h-3 transition-colors duration-150" style={{ color: isActive ? color : '#64748b' }} />
        </div>
      )}
      <span className={`text-xs font-medium flex-1 truncate transition-colors duration-150 ${isActive ? 'text-white' : 'text-slate-400'}`}>
        {label}
      </span>
      {isActive && (
        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
      )}
    </>
  );
}

const NavItem = memo(function NavItem({ link, className, onClick, isMobile }) {
  const { t }    = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { Icon, color = '#0ea5e9' } = NAV_META[link.label] ?? {};
  const label = t(link.label);

  const isHashLink = link.href.includes('#');
  const [pathPart, hashPart] = link.href.split('#');
  const targetPath    = pathPart || '/';
  const targetHashRaw = hashPart  || '';
  const targetHash    = targetHashRaw ? `#${targetHashRaw}` : '';

  const isHashActive = isHashLink && (
    location.pathname === targetPath &&
    (location.hash === targetHash ||
      (targetHashRaw === 'top' && !location.hash))
  );

  const handleHashLink = useCallback((e) => {
    e.preventDefault();
    onClick?.();
    if (location.pathname === targetPath && location.hash === targetHash) {
      scrollToSection(targetHashRaw);
    } else {
      navigate(`${targetPath}${targetHash}`);
    }
  }, [targetPath, targetHash, targetHashRaw, location.pathname, location.hash, navigate, onClick]);

  // ── MOBILE CARD ─────────────────────────────────────────────────────────────
  if (isMobile) {
    if (isHashLink) {
      return (
        <Link
          to={link.href}
          onClick={handleHashLink}
          className={`${CARD_BASE} ${isHashActive ? CARD_ACTIVE_ONLY : CARD_HOVER}`}
          style={cardStyle(isHashActive, color)}
        >
          <MobileCardContent label={label} Icon={Icon} color={color} isActive={isHashActive} />
        </Link>
      );
    }

    return (
      <NavLink
        to={link.href}
        onClick={onClick}
        className={({ isActive }) => `${CARD_BASE} ${isActive ? CARD_ACTIVE_ONLY : CARD_HOVER}`}
        style={({ isActive }) => cardStyle(isActive, color)}
      >
        {({ isActive }) => (
          <MobileCardContent label={label} Icon={Icon} color={color} isActive={isActive} />
        )}
      </NavLink>
    );
  }

  // ── DESKTOP ──────────────────────────────────────────────────────────────────
  if (isHashLink) {
    return (
      <Link to={link.href} onClick={handleHashLink} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <NavLink
      to={link.href}
      onClick={onClick}
      className={({ isActive }) => `${className}${isActive ? ' text-white bg-white/10' : ''}`}
    >
      {label}
    </NavLink>
  );
});

export default function Header() {
  const { t }    = useTranslation();
  const contentNavLinks = useSiteContent('navLinks');
  const navLinks = contentNavLinks.some(link => link.href === '/unit-tests')
    ? contentNavLinks
    : [...contentNavLinks, { label: 'nav.unitTests', href: '/unit-tests' }];
  const [isOpen,          setIsOpen]          = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const [isProfileOpen,   setIsProfileOpen]   = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { currentUser, user, userRole, isSuperadmin, logout, loading } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const profileRef = useRef(null);

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

  // Single rAF-throttled scroll listener — covers header bg + profile close
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
  }, []);

  // iOS-safe body scroll lock when mobile menu is open
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow  = 'hidden';
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${scrollY}px`;
    document.body.style.width     = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => { setIsProfileOpen(false); }, [location.pathname]);

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
                      {(isSuperadmin || userRole === 'admin') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-[color,background-color] duration-150 w-full text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="w-4 h-4 text-violet-400" />
                          </div>
                          {t('header.adminPanel')}
                        </Link>
                      )}
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
            className="md:hidden ml-auto w-10 h-10 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.2] flex items-center justify-center transition-all duration-200 text-slate-200 active:scale-95"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Full-screen backdrop with blur */}
      <div
        onClick={closeMobileMenu}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 top-14 sm:top-16 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile menu — premium glassmorphism panel */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed left-3 right-3 sm:left-5 sm:right-5 top-[68px] sm:top-[76px] z-[90] rounded-[1.5rem] border border-white/[0.1] bg-[#07091c]/95 backdrop-blur-xl shadow-2xl shadow-black/70 max-h-[88svh] overflow-y-auto overflow-x-hidden transition-[opacity,transform] duration-300 origin-top ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-[0.97] pointer-events-none'
        }`}
      >
        {/* Top accent shimmer line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        <div className="p-2">

          {/* Language switcher */}
          <div className="mb-2">
            <LanguageSwitcher className="w-full" />
          </div>

          <div className="h-px bg-white/[0.06] mb-2" />

          {/* Navigation cards — 2-column grid */}
          <div className="grid grid-cols-2 gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                onClick={closeMobileMenu}
                isMobile
              />
            ))}
          </div>

          {/* Auth section */}
          <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
            {loading ? (
              <div className="flex gap-1">
                {[1, 2].map((i) => (
                  <div key={i} className="flex-1 h-[36px] rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                ))}
              </div>
            ) : currentUser ? (
              <>
                {/* User info + actions row */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : (currentUser.email?.[0]?.toUpperCase() || <User className="w-3 h-3" />)
                    }
                  </div>
                  <span className="text-xs font-medium text-white truncate flex-1 min-w-0">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {(isSuperadmin || userRole === 'admin') && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 px-2.5 py-2 min-h-[36px] rounded-xl border transition-all duration-150 hover:border-violet-500/[0.28] hover:bg-violet-500/[0.07] active:scale-[0.98]"
                      style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.18)' }}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-300 truncate">{t('header.adminPanel')}</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-2.5 py-2 min-h-[36px] rounded-xl border transition-all duration-150 hover:border-blue-500/[0.28] hover:bg-blue-500/[0.07] active:scale-[0.98]"
                    style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.18)' }}
                  >
                    <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-300 truncate">{t('header.profile')}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-2.5 py-2 min-h-[36px] rounded-xl border transition-all duration-150 hover:border-red-500/[0.3] hover:bg-red-500/[0.08] active:scale-[0.98] col-span-2"
                    style={{ background: 'rgba(244,63,94,0.04)', borderColor: 'rgba(244,63,94,0.15)' }}
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-red-400">{t('header.logout')}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2.5 text-center text-xs font-medium text-slate-400 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:text-white hover:border-white/[0.18] hover:bg-white/[0.06] transition-all duration-200"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2.5 text-center text-xs font-semibold text-white bg-gradient-to-br from-[#3b82f6] to-[#7c3aed] rounded-xl shadow-md shadow-indigo-500/35 hover:shadow-lg hover:shadow-indigo-500/55 transition-[box-shadow] duration-200"
                >
                  {t('header.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Safe-area padding for notched phones */}
          <div className="h-[max(8px,env(safe-area-inset-bottom,0px))]" />
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
