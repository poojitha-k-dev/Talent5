'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { GlobalPlayer } from '@/components/player/GlobalPlayer';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { LandingBackground } from './LandingBackground';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#06070b] text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f6f1] dark:bg-[#0e1017]">
      {/* 1. Sleek Pinned Left Sidebar */}
      <Sidebar />

      {/* 2. Scrollable Dashboard Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden smooth-scroll">
        <LandingBackground />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-36 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>

      {/* 3. Persistent Mobile & Audio Overlays */}
      <MobileNav />
      <GlobalPlayer />
      <PWAInstallPrompt />
    </div>
  );
}
