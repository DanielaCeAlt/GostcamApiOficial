"""
Sistema de Cache para GostCAM Backend
Fecha: 20 de Noviembre de 2025
Propósito: Optimizar consultas de catálogos estáticos mediante cache en memoria
"""

import time
import json
from typing import Dict, Any, Optional, Callable
from functools import wraps
from datetime import datetime, timedelta
import threading

class MemoryCache:
    """
    Cache en memoria thread-safe para optimizar consultas de catálogos estáticos
    """
    
    def __init__(self, default_ttl: int = 3600):
        """
        Inicializa el cache
        
        Args:
            default_ttl: Tiempo de vida por defecto en segundos (1 hora)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()
        self.default_ttl = default_ttl
        
    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del cache
        
        Args:
            key: Clave del cache
            
        Returns:
            Valor cacheado o None si no existe o expiró
        """
        with self._lock:
            if key not in self._cache:
                return None
            
            cache_entry = self._cache[key]
            
            # Verificar si expiró
            if time.time() > cache_entry['expires_at']:
                del self._cache[key]
                return None
            
            # Actualizar estadísticas
            cache_entry['hits'] += 1
            cache_entry['last_accessed'] = time.time()
            
            return cache_entry['value']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Establece un valor en el cache
        
        Args:
            key: Clave del cache
            value: Valor a cachear
            ttl: Tiempo de vida en segundos (usa default_ttl si no se especifica)
        """
        with self._lock:
            expires_at = time.time() + (ttl or self.default_ttl)
            
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at,
                'created_at': time.time(),
                'last_accessed': time.time(),
                'hits': 0
            }
    
    def delete(self, key: str) -> bool:
        """
        Elimina una entrada del cache
        
        Args:
            key: Clave a eliminar
            
        Returns:
            True si se eliminó, False si no existía
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """Limpia todo el cache"""
        with self._lock:
            self._cache.clear()
    
    def cleanup_expired(self) -> int:
        """
        Limpia entradas expiradas
        
        Returns:
            Número de entradas eliminadas
        """
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, entry in self._cache.items()
                if current_time > entry['expires_at']
            ]
            
            for key in expired_keys:
                del self._cache[key]
            
            return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del cache
        
        Returns:
            Diccionario con estadísticas
        """
        with self._lock:
            total_entries = len(self._cache)
            total_hits = sum(entry['hits'] for entry in self._cache.values())
            
            memory_usage = sum(
                len(json.dumps(entry['value'], default=str).encode('utf-8'))
                for entry in self._cache.values()
            )
            
            return {
                'total_entries': total_entries,
                'total_hits': total_hits,
                'memory_usage_bytes': memory_usage,
                'memory_usage_mb': round(memory_usage / (1024 * 1024), 2),
                'entries': {
                    key: {
                        'hits': entry['hits'],
                        'created_at': datetime.fromtimestamp(entry['created_at']).isoformat(),
                        'last_accessed': datetime.fromtimestamp(entry['last_accessed']).isoformat(),
                        'expires_at': datetime.fromtimestamp(entry['expires_at']).isoformat(),
                        'is_expired': time.time() > entry['expires_at']
                    }
                    for key, entry in self._cache.items()
                }
            }
    
    def exists(self, key: str) -> bool:
        """
        Verifica si una clave existe y no ha expirado
        
        Args:
            key: Clave a verificar
            
        Returns:
            True si existe y no ha expirado
        """
        return self.get(key) is not None

# Instancia global del cache
gostcam_cache = MemoryCache(default_ttl=3600)  # 1 hora por defecto

class FuncionCacheada:
    """
    Clase callable que envuelve funciones con capacidades de cache
    Proporciona acceso directo a métodos de limpieza de cache
    """
    
    def __init__(self, func: Callable, key_template: str, ttl: Optional[int] = None):
        self.func = func
        self.key_template = key_template
        self.ttl = ttl or gostcam_cache.default_ttl
        
        # Copiar metadata de la función original
        self.__name__ = getattr(func, '__name__', 'funcion_cacheada')
        self.__doc__ = func.__doc__
        self.__module__ = getattr(func, '__module__', None)
        self.__qualname__ = getattr(func, '__qualname__', self.__name__)
    
    def __call__(self, *args, **kwargs):
        """Ejecuta la función con cache automático"""
        # Generar clave del cache
        cache_key = self._generar_clave_cache(args, kwargs)
        
        # Intentar obtener del cache
        resultado_cache = gostcam_cache.get(cache_key)
        if resultado_cache is not None:
            return resultado_cache
        
        # Ejecutar función original
        resultado = self.func(*args, **kwargs)
        
        # Cachear resultado
        gostcam_cache.set(cache_key, resultado, self.ttl)
        
        return resultado
    
    def _generar_clave_cache(self, args, kwargs) -> str:
        """Genera la clave del cache basada en argumentos"""
        # Para métodos de clase, args[0] es self, lo ignoramos en la clave
        func_args = args[1:] if args and hasattr(args[0], '__dict__') else args
        
        # Crear contexto para el template de clave
        contexto_clave = {}
        
        if func_args:
            # Mapear argumentos posicionales
            import inspect
            try:
                sig = inspect.signature(self.func)
                nombres_params = list(sig.parameters.keys())
                if hasattr(args[0], '__dict__'):  # Es un método, ignorar self
                    nombres_params = nombres_params[1:]
                
                for i, arg in enumerate(func_args):
                    if i < len(nombres_params):
                        contexto_clave[nombres_params[i]] = str(arg)
            except (ValueError, TypeError):
                # Si no puede obtener signature, usar índices
                for i, arg in enumerate(func_args):
                    contexto_clave[f'arg{i}'] = str(arg)
        
        # Agregar argumentos nombrados
        contexto_clave.update({k: str(v) for k, v in kwargs.items()})
        
        # Formatear clave
        try:
            clave_cache = self.key_template.format(**contexto_clave)
        except KeyError:
            # Si faltan parámetros en el template, usar template + hash de args
            import hashlib
            args_str = str(args) + str(kwargs)
            hash_args = hashlib.md5(args_str.encode()).hexdigest()[:8]
            clave_cache = f"{self.key_template}_{hash_args}"
        
        return clave_cache
    
    def limpiar_cache(self):
        """Limpia el cache específico para esta función"""
        # Limpia todas las claves que coincidan con el template
        invalidate_cache(self.key_template)
    
    def obtener_info_cache(self) -> Dict[str, Any]:
        """Obtiene información sobre el cache de esta función"""
        return {
            'key_template': self.key_template,
            'ttl': self.ttl,
            'function_name': self.__name__,
            'cache_stats': gostcam_cache.get_stats()
        }

def cached(key_template: str, ttl: Optional[int] = None):
    """
    Decorador para cachear resultados de funciones
    
    Args:
        key_template: Template para la clave del cache. Puede usar {parametros} de la función
        ttl: Tiempo de vida del cache en segundos
        
    Example:
        @cached("tipos_equipo", ttl=7200)
        def obtener_tipos_equipo(self):
            # Esta función se ejecutará solo si no está en cache
            return consulta_db()
            
        # Métodos disponibles:
        # obtener_tipos_equipo()           # Ejecuta con cache
        # obtener_tipos_equipo.limpiar_cache()  # Limpia cache específico
        # obtener_tipos_equipo.obtener_info_cache()  # Info del cache
    """
    def decorator(func: Callable) -> FuncionCacheada:
        return FuncionCacheada(func, key_template, ttl)
    return decorator

def invalidate_cache(pattern: str = None):
    """
    Invalida entradas del cache
    
    Args:
        pattern: Patrón para invalidar (None = todo el cache)
    """
    if pattern is None:
        gostcam_cache.clear()
    else:
        # Implementación simple de pattern matching
        keys_to_delete = []
        for key in gostcam_cache._cache.keys():
            if pattern in key:
                keys_to_delete.append(key)
        
        for key in keys_to_delete:
            gostcam_cache.delete(key)

def warm_cache():
    """
    Pre-carga datos críticos en el cache
    Esta función debería llamarse al iniciar la aplicación
    """
    # Esta función se puede llamar desde el startup de FastAPI
    # para pre-cargar catálogos críticos
    pass

class CacheManager:
    """
    Manager para operaciones avanzadas de cache
    """
    
    @staticmethod
    def get_cache_statistics() -> Dict[str, Any]:
        """Obtiene estadísticas completas del cache"""
        return gostcam_cache.get_stats()
    
    @staticmethod
    def cleanup_expired_entries() -> int:
        """Limpia entradas expiradas del cache"""
        return gostcam_cache.cleanup_expired()
    
    @staticmethod
    def invalidate_catalogs():
        """Invalida todos los catálogos cacheados"""
        catalog_patterns = ['tipos_equipo', 'estatus_equipo', 'sucursales', 'posiciones_']
        for pattern in catalog_patterns:
            invalidate_cache(pattern)
    
    @staticmethod
    def refresh_cache_entry(key: str, refresh_func: Callable, *args, **kwargs):
        """
        Refresca una entrada específica del cache ejecutando la función de actualización
        
        Args:
            key: Clave del cache a refrescar
            refresh_func: Función para obtener datos frescos
            *args, **kwargs: Argumentos para la función de actualización
        """
        try:
            fresh_data = refresh_func(*args, **kwargs)
            gostcam_cache.set(key, fresh_data)
            return fresh_data
        except Exception as e:
            # Si falla el refresh, mantener datos existentes si los hay
            existing_data = gostcam_cache.get(key)
            if existing_data is not None:
                return existing_data
            raise e
    
    @staticmethod
    def get_cache_health() -> Dict[str, Any]:
        """
        Evalúa la salud del cache
        
        Returns:
            Información sobre la salud y recomendaciones
        """
        stats = gostcam_cache.get_stats()
        
        health_info = {
            'status': 'healthy',
            'recommendations': [],
            'statistics': stats
        }
        
        # Evaluar uso de memoria
        memory_mb = stats['memory_usage_mb']
        if memory_mb > 100:  # Más de 100MB
            health_info['status'] = 'warning'
            health_info['recommendations'].append(
                f"Alto uso de memoria: {memory_mb}MB. Considere reducir TTL o limpiar cache."
            )
        
        # Evaluar número de entradas
        total_entries = stats['total_entries']
        if total_entries > 1000:  # Más de 1000 entradas
            health_info['status'] = 'warning'
            health_info['recommendations'].append(
                f"Muchas entradas en cache: {total_entries}. Considere limpieza periódica."
            )
        
        # Evaluar entradas expiradas
        expired_count = sum(
            1 for entry in stats['entries'].values() 
            if entry['is_expired']
        )
        
        if expired_count > total_entries * 0.3:  # Más del 30% expirado
            health_info['recommendations'].append(
                f"Muchas entradas expiradas: {expired_count}. Ejecute cleanup_expired_entries()."
            )
        
        return health_info

# Instancia global del manager
cache_manager = CacheManager()

# Tarea de limpieza automática (se puede integrar con un scheduler)
def schedule_cache_cleanup():
    """
    Función para limpieza automática periódica del cache
    Se puede llamar desde un scheduler o tarea en background
    """
    import threading
    import time
    
    def cleanup_task():
        while True:
            time.sleep(300)  # Cada 5 minutos
            try:
                expired_count = gostcam_cache.cleanup_expired()
                if expired_count > 0:
                    print(f"Cache cleanup: {expired_count} entradas expiradas eliminadas")
            except Exception as e:
                print(f"Error en limpieza de cache: {e}")
    
    # Iniciar thread de limpieza
    cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
    cleanup_thread.start()
    
    return cleanup_thread