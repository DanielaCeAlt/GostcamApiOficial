"""
Validaciones de Negocio Avanzadas para GostCAM
Fecha: 20 de Noviembre de 2025
Propósito: Implementar reglas de negocio robustas y transiciones de estado válidas
"""

from enum import Enum
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta

class EstatusEquipo(Enum):
    """Enumeración de estatus válidos para equipos"""
    DISPONIBLE = 1
    ASIGNADO = 2
    MANTENIMIENTO = 3
    BAJA = 4
    EN_TRANSITO = 5
    EN_REPARACION = 7

class TipoMovimiento(Enum):
    """Enumeración de tipos de movimiento válidos"""
    ALTA = 1
    BAJA = 2
    TRASLADO = 3
    MANTENIMIENTO = 4
    REPARACION = 5

class ValidacionesNegocio:
    """
    Clase para centralizar todas las validaciones de negocio del sistema GostCAM
    """
    
    # Definir transiciones de estado válidas
    TRANSICIONES_VALIDAS = {
        EstatusEquipo.DISPONIBLE.value: [
            EstatusEquipo.ASIGNADO.value,
            EstatusEquipo.MANTENIMIENTO.value,
            EstatusEquipo.EN_TRANSITO.value,
            EstatusEquipo.BAJA.value
        ],
        EstatusEquipo.ASIGNADO.value: [
            EstatusEquipo.DISPONIBLE.value,
            EstatusEquipo.MANTENIMIENTO.value,
            EstatusEquipo.EN_REPARACION.value,
            EstatusEquipo.BAJA.value
        ],
        EstatusEquipo.MANTENIMIENTO.value: [
            EstatusEquipo.DISPONIBLE.value,
            EstatusEquipo.ASIGNADO.value,
            EstatusEquipo.EN_REPARACION.value,
            EstatusEquipo.BAJA.value
        ],
        EstatusEquipo.EN_TRANSITO.value: [
            EstatusEquipo.DISPONIBLE.value,
            EstatusEquipo.ASIGNADO.value
        ],
        EstatusEquipo.EN_REPARACION.value: [
            EstatusEquipo.DISPONIBLE.value,
            EstatusEquipo.ASIGNADO.value,
            EstatusEquipo.MANTENIMIENTO.value,
            EstatusEquipo.BAJA.value
        ],
        EstatusEquipo.BAJA.value: []  # Estado final - no permite transiciones
    }
    
    # Movimientos que requieren autorización especial
    MOVIMIENTOS_CRITICOS = [
        TipoMovimiento.BAJA.value,
        TipoMovimiento.TRASLADO.value
    ]
    
    # Niveles de usuario que pueden realizar operaciones críticas
    USUARIOS_AUTORIZADOS_CRITICOS = [1, 2]  # Administrador, Operador
    
    @classmethod
    def validar_transicion_estado(cls, estado_actual: int, estado_nuevo: int) -> Tuple[bool, str]:
        """
        Valida si una transición de estado es permitida
        
        Args:
            estado_actual: Estado actual del equipo
            estado_nuevo: Estado al que se quiere cambiar
            
        Returns:
            Tuple[bool, str]: (es_valida, mensaje_error)
        """
        if estado_actual == estado_nuevo:
            return False, f"El equipo ya se encuentra en el estado solicitado"
        
        transiciones_permitidas = cls.TRANSICIONES_VALIDAS.get(estado_actual, [])
        
        if estado_nuevo not in transiciones_permitidas:
            estado_actual_nombre = cls._get_nombre_estatus(estado_actual)
            estado_nuevo_nombre = cls._get_nombre_estatus(estado_nuevo)
            
            return False, f"Transición no permitida: de '{estado_actual_nombre}' a '{estado_nuevo_nombre}'"
        
        return True, "Transición válida"
    
    @classmethod
    def validar_alta_equipo(cls, datos: Dict) -> Tuple[bool, str]:
        """
        Valida los datos para dar de alta un equipo
        
        Args:
            datos: Diccionario con datos del equipo
            
        Returns:
            Tuple[bool, str]: (es_valido, mensaje_error)
        """
        # Validaciones obligatorias
        campos_obligatorios = ['idEquipo', 'nombreEquipo', 'modelo']
        for campo in campos_obligatorios:
            if not datos.get(campo) or str(datos[campo]).strip() == "":
                return False, f"El campo '{campo}' es obligatorio"
        
        # Validar formato de número de serie
        no_serie = str(datos['idEquipo']).strip()
        if len(no_serie) < 3:
            return False, "El número de serie debe tener al menos 3 caracteres"
        
        if not no_serie.replace('-', '').replace('_', '').isalnum():
            return False, "El número de serie solo puede contener letras, números, guiones y guiones bajos"
        
        # Validar nombre del equipo
        nombre = str(datos['nombreEquipo']).strip()
        if len(nombre) < 2:
            return False, "El nombre del equipo debe tener al menos 2 caracteres"
        
        # Validar modelo
        modelo = str(datos['modelo']).strip()
        if len(modelo) < 2:
            return False, "El modelo debe tener al menos 2 caracteres"
        
        # Validar número de activo si se proporciona
        numero_activo = datos.get('numeroActivo')
        if numero_activo and len(str(numero_activo).strip()) > 50:
            return False, "El número de activo no puede exceder 50 caracteres"
        
        return True, "Validación exitosa"
    
    @classmethod
    def validar_baja_equipo(cls, datos: Dict, estado_actual: int) -> Tuple[bool, str]:
        """
        Valida si un equipo puede ser dado de baja
        
        Args:
            datos: Datos de la baja
            estado_actual: Estado actual del equipo
            
        Returns:
            Tuple[bool, str]: (es_valido, mensaje_error)
        """
        # No se puede dar de baja un equipo ya dado de baja
        if estado_actual == EstatusEquipo.BAJA.value:
            return False, "El equipo ya está dado de baja"
        
        # Validar transición a baja
        es_valida, mensaje = cls.validar_transicion_estado(estado_actual, EstatusEquipo.BAJA.value)
        if not es_valida:
            return False, mensaje
        
        # Validar que se proporcione el ID del equipo
        if not datos.get('idEquipo'):
            return False, "Debe especificar el ID del equipo a dar de baja"
        
        return True, "Validación exitosa"
    
    @classmethod
    def validar_mantenimiento(cls, datos: Dict, estado_actual: int) -> Tuple[bool, str]:
        """
        Valida si un equipo puede entrar en mantenimiento
        
        Args:
            datos: Datos del mantenimiento
            estado_actual: Estado actual del equipo
            
        Returns:
            Tuple[bool, str]: (es_valido, mensaje_error)
        """
        # Validar transición a mantenimiento
        es_valida, mensaje = cls.validar_transicion_estado(estado_actual, EstatusEquipo.MANTENIMIENTO.value)
        if not es_valida:
            return False, mensaje
        
        # Un equipo dado de baja no puede entrar en mantenimiento
        if estado_actual == EstatusEquipo.BAJA.value:
            return False, "No se puede dar mantenimiento a un equipo dado de baja"
        
        # Validaciones adicionales de mantenimiento
        if not datos.get('idEquipo'):
            return False, "Debe especificar el ID del equipo"
        
        return True, "Validación exitosa"
    
    @classmethod
    def validar_traslado(cls, datos: Dict) -> Tuple[bool, str]:
        """
        Valida los datos para un traslado de equipo
        
        Args:
            datos: Datos del traslado
            
        Returns:
            Tuple[bool, str]: (es_valido, mensaje_error)
        """
        # Validaciones obligatorias para traslado
        if not datos.get('idEquipo'):
            return False, "Debe especificar el ID del equipo"
        
        if not datos.get('origen_idCentro'):
            return False, "Debe especificar el centro de origen"
        
        if not datos.get('destino_idCentro'):
            return False, "Debe especificar el centro de destino"
        
        # El origen y destino no pueden ser iguales
        if datos['origen_idCentro'] == datos['destino_idCentro']:
            return False, "El centro de origen y destino no pueden ser iguales"
        
        return True, "Validación exitosa"
    
    @classmethod
    def validar_autorizacion_operacion(cls, nivel_usuario: int, tipo_operacion: str) -> Tuple[bool, str]:
        """
        Valida si un usuario tiene autorización para realizar una operación
        
        Args:
            nivel_usuario: Nivel del usuario (1=Admin, 2=Operador, etc.)
            tipo_operacion: Tipo de operación a realizar
            
        Returns:
            Tuple[bool, str]: (autorizado, mensaje_error)
        """
        operaciones_por_nivel = {
            1: ['alta', 'baja', 'traslado', 'mantenimiento', 'actualizar_estado', 'consulta'],  # Administrador
            2: ['alta', 'baja', 'traslado', 'mantenimiento', 'actualizar_estado', 'consulta'],  # Operador
            3: ['mantenimiento', 'actualizar_estado', 'consulta'],  # Técnico
            4: ['consulta'],  # Solo consulta
            5: ['consulta']   # Solo consulta
        }
        
        operaciones_permitidas = operaciones_por_nivel.get(nivel_usuario, ['consulta'])
        
        if tipo_operacion not in operaciones_permitidas:
            return False, f"El usuario no tiene permisos para realizar la operación: {tipo_operacion}"
        
        return True, "Autorización válida"
    
    @classmethod
    def validar_fecha_movimiento(cls, fecha_movimiento: Optional[str] = None) -> Tuple[bool, str]:
        """
        Valida que la fecha de movimiento sea válida
        
        Args:
            fecha_movimiento: Fecha del movimiento (opcional, usa fecha actual si no se proporciona)
            
        Returns:
            Tuple[bool, str]: (es_valida, mensaje_error)
        """
        try:
            if fecha_movimiento:
                fecha_mov = datetime.fromisoformat(fecha_movimiento.replace('Z', '+00:00'))
                
                # No se pueden registrar movimientos más de 7 días en el futuro
                limite_futuro = datetime.now() + timedelta(days=7)
                if fecha_mov > limite_futuro:
                    return False, "No se pueden registrar movimientos más de 7 días en el futuro"
                
                # No se pueden registrar movimientos más de 1 año en el pasado
                limite_pasado = datetime.now() - timedelta(days=365)
                if fecha_mov < limite_pasado:
                    return False, "No se pueden registrar movimientos más de 1 año en el pasado"
            
            return True, "Fecha válida"
            
        except ValueError:
            return False, "Formato de fecha inválido. Use formato ISO 8601"
    
    @classmethod
    def validar_paginacion(cls, page: int, limit: int) -> Tuple[bool, str]:
        """
        Valida parámetros de paginación
        
        Args:
            page: Número de página
            limit: Elementos por página
            
        Returns:
            Tuple[bool, str]: (es_valida, mensaje_error)
        """
        if page < 1:
            return False, "El número de página debe ser mayor a 0"
        
        if limit < 1:
            return False, "El límite debe ser mayor a 0"
        
        if limit > 1000:
            return False, "El límite máximo es 1000 elementos por página"
        
        return True, "Paginación válida"
    
    @classmethod
    def _get_nombre_estatus(cls, id_estatus: int) -> str:
        """Obtiene el nombre legible de un estatus"""
        nombres_estatus = {
            1: "Disponible",
            2: "Asignado", 
            3: "Mantenimiento",
            4: "Baja",
            5: "En Tránsito",
            7: "En Reparación"
        }
        return nombres_estatus.get(id_estatus, f"Estatus {id_estatus}")
    
    @classmethod
    def aplicar_reglas_negocio_alta(cls, datos: Dict) -> Dict:
        """
        Aplica reglas de negocio automáticas para alta de equipos
        
        Args:
            datos: Datos originales del equipo
            
        Returns:
            Dict: Datos con reglas de negocio aplicadas
        """
        datos_procesados = datos.copy()
        
        # Generar número de activo si no se proporciona
        if not datos_procesados.get('numeroActivo'):
            datos_procesados['numeroActivo'] = f"ACT-{datos['idEquipo']}"
        
        # Establecer estatus por defecto (Disponible)
        if not datos_procesados.get('idEstatus'):
            datos_procesados['idEstatus'] = EstatusEquipo.DISPONIBLE.value
        
        # Asegurar que el estatus inicial sea válido
        if datos_procesados.get('idEstatus') not in [EstatusEquipo.DISPONIBLE.value, EstatusEquipo.ASIGNADO.value]:
            datos_procesados['idEstatus'] = EstatusEquipo.DISPONIBLE.value
        
        return datos_procesados
    
    @classmethod
    def obtener_siguiente_estados_validos(cls, estado_actual: int) -> List[Dict[str, any]]:
        """
        Obtiene la lista de estados válidos a los que puede transicionar un equipo
        
        Args:
            estado_actual: Estado actual del equipo
            
        Returns:
            List[Dict]: Lista de estados válidos con ID y nombre
        """
        estados_validos = cls.TRANSICIONES_VALIDAS.get(estado_actual, [])
        
        return [
            {"id": estado_id, "nombre": cls._get_nombre_estatus(estado_id)}
            for estado_id in estados_validos
        ]