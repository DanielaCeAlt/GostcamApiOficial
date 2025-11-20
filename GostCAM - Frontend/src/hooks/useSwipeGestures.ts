import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Distancia mínima para considerar un swipe
  touchStartThreshold?: number; // Threshold para detectar inicio de touch
}

interface TouchPosition {
  x: number;
  y: number;
}

export function useSwipeGestures(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    touchStartThreshold = 10,
  } = options;

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [isSwipeDetected, setIsSwipeDetected] = useState(false);
  
  const elementRef = useRef<HTMLElement>(null);

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(null); // Reset touch end
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
    setIsSwipeDetected(false);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.targetTouches[0];
    const currentTouch = {
      x: touch.clientX,
      y: touch.clientY,
    };

    // Calculate current distance
    const distanceX = Math.abs(currentTouch.x - touchStart.x);
    const distanceY = Math.abs(currentTouch.y - touchStart.y);

    // If movement is significant, prevent scroll (for horizontal swipes)
    if (distanceX > touchStartThreshold && distanceX > distanceY) {
      e.preventDefault();
    }

    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Determine primary direction (larger distance)
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
        setIsSwipeDetected(true);
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
        setIsSwipeDetected(true);
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
        setIsSwipeDetected(true);
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
        setIsSwipeDetected(true);
      }
    }

    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive: false for touchmove to allow preventDefault
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd]);

  return {
    elementRef,
    isSwipeDetected,
    touchStart,
    touchEnd,
  };
}

// Hook específico para navegación con tabs
export function useTabSwipeNavigation(
  tabs: string[], 
  currentTab: string, 
  onTabChange: (tab: string) => void
) {
  const currentIndex = tabs.indexOf(currentTab);

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      // Ir al siguiente tab
      if (currentIndex < tabs.length - 1) {
        onTabChange(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      // Ir al tab anterior
      if (currentIndex > 0) {
        onTabChange(tabs[currentIndex - 1]);
      }
    },
    threshold: 60, // Mayor threshold para evitar swipes accidentales
  });

  return swipeGestures;
}

// Hook para navegación de paginación
export function usePaginationSwipe(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      // Página siguiente
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    },
    onSwipeRight: () => {
      // Página anterior
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    },
    threshold: 80, // Mayor threshold para paginación
  });

  return swipeGestures;
}

export default useSwipeGestures;