import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  gradientBorder = false,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={`
        relative rounded-2xl bg-navy-900/70 backdrop-blur-xl border border-white/[0.08] shadow-xl
        ${hover ? 'transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10' : ''}
        ${glow ? 'shadow-glow-sm' : ''}
        ${gradientBorder ? 'gradient-border-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
