import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'slate' | 'blue';

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
    description: 'Clean and professional light theme',
    preview: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
    },
  },
  {
    id: 'dark' as Theme,
    name: 'Dark',
    description: 'Professional dark theme',
    preview: {
      primary: '#3b82f6',
      secondary: '#d1d5db',
      background: '#1f2937',
    },
  },
  {
    id: 'slate' as Theme,
    name: 'Slate',
    description: 'Neutral slate theme',
    preview: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      background: '#0f172a',
    },
  },
  {
    id: 'blue' as Theme,
    name: 'Blue Accent',
    description: 'Blue-focused professional theme',
    preview: {
      primary: '#1e40af',
      secondary: '#64748b',
      background: '#f8fafc',
    },
  },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('breezy-driver-theme');
    return (saved as Theme) || 'light';
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
