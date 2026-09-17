'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Music,
  Compass,
  Trophy,
  Library,
  Search,
  Flame,
  Shield,
  Sparkles,
  User,
  LogOut,
  Sliders,
  LogIn,
  Mic,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'Discover', href: '/home', icon: Compass },
    { name: 'Music', href: '/music', icon: Music },
    { name: 'Desi Original', href: '/desi', icon: Sparkles, badge: 'Desi' },
    { name: 'Singing Lab', href: '/karaoke', icon: Mic, badge: 'AI' },
    { name: 'Tournaments', href: '/competitions', icon: Trophy },
    { name: 'Leaderboard', href: '/leaderboards', icon: Flame },
    { name: 'Library', href: '/library', icon: Library },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isCreator = Array.isArray(user?.roles) && user.roles.includes('CREATOR');
  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'));

  const isLandingPage = pathname === '/';
  const isDarkPage = pathname === '/' || pathname === '/login';

  const landingNavLinks = [
    { name: 'Discover', href: '/home' },
    { name: 'Music', href: '/music' },
    { name: 'Desi Music', href: '/desi' },
    { name: 'Artists', href: '/music' },
  ];

  // Do not render consumer navbar on Admin pages or dedicated Login auth page
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isDarkPage
          ? 'border-b border-white/8 shadow-none'
          : 'border-b border-amber-500/10 dark:border-white/5 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-xl shadow-sm dark:shadow-none'
      }`}
        style={isDarkPage ? {
          background: 'rgba(6,5,10,0.30)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href={isLandingPage ? '/' : '/home'} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 flex items-center justify-center p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center transition-colors ${
                isDarkPage ? 'bg-midnight-950' : 'bg-white dark:bg-midnight-950'
              }`}>
                {/* Custom waveform / sound logo mark */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1"  y="6"  width="2.2" height="6"  rx="1.1" fill="#F59E0B" />
                  <rect x="4.4" y="3"  width="2.2" height="12" rx="1.1" fill="#F59E0B" />
                  <rect x="7.9" y="1"  width="2.2" height="16" rx="1.1" fill="#FBBF24" />
                  <rect x="11.4" y="4" width="2.2" height="10" rx="1.1" fill="#F59E0B" />
                  <rect x="14.8" y="7" width="2.2" height="4"  rx="1.1" fill="#F59E0B" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`font-display font-extrabold text-xl tracking-tight group-hover:text-amber-500 transition-colors ${
                  isDarkPage ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  TALENT<span className="text-amber-500">5</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Desi
                </span>
              </div>
              <span className={`text-[9px] hidden sm:block tracking-widest uppercase ${
                isDarkPage ? 'text-white/50' : 'text-slate-500 dark:text-gray-400'
              }`}>
                Real Voices • Desi Talent
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className={`hidden ${isDarkPage ? 'lg:flex max-w-xs' : 'md:flex max-w-md'} flex-1 relative items-center`}
          >
            <Search className={`w-4 h-4 absolute left-3.5 pointer-events-none ${isDarkPage ? 'text-amber-400' : 'text-slate-400 dark:text-gray-400'}`} />
            <input
              type="text"
              placeholder={isLandingPage ? 'Search original music...' : 'Search songs, artists, Desi creators, ragas...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={isDarkPage ? {
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.28)',
                color: 'white',
              } : undefined}
              className={`w-full pl-10 pr-4 py-2 rounded-full text-xs focus:outline-none transition-all ${
                isDarkPage
                  ? 'placeholder-white/40 focus:ring-1 focus:ring-amber-400/40'
                  : 'bg-slate-100/90 dark:bg-midnight-900/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60'
              }`}
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isLandingPage ? (
              landingNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  {link.name}
                </Link>
              ))
            ) : (
              navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-700 dark:bg-white/10 dark:text-amber-400 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Action Center / User Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Creator Studio Link */}
            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{isCreator ? 'Creator Studio' : 'Become a Creator'}</span>
            </Link>

            {/* Admin Command Center Link (Only on internal app pages) */}
            {!isLandingPage && isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Command Center</span>
              </Link>
            )}

            {/* User Session */}
            {user ? (
              <div className={`flex items-center gap-2 pl-2 border-l ${isDarkPage ? 'border-white/15' : 'border-slate-200 dark:border-white/10'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 p-[1px]">
                    <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                      isDarkPage ? 'bg-midnight-900' : 'bg-white dark:bg-midnight-900'
                    }`}>
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className={`text-xs font-semibold leading-tight ${isDarkPage ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400/80">@{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isDarkPage
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
                >
                  Join Talent5
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

    </>
  );
};
