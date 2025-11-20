import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Hook para lazy loading con Intersection Observer
export function useLazyLoading(options: IntersectionObserverInit = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '50px', // Cargar 50px antes de ser visible
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, options]);

  return { elementRef, isVisible, hasLoaded };
}

// Hook para virtual scrolling optimizado
export function useVirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5, // Elementos extra a renderizar fuera de la vista
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement>(null);

  const { startIndex, endIndex, totalHeight, visibleItems, offsetY } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      startIndex: Math.max(0, start - overscan),
      endIndex: end,
      totalHeight: items.length * itemHeight,
      visibleItems: items.slice(Math.max(0, start - overscan), end),
      offsetY: Math.max(0, start - overscan) * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items, overscan]);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    scrollElementRef,
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}

// Hook para cargar imágenes de forma lazy
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { elementRef, isVisible } = useLazyLoading();

  useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    setIsLoading(true);
    setError(null);

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError('Error al cargar la imagen');
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, src]);

  return { elementRef, imageSrc, isLoading, error };
}

// Hook para debounce (optimización de performance en búsquedas)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle (optimización de eventos frecuentes)
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Hook para detectar viewport y optimizar renderizado
export function useViewportOptimization() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    window.addEventListener('resize', updateViewport, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { viewport, isVisible };
}

// Hook para medir performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(performance.now());
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    rerenders: 0,
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({
      renderTime,
      rerenders: prev.rerenders + 1,
    }));

    // Log performance en desarrollo
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  return metrics;
}

// Hook para batching de updates
export function useBatchedUpdates<T>(
  initialValue: T,
  batchTime: number = 100
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const pendingUpdate = useRef<T | ((prev: T) => T) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchedSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    pendingUpdate.current = newValue;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (pendingUpdate.current !== null) {
        setValue(pendingUpdate.current);
        pendingUpdate.current = null;
      }
    }, batchTime);
  }, [batchTime]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, batchedSetValue];
}

export default useLazyLoading;