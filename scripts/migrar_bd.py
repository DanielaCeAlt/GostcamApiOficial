"""
Script para migrar de la estructura anterior a la nueva estructura de base de datos
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dao.base_datos import engine, verificar_conexion
from sqlalchemy import text

def ejecutar_migracion():
    """
    Ejecuta la migración de la base de datos
    """
    print("🔄 Iniciando migración de base de datos...")
    
    if not verificar_conexion():
        print("❌ Error: No se puede conectar a la base de datos")
        return False
    
    try:
        with engine.connect() as connection:
            # Verificar si existe el esquema GostCAM
            result = connection.execute(text("""
                SELECT SCHEMA_NAME 
                FROM INFORMATION_SCHEMA.SCHEMATA 
                WHERE SCHEMA_NAME = 'GostCAM'
            """))
            
            if not result.fetchone():
                print("❌ Error: El esquema GostCAM no existe. Ejecute primero el script SQL de creación.")
                return False
            
            # Verificar tabla Usuarios actualizada
            result = connection.execute(text("""
                SELECT COUNT(*) as count
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'GostCAM' 
                AND TABLE_NAME = 'Usuarios'
                AND COLUMN_NAME = 'fecha_creacion'
            """))
            
            if result.fetchone().count > 0:
                print("✅ Base de datos ya está actualizada con la nueva estructura")
                return True
            else:
                print("⚠️  Advertencia: La estructura no coincide completamente")
                return False
                
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        return False

if __name__ == "__main__":
    if ejecutar_migracion():
        print("✅ Migración completada exitosamente")
    else:
        print("❌ Migración falló")