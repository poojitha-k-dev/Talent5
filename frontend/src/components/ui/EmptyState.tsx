'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, Music, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Music,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-black/10 dark:border-white/10 bg-white/30 dark:bg-midnight-950/40 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button variant="primary" size="md">
              {actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null
      )}
    </div>
  );
};
