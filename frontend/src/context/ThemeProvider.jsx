import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeProviderContext = createContext(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark', // Can be 'light' or 'dark'
  storageKey = 'vite-ui-theme',
  ...props
}) {
  const [theme, setThemeState] = useState(
    () => (localStorage.getItem(storageKey)) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.warn(`Invalid theme: ${newTheme}. Theme must be 'light' or 'dark'.`);
      return;
    }
    localStorage.setItem(storageKey, newTheme); // Persist before setting state to avoid race condition on immediate toggle
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
}; 