'use client';

import React from 'react';
import { SearchFilter } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface FilterChipsProps {
  filters: SearchFilter[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  values,
  onChange,
}) => {
  const activeFilters = filters.filter(filter => {
    const value = values[filter.id];
    return value && value !== '' && value !== 0 && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  if (activeFilters.length === 0) {
    return null;
  }

  const getDisplayValue = (filter: SearchFilter, value: any): string => {
    if (filter.type === 'multiselect' && Array.isArray(value)) {
      return value.length === 1 
        ? filter.options?.find(opt => opt.value === value[0])?.label || value[0]
        : `${value.length} seleccionados`;
    }

    if (filter.type === 'select') {
      return filter.options?.find(opt => opt.value === value)?.label || value;
    }

    if (filter.type === 'date') {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (filter.type === 'range') {
      if (Array.isArray(value)) {
        const [min, max] = value;
        return `${min} - ${max}`;
      }
      return value.toString();
    }

    if (filter.type === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    return value.toString();
  };

  const clearFilter = (filterId: string, filter: SearchFilter) => {
    switch (filter.type) {
      case 'multiselect':
        onChange(filterId, []);
        break;
      case 'boolean':
        onChange(filterId, false);
        break;
      case 'range':
        onChange(filterId, [0, 100]);
        break;
      default:
        onChange(filterId, '');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map((filter) => {
        const value = values[filter.id];
        const displayValue = getDisplayValue(filter, value);

        return (
          <div
            key={filter.id}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{displayValue}</span>
            <button
              onClick={() => clearFilter(filter.id, filter)}
              className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              title={`Quitar filtro ${filter.label}`}
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FilterChips;