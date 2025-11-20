# ===============================
# GOSTCAM - SCRIPT DE INICIO UNIFICADO
# ===============================

Write-Host "🚀 INICIANDO GOSTCAM - PROYECTO COMPLETO" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    }
}

# Verificar puertos
Write-Host "`n📡 VERIFICANDO PUERTOS..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "❌ Puerto 8000 (FastAPI) ya está en uso" -ForegroundColor Red
}
if (Test-Port 3000) {
    Write-Host "❌ Puerto 3000 (Next.js) ya está en uso" -ForegroundColor Red
}
Write-Host "✅ Puertos verificados" -ForegroundColor Green

# ===============================
# 1. INICIAR BACKEND FASTAPI
# ===============================
Write-Host "`n🐍 INICIANDO BACKEND FASTAPI..." -ForegroundColor Yellow

# Cambiar al directorio del backend
Set-Location "GostCAM - BackendAPI"
Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Cyan

# Verificar archivos
if (Test-Path "main.py") {
    Write-Host "✅ Archivo main.py encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo main.py NO encontrado" -ForegroundColor Red
}

# Activar entorno virtual si existe
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "🔧 Activando entorno virtual..." -ForegroundColor Cyan
    & ".\.venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️ No se encontró entorno virtual en .venv" -ForegroundColor Yellow
}

# Verificar dependencias
if (Test-Path "requirements.txt") {
    Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
    pip install -r requirements.txt --quiet
}

# Iniciar FastAPI
Write-Host "🚀 Iniciando servidor FastAPI en puerto 8000..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Normal
Write-Host "✅ Backend FastAPI iniciado" -ForegroundColor Green
Start-Sleep -Seconds 3

# Volver al directorio raíz
Set-Location ".."

# ===============================
# 2. INICIAR FRONTEND NEXT.JS
# ===============================
Write-Host "`n⚛️ INICIANDO FRONTEND NEXT.JS..." -ForegroundColor Yellow

# Cambiar al directorio del frontend
Set-Location "GostCAM - Frontend"
Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Cyan

# Verificar archivos
if (Test-Path "package.json") {
    Write-Host "✅ Archivo package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo package.json NO encontrado" -ForegroundColor Red
}

# Verificar node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias Node.js..." -ForegroundColor Cyan
    npm install
}

# Iniciar Next.js
Write-Host "🚀 Iniciando servidor Next.js en puerto 3000..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
Write-Host "✅ Frontend Next.js iniciado" -ForegroundColor Green
Start-Sleep -Seconds 2

# Volver al directorio raíz
Set-Location ".."

# ===============================
# 3. INFORMACIÓN Y MONITOREO
# ===============================
Write-Host "`n🌐 SERVICIOS DISPONIBLES:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Yellow
Write-Host "Frontend (Next.js): http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend (FastAPI):  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs (Swagger): http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host "`n🚀 ¡GOSTCAM ESTÁ LISTO!" -ForegroundColor Green
Write-Host "Puedes acceder a la aplicación en: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nPresiona cualquier tecla para cerrar este monitor..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")