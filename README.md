# GostCAM - Sistema de Gestión de Inventarios

API REST para gestión de inventarios de equipos de seguridad desarrollada con FastAPI.

## 🚀 Versión 2.0.0

### Cambios principales:
- ✅ Actualizado para nueva estructura de base de datos
- ✅ Cambio de Layout a PosicionEquipo
- ✅ Consolidación de esquemas en GostCAM
- ✅ Nuevos endpoints para catálogos
- ✅ Mejorado manejo de autenticación

## 🛠️ Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validación de datos
- **MySQL** - Base de datos
- **Uvicorn** - Servidor ASGI

## 📋 Requisitos

- Python 3.8+
- MySQL 8.0+
- pip

## ⚙️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/DanielaCeAlt/GostCAM-API-.git
cd GostCAM-API-
```

2. Instalar dependencias:
```bash
pip install fastapi uvicorn sqlalchemy pymysql pydantic[email] bcrypt python-multipart
```

3. Configurar base de datos:
- Ejecutar el script SQL para crear la base de datos GostCAM
- Configurar credenciales de conexión

4. Ejecutar la aplicación:
```bash
python main.py
```

## 📖 Documentación

- **API Principal**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔗 Endpoints principales

### Autenticación
- `POST /autenticacion/iniciar-sesion` - Iniciar sesión

### Equipos
- `POST /equipos/alta` - Registrar alta de equipo
- `POST /equipos/baja` - Registrar baja de equipo
- `PUT /equipos/estado` - Actualizar estado de equipo
- `POST /equipos/mantenimiento` - Registrar mantenimiento

### Movimientos
- `PUT /movimientos/actualizar` - Actualizar movimiento
- `GET /movimientos/listar-por-tipo/{tipo}` - Listar por tipo
- `GET /movimientos/consultar` - Consultar movimientos

### Catálogos
- `GET /catalogos/tipos-equipo` - Obtener tipos de equipo
- `GET /catalogos/estatus-equipo` - Obtener estatus
- `GET /catalogos/sucursales` - Obtener sucursales
- `GET /posiciones/sucursal/{id_centro}` - Obtener posiciones

## 👥 Roles de usuario

1. **Administrador** - Acceso completo
2. **Supervisor** - Gestión de equipos y movimientos
3. **Técnico** - Mantenimiento y estados
4. **Usuario** - Consultas básicas
5. **Consulta** - Solo lectura

## 📊 Base de datos

El sistema utiliza el esquema `GostCAM` con las siguientes tablas principales:
- Usuarios
- Equipo
- Sucursales
- PosicionEquipo
- MovimientoInventario
- TipoEquipo
- EstatusEquipo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es para uso académico - Maestría GOSTCAM.

Auto-merging archivo.py
CONFLICT (content): Merge conflict in archivo.py
Changes to be committed:
  new file: main.py
  new file: dao/base_datos.py
  etc...
