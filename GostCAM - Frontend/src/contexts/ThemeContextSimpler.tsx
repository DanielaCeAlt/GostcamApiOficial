'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Tipos más simples
type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isClient, setIsClient] = useState(false);
  
  // Marcar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
    // Forzar tema claro siempre
    setTheme('light');
  }, []);

  // Función simplificada para determinar el tema efectivo
  const getEffectiveTheme = (): 'light' | 'dark' => {
    return 'light'; // Siempre light por ahora
  };

  const effectiveTheme = getEffectiveTheme();

  const handleSetTheme = (newTheme: Theme) => {
    setTheme('light'); // Forzar siempre light
    if (isClient) {
      localStorage.setItem('gostcam-theme', 'light');
    }
  };

  const toggleTheme = () => {
    // No hacer nada por ahora
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    effectiveTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Componente para alternar tema
export function ThemeToggle() {
  const { effectiveTheme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
      title={`Cambiar a tema ${effectiveTheme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <i className={`fas ${effectiveTheme === 'light' ? 'fa-moon' : 'fa-sun'} text-gray-600`}></i>
    </button>
  );
}