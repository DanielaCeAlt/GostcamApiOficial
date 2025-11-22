from .base_datos import obtener_sesion, verificar_conexion, Base, engine

# Crear alias para compatibilidad
motor = engine

__all__ = ["obtener_sesion", "verificar_conexion", "Base", "motor", "engine"]