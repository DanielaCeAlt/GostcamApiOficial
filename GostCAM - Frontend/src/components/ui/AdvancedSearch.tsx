'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SearchSuggestion } from '@/hooks/useSearch';
import MobileButton from './MobileButton';

// Input básico para evitar dependencias circulares
const SearchInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }>(
  ({ className, leftIcon, rightIcon, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {rightIcon}
        </div>
      )}
    </div>
  )
);
SearchInput.displayName = 'SearchInput';

interface AdvancedSearchProps {
  /** Valor actual de búsqueda */
  value: string;
  /** Callback al cambiar el valor */
  onChange: (value: string) => void;
  /** Sugerencias de búsqueda */
  suggestions?: SearchSuggestion[];
  /** Placeholder del input */
  placeholder?: string;
  /** Mostrar historial reciente */
  showHistory?: boolean;
  /** Historial de búsquedas */
  searchHistory?: string[];
  /** Callback al seleccionar sugerencia */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Callback al limpiar búsqueda */
  onClear?: () => void;
  /** Está buscando */
  isSearching?: boolean;
  /** Número de resultados */
  resultsCount?: number;
  /** Tiempo de búsqueda */
  searchTime?: number;
  /** Clase personalizada */
  className?: string;
}

/**
 * Componente de búsqueda avanzada con sugerencias y autocompletado
 */
export default function AdvancedSearch({
  value,
  onChange,
  suggestions = [],
  placeholder = "Buscar...",
  showHistory = true,
  searchHistory = [],
  onSuggestionSelect,
  onClear,
  isSearching = false,
  resultsCount,
  searchTime,
  className
}: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Combinar sugerencias con historial
  const allSuggestions = React.useMemo(() => {
    const combined: SearchSuggestion[] = [];

    // Agregar sugerencias principales
    combined.push(...suggestions);

    // Agregar historial si está habilitado y no hay query
    if (showHistory && !value.trim() && searchHistory.length > 0) {
      searchHistory.slice(0, 5).forEach(item => {
        combined.push({
          text: item,
          type: 'recent'
        });
      });
    }

    return combined;
  }, [suggestions, showHistory, value, searchHistory]);

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
          const suggestion = allSuggestions[selectedIndex];
          onChange(suggestion.text);
          onSuggestionSelect?.(suggestion);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Obtener icono por tipo de sugerencia
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'fas fa-clock';
      case 'popular':
        return 'fas fa-fire';
      case 'autocomplete':
        return 'fas fa-search';
      case 'field':
        return 'fas fa-tag';
      default:
        return 'fas fa-search';
    }
  };

  // Obtener color por tipo
  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'text-gray-500';
      case 'popular':
        return 'text-orange-500';
      case 'autocomplete':
        return 'text-blue-500';
      case 'field':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Input principal */}
      <div className="relative">
        <SearchInput
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          leftIcon={
            isSearching ? (
              <i className="fas fa-spinner fa-spin text-blue-500" />
            ) : (
              <i className="fas fa-search text-gray-400" />
            )
          }
          rightIcon={
            value && (
              <button
                onClick={() => {
                  onChange('');
                  onClear?.();
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar búsqueda"
              >
                <i className="fas fa-times" />
              </button>
            )
          }
          className="pr-12"
        />

        {/* Indicador de búsqueda activa */}
        {isFocused && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-20 pointer-events-none" />
        )}
      </div>

      {/* Información de resultados */}
      {(resultsCount !== undefined || searchTime !== undefined) && value && (
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1 px-1">
          <div className="flex items-center space-x-2">
            {resultsCount !== undefined && (
              <span>
                {resultsCount.toLocaleString()} resultado{resultsCount !== 1 ? 's' : ''}
              </span>
            )}
            {searchTime !== undefined && (
              <span>
                ({searchTime.toFixed(0)}ms)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Panel de sugerencias */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Header del historial */}
          {showHistory && !value.trim() && searchHistory.length > 0 && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
              Búsquedas recientes
            </div>
          )}

          {/* Lista de sugerencias */}
          <div className="py-1">
            {allSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-3',
                  selectedIndex === index && 'bg-blue-50 border-l-2 border-blue-500'
                )}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Icono */}
                <i className={cn(
                  getSuggestionIcon(suggestion.type),
                  getSuggestionColor(suggestion.type),
                  'text-sm flex-shrink-0'
                )} />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">
                    {suggestion.text}
                  </div>
                  
                  {/* Información adicional */}
                  {(suggestion.field || suggestion.count !== undefined) && (
                    <div className="text-xs text-gray-500">
                      {suggestion.field && `en ${suggestion.field}`}
                      {suggestion.count !== undefined && ` (${suggestion.count})`}
                    </div>
                  )}
                </div>

                {/* Indicador de tipo */}
                {suggestion.type === 'recent' && (
                  <div className="text-xs text-gray-400">
                    Reciente
                  </div>
                )}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

/**
 * Componente de búsqueda rápida simple
 */
interface QuickSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
  isSearching?: boolean;
  className?: string;
}

export function QuickSearch({
  value,
  onChange,
  placeholder = "Búsqueda rápida...",
  resultsCount,
  isSearching,
  className
}: QuickSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <SearchInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={
          isSearching ? (
            <i className="fas fa-spinner fa-spin text-blue-500" />
          ) : (
            <i className="fas fa-search text-gray-400" />
          )
        }
        rightIcon={
          value && (
            <button
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times" />
            </button>
          )
        }
      />
      
      {resultsCount !== undefined && value && (
        <div className="text-xs text-gray-500 mt-1">
          {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de búsqueda con comandos
 */
interface SearchWithCommandsProps {
  value: string;
  onChange: (value: string) => void;
  onCommand?: (command: string, value: string) => void;
  commands?: Array<{
    key: string;
    label: string;
    description: string;
    icon?: string;
  }>;
  className?: string;
}

export function SearchWithCommands({
  value,
  onChange,
  onCommand,
  commands = [],
  className
}: SearchWithCommandsProps) {
  const [showCommands, setShowCommands] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ':' && !value.includes(':')) {
      setShowCommands(true);
    } else if (e.key === 'Escape') {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    onChange(`${command}:`);
    setShowCommands(false);
  };

  return (
    <div className={cn('relative', className)}>
      <SearchInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe ':' para comandos o busca directamente..."
        leftIcon={<i className="fas fa-terminal text-gray-400" />}
      />

      {showCommands && commands.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
          <div className="py-2">
            {commands.map(command => (
              <button
                key={command.key}
                onClick={() => handleCommandSelect(command.key)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-3"
              >
                {command.icon && <i className={`${command.icon} text-gray-400`} />}
                <div>
                  <div className="text-sm font-medium">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}