'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Sparkles,
  Trophy,
  Library,
  Search,
  User,
  LogOut,
  Sliders,
  LogIn,
  Shield,
  Upload,
  Home,
  Mic2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // 5 CORE PILLARS
  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'New Talent', href: '/new-talent', icon: Mic2, highlight: true },
    { name: 'Competitions', href: '/competitions', icon: Trophy },
    { name: 'Library', href: '/library', icon: Library },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isCreator = Array.isArray(user?.roles) && user.roles.includes('CREATOR');
  const isAdmin =
    Array.isArray(user?.roles) &&
    (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'));

  // Do not render consumer navbar on Landing Page (unauthenticated /), Admin, or Login pages
  const isLandingPage = pathname === '/' && !user;
  if (isLandingPage || pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 flex items-center justify-center p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-white dark:bg-midnight-950 flex items-center justify-center transition-colors">
              {/* Custom waveform / sound logo mark */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="1" y="6" width="2.2" height="6" rx="1.1" fill="#F59E0B" />
                <rect x="4.4" y="3" width="2.2" height="12" rx="1.1" fill="#F59E0B" />
                <rect x="7.9" y="1" width="2.2" height="16" rx="1.1" fill="#FBBF24" />
                <rect x="11.4" y="4" width="2.2" height="10" rx="1.1" fill="#F59E0B" />
                <rect x="14.8" y="7" width="2.2" height="4" rx="1.1" fill="#F59E0B" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                TALENT<span className="text-amber-500">5</span>
              </span>
            </div>
            <span className="text-[9px] hidden sm:block tracking-widest uppercase text-slate-500 dark:text-gray-400">
              Real Voices • Desi Talent
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xs lg:max-w-md xl:max-w-lg relative items-center"
        >
          <Search className="w-4 h-4 absolute left-3.5 pointer-events-none text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search songs, artists, lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs bg-slate-100/90 dark:bg-midnight-900/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
          />
        </form>

        {/* 5 Core Pillars Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-sm font-semibold'
                    : link.highlight
                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions / Profile / Theme */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Creator Studio CTA */}
          <Link
            href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 shadow-saffronGlow transition-all duration-200"
          >
            {isCreator ? (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Track</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Become Creator</span>
              </>
            )}
          </Link>

          {/* Admin Command Center Link (Always visible for administrators) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-rose-500/15 via-rose-500/20 to-amber-500/15 hover:from-rose-500/25 hover:to-amber-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:border-rose-400 shadow-sm transition-all"
              title="Return to Admin Command Center"
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              <span>Command Center</span>
            </Link>
          )}

          {/* User Session / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <Link
                href="/library"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 p-[1px] hover:scale-105 transition-transform"
                title={user.fullName || user.username}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-midnight-900 flex items-center justify-center overflow-hidden">
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
              </Link>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/login"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400/90 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                title="Admin Command Center Gateway"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-medium">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
