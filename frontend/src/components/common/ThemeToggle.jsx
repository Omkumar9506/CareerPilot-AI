import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ variant = 'dropdown', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simple icon button toggle variant
  if (variant === 'simple') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} (${resolvedTheme}). Click to toggle.`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-brand-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  // Dropdown menu variant (Light / Dark / System)
  const options = [
    { value: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
    { value: 'dark', label: 'Dark', icon: Moon, color: 'text-brand-400' },
    { value: 'system', label: 'System', icon: Laptop, color: 'text-cyber-400' },
  ];

  const currentIcon = isDark ? (
    <Moon className="w-4 h-4 text-brand-400" />
  ) : (
    <Sun className="w-4 h-4 text-amber-500" />
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-navy-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-center justify-center"
        aria-label="Select theme mode"
        aria-expanded={open}
        title={`Theme: ${theme}`}
      >
        {currentIcon}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 py-1.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
