# VERIFICACION RAPIDA DEL SISTEMA GOSTCAM

Write-Host "VERIFICANDO ESTADO DEL SISTEMA GOSTCAM" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

# Funcion para verificar conectividad
function Test-Service {
    param(
        [string]$Url,
        [string]$Name,
        [int]$TimeoutSeconds = 5
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "OK $Name : ACTIVO (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "WARN $Name : Status $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "ERROR $Name : NO RESPONDE" -ForegroundColor Red
        return $false
    }
}

# Verificar puertos en uso
Write-Host "`nVERIFICANDO PUERTOS..." -ForegroundColor Cyan
$puertos = netstat -ano | findstr ":3000 :8000"
if ($puertos) {
    Write-Host "Puertos en uso:" -ForegroundColor Green
    $puertos | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "ERROR: No se detectaron puertos 3000 o 8000 en uso" -ForegroundColor Red
}

# Verificar servicios
Write-Host "`nVERIFICANDO SERVICIOS..." -ForegroundColor Cyan

$backendOk = Test-Service -Url "http://localhost:8000/docs" -Name "Backend FastAPI (API Docs)"
$frontendOk = Test-Service -Url "http://localhost:3000" -Name "Frontend Next.js (Aplicacion)"
$equiposOk = Test-Service -Url "http://localhost:3000/equipos" -Name "Modulo de Equipos"

# Resumen final
Write-Host "`nRESUMEN DEL SISTEMA:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Yellow

$serviciosActivos = 0
if ($backendOk) { $serviciosActivos++ }
if ($frontendOk) { $serviciosActivos++ }
if ($equiposOk) { $serviciosActivos++ }

Write-Host "Servicios activos: $serviciosActivos/3" -ForegroundColor $(if ($serviciosActivos -eq 3) { "Green" } elseif ($serviciosActivos -ge 1) { "Yellow" } else { "Red" })

if ($serviciosActivos -eq 3) {
    Write-Host "SISTEMA COMPLETAMENTE OPERATIVO!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "ACCESOS RAPIDOS:" -ForegroundColor Cyan
    Write-Host "• Aplicacion Principal: http://localhost:3000" -ForegroundColor White
    Write-Host "• Modulo de Equipos:    http://localhost:3000/equipos" -ForegroundColor White
    Write-Host "• API Backend:          http://localhost:8000" -ForegroundColor White
    Write-Host "• Documentacion API:    http://localhost:8000/docs" -ForegroundColor White
} elseif ($serviciosActivos -ge 1) {
    Write-Host "SISTEMA PARCIALMENTE OPERATIVO" -ForegroundColor Yellow
} else {
    Write-Host "SISTEMA NO OPERATIVO" -ForegroundColor Red
}

Write-Host "`nPresiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")