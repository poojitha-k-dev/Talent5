'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress whenever the pathname or search parameters change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal navigation links for instant feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      try {
        const targetUrl = new URL(target.href, window.location.href);

        // Check if internal navigation to a different path
        if (
          targetUrl.origin === window.location.origin &&
          (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) &&
          !target.getAttribute('target') &&
          !target.getAttribute('download') &&
          !target.href.startsWith('#')
        ) {
          setLoading(true);
          setProgress(25);

          const t1 = setTimeout(() => {
            setProgress((p) => (p < 70 ? 70 : p));
          }, 100);

          const t2 = setTimeout(() => {
            setProgress((p) => (p < 90 ? 90 : p));
          }, 400);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      } catch (err) {
        // Ignore external or invalid URLs
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#ff5722] via-[#ff9800] to-[#ff5722] shadow-[0_0_10px_#ff5722] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
    </Suspense>
  );
}
