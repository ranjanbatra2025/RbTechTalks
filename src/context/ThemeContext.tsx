import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 1. Initialize State
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // If a user has a saved preference, respect it.
    if (savedTheme) {
      return savedTheme;
    }
    
    // OTHERWISE: Force Default to 'light' (Ignore system settings)
    return 'light'; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // 2. Force the class change immediately
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // 3. Save to storage so we remember their choice for next time
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};