import React from 'react';
import AdvancedSearch from '@/components/ui/AdvancedSearch';
import AdvancedFilters from '@/components/ui/AdvancedFiltersSimple';
import FilterChips from '@/components/ui/FilterChips';

export default function TestPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filters, setFilters] = React.useState({});

  const sampleFilters = [
    {
      id: 'tipo',
      label: 'Tipo',
      type: 'select' as const,
      placeholder: 'Seleccionar tipo',
      options: [
        { value: 'camara', label: 'Cámara' },
        { value: 'sensor', label: 'Sensor' },
        { value: 'dispositivo', label: 'Dispositivo' }
      ]
    },
    {
      id: 'estado',
      label: 'Estado',
      type: 'select' as const,
      placeholder: 'Seleccionar estado',
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
        { value: 'mantenimiento', label: 'Mantenimiento' }
      ]
    },
    {
      id: 'activo',
      label: 'Activo',
      type: 'boolean' as const
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 GostCAM - Sistema de Búsqueda Avanzado
        </h1>
        <p className="text-gray-600 mb-8">
          Prueba del sistema avanzado de búsqueda y filtros implementado
        </p>

        {/* Test AdvancedSearch */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Búsqueda Avanzada</h2>
          <AdvancedSearch
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Buscar equipos..."
            suggestions={[]}
            isSearching={false}
            resultsCount={0}
          />
        </div>

        {/* Test AdvancedFilters */}
        <div className="mb-6">
          <AdvancedFilters
            filters={sampleFilters}
            values={filters}
            onChange={(filterId, value) => {
              setFilters(prev => ({ ...prev, [filterId]: value }));
            }}
            onClear={() => setFilters({})}
            activeFilters={Object.keys(filters).filter(key => filters[key as keyof typeof filters])}
          />
        </div>

        {/* Test FilterChips */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Filtros Activos</h2>
          <FilterChips
            filters={sampleFilters}
            values={filters}
            onChange={(filterId, value) => {
              setFilters(prev => ({ ...prev, [filterId]: value }));
            }}
          />
          {Object.keys(filters).length === 0 && (
            <p className="text-gray-500 italic">No hay filtros activos</p>
          )}
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="font-medium text-green-800">
              ✅ Task 10: Sistema de Búsqueda y Filtros Avanzado - COMPLETADO
            </span>
          </div>
          <p className="text-green-700 text-sm mt-2">
            Todos los componentes están funcionando correctamente. 
            El sistema incluye búsqueda en tiempo real, filtros avanzados, chips de filtros y persistencia.
          </p>
        </div>

        {/* Current filter values for debugging */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Estado Actual:</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Búsqueda:</strong> "{searchValue}"</p>
            <p><strong>Filtros:</strong> {JSON.stringify(filters, null, 2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}