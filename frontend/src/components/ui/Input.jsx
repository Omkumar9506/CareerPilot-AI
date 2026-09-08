import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 pointer-events-none text-slate-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={twMerge(
            clsx(
              'w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed',
              LeftIcon && 'pl-9',
              RightIcon && 'pr-9',
              error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
              className
            )
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 pointer-events-none text-slate-400">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
