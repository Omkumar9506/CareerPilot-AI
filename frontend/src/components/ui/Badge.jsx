import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  className,
  variant = 'brand',
  size = 'md',
  dot = false,
  pulse = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide transition-all';

  const variants = {
    brand: 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyber-500/15 dark:text-cyber-300 dark:border-cyber-500/30',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-violetAccent-500/15 dark:text-purple-300 dark:border-violetAccent-500/30',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700',
    ai: 'bg-gradient-to-r from-brand-500/15 via-purple-500/15 to-cyber-500/15 text-brand-900 border border-brand-300 shadow-sm dark:text-white dark:border-brand-400/40 dark:shadow-brand-500/10',

    // Application Status Variants
    applied: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
    review: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    shortlisted: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
    interview: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    selected: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const dotColors = {
    brand: 'bg-brand-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    ai: 'bg-brand-400',
    applied: 'bg-blue-500',
    review: 'bg-amber-500',
    shortlisted: 'bg-purple-500',
    interview: 'bg-cyan-500',
    selected: 'bg-emerald-500',
    rejected: 'bg-rose-500',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant] || variants.brand, sizes[size], className))} {...props}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={twMerge(
                clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotColors[variant] || 'bg-brand-500')
              )}
            />
          )}
          <span
            className={twMerge(
              clsx('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant] || 'bg-brand-500')
            )}
          />
        </span>
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
