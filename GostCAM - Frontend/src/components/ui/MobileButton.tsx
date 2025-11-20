import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { useHapticFeedback } from '@/utils/hapticFeedback';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  touchFriendly?: boolean; // Aplica automáticamente min-h-[44px] min-w-[44px]
  children: ReactNode;
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      hapticFeedback = 'light',
      touchFriendly = true,
      className = '',
      onClick,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { buttonPress } = useHapticFeedback();

    // Variantes de estilo
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
      secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900',
      danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
      ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700'
    };

    // Tamaños con touch targets optimizados
    const sizeClasses = {
      sm: touchFriendly ? 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm' : 'h-9 px-3 py-2 text-sm',
      md: touchFriendly ? 'min-h-[44px] min-w-[44px] px-4 py-3 text-base' : 'h-10 px-4 py-2 text-base',
      lg: touchFriendly ? 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg' : 'h-12 px-6 py-3 text-lg',
      xl: touchFriendly ? 'min-h-[52px] min-w-[52px] px-8 py-4 text-xl' : 'h-14 px-8 py-4 text-xl'
    };

    // Clases base para todos los botones
    const baseClasses = [
      'relative inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none', // Previene selección de texto en móvil
      'touch-manipulation', // Optimiza para touch
      // Espaciado entre elementos
      'gap-2'
    ].join(' ');

    // Clases de focus ring según variante
    const focusClasses = {
      primary: 'focus:ring-blue-500',
      secondary: 'focus:ring-gray-400',
      danger: 'focus:ring-red-500',
      ghost: 'focus:ring-gray-400',
      outline: 'focus:ring-blue-500'
    };

    const combinedClassName = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      focusClasses[variant],
      // Clases adicionales para touch
      'active:scale-[0.98]', // Feedback visual en tap
      'transform',
      className
    ].join(' ');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      // Proporcionar feedback háptico si está habilitado
      if (hapticFeedback !== 'none') {
        buttonPress(hapticFeedback);
      }

      // Ejecutar callback si existe
      if (onClick) {
        onClick(event);
      }
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <span className="ml-2">Cargando...</span>
          </>
        );
      }

      return (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span className={`${leftIcon || rightIcon ? 'flex-1' : ''} truncate`}>
            {children}
          </span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={combinedClassName}
        onClick={handleClick}
        disabled={disabled || isLoading}
        // Atributos de accesibilidad móvil
        aria-disabled={disabled || isLoading}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Botón específico para iconos con tamaño cuadrado
export const MobileIconButton = forwardRef<
  HTMLButtonElement,
  Omit<MobileButtonProps, 'children'> & { icon: ReactNode; ariaLabel: string }
>(({ icon, ariaLabel, size = 'md', ...props }, ref) => {
  const squareClasses = {
    sm: 'min-h-[44px] min-w-[44px] w-11 h-11',
    md: 'min-h-[44px] min-w-[44px] w-12 h-12', 
    lg: 'min-h-[48px] min-w-[48px] w-14 h-14',
    xl: 'min-h-[52px] min-w-[52px] w-16 h-16'
  };

  return (
    <MobileButton
      ref={ref}
      size={size}
      className={`${squareClasses[size]} p-0`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </MobileButton>
  );
});

MobileIconButton.displayName = 'MobileIconButton';

// Grupo de botones con espaciado óptimo
export const MobileButtonGroup: React.FC<{
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}> = ({ 
  children, 
  orientation = 'horizontal', 
  spacing = 'normal',
  className = '' 
}) => {
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
    normal: orientation === 'horizontal' ? 'gap-3' : 'gap-3',
    loose: orientation === 'horizontal' ? 'gap-4' : 'gap-4'
  };

  const orientationClass = orientation === 'horizontal' ? 'flex-row' : 'flex-col';

  return (
    <div className={`flex ${orientationClass} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default MobileButton;