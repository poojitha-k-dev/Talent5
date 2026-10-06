'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, X, Sparkles } from 'lucide-react';
import { Button } from './Button';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Listen for PWA install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const dismissed = localStorage.getItem('talent5_pwa_dismissed');
        if (!dismissed) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Register Service Worker in production only. In dev, actively clean up any stale worker.
      if ('serviceWorker' in navigator) {
        if (process.env.NODE_ENV === 'production') {
          navigator.serviceWorker
            .register('/sw.js')
            .then(() => console.log('✅ Talent5 Service Worker registered.'))
            .catch((err) => console.log('SW registration error:', err));
        } else {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
          if ('caches' in window) {
            caches.keys().then((names) => {
              for (const name of names) {
                caches.delete(name);
              }
            });
          }
        }
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('talent5_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Pill */}
      {isOffline && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-amber-500/90 text-midnight-950 font-bold text-xs shadow-xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode: Playing from cached audio vault</span>
        </div>
      )}

      {/* Floating PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-40 max-w-sm w-full p-4 rounded-2xl bg-midnight-900/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-midnight-950 flex items-center justify-center text-amber-400 font-bold text-xs font-display">
                T5
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                <span>Install Talent5 App</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </h4>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                Instant launching & offline music streaming.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold text-[11px] px-2.5 py-1"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
