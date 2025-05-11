import { createContext, useState, ReactNode, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  // Apply theme to body element
  useEffect(() => {
    const body = document.body;

    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem('theme') as Theme;

  //   if (savedTheme) {
  //     setTheme(savedTheme); // Use the theme from localStorage if available.
  //   } else {
  //     // Otherwise, use the system preference.
  //     const prefersDarkMode = window.matchMedia(
  //       '(prefers-color-scheme: dark)'
  //     ).matches;
  //     setTheme(prefersDarkMode ? 'dark' : 'light');
  //   }
  // }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
