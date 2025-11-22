"""
Sistema de Logging Estructurado para GostCAM Backend
Fecha: 20 de Noviembre de 2025
Propósito: Logging avanzado con métricas de performance y trazabilidad
"""

import logging
import time
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps
import traceback

class GostCAMLogger:
    """
    Logger estructurado personalizado para GostCAM
    Incluye métricas de performance, contexto de usuario y trazabilidad
    """
    
    def __init__(self, name: str = "gostcam"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Evitar duplicar handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Configura handlers para archivo y consola"""
        
        # Crear directorio de logs si no existe
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Formatter estructurado
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Handler para archivo (rotativo diario)
        file_handler = logging.FileHandler(
            f"{log_dir}/gostcam_{datetime.now().strftime('%Y%m%d')}.log"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        
        # Handler para consola
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def _build_context(
        self, 
        operation: str,
        user_id: Optional[str] = None,
        equipo_id: Optional[str] = None,
        sucursal_id: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Construye contexto estructurado para logging"""
        
        context = {
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "session_id": getattr(self, '_session_id', None),
        }
        
        if user_id:
            context["user_id"] = user_id
        if equipo_id:
            context["equipo_id"] = equipo_id
        if sucursal_id:
            context["sucursal_id"] = sucursal_id
        if extra_data:
            context.update(extra_data)
        
        return context
    
    def info(
        self,
        message: str,
        operation: str = "general",
        user_id: Optional[str] = None,
        equipo_id: Optional[str] = None,
        sucursal_id: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        """Log de información con contexto estructurado"""
        
        context = self._build_context(operation, user_id, equipo_id, sucursal_id, extra_data)
        log_entry = {
            "message": message,
            "level": "INFO",
            "context": context
        }
        
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def error(
        self,
        message: str,
        error: Exception,
        operation: str = "general",
        user_id: Optional[str] = None,
        equipo_id: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        """Log de error con contexto y stack trace"""
        
        context = self._build_context(operation, user_id, equipo_id, None, extra_data)
        context["error_type"] = type(error).__name__
        context["error_details"] = str(error)
        context["stack_trace"] = traceback.format_exc()
        
        log_entry = {
            "message": message,
            "level": "ERROR", 
            "context": context
        }
        
        self.logger.error(json.dumps(log_entry, ensure_ascii=False))
    
    def performance(
        self,
        operation: str,
        duration_ms: float,
        user_id: Optional[str] = None,
        equipo_id: Optional[str] = None,
        query_type: Optional[str] = None,
        record_count: Optional[int] = None
    ):
        """Log de métricas de performance"""
        
        extra_data = {
            "duration_ms": round(duration_ms, 2),
            "performance_category": self._categorize_performance(duration_ms)
        }
        
        if query_type:
            extra_data["query_type"] = query_type
        if record_count is not None:
            extra_data["record_count"] = record_count
        
        context = self._build_context(operation, user_id, equipo_id, None, extra_data)
        
        log_entry = {
            "message": f"Performance: {operation} completado en {duration_ms:.2f}ms",
            "level": "PERFORMANCE",
            "context": context
        }
        
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def audit(
        self,
        operation: str,
        user_id: str,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        equipo_id: Optional[str] = None
    ):
        """Log de auditoría para cambios importantes"""
        
        extra_data = {
            "audit_type": "data_change",
            "before_state": before_state,
            "after_state": after_state
        }
        
        context = self._build_context(operation, user_id, equipo_id, None, extra_data)
        
        log_entry = {
            "message": f"Auditoría: {operation}",
            "level": "AUDIT",
            "context": context
        }
        
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def _categorize_performance(self, duration_ms: float) -> str:
        """Categoriza performance basado en duración"""
        if duration_ms < 100:
            return "EXCELLENT"
        elif duration_ms < 500:
            return "GOOD"
        elif duration_ms < 1000:
            return "ACCEPTABLE"
        elif duration_ms < 3000:
            return "SLOW"
        else:
            return "CRITICAL"

# Instancia global del logger
gostcam_logger = GostCAMLogger()

def log_performance(operation: str = None, include_args: bool = False):
    """
    Decorador para logging automático de performance
    
    Args:
        operation: Nombre de la operación (opcional, usa nombre de función por defecto)
        include_args: Si incluir argumentos en el log
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            op_name = operation or f"{func.__module__}.{func.__name__}"
            start_time = time.time()
            
            # Extraer contexto de argumentos si está disponible
            user_id = None
            equipo_id = None
            
            if include_args and args:
                # Intentar extraer IDs del primer argumento (self) o datos
                if hasattr(args[0], '__dict__'):
                    # Para métodos DAO, el primer arg es self
                    if len(args) > 1 and isinstance(args[1], dict):
                        data = args[1]
                        user_id = data.get('idUsuario') or data.get('user_id')
                        equipo_id = data.get('idEquipo') or data.get('equipo_id')
            
            try:
                gostcam_logger.info(
                    f"Iniciando: {op_name}",
                    operation=op_name,
                    user_id=user_id,
                    equipo_id=equipo_id
                )
                
                result = func(*args, **kwargs)
                
                # Calcular duración
                duration = (time.time() - start_time) * 1000
                
                # Extraer información del resultado si es posible
                record_count = None
                if isinstance(result, dict):
                    if 'equipos' in result and isinstance(result['equipos'], list):
                        record_count = len(result['equipos'])
                    elif 'movimientos' in result and isinstance(result['movimientos'], list):
                        record_count = len(result['movimientos'])
                
                gostcam_logger.performance(
                    operation=op_name,
                    duration_ms=duration,
                    user_id=user_id,
                    equipo_id=equipo_id,
                    query_type=func.__name__,
                    record_count=record_count
                )
                
                return result
                
            except Exception as error:
                duration = (time.time() - start_time) * 1000
                
                gostcam_logger.error(
                    f"Error en {op_name}",
                    error=error,
                    operation=op_name,
                    user_id=user_id,
                    equipo_id=equipo_id,
                    extra_data={"duration_ms": duration}
                )
                
                raise  # Re-raise la excepción
        
        return wrapper
    return decorator

def log_audit_change(operation: str):
    """
    Decorador para auditoría de cambios de datos
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extraer contexto antes de la operación
            user_id = None
            equipo_id = None
            before_state = None
            
            if len(args) > 1 and isinstance(args[1], dict):
                data = args[1]
                user_id = data.get('idUsuario') or data.get('user_id')
                equipo_id = data.get('idEquipo') or data.get('equipo_id')
                
                # Para cambios de estado, capturar estado anterior
                if operation in ['actualizar_estado', 'registrar_baja']:
                    # Aquí podrías consultar el estado actual antes del cambio
                    before_state = {"equipo_id": equipo_id, "timestamp": datetime.utcnow().isoformat()}
            
            try:
                result = func(*args, **kwargs)
                
                # Log de auditoría exitosa
                after_state = None
                if isinstance(result, dict) and result.get('exito'):
                    after_state = {"result": "success", "timestamp": datetime.utcnow().isoformat()}
                
                gostcam_logger.audit(
                    operation=operation,
                    user_id=user_id,
                    before_state=before_state,
                    after_state=after_state,
                    equipo_id=equipo_id
                )
                
                return result
                
            except Exception as error:
                gostcam_logger.error(
                    f"Error en auditoría: {operation}",
                    error=error,
                    operation=operation,
                    user_id=user_id,
                    equipo_id=equipo_id
                )
                raise
        
        return wrapper
    return decorator

# Funciones de utilidad para logging directo
def log_api_request(endpoint: str, method: str, user_id: str = None, duration_ms: float = None):
    """Log de requests de API"""
    extra_data = {
        "endpoint": endpoint,
        "method": method,
        "api_version": "2.0.0"
    }
    
    if duration_ms:
        extra_data["duration_ms"] = duration_ms
    
    gostcam_logger.info(
        f"API Request: {method} {endpoint}",
        operation="api_request",
        user_id=user_id,
        extra_data=extra_data
    )

def log_database_operation(operation: str, table: str, record_id: str = None, duration_ms: float = None):
    """Log de operaciones de base de datos"""
    extra_data = {
        "table": table,
        "db_operation": operation
    }
    
    if duration_ms:
        extra_data["duration_ms"] = duration_ms
    
    gostcam_logger.info(
        f"DB Operation: {operation} en {table}",
        operation="database_operation",
        equipo_id=record_id,
        extra_data=extra_data
    )

def log_authentication_attempt(email: str, success: bool, ip_address: str = None):
    """Log de intentos de autenticación"""
    extra_data = {
        "email": email,
        "success": success,
        "auth_method": "basic"
    }
    
    if ip_address:
        extra_data["ip_address"] = ip_address
    
    level = "INFO" if success else "WARNING"
    message = f"Autenticación {'exitosa' if success else 'fallida'} para {email}"
    
    if success:
        gostcam_logger.info(
            message,
            operation="authentication",
            user_id=email,
            extra_data=extra_data
        )
    else:
        # Para fallos de autenticación, usar logger directo para WARNING
        gostcam_logger.logger.warning(json.dumps({
            "message": message,
            "level": "WARNING",
            "context": gostcam_logger._build_context("authentication", email, None, None, extra_data)
        }, ensure_ascii=False))