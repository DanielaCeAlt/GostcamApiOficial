'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDebounce } from './usePerformance';

// Tipos para el sistema de búsqueda y filtrado
export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'boolean' | 'multiselect';
  options?: Array<{ value: string; label: string; count?: number }>;
  placeholder?: string;
  defaultValue?: any;
  validation?: (value: any) => boolean;
  transform?: (value: any) => any;
}

export interface FilterState {
  [key: string]: any;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  filteredCount: number;
  searchTime: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  searchQuery: string;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'autocomplete' | 'field';
  count?: number;
  field?: string;
}

export interface UseSearchOptions<T> {
  /** Datos sobre los que buscar */
  data: T[];
  /** Configuración de filtros */
  filters: SearchFilter[];
  /** Función de búsqueda personalizada */
  searchFunction?: (items: T[], query: string, filters: FilterState) => T[];
  /** Campos donde buscar por defecto */
  searchFields?: (keyof T)[];
  /** Delay para debounce de búsqueda */
  debounceMs?: number;
  /** Habilitar historial de búsquedas */
  enableHistory?: boolean;
  /** Habilitar sugerencias */
  enableSuggestions?: boolean;
  /** Habilitar filtros guardados */
  enableSavedFilters?: boolean;
  /** Clave para persistencia en localStorage */
  persistenceKey?: string;
}

/**
 * Hook principal para búsqueda y filtrado avanzado
 */
export function useSearch<T extends Record<string, any>>({
  data,
  filters: filterConfig,
  searchFunction,
  searchFields = [],
  debounceMs = 300,
  enableHistory = true,
  enableSuggestions = true,
  enableSavedFilters = true,
  persistenceKey = 'search-state'
}: UseSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  const searchStartTime = useRef<number>(0);

  // Cargar estado persistido
  useEffect(() => {
    if (!persistenceKey) return;

    try {
      const saved = localStorage.getItem(persistenceKey);
      if (saved) {
        const { filters: savedFilters, history, savedFiltersData } = JSON.parse(saved);
        if (savedFilters) setFilters(savedFilters);
        if (history && enableHistory) setSearchHistory(history);
        if (savedFiltersData && enableSavedFilters) setSavedFilters(savedFiltersData);
      }
    } catch (error) {
      console.error('Error loading search state:', error);
    }
  }, [persistenceKey, enableHistory, enableSavedFilters]);

  // Persistir estado
  const persistState = useCallback(() => {
    if (!persistenceKey) return;

    const state = {
      filters,
      history: searchHistory,
      savedFiltersData: savedFilters
    };

    try {
      localStorage.setItem(persistenceKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving search state:', error);
    }
  }, [filters, searchHistory, savedFilters, persistenceKey]);

  // Función de búsqueda por defecto
  const defaultSearchFunction = useCallback((items: T[], query: string, activeFilters: FilterState): T[] => {
    if (!query && Object.keys(activeFilters).length === 0) {
      return items;
    }

    return items.filter(item => {
      // Búsqueda por texto
      if (query) {
        const searchableText = searchFields.length > 0 
          ? searchFields.map(field => String(item[field] || '')).join(' ')
          : Object.values(item).join(' ');
        
        const queryLower = query.toLowerCase();
        if (!searchableText.toLowerCase().includes(queryLower)) {
          return false;
        }
      }

      // Aplicar filtros
      for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
        if (filterValue === undefined || filterValue === '' || filterValue === null) {
          continue;
        }

        const currentFilter = filters.find((f: SearchFilter) => f.id === filterKey);
        if (!currentFilter) continue;

        const itemValue = (item as any)[filterKey];

        switch (currentFilter.type) {
          case 'text':
            if (!String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())) {
              return false;
            }
            break;

          case 'select':
            if (itemValue !== filterValue) {
              return false;
            }
            break;

          case 'multiselect':
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              if (!filterValue.includes(itemValue)) {
                return false;
              }
            }
            break;

          case 'boolean':
            if (Boolean(itemValue) !== Boolean(filterValue)) {
              return false;
            }
            break;

          case 'date':
            const itemDate = new Date(itemValue);
            const filterDate = new Date(filterValue);
            if (itemDate.toDateString() !== filterDate.toDateString()) {
              return false;
            }
            break;

          case 'range':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue;
              const numValue = Number(itemValue);
              if (numValue < min || numValue > max) {
                return false;
              }
            }
            break;
        }
      }

      return true;
    });
  }, [searchFields, filterConfig]);

  // Ejecutar búsqueda
  const searchResults = useMemo((): SearchResult<T> => {
    setIsSearching(true);
    searchStartTime.current = performance.now();

    const searchFunc = searchFunction || defaultSearchFunction;
    const filteredItems = searchFunc(data, debouncedQuery, filters);
    
    // Calcular facetas para filtros
    const facets: Record<string, Array<{ value: string; count: number }>> = {};
    filterConfig.forEach(filter => {
      if (filter.type === 'select' || filter.type === 'multiselect') {
        const values: Record<string, number> = {};
        filteredItems.forEach(item => {
          const value = String(item[filter.id] || '');
          if (value) {
            values[value] = (values[value] || 0) + 1;
          }
        });

        facets[filter.id] = Object.entries(values)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);
      }
    });

    const searchTime = performance.now() - searchStartTime.current;
    setIsSearching(false);

    return {
      items: filteredItems,
      totalCount: data.length,
      filteredCount: filteredItems.length,
      searchTime,
      facets
    };
  }, [data, debouncedQuery, filters, searchFunction, defaultSearchFunction, filterConfig]);

  // Actualizar filtro
  const updateFilter = useCallback((filterId: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === undefined || value === '' || value === null || 
          (Array.isArray(value) && value.length === 0)) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }

      return newFilters;
    });

    // Actualizar filtros activos
    setActiveFilters(prev => {
      const filtered = prev.filter(id => id !== filterId);
      if (value !== undefined && value !== '' && value !== null && 
          !(Array.isArray(value) && value.length === 0)) {
        return [...filtered, filterId];
      }
      return filtered;
    });
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setActiveFilters([]);
  }, []);

  // Limpiar todo
  const clearAll = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    setActiveFilters([]);
  }, []);

  // Guardar búsqueda en historial
  const saveToHistory = useCallback((query: string) => {
    if (!enableHistory || !query.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, 20); // Máximo 20 elementos
      return updated;
    });
  }, [enableHistory]);

  // Actualizar query con historial
  const updateSearchQuery = useCallback((query: string, saveHistory = true) => {
    setSearchQuery(query);
    if (saveHistory && query.trim()) {
      saveToHistory(query);
    }
  }, [saveToHistory]);

  // Guardar filtro actual
  const saveCurrentFilter = useCallback((name: string, isDefault = false) => {
    if (!enableSavedFilters) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      searchQuery,
      isDefault,
      createdAt: new Date(),
      usageCount: 0
    };

    setSavedFilters(prev => {
      const updated = isDefault 
        ? prev.map(f => ({ ...f, isDefault: false }))
        : prev;
      return [newFilter, ...updated];
    });
  }, [enableSavedFilters, filters, searchQuery]);

  // Cargar filtro guardado
  const loadSavedFilter = useCallback((filterId: string) => {
    const savedFilter = savedFilters.find(f => f.id === filterId);
    if (!savedFilter) return;

    setFilters(savedFilter.filters);
    setSearchQuery(savedFilter.searchQuery);
    setActiveFilters(Object.keys(savedFilter.filters));

    // Incrementar contador de uso
    setSavedFilters(prev => 
      prev.map(f => 
        f.id === filterId 
          ? { ...f, usageCount: f.usageCount + 1 }
          : f
      )
    );
  }, [savedFilters]);

  // Eliminar filtro guardado
  const deleteSavedFilter = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // Generar sugerencias de búsqueda
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    if (!enableSuggestions) return [];

    const suggestions: SearchSuggestion[] = [];
    const currentQuery = searchQuery.toLowerCase();

    // Sugerencias del historial
    searchHistory
      .filter(item => item.toLowerCase().includes(currentQuery))
      .slice(0, 5)
      .forEach(item => {
        suggestions.push({
          text: item,
          type: 'recent'
        });
      });

    // Sugerencias de autocompletado de campos
    if (currentQuery.length >= 2) {
      searchFields.forEach(field => {
        const values = [...new Set(data.map(item => String(item[field] || '')))];
        values
          .filter(value => value.toLowerCase().includes(currentQuery))
          .slice(0, 3)
          .forEach(value => {
            suggestions.push({
              text: value,
              type: 'autocomplete',
              field: String(field)
            });
          });
      });
    }

    return suggestions.slice(0, 10);
  }, [enableSuggestions, searchQuery, searchHistory, searchFields, data]);

  // Persistir cambios
  useEffect(() => {
    persistState();
  }, [persistState]);

  return {
    // Estado
    searchQuery,
    filters,
    activeFilters,
    savedFilters,
    searchHistory,
    isSearching,
    searchResults,
    searchSuggestions,

    // Acciones
    updateSearchQuery,
    updateFilter,
    clearFilters,
    clearAll,
    saveCurrentFilter,
    loadSavedFilter,
    deleteSavedFilter,

    // Info útil
    hasActiveFilters: activeFilters.length > 0,
    hasResults: searchResults.filteredCount > 0,
    isFiltered: searchResults.filteredCount !== searchResults.totalCount,
    filterConfig
  };
}

/**
 * Hook para búsqueda rápida simple
 */
export function useQuickSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  debounceMs = 200
) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    const queryLower = debouncedQuery.toLowerCase();
    return data.filter(item => {
      const searchableText = searchFields
        .map(field => String(item[field] || ''))
        .join(' ')
        .toLowerCase();
      return searchableText.includes(queryLower);
    });
  }, [data, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    results,
    resultsCount: results.length,
    isSearching: query !== debouncedQuery
  };
}

/**
 * Hook para filtros avanzados con facetas
 */
export function useAdvancedFilters<T>(data: T[], filterConfig: SearchFilter[]) {
  const [filters, setFilters] = useState<FilterState>({});

  const updateFilter = useCallback((filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const facets = useMemo(() => {
    const result: Record<string, Array<{ value: string; count: number }>> = {};

    filterConfig.forEach(config => {
      if (config.type === 'select' || config.type === 'multiselect') {
        const counts: Record<string, number> = {};
        
        data.forEach(item => {
          const value = String((item as any)[config.id] || '');
          if (value) {
            counts[value] = (counts[value] || 0) + 1;
          }
        });

        result[config.id] = Object.entries(counts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);
      }
    });

    return result;
  }, [data, filterConfig]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearAllFilters,
    facets,
    hasActiveFilters: Object.keys(filters).length > 0
  };
}