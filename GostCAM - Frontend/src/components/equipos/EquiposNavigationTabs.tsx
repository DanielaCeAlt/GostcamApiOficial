'use client';

import React from 'react';
import { useTabSwipeNavigation } from '@/hooks/useSwipeGestures';
import { useHapticFeedback } from '@/utils/hapticFeedback';

type VistaActual = 'lista' | 'busqueda' | 'alta' | 'historial' | 'cambiarUbicacion' | 'mantenimientoEquipo' | 'dashboard' | 'editar';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface EquiposNavigationTabsProps {
  tabs: TabItem[];
  activeTab: VistaActual;
  onTabChange: (vista: VistaActual) => void;
}

const EquiposNavigationTabs: React.FC<EquiposNavigationTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  const { navigationChange } = useHapticFeedback();
  
  // Configurar gestos swipe para navegación entre tabs
  const tabIds = tabs.map(tab => tab.id);
  const { elementRef, isSwipeDetected } = useTabSwipeNavigation(
    tabIds,
    activeTab,
    (newTab) => {
      navigationChange(); // Feedback háptico
      onTabChange(newTab as VistaActual);
    }
  );

  const handleTabClick = (tabId: string) => {
    navigationChange(); // Feedback háptico para taps
    onTabChange(tabId as VistaActual);
  };

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="bg-white border-b border-gray-200 mb-6 relative"
    >
      {/* Indicador visual de swipe */}
      {isSwipeDetected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
      )}
      
      {/* Navegación optimizada para móvil */}
      <nav className="flex overflow-x-auto scrollbar-hide">
        <div className="flex space-x-1 px-4 min-w-full">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isFirst = index === 0;
            const isLast = index === tabs.length - 1;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex-shrink-0 flex items-center justify-center
                  min-h-[48px] min-w-[120px] px-4 py-3
                  border-b-3 font-medium text-sm
                  transition-all duration-300 ease-in-out
                  touch-manipulation select-none
                  active:scale-95
                  ${isActive 
                    ? 'border-orange-600 text-orange-600 bg-orange-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isFirst ? 'ml-0' : ''}
                  ${isLast ? 'mr-0' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
              >
                <span className="flex items-center gap-2">
                  <i className={`fas ${tab.icon} text-xs sm:text-sm ${isActive ? 'text-orange-600' : ''}`}></i>
                  <span className="hidden sm:inline-block truncate">{tab.label}</span>
                  {/* Solo mostrar texto en móvil para tab activo */}
                  <span className="sm:hidden text-xs truncate max-w-[60px]">
                    {isActive ? tab.label.split(' ')[0] : ''}
                  </span>
                </span>
                
                {/* Indicador de tab activo mejorado */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-600 rounded-t-full transition-all duration-300"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Guía visual para swipe (solo móvil) */}
      <div className="md:hidden flex justify-center py-1">
        <div className="flex space-x-1">
          {tabs.map((tab, index) => (
            <div
              key={`indicator-${tab.id}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                tab.id === activeTab ? 'bg-orange-600 scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instrucciones de swipe (aparece brevemente) */}
      <div className="md:hidden absolute top-full left-0 right-0 bg-blue-50 border-b border-blue-200 py-1 text-center transition-all duration-500 overflow-hidden">
        <p className="text-xs text-blue-600 animate-fade-in-out">
          <i className="fas fa-hand-point-left mr-1"></i>
          Desliza para cambiar de vista
          <i className="fas fa-hand-point-right ml-1"></i>
        </p>
      </div>
    </div>
  );
};

export default EquiposNavigationTabs;