import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface UseTheme {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme;
}

export function useTheme(defaultTheme: Theme = 'light'): UseTheme {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      setResolvedTheme(storedTheme);
    } else {
      setTheme(defaultTheme);
      setResolvedTheme(defaultTheme)
    }
  }, [defaultTheme]);

  useEffect(() => {
    if (theme) {
        localStorage.setItem('theme', theme);
        setResolvedTheme(theme);
    }
  }, [theme]);
  
  return { theme, setTheme, resolvedTheme };
}