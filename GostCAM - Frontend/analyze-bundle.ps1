# Bundle Analysis Script para GostCAM
# Analiza el tamaño del bundle y sugiere optimizaciones

Write-Host "🔍 Analizando Bundle de GostCAM..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verificar si existe next.config.js
if (Test-Path "next.config.js") {
    Write-Host "✅ next.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ next.config.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar si existe package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Instalando herramientas de análisis..." -ForegroundColor Yellow

# Instalar @next/bundle-analyzer si no está instalado
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if (-not ($packageJson.devDependencies.'@next/bundle-analyzer')) {
    Write-Host "📦 Instalando @next/bundle-analyzer..." -ForegroundColor Yellow
    npm install --save-dev @next/bundle-analyzer
}

# Instalar webpack-bundle-analyzer si no está instalado
if (-not ($packageJson.devDependencies.'webpack-bundle-analyzer')) {
    Write-Host "📦 Instalando webpack-bundle-analyzer..." -ForegroundColor Yellow
    npm install --save-dev webpack-bundle-analyzer
}

Write-Host ""
Write-Host "🏗️ Construyendo aplicación para análisis..." -ForegroundColor Yellow

# Construir la aplicación
$env:ANALYZE = "true"
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📈 Iniciando análisis de bundle..." -ForegroundColor Yellow
    Write-Host "Se abrirá una ventana del navegador con el análisis" -ForegroundColor Gray
    
    # El análisis se debe abrir automáticamente si está configurado correctamente
    Start-Sleep -Seconds 2
    Write-Host "✅ Análisis iniciado" -ForegroundColor Green
    
} else {
    Write-Host "❌ Error durante el build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 Recomendaciones de optimización:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Busca módulos grandes en el bundle analyzer" -ForegroundColor White
Write-Host "2. Identifica dependencias duplicadas" -ForegroundColor White
Write-Host "3. Evalúa oportunidades de code splitting" -ForegroundColor White
Write-Host "4. Considera lazy loading para componentes pesados" -ForegroundColor White
Write-Host "5. Revisa si todas las dependencias son necesarias" -ForegroundColor White

Write-Host ""
Write-Host "📋 Análisis de archivos estáticos:" -ForegroundColor Yellow

# Analizar tamaño de archivos en .next/static si existe
if (Test-Path ".next/static") {
    Write-Host "📁 Contenido de .next/static:" -ForegroundColor Gray
    
    # Obtener tamaños de archivos JS
    $jsFiles = Get-ChildItem -Path ".next/static" -Recurse -Include "*.js" | Sort-Object Length -Descending
    if ($jsFiles.Count -gt 0) {
        Write-Host "`n🟡 Archivos JavaScript más grandes:" -ForegroundColor Yellow
        $jsFiles | Select-Object -First 10 | ForEach-Object {
            $sizeKB = [math]::Round($_.Length / 1KB, 2)
            Write-Host "  $($_.Name): ${sizeKB} KB" -ForegroundColor White
        }
    }
    
    # Obtener tamaños de archivos CSS
    $cssFiles = Get-ChildItem -Path ".next/static" -Recurse -Include "*.css" | Sort-Object Length -Descending
    if ($cssFiles.Count -gt 0) {
        Write-Host "`n🎨 Archivos CSS más grandes:" -ForegroundColor Yellow
        $cssFiles | Select-Object -First 5 | ForEach-Object {
            $sizeKB = [math]::Round($_.Length / 1KB, 2)
            Write-Host "  $($_.Name): ${sizeKB} KB" -ForegroundColor White
        }
    }
} else {
    Write-Host "⚠️  Directorio .next/static no encontrado. Ejecuta 'npm run build' primero." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Para optimizaciones adicionales:" -ForegroundColor Cyan
Write-Host "- Ejecuta: npm run analyze (después de configurar el script)" -ForegroundColor White
Write-Host "- Revisa: https://nextjs.org/docs/advanced-features/measuring-performance" -ForegroundColor White
Write-Host "- Considera: implementar más lazy loading y code splitting" -ForegroundColor White

Write-Host ""
Write-Host "✨ Análisis de bundle completado" -ForegroundColor Green