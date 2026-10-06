import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlobalPlayer } from '@/components/player/GlobalPlayer';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { LandingBackground } from '@/components/layout/LandingBackground';
import { RouteProgressBar } from '@/components/layout/RouteProgressBar';

export const metadata: Metadata = {
  title: 'Talent5 — Real Voices. Original Stories. Desi Talent.',
  description:
    'India\'s premier music discovery, streaming, independent creator, and talent platform celebrating Desi voices across 13 Indian languages.',
  manifest: '/manifest.json',
  keywords: [
    'Indian music',
    'Desi music',
    'Indie artists India',
    'Telugu music',
    'Hindi music',
    'Tamil music',
    'Punjabi songs',
    'Talent5',
    'Creator rewards',
  ],
  openGraph: {
    title: 'Talent5 — Real Voices. Original Stories. Desi Talent.',
    description: 'Stream music, discover independent Desi artists, and earn rewards on Talent5.',
    url: 'https://talent5.com',
    siteName: 'Talent5',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#f8f6f1] dark:bg-[#0e1017] text-zinc-900 dark:text-[var(--text-primary)] min-h-screen antialiased selection:bg-orange-500 selection:text-white overflow-hidden">
        <RouteProgressBar />
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <div className="flex h-screen w-screen overflow-hidden bg-[#f8f6f1] dark:bg-[#0e1017]">
                {/* 1. Sleek Pinned Left Sidebar */}
                <Sidebar />

                {/* 2. Scrollable Dashboard Main Content (Hardware Accelerated & Smooth) */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden smooth-scroll">
                  <LandingBackground />
                  <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-36 max-w-[1600px] w-full mx-auto">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>

              {/* 3. Persistent Mobile & Audio Overlays */}
              <MobileNav />
              <GlobalPlayer />
              <PWAInstallPrompt />
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
