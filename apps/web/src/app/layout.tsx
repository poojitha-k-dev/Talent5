import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlobalPlayer } from '@/components/player/GlobalPlayer';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { LandingBackground } from '@/components/layout/LandingBackground';

export const metadata: Metadata = {
  title: 'Talent5 — Real Voices. Original Stories. Desi Talent.',
  description:
    'India’s premier music discovery, streaming, independent creator, and talent platform celebrating Desi voices across 13 Indian languages.',
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
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-midnight-950 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <Navbar />
              <LandingBackground />
              <main className="flex-1">{children}</main>
              <Footer />
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
