'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  return (
    <button
      id="theme-toggle-btn"
      data-testid="theme-toggle"
      onClick={toggleTheme}
      type="button"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className={`relative px-2.5 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 group cursor-pointer ${
        isLight
          ? 'bg-amber-100/90 border-amber-300/80 text-amber-900 shadow-xs hover:bg-amber-200/90'
          : 'bg-[#181a24] border-white/10 hover:border-amber-500/50 text-amber-400'
      } ${className}`}
      aria-label="Toggle Color Theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
      <span className="text-[11px] font-bold tracking-tight select-none">
        {isLight ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};
