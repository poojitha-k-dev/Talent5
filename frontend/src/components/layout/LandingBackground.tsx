'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * LandingBackground — renders the fixed cinematic photo background
 * ONLY on the landing page (pathname === '/').
 * On all other routes this renders nothing, so no bleed-through.
 */
export function LandingBackground() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden>
      {/* Full-bleed cinematic photo */}
      <img
        src="/images/landing/desi_music_cinematic.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.45) saturate(1.05) sepia(0.18)' }}
      />
      {/* Warm amber tone-map */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, rgba(160,65,0,0.22) 0%, rgba(80,30,0,0.12) 45%, rgba(0,0,0,0.08) 100%)' }} />
      {/* Saffron radial — top-left */}
      <div className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full blur-[130px] opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.55) 0%, transparent 70%)' }} />
      {/* Teal — mid right */}
      <div className="absolute top-[40%] -right-20 w-[480px] h-[480px] rounded-full blur-[110px] opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.45) 0%, transparent 70%)' }} />
      {/* Fine noise grain */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <filter id="landing-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#landing-grain)" />
      </svg>
    </div>
  );
}
