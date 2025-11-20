'use client';

import React from 'react';

interface Equipo {
  no_serie: string;
  nombreEquipo: string;
  TipoEquipo: string;
  EstatusEquipo: string;
  SucursalActual: string;
  UsuarioAsignado: string;
  modelo?: string;
  fechaAlta?: string;
  marca?: string;
  ubicacion?: string;
  observaciones?: string;
}

interface EquiposInfoPanelProps {
  equipo: Equipo | null;
  onEdit?: (noSerie: string) => void;
  onDelete?: (noSerie: string) => void;
  onTransfer?: (noSerie: string) => void;
  onMaintenance?: (noSerie: string) => void;
  onReportFault?: (noSerie: string) => void;
  showActions?: boolean;
  loading?: boolean;
}

const EquiposInfoPanel: React.FC<EquiposInfoPanelProps> = ({
  equipo,
  onEdit,
  onDelete,
  onTransfer,
  onMaintenance,
  onReportFault,
  showActions = true,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <i className="fas fa-desktop text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-lg">
            Selecciona un equipo
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Elige un equipo de la lista para ver su información detallada
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (fecha: string | undefined) => {
    if (!fecha) return 'No especificada';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Activo': 'bg-green-100 text-green-800',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800',
      'Fuera de Servicio': 'bg-red-100 text-red-800',
      'En Traslado': 'bg-blue-100 text-blue-800'
    };

    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-2xl text-blue-600 mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Información del Equipo
              </h3>
              <p className="text-sm text-gray-600">
                {equipo.no_serie}
              </p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(equipo.EstatusEquipo)}`}>
            {equipo.EstatusEquipo}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
              Información Básica
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del Equipo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {equipo.nombreEquipo}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Equipo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {equipo.TipoEquipo}
                </p>
              </div>

              {equipo.marca && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {equipo.marca}
                  </p>
                </div>
              )}

              {equipo.modelo && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {equipo.modelo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location and Assignment */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
              Ubicación y Asignación
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursal Actual
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {equipo.SucursalActual}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario Asignado
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {equipo.UsuarioAsignado || 'Sin asignar'}
                </p>
              </div>

              {equipo.ubicacion && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación Específica
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {equipo.ubicacion}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Alta
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(equipo.fechaAlta)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Observations */}
        {equipo.observaciones && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Observaciones
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {equipo.observaciones}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Acciones Disponibles
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(equipo.no_serie)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Editar
                </button>
              )}

              {onTransfer && (
                <button
                  onClick={() => onTransfer(equipo.no_serie)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors duration-200"
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Trasladar
                </button>
              )}

              {onMaintenance && (
                <button
                  onClick={() => onMaintenance(equipo.no_serie)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors duration-200"
                >
                  <i className="fas fa-wrench mr-2"></i>
                  Mantenimiento
                </button>
              )}

              {onReportFault && (
                <button
                  onClick={() => onReportFault(equipo.no_serie)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-200"
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Reportar Falla
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(equipo.no_serie)}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquiposInfoPanel;
