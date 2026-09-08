import React from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Select = React.forwardRef(({
  children,
  className,
  label,
  error,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'w-full appearance-none rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 pr-9 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
              className
            )
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
