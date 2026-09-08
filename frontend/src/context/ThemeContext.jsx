import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'careerpilot-theme';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // 1. Initial theme choice stored in localStorage or fallback to 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'system';
  });

  // 2. Query OS preference
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // 3. Compute resolved active theme ('light' or 'dark')
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  // 4. Apply theme to <html> element
  const applyThemeToDOM = useCallback((activeTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }, []);

  // 5. Synchronize on theme change
  useEffect(() => {
    const effective = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(effective);
    applyThemeToDOM(effective);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage write failure
    }
  }, [theme, getSystemTheme, applyThemeToDOM]);

  // 6. Listen for OS theme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleOSChange = (e) => {
      if (theme === 'system') {
        const newSystem = e.matches ? 'dark' : 'light';
        setResolvedTheme(newSystem);
        applyThemeToDOM(newSystem);
      }
    };

    mediaQuery.addEventListener('change', handleOSChange);
    return () => mediaQuery.removeEventListener('change', handleOSChange);
  }, [theme, applyThemeToDOM]);

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      // If currently system, toggle opposite to resolved
      return resolvedTheme === 'dark' ? 'light' : 'dark';
    });
  };

  const value = {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
