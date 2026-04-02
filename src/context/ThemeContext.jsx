import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved !== null ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Apply synchronously so body class is set before first render
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
    return dark;
  });

  const [animationEnabled, setAnimationEnabled] = useState(() => {
    return localStorage.getItem('animationEnabled') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('animationEnabled', animationEnabled.toString());
  }, [animationEnabled]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setIsDark(d => !d);
  const toggleAnimation = () => setAnimationEnabled(a => !a);

  return (
    <ThemeContext.Provider value={{ isDark, animationEnabled, toggleTheme, toggleAnimation }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
