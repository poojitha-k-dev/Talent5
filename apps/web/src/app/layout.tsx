import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlobalPlayer } from '@/components/player/GlobalPlayer';

export const metadata: Metadata = {
  title: 'Talent5 — Real Voices. Original Stories. Desi Talent.',
  description:
    'India’s premier music discovery, streaming, independent creator, and talent platform celebrating Desi voices across 13 Indian languages.',
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
    <html lang="en" className="dark">
      <body className="bg-midnight-950 text-gray-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-midnight-950">
        <AuthProvider>
          <AudioProvider>
            <Navbar />
            <main className="flex-1 pb-28 sm:pb-24">{children}</main>
            <MobileNav />
            <GlobalPlayer />
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
