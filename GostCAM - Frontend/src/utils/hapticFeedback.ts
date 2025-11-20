// Utilidades para feedback háptico en dispositivos móviles
export interface HapticFeedbackOptions {
  type?: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';
  pattern?: number[]; // Para vibraciones personalizadas
}

class HapticFeedback {
  static isSupported(): boolean {
    return 'vibrate' in navigator || 'hapticActuators' in navigator;
  }

  private static hasVibrationAPI(): boolean {
    return 'vibrate' in navigator;
  }

  private static hasHapticAPI(): boolean {
    return 'hapticActuators' in navigator;
  }

  /**
   * Proporciona feedback háptico según el tipo especificado
   */
  static trigger(options: HapticFeedbackOptions = {}) {
    if (!this.isSupported()) {
      console.debug('Haptic feedback not supported on this device');
      return;
    }

    const { type = 'light', pattern } = options;

    // Si se especifica un patrón personalizado
    if (pattern && this.hasVibrationAPI()) {
      navigator.vibrate(pattern);
      return;
    }

    // Feedback predefinido según el tipo
    const feedbackPatterns = {
      light: [10], // Vibración suave
      medium: [20], // Vibración media
      heavy: [40], // Vibración fuerte
      selection: [5], // Para selección de elementos
      impact: [15, 10, 15], // Para acciones importantes
      notification: [10, 50, 10], // Para notificaciones
    };

    if (this.hasVibrationAPI() && feedbackPatterns[type]) {
      navigator.vibrate(feedbackPatterns[type]);
    }
  }

  /**
   * Feedback para botones y elementos interactivos
   */
  static buttonPress(intensity: 'light' | 'medium' | 'heavy' = 'light') {
    this.trigger({ type: intensity });
  }

  /**
   * Feedback para navegación entre tabs/páginas
   */
  static navigationChange() {
    this.trigger({ type: 'selection' });
  }

  /**
   * Feedback para acciones exitosas
   */
  static success() {
    this.trigger({ type: 'notification' });
  }

  /**
   * Feedback para errores
   */
  static error() {
    this.trigger({ pattern: [100, 50, 100] });
  }

  /**
   * Feedback para swipe gestures
   */
  static swipeDetected() {
    this.trigger({ type: 'light' });
  }

  /**
   * Feedback para pull-to-refresh
   */
  static pullRefresh() {
    this.trigger({ type: 'medium' });
  }

  /**
   * Detiene todas las vibraciones
   */
  static stop() {
    if (this.hasVibrationAPI()) {
      navigator.vibrate(0);
    }
  }
}

// Hook de React para usar feedback háptico
import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((options: HapticFeedbackOptions = {}) => {
    HapticFeedback.trigger(options);
  }, []);

  const buttonPress = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    HapticFeedback.buttonPress(intensity);
  }, []);

  const navigationChange = useCallback(() => {
    HapticFeedback.navigationChange();
  }, []);

  const success = useCallback(() => {
    HapticFeedback.success();
  }, []);

  const error = useCallback(() => {
    HapticFeedback.error();
  }, []);

  const swipeDetected = useCallback(() => {
    HapticFeedback.swipeDetected();
  }, []);

  const pullRefresh = useCallback(() => {
    HapticFeedback.pullRefresh();
  }, []);

  const stop = useCallback(() => {
    HapticFeedback.stop();
  }, []);

  return {
    triggerHaptic,
    buttonPress,
    navigationChange,
    success,
    error,
    swipeDetected,
    pullRefresh,
    stop,
    isSupported: HapticFeedback.isSupported(),
  };
}

export default HapticFeedback;