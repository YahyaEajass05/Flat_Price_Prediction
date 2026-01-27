#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Interactive menu to run various project operations

.DESCRIPTION
    This script provides an interactive menu to:
    - Start the API server
    - Train models
    - Evaluate models
    - Make predictions
    - Run tests

.EXAMPLE
    .\start_project.ps1
    Shows interactive menu

.NOTES
    Author: Flat Price Prediction AI Team
    Date: January 27, 2026
#>

# Set error action preference
$ErrorActionPreference = "Stop"

# Script variables
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

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

# Function to show menu
function Show-Menu {
    Clear-Host
    Write-Separator
    Write-ColorOutput "   FLAT PRICE PREDICTION AI - PROJECT LAUNCHER" "Yellow"
    Write-Separator
    Write-Host ""
    Write-ColorOutput "   Choose an operation:" "Cyan"
    Write-Host ""
    Write-Host "   [1] Start API Server"
    Write-Host "   [2] Train Models"
    Write-Host "   [3] Evaluate Models"
    Write-Host "   [4] Make Predictions"
    Write-Host "   [5] Run Complete Pipeline (Train + Evaluate + Predict)"
    Write-Host "   [6] Test API Endpoints"
    Write-Host "   [7] Run EDA Analysis"
    Write-Host "   [8] View Project Status"
    Write-Host "   [Q] Quit"
    Write-Host ""
    Write-Separator
    Write-Host ""
}

# Function to check project status
function Get-ProjectStatus {
    Clear-Host
    Write-Separator
    Write-ColorOutput "   PROJECT STATUS" "Yellow"
    Write-Separator
    Write-Host ""
    
    # Check models
    Write-ColorOutput "Model Files:" "Cyan"
    $models = @("xgboost_model.pkl", "lightgbm_model.pkl", "catboost_model.pkl")
    foreach ($model in $models) {
        $path = Join-Path $ScriptDir "models\$model"
        if (Test-Path $path) {
            $size = (Get-Item $path).Length / 1MB
            Write-ColorOutput "  ✓ $model ($($size.ToString('0.00')) MB)" "Green"
        }
        else {
            Write-ColorOutput "  ✗ $model (not trained)" "Red"
        }
    }
    
    Write-Host ""
    Write-ColorOutput "Data Files:" "Cyan"
    $dataFiles = @("data\raw\data.csv", "data\raw\test.csv")
    foreach ($file in $dataFiles) {
        $path = Join-Path $ScriptDir $file
        if (Test-Path $path) {
            $lines = (Get-Content $path | Measure-Object -Line).Lines
            Write-ColorOutput "  ✓ $file ($lines lines)" "Green"
        }
        else {
            Write-ColorOutput "  ✗ $file (missing)" "Red"
        }
    }
    
    Write-Host ""
    Write-ColorOutput "Python Environment:" "Cyan"
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "  ✓ $pythonVersion" "Green"
        
        $packages = @("flask", "pandas", "numpy", "scikit-learn", "xgboost", "lightgbm", "catboost")
        foreach ($pkg in $packages) {
            $check = python -c "import $pkg" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "  ✓ $pkg installed" "Green"
            }
            else {
                Write-ColorOutput "  ✗ $pkg not installed" "Red"
            }
        }
    }
    catch {
        Write-ColorOutput "  ✗ Python not found" "Red"
    }
    
    Write-Host ""
    Write-Separator
    Write-Host ""
    Write-Host "Press any key to return to menu..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main menu loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            Clear-Host
            Write-ColorOutput "Starting API Server..." "Cyan"
            Write-Host ""
            & "$ScriptDir\run_api.ps1"
        }
        
        "2" {
            Clear-Host
            Write-ColorOutput "Training Models..." "Cyan"
            Write-Host ""
            & "$ScriptDir\run_model.ps1" -Operation train
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "3" {
            Clear-Host
            Write-Host "Select model to evaluate:"
            Write-Host "  [1] XGBoost"
            Write-Host "  [2] LightGBM"
            Write-Host "  [3] CatBoost"
            Write-Host ""
            $modelChoice = Read-Host "Enter choice"
            
            $modelName = switch ($modelChoice) {
                "1" { "xgboost" }
                "2" { "lightgbm" }
                "3" { "catboost" }
                default { "xgboost" }
            }
            
            Clear-Host
            Write-ColorOutput "Evaluating $modelName model..." "Cyan"
            Write-Host ""
            & "$ScriptDir\run_model.ps1" -Operation evaluate -Model $modelName -SavePredictions
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "4" {
            Clear-Host
            Write-ColorOutput "Making Predictions..." "Cyan"
            Write-Host ""
            & "$ScriptDir\run_model.ps1" -Operation predict -Model ensemble
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "5" {
            Clear-Host
            Write-ColorOutput "Running Complete Pipeline..." "Cyan"
            Write-Host ""
            & "$ScriptDir\run_model.ps1" -Operation all
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "6" {
            Clear-Host
            Write-ColorOutput "Testing API Endpoints..." "Cyan"
            Write-ColorOutput "Make sure API server is running first!" "Yellow"
            Write-Host ""
            Write-Host "Press any key to start tests..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            
            python "$ScriptDir\test_api_endpoints.py"
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "7" {
            Clear-Host
            Write-ColorOutput "Running EDA Analysis..." "Cyan"
            Write-Host ""
            python "$ScriptDir\scripts\eda_analysis.py"
            Write-Host ""
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "8" {
            Get-ProjectStatus
        }
        
        "Q" {
            Clear-Host
            Write-ColorOutput "Goodbye!" "Green"
            break
        }
        
        default {
            Write-ColorOutput "Invalid choice. Please try again." "Red"
            Start-Sleep -Seconds 2
        }
    }
} while ($choice -ne "Q")
