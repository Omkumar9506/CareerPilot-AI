import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'careerpilot-theme';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // 1. Initial theme selection from localStorage, falling back to 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme:', e);
    }
    return 'system';
  });

  // 2. Compute resolved theme based on user choice or OS preference
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  });

  // 3. Apply classes to document.documentElement
  const applyThemeToDOM = useCallback((activeTheme) => {
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, []);

  // 4. Sync on theme change
  useEffect(() => {
    let effective = theme;
    if (theme === 'system') {
      effective = getSystemTheme();
    }

    setResolvedTheme(effective);
    applyThemeToDOM(effective);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }, [theme, getSystemTheme, applyThemeToDOM]);

  // 5. Listen for OS theme preference changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleOSThemeChange = (e) => {
      if (theme === 'system') {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newSystemTheme);
        applyThemeToDOM(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleOSThemeChange);
    return () => mediaQuery.removeEventListener('change', handleOSThemeChange);
  }, [theme, applyThemeToDOM]);

  // 6. Setter and toggle functions
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
