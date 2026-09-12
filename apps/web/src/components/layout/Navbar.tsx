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
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/10 dark:border-white/5 bg-white/85 dark:bg-midnight-950/85 backdrop-blur-xl transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 flex items-center justify-center p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-midnight-950 rounded-[10px] flex items-center justify-center transition-colors">
                <Music className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  TALENT<span className="text-amber-500">5</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Desi
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-gray-400 hidden sm:block tracking-widest uppercase">
                Real Voices • Desi Talent
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search songs, artists, Desi creators, ragas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/90 dark:bg-midnight-900/90 border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
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
            })}
          </nav>

          {/* Action Center / User Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Creator Studio Link */}
            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              <span>{isCreator ? 'Creator Studio' : 'Become Creator'}</span>
            </Link>

            {/* Admin Command Center Link */}
            {isAdmin && (
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
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 p-[1px]">
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
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-slate-700 dark:text-gray-200"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Join Talent5
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
};
