#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start the Flat Price Prediction API Server

.DESCRIPTION
    This script starts the Flask API server for the Flat Price Prediction AI.
    It performs pre-flight checks and starts the server on localhost:5000

.EXAMPLE
    .\run_api.ps1
    Starts the API server with default settings

.EXAMPLE
    .\run_api.ps1 -Port 8080
    Starts the API server on port 8080

.NOTES
    Author: Flat Price Prediction AI Team
    Date: January 27, 2026
#>

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 5000,
    
    [Parameter(Mandatory=$false)]
    [switch]$Debug = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipChecks = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Script variables
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApiScript = Join-Path $ScriptDir "api\app.py"

# Function to print colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to print separator
function Write-Separator {
    Write-ColorOutput ("=" * 70) "Cyan"
}

# Header
Clear-Host
Write-Separator
Write-ColorOutput "FLAT PRICE PREDICTION API - STARTUP SCRIPT" "Yellow"
Write-Separator
Write-Host ""

# Pre-flight checks
if (-not $SkipChecks) {
    Write-ColorOutput "Running pre-flight checks..." "Cyan"
    Write-Host ""
    
    # Check 1: Python installation
    Write-Host "  [1/6] Checking Python installation..."
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "        ✓ $pythonVersion" "Green"
    }
    catch {
        Write-ColorOutput "        ✗ Python not found!" "Red"
        Write-ColorOutput "        Please install Python 3.8 or higher" "Yellow"
        exit 1
    }
    
    # Check 2: Flask installation
    Write-Host "  [2/6] Checking Flask installation..."
    try {
        $flaskCheck = python -c "import flask; print(f'Flask {flask.__version__}')" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "        ✓ $flaskCheck" "Green"
        }
        else {
            throw "Flask not installed"
        }
    }
    catch {
        Write-ColorOutput "        ✗ Flask not installed!" "Red"
        Write-ColorOutput "        Installing Flask..." "Yellow"
        python -m pip install flask flask-cors --quiet
        Write-ColorOutput "        ✓ Flask installed" "Green"
    }
    
    # Check 3: Required model files
    Write-Host "  [3/6] Checking model files..."
    $modelFiles = @(
        "models\xgboost_model.pkl",
        "models\lightgbm_model.pkl",
        "models\catboost_model.pkl",
        "models\label_encoders.pkl",
        "models\ensemble_weights.pkl"
    )
    
    $allModelsExist = $true
    foreach ($modelFile in $modelFiles) {
        $fullPath = Join-Path $ScriptDir $modelFile
        if (Test-Path $fullPath) {
            $size = (Get-Item $fullPath).Length / 1MB
            Write-ColorOutput "        ✓ $modelFile ($($size.ToString('0.00')) MB)" "Green"
        }
        else {
            Write-ColorOutput "        ✗ $modelFile missing!" "Red"
            $allModelsExist = $false
        }
    }
    
    if (-not $allModelsExist) {
        Write-Host ""
        Write-ColorOutput "  Some model files are missing. Please train the models first:" "Yellow"
        Write-ColorOutput "  python scripts\train.py" "Cyan"
        exit 1
    }
    
    # Check 4: API script exists
    Write-Host "  [4/6] Checking API script..."
    if (Test-Path $ApiScript) {
        Write-ColorOutput "        ✓ api\app.py exists" "Green"
    }
    else {
        Write-ColorOutput "        ✗ api\app.py not found!" "Red"
        exit 1
    }
    
    # Check 5: Port availability
    Write-Host "  [5/6] Checking port $Port availability..."
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        Write-ColorOutput "        ✓ Port $Port is available" "Green"
    }
    catch {
        Write-ColorOutput "        ✗ Port $Port is already in use!" "Red"
        Write-ColorOutput "        Please stop the existing service or use a different port" "Yellow"
        exit 1
    }
    
    # Check 6: Dependencies
    Write-Host "  [6/6] Checking Python dependencies..."
    $dependencies = @("pandas", "numpy", "scikit-learn", "joblib")
    $allDepsInstalled = $true
    foreach ($dep in $dependencies) {
        $check = python -c "import $dep" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "        ✓ $dep installed" "Green"
        }
        else {
            Write-ColorOutput "        ✗ $dep not installed!" "Red"
            $allDepsInstalled = $false
        }
    }
    
    if (-not $allDepsInstalled) {
        Write-Host ""
        Write-ColorOutput "  Installing missing dependencies..." "Yellow"
        python -m pip install -r requirements.txt --quiet
    }
    
    Write-Host ""
    Write-ColorOutput "✓ All pre-flight checks passed!" "Green"
    Write-Host ""
}

# Start API server
Write-Separator
Write-ColorOutput "STARTING API SERVER" "Yellow"
Write-Separator
Write-Host ""

Write-ColorOutput "Configuration:" "Cyan"
Write-Host "  • Port: $Port"
Write-Host "  • Debug Mode: $Debug"
Write-Host "  • URL: http://localhost:$Port"
Write-Host ""

Write-ColorOutput "Starting Flask application..." "Cyan"
Write-Host ""
Write-Separator
Write-Host ""

# Set environment variables if needed
if ($Port -ne 5000) {
    $env:FLASK_PORT = $Port
}

if ($Debug) {
    $env:FLASK_DEBUG = "1"
}

# Start the API
try {
    python $ApiScript
}
catch {
    Write-Host ""
    Write-ColorOutput "✗ API server stopped" "Red"
    exit 1
}

Write-Host ""
Write-ColorOutput "API server stopped gracefully" "Green"
