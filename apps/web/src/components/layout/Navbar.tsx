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
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-midnight-950/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 flex items-center justify-center p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-midnight-950 rounded-[10px] flex items-center justify-center">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  TALENT<span className="text-amber-500">5</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Desi
                </span>
              </div>
              <span className="text-[9px] text-gray-400 hidden sm:block tracking-widest uppercase">
                Real Voices • Desi Talent
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search songs, artists, Desi creators, ragas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-midnight-900/90 border border-white/10 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
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
                      ? 'bg-white/10 text-amber-400 shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-teal-500/20 text-teal-300 font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Center / User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Creator Studio Link */}
            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{isCreator ? 'Creator Studio' : 'Become Creator'}</span>
            </Link>

            {/* Admin Command Center Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Command Center</span>
              </Link>
            )}

            {/* User Session */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 p-[1px]">
                    <div className="w-full h-full rounded-full bg-midnight-900 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-amber-400/80">@{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-gray-400 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors"
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
