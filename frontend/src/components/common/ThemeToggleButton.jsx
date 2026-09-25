import useThemeMode from '../../hooks/useThemeMode';

const ThemeToggleButton = ({ compact = false, className = '' }) => {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--tm-text)] transition hover:bg-[var(--tm-hover)] ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
      {compact ? null : <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
};

export default ThemeToggleButton;
