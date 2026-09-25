import { useEffect, useState } from 'react';

const THEME_KEY = 'tm_theme';
const THEME_EVENT = 'tm_theme_change';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(THEME_KEY) || 'dark';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
};

const persistTheme = (theme) => {
  applyTheme(theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
  }
};

const useThemeMode = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    persistTheme(theme);
  }, []);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail?.theme) {
        setTheme(event.detail.theme);
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_KEY && event.newValue) {
        applyTheme(event.newValue);
        setTheme(event.newValue);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateTheme = (nextTheme) => {
    const resolvedTheme = typeof nextTheme === 'function' ? nextTheme(theme) : nextTheme;

    if (!resolvedTheme) return;

    persistTheme(resolvedTheme);
    setTheme(resolvedTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: resolvedTheme } }));
  };

  const toggleTheme = () => {
    updateTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme: updateTheme, toggleTheme };
};

export default useThemeMode;
