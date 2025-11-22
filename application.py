# Archivo de entrada para Azure App Service
# Azure busca 'application:app' por defecto
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)