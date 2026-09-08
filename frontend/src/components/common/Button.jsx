import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 hover:from-brand-500 hover:to-cyber-500 text-white shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 focus:ring-brand-400 active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700/80 focus:ring-slate-400 active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 dark:hover:bg-white/5 dark:text-slate-300 dark:border-slate-700 dark:hover:text-white focus:ring-brand-400 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:text-slate-300 dark:hover:text-white focus:ring-slate-500',
    glow: 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm hover:shadow-glow-md focus:ring-brand-400 active:scale-[0.98]',
    cyan: 'bg-cyber-500/10 hover:bg-cyber-500/20 text-cyber-700 dark:text-cyber-300 border border-cyber-500/30 hover:border-cyber-400/50 focus:ring-cyber-400 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
