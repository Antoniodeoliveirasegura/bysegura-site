import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved !== null ? saved === 'dark' : true;
    // Apply synchronously so body class is set before first render
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
    return dark;
  });

  const [animationEnabled, setAnimationEnabled] = useState(() => {
    return localStorage.getItem('animationEnabled') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('animationEnabled', animationEnabled.toString());
  }, [animationEnabled]);

const toggleTheme = () => setIsDark(d => !d);
  const toggleAnimation = () => setAnimationEnabled(a => !a);

  return (
    <ThemeContext.Provider value={{ isDark, animationEnabled, toggleTheme, toggleAnimation }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
