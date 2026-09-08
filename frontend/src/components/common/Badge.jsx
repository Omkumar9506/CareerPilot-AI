import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
    primary: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30',
    cyber: 'bg-cyber-500/10 text-cyber-700 dark:text-cyber-300 border border-cyber-500/30 shadow-sm',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30',
    glow: 'bg-gradient-to-r from-brand-500/15 via-purple-500/15 to-cyber-500/15 text-slate-900 dark:text-white border border-brand-400/40 shadow-glow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
