import { useTheme } from '../context/ThemeContext';

export const useChartTheme = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    isDark,
    // Grid lines
    gridStroke: isDark ? '#1e293b' : '#e2e8f0',
    gridStrokeDasharray: '3 3',

    // Axes and labels
    axisStroke: isDark ? '#334155' : '#cbd5e1',
    tickFill: isDark ? '#94a3b8' : '#64748b',
    tickFontSize: 11,

    // Tooltip styling
    tooltipContentStyle: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: '0.75rem',
      boxShadow: isDark 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: '12px',
      padding: '8px 12px',
    },
    tooltipItemStyle: {
      color: isDark ? '#cbd5e1' : '#334155',
      fontSize: '12px',
    },
    tooltipLabelStyle: {
      color: isDark ? '#f8fafc' : '#0f172a',
      fontWeight: '600',
      marginBottom: '4px',
    },

    // Chart Palette Colors
    colors: {
      primary: isDark ? '#6366f1' : '#4f46e5',
      secondary: isDark ? '#06b6d4' : '#0891b2',
      purple: isDark ? '#8b5cf6' : '#7c3aed',
      success: isDark ? '#10b981' : '#059669',
      warning: isDark ? '#f59e0b' : '#d97706',
      error: isDark ? '#ef4444' : '#dc2626',
      bars: isDark 
        ? ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']
        : ['#4f46e5', '#0891b2', '#7c3aed', '#059669', '#d97706'],
    },
  };
};
