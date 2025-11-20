'use client';

import React, { useState } from 'react';
import { useCatalogos } from '@/hooks/useCatalogos';
import MobileButton from '@/components/ui/MobileButton';

interface EquiposAltaProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  enableAutoSave?: boolean;
}

export default function EquiposAlta({ 
  onSuccess, 
  onCancel, 
  enableAutoSave = false 
}: EquiposAltaProps) {
  const { tiposEquipo, sucursales, usuarios, estatusEquipo } = useCatalogos();
  const [mensaje, setMensaje] = useState<{tipo: string; texto: string} | null>(null);
  
  const [formData, setFormData] = useState({
    no_serie: '',
    nombreEquipo: '',
    modelo: '',
    numeroActivo: '',
    idTipoEquipo: '',
    idEstatus: '1',
    idSucursal: '',
    idPosicion: '1',
    idUsuarios: '',
    valorEstimado: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/equipos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensaje({
          tipo: 'success',
          texto: 'Equipo creado exitosamente'
        });
        onSuccess?.();
      } else {
        setMensaje({
          tipo: 'error',
          texto: 'Error al crear el equipo'
        });
      }
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al crear el equipo'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Alta de Equipo</h1>
          <p className="text-gray-600">Registra un nuevo equipo en el inventario</p>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-md mb-4 ${
            mensaje.tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Serie *
              </label>
              <input
                type="text"
                value={formData.no_serie}
                onChange={(e) => handleChange('no_serie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Equipo *
              </label>
              <input
                type="text"
                value={formData.nombreEquipo}
                onChange={(e) => handleChange('nombreEquipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Activo
              </label>
              <input
                type="text"
                value={formData.numeroActivo}
                onChange={(e) => handleChange('numeroActivo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Equipo *
              </label>
              <select
                value={formData.idTipoEquipo}
                onChange={(e) => handleChange('idTipoEquipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposEquipo.map(tipo => (
                  <option key={tipo.idTipoEquipo} value={tipo.idTipoEquipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal *
              </label>
              <select
                value={formData.idSucursal}
                onChange={(e) => handleChange('idSucursal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar sucursal...</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.idCentro} value={sucursal.idCentro}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Asignado *
              </label>
              <select
                value={formData.idUsuarios}
                onChange={(e) => handleChange('idUsuarios', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios.map(usuario => (
                  <option key={usuario.idUsuarios} value={usuario.idUsuarios}>
                    {usuario.NombreUsuario}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Estimado
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorEstimado}
                onChange={(e) => handleChange('valorEstimado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <MobileButton
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </MobileButton>
            <MobileButton
              type="submit"
              variant="primary"
            >
              Crear Equipo
            </MobileButton>
          </div>
        </form>
      </div>
    </div>
  );
}