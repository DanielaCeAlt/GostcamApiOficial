# 🚀 GostCAM - Sistema de Gestión de Cámaras y Equipos

**Versión:** 2.0.0 Unificado  
**Arquitectura:** Full-Stack con Next.js + FastAPI  
**Base de Datos:** MySQL  

---

## 📋 DESCRIPCIÓN

GostCAM es un sistema completo para la gestión, seguimiento y control de equipos de vigilancia (cámaras, sensores, routers, etc.) distribuidos en múltiples sucursales.

### 🏗️ ARQUITECTURA UNIFICADA

```
📁 GostCAM/
├── 🐍 GostCAM - BackendAPI/     # FastAPI + Python + SQLAlchemy
├── ⚛️ GostCAM - Frontend/       # Next.js + React + TypeScript
├── 🗄️ BD - Mysql/              # Scripts y modelo de base de datos
├── 📜 start-gostcam.ps1         # Script de inicio completo
├── ⚙️ setup-dev.ps1             # Configuración inicial
└── 📖 README.md                 # Esta documentación
```

---

## 🛠️ TECNOLOGÍAS

### Backend (FastAPI)
- **Python 3.8+**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **PyMySQL** - Conector MySQL
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

### Frontend (Next.js)
- **Next.js 15** - Framework React con SSR/SSG
- **React 19** - Biblioteca de interfaces
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes UI

### Base de Datos
- **MySQL 8.0+** - Base de datos principal
- **MySQL Workbench** - Modelado y administración

---

## 🚀 INICIO RÁPIDO

### 1️⃣ CONFIGURACIÓN INICIAL (Solo la primera vez)

```powershell
# Clonar o descargar el proyecto
cd GostCAM

# Ejecutar configuración automática
.\setup-dev.ps1
```

### 2️⃣ CONFIGURAR BASE DE DATOS

```sql
-- 1. Crear la base de datos
CREATE DATABASE GostCAM;

-- 2. Importar estructura
mysql -u root -p GostCAM < "BD - Mysql/1_BD_GostCAM(Completo).sql"
```

### 3️⃣ CONFIGURAR ENTORNOS

**Backend (.env)**
```env
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/GostCAM
SECRET_KEY=tu_secret_key_super_seguro
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_API_MODE=hybrid
NEXT_PUBLIC_USE_PYTHON_API=true
```

### 4️⃣ INICIAR APLICACIÓN

```powershell
# Iniciar aplicación completa (Backend + Frontend)
.\start-gostcam.ps1

# O individualmente:
.\start-backend.ps1   # Solo FastAPI (puerto 8000)
.\start-frontend.ps1  # Solo Next.js (puerto 3000)
```

---

## 🌐 ACCESOS Y URLS

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Principal** | http://localhost:3000 | Frontend completo |
| **API Backend** | http://localhost:8000 | FastAPI endpoints |
| **API Docs (Swagger)** | http://localhost:8000/docs | Documentación interactiva |
| **API Redoc** | http://localhost:8000/redoc | Documentación alternativa |

---

## 📊 FUNCIONALIDADES PRINCIPALES

### 🏢 **Gestión de Sucursales**
- Registro y administración de sucursales
- Visualización de equipos por ubicación
- Estadísticas operativas por sucursal

### 📹 **Gestión de Equipos**
- ✅ Alta, baja y modificación de equipos
- 📊 Seguimiento de estado (Activo/Inactivo/Mantenimiento/Con Falla)
- 🔍 Búsqueda y filtrado avanzado
- 📱 Soporte multi-dispositivo

### 🚚 **Control de Movimientos**
- Traslados entre sucursales
- Historial de movimientos
- Seguimiento de instalaciones y retiros
- Planificación de mantenimientos

### ⚠️ **Gestión de Fallas**
- Registro de incidencias
- Asignación a técnicos
- Seguimiento de resolución
- Estadísticas de fallas

### 📈 **Dashboard y Reportes**
- Panel de control en tiempo real
- Estadísticas operativas
- Gráficos y métricas
- Alertas automáticas

---

## 🔧 DESARROLLO

### 📂 **Estructura del Proyecto**

#### Backend (FastAPI)
```
GostCAM - BackendAPI/
├── config/           # Configuración de la aplicación
├── dao/              # Data Access Objects
├── modelos/          # Modelos Pydantic
├── scripts/          # Scripts de utilidad
├── main.py           # Punto de entrada FastAPI
├── requirements.txt  # Dependencias Python
└── .env             # Variables de entorno
```

#### Frontend (Next.js)
```
GostCAM - Frontend/
├── src/
│   ├── app/          # App Router de Next.js
│   ├── components/   # Componentes React
│   ├── contexts/     # Context Providers
│   ├── hooks/        # Custom Hooks
│   ├── lib/          # Servicios y utilidades
│   ├── types/        # Definiciones TypeScript
│   └── utils/        # Funciones auxiliares
├── public/           # Archivos estáticos
├── package.json      # Dependencias Node.js
└── .env.local       # Variables de entorno
```

### 🔄 **API Service Híbrido**

El sistema utiliza un enfoque híbrido inteligente:

- **Operaciones pesadas** → FastAPI (equipos, movimientos, dashboard)
- **Operaciones ligeras** → Next.js API (autenticación, catálogos)
- **Fallback automático** en caso de error
- **Cache inteligente** con TTL configurable
- **Retry logic** con exponential backoff

### 🧪 **Testing**

```powershell
# Backend
cd "GostCAM - BackendAPI"
python -m pytest

# Frontend  
cd "GostCAM - Frontend"
npm run test
```

---

## 📋 REQUISITOS DEL SISTEMA

### 🖥️ **Software Requerido**
- **Node.js** 18+ ([Descargar](https://nodejs.org))
- **Python** 3.8+ ([Descargar](https://python.org))
- **MySQL** 8.0+ ([Descargar](https://dev.mysql.com/downloads/))
- **Git** ([Descargar](https://git-scm.com))

### 🔧 **Herramientas Recomendadas**
- **VS Code** con extensiones TypeScript/Python
- **MySQL Workbench** para administración de BD
- **Postman** para testing de APIs

### 💾 **Recursos Mínimos**
- **RAM:** 4GB (recomendado 8GB)
- **Disco:** 2GB espacio libre
- **Puertos:** 3000, 8000 disponibles

---

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### 🔐 **Autenticación**
- JWT tokens para autenticación
- Roles de usuario (Admin, Manager, Técnico, Usuario)
- Timeout de sesión configurable

### 🛡️ **Validación**
- Validación de entrada con Pydantic
- Sanitización de datos
- Rate limiting en API endpoints

### 🔍 **Logs y Monitoreo**
- Logs estructurados en JSON
- Seguimiento de acciones de usuario
- Métricas de performance

---

## 📚 DOCUMENTACIÓN ADICIONAL

### 📖 **Archivos de Documentación**
- `OPTIMIZATION_AUDIT_REPORT.md` - Reporte de auditoría técnica
- `CAMERA_INTEGRATION.md` - Integración con sistemas de cámaras
- `REFACTORING.md` - Notas sobre refactorización

### 🔗 **APIs Documentadas**
- FastAPI Docs: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

### 🎓 **Recursos de Aprendizaje**
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Next.js Learn](https://nextjs.org/learn)
- [React Documentation](https://react.dev)

---

## 🤝 CONTRIBUCIÓN

### 🔄 **Workflow de Desarrollo**
1. Crear feature branch
2. Desarrollar funcionalidad
3. Testing exhaustivo
4. Code review
5. Merge a main

### 📝 **Convenciones de Código**
- **Python:** PEP 8
- **TypeScript:** ESLint + Prettier
- **Git:** Conventional commits

---

## 🐛 TROUBLESHOOTING

### ❌ **Problemas Comunes**

**1. Error de conexión a MySQL**
```bash
# Verificar que MySQL esté ejecutándose
mysqladmin ping

# Verificar credenciales en .env
DATABASE_URL=mysql+pymysql://usuario:password@localhost:3306/GostCAM
```

**2. Puerto 3000/8000 en uso**
```powershell
# Buscar proceso usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Terminar proceso
taskkill /F /PID [PID]
```

**3. Dependencias no instaladas**
```powershell
# Backend
cd "GostCAM - BackendAPI"
pip install -r requirements.txt

# Frontend
cd "GostCAM - Frontend" 
npm install
```

### 🆘 **Obtener Ayuda**
1. Revisar logs de consola
2. Verificar archivo .env
3. Comprobar conectividad de base de datos
4. Revisar documentación de APIs

---

## 📝 CHANGELOG

### v2.0.0 (Actual)
- ✅ Proyecto unificado en una carpeta
- ✅ API Service híbrido inteligente
- ✅ Scripts de inicio automatizados
- ✅ Optimizaciones de performance
- ✅ Sistema de cache mejorado

### v1.0.0
- ✅ Funcionalidad básica completa
- ✅ CRUD de equipos y movimientos
- ✅ Dashboard estadístico
- ✅ Autenticación JWT

---

## 📄 LICENCIA

Este proyecto es de uso interno para el sistema GostCAM.

---

## 📞 CONTACTO

**Proyecto:** GostCAM v2.0.0  
**Desarrollado con** ❤️ usando FastAPI + Next.js

---

## 🚀 ¡COMENZAR AHORA!

```powershell
# 1. Ejecutar configuración inicial
.\setup-dev.ps1

# 2. Iniciar aplicación completa
.\start-gostcam.ps1

# 3. Abrir navegador en http://localhost:3000
```

**¡Tu sistema GostCAM está listo para funcionar!** 🎉