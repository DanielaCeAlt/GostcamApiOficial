'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SearchFilter, FilterState, SavedFilter } from '@/hooks/useSearch';
import MobileButton from './MobileButton';

interface AdvancedFiltersProps {
  filters: SearchFilter[];
  values: FilterState;
  onChange: (filterId: string, value: any) => void;
  onClear: () => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string) => void;
  onLoadFilter?: (filterId: string) => void;
  onDeleteFilter?: (filterId: string) => void;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  showOnlyActive?: boolean;
  activeFilters?: string[];
  className?: string;
}

export default function AdvancedFilters({
  filters,
  values,
  onChange,
  onClear,
  savedFilters = [],
  facets = {},
  activeFilters = [],
  className
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const hasActiveFilters = activeFilters.length > 0;

  const renderFilter = (filter: SearchFilter) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              placeholder={filter.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'select':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              value={value || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{filter.placeholder || 'Seleccionar...'}</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {facets[filter.id]?.find(f => f.value === option.value)?.count && 
                    ` (${facets[filter.id]?.find(f => f.value === option.value)?.count})`
                  }
                </option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={filter.id}
              checked={Boolean(value)}
              onChange={(e) => onChange(filter.id, e.target.checked)}
              className="rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={filter.id} className="text-sm font-medium text-gray-700">
              {filter.label}
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'range':
        const [min, max] = Array.isArray(value) ? value : [0, 100];
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={min}
                onChange={(e) => onChange(filter.id, [Number(e.target.value), max])}
                placeholder="Mín"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={max}
                onChange={(e) => onChange(filter.id, [min, Number(e.target.value)])}
                placeholder="Máx"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2">
              {filter.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = e.target.checked
                        ? [...currentValue, option.value]
                        : currentValue.filter(v => v !== option.value);
                      onChange(filter.id, newValue);
                    }}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                  {facets[filter.id]?.find(f => f.value === option.value)?.count && (
                    <span className="text-xs text-gray-500">
                      ({facets[filter.id]?.find(f => f.value === option.value)?.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          <i className="fas fa-filter mr-2 text-blue-500"></i>
          Filtros Avanzados
        </h3>

        <div className="flex items-center space-x-2">
          <MobileButton
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            leftIcon={<i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} />}
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </MobileButton>

          {hasActiveFilters && (
            <MobileButton
              variant="outline"
              onClick={onClear}
              leftIcon={<i className="fas fa-times" />}
            >
              Limpiar
            </MobileButton>
          )}
        </div>
      </div>

      {/* Filtros */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(renderFilter)}
          </div>

          {/* Conteo de filtros activos */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1" />
                {activeFilters.length} filtro(s) activo(s)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}