import { useTheme } from '../context/ThemeContext';

export const useChartTheme = () => {
  const { isDark } = useTheme();

  return {
    isDark,
    textColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? '#1e293b' : '#e2e8f0',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
    tooltipStyle: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: '12px',
      fontSize: '12px',
      color: isDark ? '#f8fafc' : '#0f172a',
      boxShadow: isDark
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    },
  };
};

export default useChartTheme;
