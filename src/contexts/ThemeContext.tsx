import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'neon' | 'ocean' | 'forest' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Array<{
    id: Theme;
    name: string;
    description: string;
    preview: {
      primary: string;
      secondary: string;
      background: string;
    };
  }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = [
  {
    id: 'light' as Theme,
    name: 'Light',
    description: 'Clean and bright theme',
    preview: {
      primary: '#2563eb',
      secondary: '#16a34a',
      background: '#ffffff',
    },
  },
  {
    id: 'dark' as Theme,
    name: 'Dark',
    description: 'Easy on the eyes',
    preview: {
      primary: '#3b82f6',
      secondary: '#22c55e',
      background: '#0f172a',
    },
  },
  {
    id: 'neon' as Theme,
    name: 'Neon Purple',
    description: 'Cool black and purple neon theme',
    preview: {
      primary: '#a855f7',
      secondary: '#ec4899',
      background: '#0a0a0a',
    },
  },
  {
    id: 'ocean' as Theme,
    name: 'Ocean Blue',
    description: 'Deep blue ocean vibes',
    preview: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#0c4a6e',
    },
  },
  {
    id: 'forest' as Theme,
    name: 'Forest Green',
    description: 'Natural green forest theme',
    preview: {
      primary: '#059669',
      secondary: '#65a30d',
      background: '#064e3b',
    },
  },
  {
    id: 'sunset' as Theme,
    name: 'Sunset Orange',
    description: 'Warm sunset colors',
    preview: {
      primary: '#ea580c',
      secondary: '#dc2626',
      background: '#7c2d12',
    },
  },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('breezy-driver-theme');
    return (saved as Theme) || 'neon';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('breezy-driver-theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'neon', 'ocean', 'forest', 'sunset');
    
    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
