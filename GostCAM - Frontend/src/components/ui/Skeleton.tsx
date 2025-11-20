'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse'
}) => {
  const getBaseClasses = () => {
    const animationClass = animation === 'pulse' 
      ? 'animate-pulse' 
      : animation === 'wave'
      ? 'animate-wave'
      : '';

    return `bg-gray-200 ${animationClass} ${className}`;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getStyles = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${getBaseClasses()} ${getVariantClasses()} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              ...getStyles()
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${getBaseClasses()} ${getVariantClasses()}`}
      style={getStyles()}
    >
      {variant === 'text' && !height && (
        <span className="opacity-0">.</span>
      )}
    </div>
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg p-6 space-y-4 ${className}`}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} className="mt-2" />
      </div>
    </div>
    <Skeleton lines={3} />
    <div className="flex space-x-2">
      <Skeleton width={80} height={32} />
      <Skeleton width={80} height={32} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={`header-${index}`} height={16} width="80%" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={16} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  className?: string;
}> = ({ 
  items = 6, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div 
        key={index} 
        className="bg-white rounded-lg p-4 border border-gray-200"
      >
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1">
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={12} className="mt-2" />
          </div>
          <div className="flex space-x-2">
            <Skeleton width={24} height={24} variant="circular" />
            <Skeleton width={24} height={24} variant="circular" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton width={60} height={24} />
          </div>
          <div className="mt-4">
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={12} className="mt-2" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6">
        <Skeleton width="50%" height={20} className="mb-4" />
        <Skeleton width="100%" height={200} />
      </div>
      <div className="bg-white rounded-lg p-6">
        <Skeleton width="50%" height={20} className="mb-4" />
        <Skeleton variant="circular" width={200} height={200} className="mx-auto" />
      </div>
    </div>
  </div>
);

export default Skeleton;