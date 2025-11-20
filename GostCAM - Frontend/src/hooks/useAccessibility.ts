import { useEffect, useCallback, useRef } from 'react';

// Hook para gestionar navegación por teclado y accesibilidad
export function useKeyboardNavigation() {
  const focusableElementsRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const currentFocusIndexRef = useRef<number>(-1);

  // Selectores para elementos focuseables
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]'
  ].join(', ');

  // Actualizar lista de elementos focuseables
  const updateFocusableElements = useCallback(() => {
    focusableElementsRef.current = document.querySelectorAll(focusableSelectors);
  }, [focusableSelectors]);

  // Navegar al siguiente elemento
  const focusNext = useCallback(() => {
    updateFocusableElements();
    if (!focusableElementsRef.current) return;

    const elements = Array.from(focusableElementsRef.current);
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    const nextIndex = (currentIndex + 1) % elements.length;
    
    elements[nextIndex]?.focus();
    currentFocusIndexRef.current = nextIndex;
  }, [updateFocusableElements]);

  // Navegar al elemento anterior
  const focusPrevious = useCallback(() => {
    updateFocusableElements();
    if (!focusableElementsRef.current) return;

    const elements = Array.from(focusableElementsRef.current);
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    
    elements[prevIndex]?.focus();
    currentFocusIndexRef.current = prevIndex;
  }, [updateFocusableElements]);

  // Forzar focus en un elemento específico
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    element?.focus();
  }, []);

  // Manejar teclas de navegación
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Tab':
        // Tab ya maneja focus naturalmente, solo actualizamos la lista
        updateFocusableElements();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        // Solo si estamos en un contexto de navegación específico
        if (event.target && (event.target as HTMLElement).getAttribute('role') === 'menubar') {
          event.preventDefault();
          focusNext();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        if (event.target && (event.target as HTMLElement).getAttribute('role') === 'menubar') {
          event.preventDefault();
          focusPrevious();
        }
        break;
      case 'Home':
        if (event.ctrlKey) {
          event.preventDefault();
          updateFocusableElements();
          focusableElementsRef.current?.[0]?.focus();
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          event.preventDefault();
          updateFocusableElements();
          const elements = focusableElementsRef.current;
          elements?.[elements.length - 1]?.focus();
        }
        break;
    }
  }, [updateFocusableElements, focusNext, focusPrevious]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    updateFocusableElements();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, updateFocusableElements]);

  return {
    focusNext,
    focusPrevious,
    focusElement,
    updateFocusableElements
  };
}

// Hook para manejo de roles ARIA y announces
export function useAriaAnnouncements() {
  const announceElementRef = useRef<HTMLDivElement | null>(null);

  // Crear elemento para anuncios si no existe
  const createAnnouncer = useCallback(() => {
    if (!announceElementRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('role', 'status');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announceElementRef.current = announcer;
    }
    return announceElementRef.current;
  }, []);

  // Anunciar mensaje para lectores de pantalla
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    
    // Limpiar contenido anterior
    announcer.textContent = '';
    
    // Usar setTimeout para asegurar que el lector de pantalla detecte el cambio
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // Limpiar después de un tiempo
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }, [createAnnouncer]);

  // Anunciar cambios de página/sección
  const announcePageChange = useCallback((pageName: string, description?: string) => {
    const message = description 
      ? `Navegado a ${pageName}. ${description}`
      : `Navegado a ${pageName}`;
    announce(message, 'polite');
  }, [announce]);

  // Anunciar errores
  const announceError = useCallback((errorMessage: string) => {
    announce(`Error: ${errorMessage}`, 'assertive');
  }, [announce]);

  // Anunciar acciones completadas
  const announceSuccess = useCallback((successMessage: string) => {
    announce(`Completado: ${successMessage}`, 'polite');
  }, [announce]);

  // Anunciar loading states
  const announceLoading = useCallback((action: string) => {
    announce(`Cargando ${action}...`, 'polite');
  }, [announce]);

  useEffect(() => {
    createAnnouncer();
    
    return () => {
      if (announceElementRef.current) {
        document.body.removeChild(announceElementRef.current);
        announceElementRef.current = null;
      }
    };
  }, [createAnnouncer]);

  return {
    announce,
    announcePageChange,
    announceError,
    announceSuccess,
    announceLoading
  };
}

// Hook para validar contraste de colores
export function useContrastValidation() {
  // Función para calcular la luminancia relativa
  const calculateLuminance = useCallback((r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(component => {
      component /= 255;
      return component <= 0.03928
        ? component / 12.92
        : Math.pow((component + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }, []);

  // Función para calcular el ratio de contraste
  const calculateContrastRatio = useCallback((color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = calculateLuminance(...color1);
    const lum2 = calculateLuminance(...color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }, [calculateLuminance]);

  // Convertir color hex a RGB
  const hexToRgb = useCallback((hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  }, []);

  // Validar si cumple WCAG AA (4.5:1) o AAA (7:1)
  const validateContrast = useCallback((foreground: string, background: string) => {
    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);
    
    if (!fgRgb || !bgRgb) {
      return { ratio: 0, aa: false, aaa: false, error: 'Invalid color format' };
    }

    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      error: null
    };
  }, [hexToRgb, calculateContrastRatio]);

  // Auditar contrastes en la página
  const auditPageContrast = useCallback(() => {
    const results: Array<{
      element: Element;
      foreground: string;
      background: string;
      ratio: number;
      passes: { aa: boolean; aaa: boolean };
    }> = [];

    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label');
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Convertir colores RGB a hex para la validación
      // Esta es una simplificación - en producción usaríamos una librería más robusta
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // Simplificación para demo - en producción necesitaríamos parsing RGB más robusto
        console.debug('Contrast check needed for:', element.tagName, color, backgroundColor);
      }
    });

    return results;
  }, []);

  return {
    validateContrast,
    auditPageContrast,
    calculateContrastRatio,
    calculateLuminance
  };
}

export default useKeyboardNavigation;