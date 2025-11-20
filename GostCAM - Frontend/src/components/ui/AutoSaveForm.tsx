'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAutoSave } from '@/hooks/useForm';

interface AutoSaveIndicatorProps {
  /** Estado del auto-save */
  status: 'idle' | 'saving' | 'saved' | 'error';
  /** Última vez que se guardó */
  lastSaved?: Date | null;
  /** Posición del indicador */
  position?: 'fixed' | 'inline';
  /** Mostrar tiempo transcurrido */
  showTime?: boolean;
  /** Texto personalizado */
  customText?: {
    saving?: string;
    saved?: string;
    error?: string;
  };
  /** Callback para reintentar en caso de error */
  onRetry?: () => void;
  className?: string;
}

/**
 * Indicador visual de auto-save con estados y tiempo
 */
export function AutoSaveIndicator({
  status,
  lastSaved,
  position = 'fixed',
  showTime = true,
  customText = {},
  onRetry,
  className
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Calcular tiempo transcurrido
  useEffect(() => {
    if (!lastSaved || !showTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo('hace un momento');
      } else if (minutes < 60) {
        setTimeAgo(`hace ${minutes}m`);
      } else {
        setTimeAgo(`hace ${hours}h`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved, showTime]);

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: 'fas fa-sync fa-spin',
          text: customText.saving || 'Guardando...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'saved':
        return {
          icon: 'fas fa-check',
          text: customText.saved || 'Guardado',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: 'fas fa-exclamation-triangle',
          text: customText.error || 'Error al guardar',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-4 right-4 z-50' 
    : 'relative';

  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm transition-all duration-300',
      config.bgColor,
      config.color,
      'border-current border-opacity-20',
      positionClasses,
      className
    )}>
      <i className={cn(config.icon, 'text-sm')} />
      <span className="text-sm font-medium">{config.text}</span>
      
      {showTime && timeAgo && status === 'saved' && (
        <span className="text-xs opacity-75">({timeAgo})</span>
      )}

      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs underline hover:no-underline ml-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

/**
 * Wrapper para formularios con auto-save
 */
interface AutoSaveFormProps {
  children: React.ReactNode;
  data: any;
  onSave: (data: any) => Promise<void>;
  saveDelay?: number;
  showIndicator?: boolean;
  indicatorPosition?: 'fixed' | 'inline';
  className?: string;
}

export default function AutoSaveForm({
  children,
  data,
  onSave,
  saveDelay = 2000,
  showIndicator = true,
  indicatorPosition = 'fixed',
  className
}: AutoSaveFormProps) {
  const { saveStatus, lastSaved } = useAutoSave(data, onSave, saveDelay);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onSave(data).catch(() => {
      // Error will be handled by the hook
    });
  };

  return (
    <div className={cn('relative', className)}>
      {children}
      
      {showIndicator && (
        <AutoSaveIndicator
          status={saveStatus}
          lastSaved={lastSaved}
          position={indicatorPosition}
          onRetry={saveStatus === 'error' ? handleRetry : undefined}
        />
      )}
    </div>
  );
}

/**
 * Hook para manejo de formularios con auto-save y validación
 */
export function useAutoSaveForm<T extends Record<string, any>>({
  initialData,
  saveFunction,
  validateFunction,
  saveDelay = 2000
}: {
  initialData: T;
  saveFunction: (data: T) => Promise<void>;
  validateFunction?: (data: T) => boolean;
  saveDelay?: number;
}) {
  const [data, setData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { saveStatus, lastSaved } = useAutoSave(
    data,
    async (dataToSave: T) => {
      // Solo guardar si es válido
      if (validateFunction && !validateFunction(dataToSave)) {
        throw new Error('Datos inválidos');
      }
      await saveFunction(dataToSave);
      setIsDirty(false);
    },
    saveDelay
  );

  const updateField = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Limpiar error del campo si existe
    if (validationErrors[field as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof T, value: any) => {
    if (validateFunction) {
      const testData = { ...data, [field]: value };
      const isValid = validateFunction(testData);
      
      if (!isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [field as string]: 'Campo inválido'
        }));
      }
    }
  };

  const reset = (newData?: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
    setIsDirty(false);
    setValidationErrors({});
  };

  return {
    data,
    isDirty,
    saveStatus,
    lastSaved,
    validationErrors,
    updateField,
    validateField,
    reset,
    isValid: Object.keys(validationErrors).length === 0
  };
}

/**
 * Componente de estado de formulario con información completa
 */
interface FormStatusProps {
  isDirty: boolean;
  isValid: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  validationErrors?: Record<string, string>;
  className?: string;
}

export function FormStatus({
  isDirty,
  isValid,
  saveStatus,
  lastSaved,
  validationErrors = {},
  className
}: FormStatusProps) {
  const errorCount = Object.keys(validationErrors).length;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Auto-save indicator */}
      <AutoSaveIndicator
        status={saveStatus}
        lastSaved={lastSaved}
        position="inline"
      />

      {/* Validation status */}
      {!isValid && errorCount > 0 && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <i className="fas fa-exclamation-circle" />
          <span>{errorCount} error(es) de validación</span>
        </div>
      )}

      {/* Unsaved changes */}
      {isDirty && saveStatus !== 'saving' && (
        <div className="flex items-center space-x-2 text-orange-600 text-sm">
          <i className="fas fa-dot-circle" />
          <span>Cambios sin guardar</span>
        </div>
      )}

      {/* All good */}
      {!isDirty && isValid && saveStatus === 'saved' && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <i className="fas fa-check-circle" />
          <span>Todo guardado</span>
        </div>
      )}
    </div>
  );
}