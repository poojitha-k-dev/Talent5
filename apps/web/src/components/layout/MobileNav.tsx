'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music, Sparkles, Search, Library } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Music', href: '/music', icon: Music },
    { name: 'Desi', href: '/desi', icon: Sparkles },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
  ];

  return (
    <nav className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-xl border-t border-amber-500/20 dark:border-white/10 px-2 py-1 flex items-center justify-around transition-colors duration-300">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
