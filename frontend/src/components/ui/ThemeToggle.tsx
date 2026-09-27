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
      title={isLight ? 'Switch to Midnight Obsidian (Dark Mode)' : 'Switch to Royal Ivory (Light Mode)'}
      className={`relative px-2.5 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 group cursor-pointer ${
        isLight
          ? 'bg-amber-100/80 border-amber-400 text-amber-900 shadow-sm hover:bg-amber-200/80'
          : 'bg-midnight-900 border-white/10 hover:border-amber-500/50 text-amber-400'
      } ${className}`}
      aria-label="Toggle Color Theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isLight ? (
          <Moon className="w-3.5 h-3.5 text-amber-700 fill-amber-700 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-90" />
        )}
      </div>
      <span className="text-[11px] font-bold tracking-tight select-none">
        {isLight ? 'Ivory' : 'Obsidian'}
      </span>
    </button>
  );
};
