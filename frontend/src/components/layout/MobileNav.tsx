'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Mic2, Trophy, Library, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin =
    Array.isArray(user?.roles) &&
    (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'));

  // Hide on admin or auth login/register screens
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  // CORE PILLARS FOR MOBILE (Includes Admin if privileged)
  const items = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'New Talent', href: '/new-talent', icon: Mic2, highlight: true },
    { name: 'Contests', href: '/competitions', icon: Trophy },
    { name: 'Library', href: '/library', icon: Library },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield, highlight: true }] : []),
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-midnight-950/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 px-2 py-1.5 flex items-center justify-around transition-colors duration-300">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`relative flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : item.highlight
                ? 'text-amber-500 font-semibold'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
            {item.highlight && !isActive && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
