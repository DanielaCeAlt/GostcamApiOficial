'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light'); // Start with light theme
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Detectar preferencia del sistema
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined' || !mounted) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [mounted]);

  // Calcular tema efectivo
  const calculateEffectiveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  }, [getSystemTheme]);

  // Aplicar tema al DOM
  const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
    if (typeof window === 'undefined' || !mounted) return;
    
    const root = document.documentElement;
    
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Actualizar meta theme-color para mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeToApply === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [mounted]);

  // Manejar el montaje del componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar tema guardado al inicializar (solo después del montaje)
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const savedTheme = localStorage.getItem('gostcam-theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.warn('Error loading saved theme:', error);
    }
  }, [mounted]);

  // Actualizar tema efectivo cuando cambia el tema
  useEffect(() => {
    if (!mounted) return;
    
    const newEffectiveTheme = calculateEffectiveTheme(theme);
    if (newEffectiveTheme !== effectiveTheme) {
      setEffectiveTheme(newEffectiveTheme);
      applyTheme(newEffectiveTheme);
    }
  }, [theme, mounted, calculateEffectiveTheme, effectiveTheme, applyTheme]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = getSystemTheme();
        if (newEffectiveTheme !== effectiveTheme) {
          setEffectiveTheme(newEffectiveTheme);
          applyTheme(newEffectiveTheme);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, getSystemTheme, effectiveTheme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!mounted) return;
    
    setThemeState(newTheme);
    
    try {
      localStorage.setItem('gostcam-theme', newTheme);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  }, [mounted]);

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme
  };

  // Evitar hydration mismatch mostrando loading hasta que esté montado
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Componente para el selector de tema
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Claro', icon: 'fa-sun' },
    { value: 'dark', label: 'Oscuro', icon: 'fa-moon' },
    { value: 'system', label: 'Sistema', icon: 'fa-desktop' }
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">
        Tema:
      </span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {themes.map((themeOption) => (
          <option key={themeOption.value} value={themeOption.value}>
            {themeOption.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Componente toggle simple para el tema
export function ThemeToggle() {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      title={`Cambiar a tema ${effectiveTheme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <i className={`fas ${effectiveTheme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
    </button>
  );
}