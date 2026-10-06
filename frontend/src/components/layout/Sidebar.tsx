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
  Heart,
  Music,
  Disc,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarPlaylist {
  id: string;
  name: string;
  slug?: string;
  songCount?: number;
  coverUrl?: string;
  visibility?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [playlists, setPlaylists] = useState<SidebarPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  // Fetch real public and user playlists from backend database
  const loadPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const res = await fetch('/api/v1/playlists');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPlaylists(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load playlists from database:', err);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  // Also fetch user's personal playlists from library if logged in
  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.playlists)) {
          setPlaylists((prev) => {
            const map = new Map<string, SidebarPlaylist>();
            json.data.playlists.forEach((p: any) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.error('Failed to sync library playlists:', err));
  }, [token]);

  const mainNav = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/discover', icon: Search },
    { name: 'Your Library', href: '/library', icon: Library },
  ];

  const talentPillars = [
    { name: 'New Talent', href: '/new-talent', icon: Mic2, badge: 'Live' },
    { name: 'Competitions', href: '/competitions', icon: Trophy, badge: 'Active' },
  ];

  // Real Database Create Playlist Handler
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    if (!user || !token) {
      setShowCreateModal(false);
      router.push('/login');
      return;
    }

    setCreatingPlaylist(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/v1/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          visibility: 'PUBLIC',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const createdPlaylist: SidebarPlaylist = json.data;
        setPlaylists((prev) => [createdPlaylist, ...prev]);
        setNewPlaylistName('');
        setShowCreateModal(false);
        router.push(`/playlist/${createdPlaylist.id}`);
      } else {
        setCreateError(json.message || 'Failed to create playlist in database.');
      }
    } catch (err: any) {
      console.error('Playlist creation error:', err);
      setCreateError(err.message || 'Network error while creating playlist.');
    } finally {
      setCreatingPlaylist(false);
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
        className={`h-screen sticky top-0 flex-shrink-0 bg-white dark:bg-[#12141c] border-r border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 flex flex-col z-40 select-none transition-[width,transform] duration-300 ease-in-out ${
          isCollapsed ? 'md:w-[72px]' : 'md:w-64 md:xl:w-72'
        } ${
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
          <div className="pt-4 pb-3 flex flex-col items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            {/* 3 LINES HAMBURGER BUTTON (CLICK TO OPEN) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all group relative flex items-center justify-center"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Open sidebar
              </span>
            </button>

            {/* Mini Brand Logo */}
            <Link
              href="/"
              prefetch={true}
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
          <div className="px-4 pt-5 pb-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              {/* 3 LINES HAMBURGER BUTTON (CLICK TO CLOSE) */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsMobileOpen(false);
                  } else {
                    toggleSidebar();
                  }
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all group flex-shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:text-orange-500 transition-colors" />
              </button>

              {/* BRAND LOGO */}
              <Link href="/" prefetch={true} className="flex items-center gap-2.5 group min-w-0">
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
                  <span className="font-display font-bold text-lg tracking-tight text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">
                    Talent<span className="text-[#ff5722]">5</span>
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold leading-tight">
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
                className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white rounded-lg"
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
                  prefetch={true}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff5722]/20 to-[#ff5722]/10 text-[#ff5722] shadow-inner shadow-orange-500/10'
                      : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
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
                  prefetch={true}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div
                    className={
                      isActive
                        ? 'text-orange-600 dark:text-[#ff5722]'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors'
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
          <div className="px-2 pt-3 space-y-1.5 flex flex-col items-center border-t border-black/[0.06] dark:border-white/[0.06] mt-3">
            {talentPillars.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                    isActive
                      ? 'bg-black/[0.06] dark:bg-white/[0.08] text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors" />
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
            <div className="px-3.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              Explore Talent
            </div>
            {talentPillars.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-black/[0.05] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex-shrink-0">
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
          <div className="px-2 pt-3 flex flex-col items-center gap-2 border-t border-black/[0.06] dark:border-white/[0.06] mt-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-[#ff5722] hover:text-white text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all group relative border border-black/[0.08] dark:border-white/[0.08] shadow-2xs"
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
              prefetch={true}
              className="w-10 h-10 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center transition-all group relative border border-orange-500/20"
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
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-black/[0.08] dark:border-white/[0.08] hover:border-orange-500/30 text-zinc-800 dark:text-white text-xs font-semibold tracking-wide transition-all group shadow-2xs"
            >
              <div className="w-5 h-5 rounded-md bg-black/10 dark:bg-white/10 group-hover:bg-[#ff5722] group-hover:text-white flex items-center justify-center transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Create Playlist</span>
            </button>

            <Link
              href={isCreator ? '/creator-studio' : '/creator-studio/apply'}
              prefetch={true}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isCreator ? 'Creator Studio' : 'Become Creator'}</span>
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. REAL DATABASE PLAYLISTS SECTION (Scrollable list)            */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="flex-1 overflow-y-auto px-2 pt-3 space-y-1.5 flex flex-col items-center scrollbar-none">
            {/* Quick Liked Songs Link */}
            <Link
              href="/library"
              prefetch={true}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group relative"
              title="Liked Songs"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                Liked Songs (Your Library)
              </span>
            </Link>

            {playlists.map((pl) => {
              const isActive = pathname === `/playlist/${pl.id}`;
              return (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  prefetch={true}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Disc className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16181f] text-white text-xs font-semibold rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {pl.name} ({pl.songCount || 0} tracks)
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 pt-5 pb-4 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <div className="flex items-center justify-between px-3.5 pb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                Playlists ({playlists.length})
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors p-1"
                title="Add New Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Liked Songs Hub */}
            <Link
              href="/library"
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/library'
                  ? 'bg-rose-500/10 text-rose-500 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                <Heart className="w-3 h-3 fill-current" />
              </div>
              <span className="truncate">Liked Songs</span>
            </Link>

            {loadingPlaylists && playlists.length === 0 ? (
              <div className="px-3.5 py-4 flex items-center gap-2 text-zinc-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>Loading playlists...</span>
              </div>
            ) : playlists.length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-zinc-400">
                <p>No playlists yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-1 text-orange-500 hover:underline font-semibold"
                >
                  + Create your first playlist
                </button>
              </div>
            ) : (
              playlists.map((pl) => {
                const isActive = pathname === `/playlist/${pl.id}`;
                return (
                  <Link
                    key={pl.id}
                    href={`/playlist/${pl.id}`}
                    prefetch={true}
                    className={`flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-colors group ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="truncate">{pl.name}</span>
                    </div>
                    {pl.songCount !== undefined && (
                      <span className="text-[10px] text-zinc-400 flex-shrink-0">
                        {pl.songCount}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. USER PROFILE FOOTER (Real Auth Session)                     */}
        {/* ============================================================== */}
        {isCollapsed ? (
          <div className="p-2 border-t border-black/[0.06] dark:border-white/[0.06] bg-[#f8f7f4] dark:bg-[#0e1017] flex flex-col items-center gap-2">
            {user ? (
              <div className="group relative flex flex-col items-center">
                <Link
                  href="/profile"
                  prefetch={true}
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
                prefetch={true}
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
          <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] bg-[#f8f7f4] dark:bg-[#0e1017]">
            {user ? (
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                <Link href="/profile" prefetch={true} className="flex items-center gap-2.5 truncate group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-orange-500 truncate">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={true}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7043] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-orange-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        )}

        {/* REAL DATABASE CREATE PLAYLIST MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141620] border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-zinc-900 dark:text-white">
              <h3 className="text-base font-bold mb-1">Create Real Playlist</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Saved directly to database and visible in your library.
              </p>

              {!user && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                  You need to be logged in to save custom playlists.
                </div>
              )}

              {createError && (
                <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. My Favorite Desi Melodies"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError(null);
                    }}
                    className="px-3.5 py-2 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPlaylist || !newPlaylistName.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-[#ff5722] hover:bg-[#ff7043] disabled:opacity-50 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    {creatingPlaylist && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{user ? 'Create & Save' : 'Sign In to Create'}</span>
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