import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm transition-all dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-100 dark:shadow-none',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassCard = ({ children, className, hover = true, glow = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-2xl p-6 relative overflow-hidden text-slate-900 dark:text-slate-100',
          hover && 'glass-card-hover',
          glow && 'dark:shadow-glow-brand shadow-md',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('flex flex-col space-y-1.5 p-6', className))} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={twMerge(clsx('text-xl font-bold tracking-tight text-slate-900 dark:text-white', className))} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={twMerge(clsx('text-sm text-slate-500 dark:text-slate-400', className))} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('p-6 pt-0', className))} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80', className))} {...props}>
    {children}
  </div>
);
