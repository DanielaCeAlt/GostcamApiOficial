"""
Configuración centralizada de la aplicación
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Base de datos
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://gostcam:Altamirano92@mysql-gostcam.mysql.database.azure.com:3306/GostCAM?ssl_ca=&ssl_disabled=False")
    
    # Seguridad
    SECRET_KEY = os.getenv("SECRET_KEY", "CAMBIA_ESTE_SECRET_SUPER_SEGURO")
    
    # Servidor
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # API
    API_TITLE = "Sistema de Gestión de Inventarios - GostCAM"
    API_DESCRIPTION = "API REST para gestión de inventarios de equipos de seguridad"
    API_VERSION = "2.0.0"
    
    # Logs
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Validaciones
    MAX_EQUIPOS_POR_MOVIMIENTO = 100
    TIMEOUT_SESION = 3600  # 1 hora en segundos

settings = Settings()