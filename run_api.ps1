# Simple API Launcher for Flat Price Prediction
param(
    [int]$Port = 5000
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         FLAT PRICE PREDICTION API - STARTUP" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  [OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Python not found!" -ForegroundColor Red
    exit 1
}

# Check Flask
Write-Host "Checking Flask..." -ForegroundColor Cyan
$flaskCheck = python -c "import flask; print('OK')" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Flask installed" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Flask not installed, installing..." -ForegroundColor Yellow
    python -m pip install flask flask-cors --quiet
}

# Check models
Write-Host "Checking models..." -ForegroundColor Cyan
$models = @("xgboost_model.pkl", "lightgbm_model.pkl", "catboost_model.pkl")
$allExist = $true
foreach ($model in $models) {
    if (Test-Path "models\$model") {
        Write-Host "  [OK] $model" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $model" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "Some models are missing. Train models first:" -ForegroundColor Yellow
    Write-Host "  python scripts\train.py" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         STARTING API SERVER ON PORT $Port" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Start API
python api\app.py
