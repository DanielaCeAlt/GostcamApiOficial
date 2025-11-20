# ===============================
# VERIFICACIÓN RÁPIDA DEL SISTEMA GOSTCAM
# ===============================

Write-Host "🔍 VERIFICANDO ESTADO DEL SISTEMA GOSTCAM" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Yellow

# Función para verificar conectividad
function Test-Service {
    param(
        [string]$Url,
        [string]$Name,
        [int]$TimeoutSeconds = 5
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name : ACTIVO (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Name : Status $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name : NO RESPONDE ($($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Verificar puertos en uso
Write-Host "`n🔌 VERIFICANDO PUERTOS..." -ForegroundColor Cyan
$puertos = netstat -ano | findstr ":3000 :8000"
if ($puertos) {
    Write-Host "Puertos en uso:" -ForegroundColor Green
    $puertos | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "❌ No se detectaron puertos 3000 o 8000 en uso" -ForegroundColor Red
}

# Verificar servicios
Write-Host "`n🌐 VERIFICANDO SERVICIOS..." -ForegroundColor Cyan

$backendOk = Test-Service -Url "http://localhost:8000/docs" -Name "Backend FastAPI (API Docs)"
$frontendOk = Test-Service -Url "http://localhost:3000" -Name "Frontend Next.js (Aplicación)"
$equiposOk = Test-Service -Url "http://localhost:3000/equipos" -Name "Módulo de Equipos"

# Verificar procesos
Write-Host "`n⚙️ VERIFICANDO PROCESOS..." -ForegroundColor Cyan
$pythonProcesses = Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Select-Object ProcessName, Id, CPU
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object ProcessName, Id, CPU

if ($pythonProcesses) {
    Write-Host "✅ Procesos Python detectados:" -ForegroundColor Green
    $pythonProcesses | Format-Table -AutoSize
} else {
    Write-Host "⚠️ No se detectaron procesos Python (Backend)" -ForegroundColor Yellow
}

if ($nodeProcesses) {
    Write-Host "✅ Procesos Node.js detectados:" -ForegroundColor Green
    $nodeProcesses | Format-Table -AutoSize
} else {
    Write-Host "⚠️ No se detectaron procesos Node.js (Frontend)" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n📊 RESUMEN DEL SISTEMA:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Yellow

$serviciosActivos = 0
if ($backendOk) { $serviciosActivos++ }
if ($frontendOk) { $serviciosActivos++ }
if ($equiposOk) { $serviciosActivos++ }

Write-Host "Servicios activos: $serviciosActivos/3" -ForegroundColor $(if ($serviciosActivos -eq 3) { "Green" } elseif ($serviciosActivos -ge 1) { "Yellow" } else { "Red" })

if ($serviciosActivos -eq 3) {
    Write-Host "🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "🚀 ACCESOS RÁPIDOS:" -ForegroundColor Cyan
    Write-Host "• Aplicación Principal: http://localhost:3000" -ForegroundColor White
    Write-Host "• Módulo de Equipos:    http://localhost:3000/equipos" -ForegroundColor White
    Write-Host "• API Backend:          http://localhost:8000" -ForegroundColor White
    Write-Host "• Documentación API:    http://localhost:8000/docs" -ForegroundColor White
} elseif ($serviciosActivos -ge 1) {
    Write-Host "⚠️ SISTEMA PARCIALMENTE OPERATIVO" -ForegroundColor Yellow
    Write-Host "Algunos servicios pueden no estar disponibles." -ForegroundColor Yellow
} else {
    Write-Host "❌ SISTEMA NO OPERATIVO" -ForegroundColor Red
    Write-Host "Ejecute .\start-gostcam.ps1 para iniciar los servicios." -ForegroundColor Red
}

Write-Host "`n💡 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "• .\start-gostcam.ps1     - Iniciar sistema completo" -ForegroundColor White
Write-Host "• .\start-backend.ps1     - Solo Backend FastAPI" -ForegroundColor White
Write-Host "• .\start-frontend.ps1    - Solo Frontend Next.js" -ForegroundColor White
Write-Host "• .\verify-system.ps1     - Ejecutar esta verificación" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")