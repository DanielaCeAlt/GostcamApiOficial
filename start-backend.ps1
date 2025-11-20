# Iniciar solo Backend FastAPI
Write-Host "Iniciando Backend FastAPI..." -ForegroundColor Yellow

cd "GostCAM - BackendAPI"
& ".\.venv\Scripts\Activate.ps1"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000