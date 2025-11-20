'use client';

import React, { useState, useMemo } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { useCatalogos } from '@/hooks/useCatalogos';
import AdvancedSearch from '@/components/ui/AdvancedSearch';
import AdvancedFilters from '@/components/ui/AdvancedFiltersSimple';
import { FilterChips } from '@/components/ui/FilterChips';
import MobileButton from '@/components/ui/MobileButton';

interface Filtros {
  texto: string;
  limite: number;
  pagina: number;
  tipoEquipo?: string;
  estatus?: string;
  sucursal?: string;
  usuarioAsignado?: string;
  fechaAltaDesde?: string;
  fechaAltaHasta?: string;
}

interface EquiposFiltrosProps {
  filtros: Filtros;
  loading: boolean;
  equipos: any[];
  onFiltroChange: (campo: string, valor: string) => void;
  onBuscar: () => void;
  onLimpiarFiltros: () => void;
  onSearchResults?: (results: any[]) => void;
}

const EquiposFiltros: React.FC<EquiposFiltrosProps> = ({
  filtros,
  loading,
  equipos,
  onFiltroChange,
  onBuscar,
  onLimpiarFiltros,
  onSearchResults
}) => {
  const [expandedMobile, setExpandedMobile] = useState(false);
  const { tiposEquipo, sucursales, usuarios, estatusEquipo } = useCatalogos();

  // Configuración de filtros avanzados
  const filterConfig = useMemo(() => [
    {
      id: 'tipoEquipo',
      label: 'Tipo de Equipo',
      type: 'select' as const,
      options: tiposEquipo.map(tipo => ({
        value: tipo.idTipoEquipo?.toString() || '',
        label: tipo.nombre
      })),
      placeholder: 'Todos los tipos'
    },
    {
      id: 'estatus',
      label: 'Estado',
      type: 'select' as const,
      options: estatusEquipo.map(estatus => ({
        value: estatus.idEstatus?.toString() || '',
        label: estatus.nombre
      })),
      placeholder: 'Todos los estados'
    },
    {
      id: 'sucursal',
      label: 'Sucursal',
      type: 'select' as const,
      options: sucursales.map(sucursal => ({
        value: sucursal.idCentro?.toString() || '',
        label: sucursal.nombre
      })),
      placeholder: 'Todas las sucursales'
    },
    {
      id: 'usuarioAsignado',
      label: 'Usuario Asignado',
      type: 'select' as const,
      options: [
        { value: '', label: 'Sin asignar' },
        ...usuarios.map(usuario => ({
          value: usuario.idUsuarios?.toString() || '',
          label: usuario.NombreUsuario || ''
        }))
      ],
      placeholder: 'Cualquier usuario'
    },
    {
      id: 'fechaAltaDesde',
      label: 'Fecha de Alta (Desde)',
      type: 'date' as const
    },
    {
      id: 'fechaAltaHasta',
      label: 'Fecha de Alta (Hasta)',
      type: 'date' as const
    },
    {
      id: 'valorEstimado',
      label: 'Valor Estimado',
      type: 'range' as const,
      placeholder: 'Rango de valor'
    }
  ], [tiposEquipo, sucursales, usuarios, estatusEquipo]);

  // Hook de búsqueda avanzada
  const {
    searchQuery,
    filters: searchFilters,
    activeFilters,
    savedFilters,
    searchHistory,
    searchResults,
    searchSuggestions,
    updateSearchQuery,
    updateFilter,
    clearFilters,
    clearAll,
    saveCurrentFilter,
    loadSavedFilter,
    deleteSavedFilter,
    hasActiveFilters
  } = useSearch({
    data: equipos,
    filters: filterConfig,
    searchFields: ['no_serie', 'NombreEquipo', 'nombreEquipo', 'modelo', 'TipoEquipo', 'SucursalActual'],
    debounceMs: 300,
    enableHistory: true,
    enableSuggestions: true,
    enableSavedFilters: true,
    persistenceKey: 'equipos-search'
  });

  // Sincronizar con resultados - solo cuando cambien los resultados, no las callbacks
  React.useEffect(() => {
    if (onSearchResults && searchResults.items.length !== equipos.length) {
      onSearchResults(searchResults.items);
    }
  }, [searchResults.items.length]);

  // Manejar cambios de búsqueda directamente sin useEffect
  const handleSearchChange = React.useCallback((query: string) => {
    updateSearchQuery(query);
    onFiltroChange('texto', query);
  }, [updateSearchQuery, onFiltroChange]);

  const handleAdvancedFilterChange = React.useCallback((filterId: string, value: any) => {
    updateFilter(filterId, value);
    onFiltroChange(filterId, value);
  }, [updateFilter, onFiltroChange]);

  const handleClearAll = () => {
    clearAll();
    onLimpiarFiltros();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 transition-all">
      {/* Header con toggle para móvil */}
      <div className="flex items-center justify-between md:mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          <i className="fas fa-filter mr-2"></i>
          Filtros de Búsqueda
        </h3>
        <button
          onClick={() => setExpandedMobile(!expandedMobile)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Alternar filtros"
          aria-expanded={expandedMobile}
        >
          <i className={`fas fa-chevron-${expandedMobile ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {/* Contenedor de filtros - colapsable en móvil */}
      <div className={`${expandedMobile ? 'block' : 'hidden'} md:block transition-all`}>
        {/* Fila principal: búsqueda compacta y botones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Búsqueda de texto - principal */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Búsqueda
            </label>
            <input
              type="text"
              value={filtros.texto}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Serie, nombre, modelo..."
              className="w-full h-10 md:h-11 border border-gray-300 rounded-md px-3 
                       bg-white text-gray-900 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-150"
            />
          </div>

          {/* Límite de resultados */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Por página
            </label>
            <select
              value={filtros.limite}
              onChange={(e) => onFiltroChange('limite', e.target.value)}
              className="w-full h-10 md:h-11 border border-gray-300 rounded-md px-3 
                       bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-150 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Filtros adicionales - colapsables/menos visibles en móvil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Estado
            </label>
            <select
              className="w-full h-10 md:h-11 border border-gray-300 rounded-md px-3 
                       bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-150 cursor-not-allowed opacity-60"
              disabled
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Tipo de Equipo
            </label>
            <select
              className="w-full h-10 md:h-11 border border-gray-300 rounded-md px-3 
                       bg-white text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-150 cursor-not-allowed opacity-60"
              disabled
            >
              <option value="">Todos los tipos</option>
              <option value="Cámara">Cámara</option>
              <option value="Sensor">Sensor</option>
              <option value="Dispositivo">Dispositivo</option>
            </select>
          </div>
        </div>

        {/* Botones de acción - touch-friendly (44px mín) */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onBuscar}
            disabled={loading}
            className="flex-1 sm:flex-none h-11 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-md 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center space-x-2 transition-colors duration-150 focus-visible-ring"
            aria-busy={loading}
          >
            <i className="fas fa-search"></i>
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
          
          <button
            onClick={onLimpiarFiltros}
            disabled={loading}
            className="flex-1 sm:flex-none h-11 px-5 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-medium rounded-md
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center space-x-2 transition-colors duration-150 focus-visible-ring"
          >
            <i className="fas fa-times"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Información de búsqueda activa */}
      {filtros.texto && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md fade-in">
          <p className="text-sm text-blue-900 font-medium flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            Búsqueda activa: <strong className="ml-1">"{filtros.texto}"</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default EquiposFiltros;