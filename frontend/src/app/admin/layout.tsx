'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileMusic,
  ShieldAlert,
  Coins,
  ScrollText,
  Settings,
  Scale,
  ArrowLeft,
  Shield,
  Sparkles,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAdmin =
    Array.isArray(user?.roles) &&
    (user.roles.includes('ADMIN') ||
      user.roles.includes('SUPER_ADMIN') ||
      user.roles.includes('FINANCE') ||
      user.roles.includes('MODERATOR'));

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users & Signups', href: '/admin/users', icon: Users },
    { name: 'Auditions & Creators', href: '/admin/applications', icon: UserCheck },
    { name: 'Content Moderation', href: '/admin/content-review', icon: FileMusic },
    { name: 'Rights & Licensing', href: '/admin/rights', icon: Scale },
    { name: 'Anti-Fraud Cockpit', href: '/admin/fraud', icon: ShieldAlert },
    { name: 'Payout Settlements', href: '/admin/payouts', icon: Coins },
    { name: 'Audit Ledger', href: '/admin/audit-logs', icon: ScrollText },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  // Route directly to /admin/login if not authenticated
  useEffect(() => {
    if (!isLoading && pathname !== '/admin/login' && (!user || !isAdmin)) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, isAdmin, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent 1-tick flicker between AdminLoginGate and children during Auth hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-gray-400">Verifying administrator clearance...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#06070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-gray-400">Redirecting to Administrator Gateway...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col">
      {/* Admin Top Command Bar */}
      <header className="sticky top-0 z-50 h-14 bg-midnight-950/95 border-b border-rose-500/20 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mr-2 px-2.5 py-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Music Platform</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              TALENT<span className="text-rose-500">5</span> <span className="text-gray-400 font-mono text-xs font-normal">Command Center</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {user.roles.find(r => ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(r)) || 'ADMIN'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono hidden md:inline">Node: ap-south-1 (Mumbai)</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-300 font-medium">{user.fullName}</span>
            <span className="text-[11px] text-gray-500 font-mono hidden sm:inline">({user.email})</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-midnight-900/60 border-r border-white/5 flex flex-col flex-shrink-0">
          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-3 pb-2">
              Management Cockpits
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-white/5">
            <div className="p-3 rounded-xl bg-midnight-950 border border-white/5 text-[11px] text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">Compliance Guard</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Schema-enforced rights verification & anti-fraud velocity heuristics active.
              </p>
            </div>
          </div>
        </aside>

        {/* Admin Main Canvas */}
        <main className="flex-1 overflow-y-auto bg-midnight-950 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
