'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Mic2,
  Trophy,
  Plus,
  Upload,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface PlaylistNav {
  id: string;
  name: string;
  query: string;
  color: string;
  icon?: string;
}

const CURATED_PLAYLISTS: PlaylistNav[] = [
  { id: '1', name: 'Chill Vibes', query: 'chill', color: 'from-violet-500 to-purple-600' },
  { id: '2', name: 'Romantic Hits', query: 'romantic', color: 'from-rose-500 to-pink-600' },
  { id: '3', name: 'Workout Mix', query: 'workout', color: 'from-emerald-500 to-teal-600' },
  { id: '4', name: 'Punjabi Tadka', query: 'punjabi', color: 'from-amber-500 to-orange-600' },
  { id: '5', name: 'Bollywood Love', query: 'bollywood', color: 'from-red-500 to-rose-600' },
  { id: '6', name: 'Focus Mode', query: 'meditative', color: 'from-cyan-500 to-blue-600' },
  { id: '7', name: 'Sad Songs', query: 'soulful', color: 'from-blue-500 to-indigo-600' },
  { id: '8', name: 'Arijit Singh Hits', query: 'arijit', color: 'from-orange-500 to-amber-600', icon: '❤️' },
  { id: '9', name: 'Liked Songs', query: 'liked', color: 'from-fuchsia-500 to-pink-500', icon: '💜' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [createdPlaylists, setCreatedPlaylists] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Sidebar toggle state (3-lines hamburger feature)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load persisted collapsed state after mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('talent5_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('talent5_sidebar_collapsed', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const mainNav = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/discover', icon: Search },
    { name: 'Your Library', href: '/library', icon: Library },
  ];

  const talentPillars = [
    { name: 'New Talent', href: '/new-talent', icon: Mic2, badge: 'Live' },
    { name: 'Competitions', href: '/competitions', icon: Trophy, badge: 'Active' },
  ];

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      setCreatedPlaylists((prev) => [...prev, newPlaylistName.trim()]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const isCreator = Array.isArray(user?.roles) && user.roles.includes('CREATOR');
  const userDisplayName = (user as any)?.fullName || (user as any)?.name || user?.username || 'Desi Artist';
  const userInitial = userDisplayName[0]?.toUpperCase() || 'U';

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Mobile 3-Lines (Hamburger) Floating Trigger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-xl bg-[#0c0d10]/90 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-white/10 active:scale-95 transition-all"
        title="Open sidebar"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-orange-400" />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`h-screen sticky top-0 flex-shrink-0 bg-[#0c0d10] border-r border-white/[0.06] text-zinc-300 flex flex-col z-40 select-none transition-[width,transform] duration-300 ease-in-out ${
          // Desktop Width: Collapsed (72px) vs Expanded (w-64 xl:w-72)
          isCollapsed ? 'md:w-[72px]' : 'md:w-64 md:xl:w-72'
        } ${
          // Mobile: Drawer slide-in
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] translate-x-0 shadow-2xl'
            : 'max-md:-translate-x-full fixed md:relative'
        }`}
      >
        {/* ============================================================== */}
        {/* 1. BRAND LOGO & 3-LINES TOGGLE HEADER                          */}
        {/* ============================================================== */}
        {isCollapsed ? (
          // COLLAPSED HEADER
          <div className="pt-4 pb-3 flex flex-col items-center gap-3 border-b border-white/[0.05]">
            {/* 3 LINES HAMBURGER BUTTON (CLICK TO OPEN) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all group relative flex items-center justify-center"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Open sidebar
              </span>
            </button>

            {/* Mini Brand Logo */}
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff5722] to-[#ff8a50] flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex-shrink-0 group relative"
              title="Talent5 Home"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <rect x="2" y="6" width="2" height="6" rx="1" fill="currentColor" />
                <rect x="5.5" y="3" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="9" y="1" width="2" height="16" rx="1" fill="currentColor" />
                <rect x="12.5" y="4" width="2" height="10" rx="1" fill="currentColor" />
                <rect x="16" y="7" width="2" height="4" rx="1" fill="currentColor" />
              </svg>
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Talent5 Home
              </span>
            </Link>
          </div>
        ) : (
          // EXPANDED HEADER
          <div className="px-4 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.05]">
            <div className="flex items-center gap-2 min-w-0">
              {/* 3 LINES HAMBURGER BUTTON (CLICK TO CLOSE) */}
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileOpen(false);
                  } else {
                    toggleSidebar();
                  }
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all group flex-shrink-0"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <Menu className="w-5 h-5 text-zinc-300 group-hover:text-orange-400 transition-colors" />
              </button>

              {/* BRAND LOGO */}
              <Link href="/" className="flex items-center gap-2.5 group min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff5722] to-[#ff8a50] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <rect x="2" y="6" width="2" height="6" rx="1" fill="currentColor" />
                    <rect x="5.5" y="3" width="2" height="12" rx="1" fill="currentColor" />
                    <rect x="9" y="1" width="2" height="16" rx="1" fill="currentColor" />
                    <rect x="12.5" y="4" width="2" height="10" rx="1" fill="currentColor" />
                    <rect x="16" y="7" width="2" height="4" rx="1" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-orange-400 transition-colors leading-tight">
                    Talent<span className="text-[#ff5722]">5</span>
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold leading-tight">
                    Real Voices • Desi
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {/* Close 'X' button on mobile view */}
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. PRIMARY NAVIGATION (Home, Search, Your Library)             */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <nav className="px-2 pt-3 space-y-1.5 flex flex-col items-center">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff5722]/20 to-[#ff5722]/10 text-[#ff5722] shadow-inner shadow-orange-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {/* Floating tooltip */}
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
                  )}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="px-3 pt-3 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff5722]/20 to-[#ff5722]/10 text-white font-semibold shadow-inner shadow-orange-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div
                    className={
                      isActive
                        ? 'text-[#ff5722]'
                        : 'text-zinc-400 group-hover:text-white transition-colors'
                    }
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff5722] shadow-[0_0_8px_#ff5722]" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ============================================================== */}
        {/* 3. TALENT5 PILLARS (New Talent & Competitions)                 */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="px-2 pt-3 space-y-1.5 flex flex-col items-center border-t border-white/[0.06] mt-3">
            {talentPillars.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-3 pt-4 space-y-1">
            <div className="px-3.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Explore Talent
            </div>
            {talentPillars.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. ACTION BUTTONS (+ Create Playlist & Creator Studio)         */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="px-2 pt-3 flex flex-col items-center gap-2 border-t border-white/[0.06] mt-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-[#ff5722] hover:text-white text-zinc-300 flex items-center justify-center transition-all group relative border border-white/[0.08] shadow-sm"
              title="Create Playlist"
              aria-label="Create Playlist"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Create Playlist
              </span>
            </button>

            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all group relative border border-amber-500/20"
              title={isCreator ? 'Creator Studio' : 'Become Creator'}
            >
              <Upload className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {isCreator ? 'Creator Studio' : 'Become Creator'}
              </span>
            </Link>
          </div>
        ) : (
          <div className="px-3 pt-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-orange-500/30 text-white text-xs font-semibold tracking-wide transition-all group shadow-sm"
            >
              <div className="w-5 h-5 rounded-md bg-white/10 group-hover:bg-[#ff5722] group-hover:text-white flex items-center justify-center transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Create Playlist</span>
            </button>

            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-[11px] font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isCreator ? 'Creator Studio' : 'Become Creator'}</span>
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. PLAYLISTS SECTION (Scrollable list)                          */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="flex-1 overflow-y-auto px-2 pt-3 space-y-1.5 flex flex-col items-center scrollbar-none">
            {CURATED_PLAYLISTS.map((pl) => (
              <Link
                key={pl.id}
                href={'/discover?search=' + encodeURIComponent(pl.query)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all group relative"
              >
                {pl.icon ? (
                  <span className="text-xs group-hover:scale-125 transition-transform">{pl.icon}</span>
                ) : (
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${pl.color} group-hover:scale-150 transition-transform`}
                  />
                )}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {pl.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 pt-5 pb-4 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <div className="flex items-center justify-between px-3.5 pb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Playlists
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Add Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {createdPlaylists.map((pl, idx) => (
              <Link
                key={idx}
                href={'/discover?search=' + encodeURIComponent(pl)}
                className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 flex-shrink-0" />
                <span className="truncate">{pl}</span>
              </Link>
            ))}

            {CURATED_PLAYLISTS.map((pl) => (
              <Link
                key={pl.id}
                href={'/discover?search=' + encodeURIComponent(pl.query)}
                className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors group"
              >
                {pl.icon ? (
                  <span className="text-xs group-hover:scale-110 transition-transform">{pl.icon}</span>
                ) : (
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${pl.color} flex-shrink-0 group-hover:scale-125 transition-transform`}
                  />
                )}
                <span className="truncate font-medium">{pl.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. USER PROFILE FOOTER                                         */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="p-2 border-t border-white/[0.06] bg-[#090a0d] flex flex-col items-center gap-2">
            {user ? (
              <div className="group relative flex flex-col items-center">
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm hover:scale-105 transition-transform"
                >
                  {userInitial}
                </Link>
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {userDisplayName}
                </span>
              </div>
            ) : (
              <Link
                href="/login"
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] flex items-center justify-center text-white hover:opacity-95 shadow-md shadow-orange-500/20 transition-all group relative"
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  Sign In / Register
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-white/[0.06] bg-[#090a0d]">
            {user ? (
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.03]">
                <Link href="/profile" className="flex items-center gap-2.5 truncate group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-white group-hover:text-orange-400 truncate">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-orange-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        )}

        {/* CREATE PLAYLIST MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-base font-bold text-white mb-2">Create New Playlist</h3>
              <p className="text-xs text-zinc-400 mb-4">Enter a name for your custom playlist.</p>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. My Favorite Desi Melodies"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#ff5722] hover:bg-[#ff7043] text-white rounded-lg shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};