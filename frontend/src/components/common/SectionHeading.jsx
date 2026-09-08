import React from 'react';
import { Badge } from './Badge';

export const SectionHeading = ({
  badge,
  badgeIcon,
  title,
  highlight,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClasses = {
    center: 'text-center mx-auto items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  };

  return (
    <div className={`flex flex-col max-w-3xl mb-14 md:mb-20 ${alignClasses[align] || alignClasses.center} ${className}`}>
      {badge && (
        <div className="mb-4">
          <Badge variant="glow" size="md" icon={badgeIcon}>
            {badge}
          </Badge>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
        {title}{' '}
        {highlight && (
          <span className="gradient-ai">{highlight}</span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
