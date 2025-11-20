# ===============================
# GOSTCAM - CONFIGURACIÓN INICIAL DE DESARROLLO
# ===============================

Write-Host "🔧 CONFIGURANDO ENTORNO DE DESARROLLO GOSTCAM" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow

$originalLocation = Get-Location

# ===============================
# 1. CONFIGURAR BACKEND (FastAPI)
# ===============================
Write-Host "`n🐍 CONFIGURANDO BACKEND FASTAPI..." -ForegroundColor Yellow

try {
    Set-Location "GostCAM - BackendAPI"
    
    # Crear entorno virtual si no existe
    if (-not (Test-Path ".venv")) {
        Write-Host "📦 Creando entorno virtual Python..." -ForegroundColor Cyan
        python -m venv .venv
    }
    
    # Activar entorno virtual
    Write-Host "🔧 Activando entorno virtual..." -ForegroundColor Cyan
    & ".\.venv\Scripts\Activate.ps1"
    
    # Actualizar pip
    Write-Host "⬆️ Actualizando pip..." -ForegroundColor Cyan
    python -m pip install --upgrade pip
    
    # Instalar dependencias
    Write-Host "📚 Instalando dependencias Python..." -ForegroundColor Cyan
    pip install -r requirements.txt
    
    # Verificar instalación de FastAPI
    Write-Host "✅ Verificando FastAPI..." -ForegroundColor Cyan
    python -c "import fastapi; print(f'FastAPI {fastapi.__version__} instalado correctamente')"
    
    Write-Host "✅ Backend configurado correctamente" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error configurando Backend: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Set-Location $originalLocation
}

# ===============================
# 2. CONFIGURAR FRONTEND (Next.js)
# ===============================
Write-Host "`n⚛️ CONFIGURANDO FRONTEND NEXT.JS..." -ForegroundColor Yellow

try {
    Set-Location "GostCAM - Frontend"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js no encontrado. Instala Node.js desde https://nodejs.org" -ForegroundColor Red
        return
    }
    
    # Instalar dependencias
    Write-Host "📦 Instalando dependencias Node.js..." -ForegroundColor Cyan
    npm install
    
    # Verificar Next.js
    Write-Host "✅ Verificando Next.js..." -ForegroundColor Cyan
    npx next --version
    
    Write-Host "✅ Frontend configurado correctamente" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error configurando Frontend: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Set-Location $originalLocation
}

# ===============================
# 3. VERIFICAR BASE DE DATOS
# ===============================
Write-Host "`n🗄️ VERIFICANDO CONFIGURACIÓN DE BASE DE DATOS..." -ForegroundColor Yellow

# Verificar archivos SQL
if (Test-Path "BD - Mysql\1_BD_GostCAM(Completo).sql") {
    Write-Host "✅ Script de base de datos encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Script de base de datos no encontrado" -ForegroundColor Yellow
}

if (Test-Path "BD - Mysql\Modelo_GostCAM.mwb") {
    Write-Host "✅ Modelo de base de datos encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Modelo de base de datos no encontrado" -ForegroundColor Yellow
}

Write-Host "📝 NOTA: Asegúrate de que MySQL esté ejecutándose y la BD 'GostCAM' esté creada" -ForegroundColor Cyan

# ===============================
# 4. VERIFICAR CONFIGURACIONES
# ===============================
Write-Host "`n⚙️ VERIFICANDO CONFIGURACIONES..." -ForegroundColor Yellow

# Backend config
if (Test-Path "GostCAM - BackendAPI\.env") {
    Write-Host "✅ Configuración Backend (.env) encontrada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Configuración Backend (.env) no encontrada" -ForegroundColor Yellow
}

# Frontend config
if (Test-Path "GostCAM - Frontend\.env.local") {
    Write-Host "✅ Configuración Frontend (.env.local) encontrada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Configuración Frontend (.env.local) no encontrada" -ForegroundColor Yellow
}

# ===============================
# 5. CREAR SCRIPT DE DESARROLLO
# ===============================
Write-Host "`n🛠️ CREANDO SCRIPTS DE DESARROLLO..." -ForegroundColor Yellow

# Script para iniciar solo Backend
$backendScript = @"
# Iniciar solo Backend FastAPI
Set-Location "GostCAM - BackendAPI"
& ".\.venv\Scripts\Activate.ps1"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

$backendScript | Out-File -FilePath "start-backend.ps1" -Encoding UTF8
Write-Host "✅ Creado: start-backend.ps1" -ForegroundColor Green

# Script para iniciar solo Frontend
$frontendScript = @"
# Iniciar solo Frontend Next.js
Set-Location "GostCAM - Frontend"
npm run dev
"@

$frontendScript | Out-File -FilePath "start-frontend.ps1" -Encoding UTF8
Write-Host "✅ Creado: start-frontend.ps1" -ForegroundColor Green

# ===============================
# 6. RESUMEN FINAL
# ===============================
Write-Host "`n🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n📁 ESTRUCTURA DEL PROYECTO:" -ForegroundColor Cyan
Write-Host "├── BD - Mysql/              (Scripts y modelo de BD)" -ForegroundColor White
Write-Host "├── GostCAM - BackendAPI/    (FastAPI + Python)" -ForegroundColor White  
Write-Host "├── GostCAM - Frontend/      (Next.js + React)" -ForegroundColor White
Write-Host "├── start-gostcam.ps1        (Iniciar todo)" -ForegroundColor White
Write-Host "├── start-backend.ps1        (Solo Backend)" -ForegroundColor White
Write-Host "└── start-frontend.ps1       (Solo Frontend)" -ForegroundColor White

Write-Host "`n🚀 COMANDOS DISPONIBLES:" -ForegroundColor Cyan
Write-Host "- .\start-gostcam.ps1        # Iniciar aplicación completa" -ForegroundColor White
Write-Host "- .\start-backend.ps1        # Solo Backend (puerto 8000)" -ForegroundColor White  
Write-Host "- .\start-frontend.ps1       # Solo Frontend (puerto 3000)" -ForegroundColor White

Write-Host "`n🌐 URLS IMPORTANTES:" -ForegroundColor Cyan
Write-Host "- Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "- API Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host "- API Redoc:    http://localhost:8000/redoc" -ForegroundColor White

Write-Host "`n✅ ¡ENTORNO LISTO PARA DESARROLLO!" -ForegroundColor Green
Write-Host "Ejecuta .\start-gostcam.ps1 para comenzar" -ForegroundColor Yellow

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")