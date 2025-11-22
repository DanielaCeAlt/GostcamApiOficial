from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de conexión directa (sin dotenv) - SSL requerido para Azure MySQL
DATABASE_URL = 'mysql+pymysql://gostcam:Altamirano92@mysql-gostcam.mysql.database.azure.com:3306/gostcam?charset=utf8mb4'

# Configuración del motor de base de datos con SSL para Azure MySQL
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para ver las consultas SQL en desarrollo
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "charset": "utf8mb4",
        "autocommit": False,
        "ssl": {'check_hostname': False},
        "ssl_disabled": False
    }
)

# Alias para compatibilidad
motor = engine

# Base para los modelos declarativos
Base = declarative_base()

# Configuración de la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def obtener_sesion():
    """
    Generador que proporciona una sesión de base de datos.
    Se asegura de cerrar la sesión cuando termina.
    """
    sesion = SessionLocal()
    try:
        yield sesion
    except Exception as error:
        sesion.rollback()
        raise error
    finally:
        sesion.close()

def crear_tablas():
    """
    Crea todas las tablas definidas en los modelos.
    Nota: Con el nuevo esquema, las tablas ya existen en la BD.
    """
    Base.metadata.create_all(bind=engine)

def verificar_conexion():
    """
    Verifica que la conexión a la base de datos funcione correctamente.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))  # ✅ Agregado text()
            print("✅ Conexión a la base de datos exitosa")
            return True
    except Exception as error:
        print(f"❌ Error de conexión: {error}")
        return False

def verificar_esquema():
    """
    Verifica que el esquema GostCAM y sus tablas existan.
    """
    try:
        with engine.connect() as connection:
            # Verificar si el esquema existe
            result = connection.execute(text("""
                SELECT SCHEMA_NAME 
                FROM INFORMATION_SCHEMA.SCHEMATA 
                WHERE SCHEMA_NAME = 'GostCAM'
            """))
            
            if not result.first():
                print("❌ El esquema 'GostCAM' no existe")
                return False
            
            # Verificar algunas tablas principales
            tablas_principales = ['Usuarios', 'Equipo', 'Sucursales', 'TipoEquipo']
            for tabla in tablas_principales:
                result = connection.execute(text(f"""
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = 'GostCAM' AND TABLE_NAME = '{tabla}'
                """))
                
                if not result.first():
                    print(f"❌ La tabla '{tabla}' no existe en el esquema GostCAM")
                    return False
            
            print("✅ Esquema y tablas principales verificados correctamente")
            return True
            
    except Exception as error:
        print(f"❌ Error verificando esquema: {error}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando conexión a la base de datos...")
    conexion_ok = verificar_conexion()
    
    if conexion_ok:
        print("🔍 Verificando esquema de base de datos...")
        verificar_esquema()
    else:
        print("❌ No se puede continuar sin conexión a la base de datos")