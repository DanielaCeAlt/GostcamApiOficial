Write-Host "Iniciando GostCAM..." -ForegroundColor Green

# Iniciar Backend
Write-Host "Iniciando Backend FastAPI..." -ForegroundColor Yellow
Set-Location "GostCAM - BackendAPI"
Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Normal
Set-Location ".."

# Esperar un momento
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend Next.js..." -ForegroundColor Yellow
Set-Location "GostCAM - Frontend"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
Set-Location ".."

Write-Host "Servicios iniciados!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
