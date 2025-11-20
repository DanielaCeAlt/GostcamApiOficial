import React, { useMemo, ReactNode, CSSProperties } from 'react';
import { useVirtualScrolling, useViewportOptimization, usePerformanceMonitor } from '@/hooks/usePerformance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  estimatedItemSize?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent,
  header,
  footer,
  getItemKey = (_, index) => index,
}: VirtualizedListProps<T>) {
  usePerformanceMonitor('VirtualizedList');
  
  const { viewport } = useViewportOptimization();
  
  const {
    scrollElementRef,
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  } = useVirtualScrolling({
    items,
    itemHeight,
    containerHeight: height,
    overscan: viewport.isMobile ? 3 : overscan, // Menos overscan en móvil
  });

  // Optimización: memoizar elementos visibles
  const visibleElements = useMemo(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = startIndex + index;
      const style: CSSProperties = {
        position: 'absolute',
        top: (actualIndex * itemHeight),
        left: 0,
        right: 0,
        height: itemHeight,
      };

      return (
        <div
          key={getItemKey(item, actualIndex)}
          style={style}
          data-index={actualIndex}
        >
          {renderItem(item, actualIndex, style)}
        </div>
      );
    });
  }, [visibleItems, startIndex, itemHeight, renderItem, getItemKey]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    onScroll?.(scrollTop);
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`relative overflow-hidden ${className}`}
        style={{ height }}
      >
        {loadingComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <i className="fas fa-inbox text-4xl mb-4 block"></i>
            <p>No hay elementos para mostrar</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ height }}
    >
      {/* Header fijo */}
      {header && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          {header}
        </div>
      )}

      {/* Contenedor principal con scroll */}
      <div
        ref={scrollElementRef as React.RefObject<HTMLDivElement>}
        className="overflow-auto h-full"
        onScroll={handleScroll}
        style={{
          height: header ? `calc(100% - 60px)` : '100%',
        }}
      >
        {/* Contenedor interno con altura total */}
        <div
          className="relative"
          style={{ height: totalHeight }}
        >
          {/* Contenedor de elementos visibles */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
            }}
          >
            {visibleElements}
          </div>
        </div>
      </div>

      {/* Footer fijo */}
      {footer && (
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}

// Componente específico para lista de equipos virtualizada
interface Equipment {
  no_serie: string;
  nombre?: string;
  tipo_equipo?: string;
  estatus?: string;
  ubicacion?: string;
  [key: string]: any;
}

interface VirtualizedEquipmentListProps {
  equipos: Equipment[];
  onEquipoClick?: (equipo: Equipment) => void;
  className?: string;
  loading?: boolean;
}

export const VirtualizedEquipmentList: React.FC<VirtualizedEquipmentListProps> = ({
  equipos,
  onEquipoClick,
  className,
  loading
}) => {
  const renderEquipoItem = (equipo: Equipment, index: number, style: CSSProperties) => (
    <div 
      className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onEquipoClick?.(equipo)}
      role="listitem"
      tabIndex={0}
      aria-label={`Equipo ${equipo.no_serie}`}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
        <i className="fas fa-desktop text-blue-600" aria-hidden="true"></i>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {equipo.nombre || `Equipo ${equipo.no_serie}`}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {equipo.tipo_equipo} • {equipo.ubicacion || 'Sin ubicación'}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          equipo.estatus === 'Activo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {equipo.estatus || 'Desconocido'}
        </span>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={equipos}
      itemHeight={80}
      height={600}
      renderItem={renderEquipoItem}
      className={className}
      loading={loading}
      getItemKey={(equipo) => equipo.no_serie}
      emptyComponent={
        <div className="text-center text-gray-500 p-8">
          <i className="fas fa-search text-4xl mb-4 block"></i>
          <h3 className="text-lg font-medium mb-2">No hay equipos</h3>
          <p>No se encontraron equipos que coincidan con los criterios de búsqueda.</p>
        </div>
      }
      loadingComponent={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando equipos...</p>
          </div>
        </div>
      }
    />
  );
};

// Hook para paginación virtualizada (infinite scroll)
export function useInfiniteScroll<T>({
  loadMore,
  hasMore,
  loading,
  threshold = 200,
}: {
  loadMore: () => Promise<void> | void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}) {
  const handleScroll = React.useCallback((scrollTop: number) => {
    const element = document.querySelector('[data-virtualized-container]') as HTMLElement;
    if (!element || loading || !hasMore) return;

    const { scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceFromBottom < threshold) {
      loadMore();
    }
  }, [loadMore, hasMore, loading, threshold]);

  return { handleScroll };
}

export default VirtualizedList;