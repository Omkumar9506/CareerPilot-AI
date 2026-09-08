import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/25 hover:shadow-brand-600/40 border border-brand-500/30',
    ai: 'bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 hover:from-brand-500 hover:via-indigo-500 hover:to-cyber-500 text-white shadow-md shadow-brand-600/30 hover:shadow-brand-600/50 border border-brand-400/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-white dark:border-slate-800 shadow-sm',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-brand-500/10 dark:hover:border-brand-500/60 bg-transparent',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 border border-rose-500/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';
