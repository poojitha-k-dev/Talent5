'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, ShieldCheck, Sparkles, AlertTriangle, XCircle } from 'lucide-react';

export type BadgeType =
  | 'verified'
  | 'approvedCreator'
  | 'desiOriginal'
  | 'rightsVerified'
  | 'rightsExpired'
  | 'rightsRestricted'
  | 'language'
  | 'genre';

interface BadgeProps {
  type: BadgeType;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, label, className }) => {
  const configs = {
    verified: {
      text: label || 'Verified',
      icon: CheckCircle2,
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    approvedCreator: {
      text: label || 'Approved Creator',
      icon: Sparkles,
      style: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    },
    desiOriginal: {
      text: label || 'Desi Original',
      icon: Sparkles,
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    rightsVerified: {
      text: label || 'Rights Verified',
      icon: ShieldCheck,
      style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    rightsExpired: {
      text: label || 'Rights Expired',
      icon: XCircle,
      style: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    rightsRestricted: {
      text: label || 'Restricted',
      icon: AlertTriangle,
      style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    },
    language: {
      text: label || 'Language',
      icon: null,
      style: 'bg-midnight-800 text-gray-300 border-white/10 hover:border-amber-500/40',
    },
    genre: {
      text: label || 'Genre',
      icon: null,
      style: 'bg-midnight-800 text-gray-300 border-white/10',
    },
  };

  const item = configs[type];
  const Icon = item.icon;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors',
          item.style,
          className
        )
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{item.text}</span>
    </span>
  );
};
