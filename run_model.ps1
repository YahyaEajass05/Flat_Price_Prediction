#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run model operations (training, evaluation, prediction)

.DESCRIPTION
    This script provides a convenient interface to run various model operations
    including training, evaluation, and prediction.

.PARAMETER Operation
    The operation to perform: train, evaluate, predict, or all

.PARAMETER Model
    The model to use: xgboost, lightgbm, catboost, or ensemble (for evaluation/prediction)

.PARAMETER InputFile
    Input CSV file for prediction (default: data/raw/test.csv)

.PARAMETER OutputFile
    Output CSV file for predictions (default: predictions.csv)

.EXAMPLE
    .\run_model.ps1 -Operation train
    Train all models

.EXAMPLE
    .\run_model.ps1 -Operation evaluate -Model xgboost
    Evaluate the XGBoost model

.EXAMPLE
    .\run_model.ps1 -Operation predict -Model ensemble -InputFile data/raw/test.csv
    Make predictions using ensemble model

.NOTES
    Author: Flat Price Prediction AI Team
    Date: January 27, 2026
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("train", "evaluate", "predict", "all")]
    [string]$Operation,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("xgboost", "lightgbm", "catboost", "ensemble")]
    [string]$Model = "ensemble",
    
    [Parameter(Mandatory=$false)]
    [string]$InputFile = "data\raw\test.csv",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "predictions.csv",
    
    [Parameter(Mandatory=$false)]
    [switch]$SavePredictions = $false
)

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

# Header
Clear-Host
Write-Separator
Write-ColorOutput "FLAT PRICE PREDICTION - MODEL OPERATIONS" "Yellow"
Write-Separator
Write-Host ""

# Pre-flight checks
Write-ColorOutput "Running pre-flight checks..." "Cyan"
Write-Host ""

# Check Python
Write-Host "  [1/3] Checking Python installation..."
try {
    $pythonVersion = python --version 2>&1
    Write-ColorOutput "        ✓ $pythonVersion" "Green"
}
catch {
    Write-ColorOutput "        ✗ Python not found!" "Red"
    exit 1
}

# Check data files
Write-Host "  [2/3] Checking data files..."
$dataFiles = @("data\raw\data.csv", "data\raw\test.csv")
$allDataExist = $true
foreach ($dataFile in $dataFiles) {
    $fullPath = Join-Path $ScriptDir $dataFile
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length / 1MB
        Write-ColorOutput "        ✓ $dataFile ($($size.ToString('0.00')) MB)" "Green"
    }
    else {
        Write-ColorOutput "        ✗ $dataFile missing!" "Red"
        $allDataExist = $false
    }
}

if (-not $allDataExist -and $Operation -ne "predict") {
    Write-Host ""
    Write-ColorOutput "  Some data files are missing!" "Red"
    exit 1
}

# Check scripts
Write-Host "  [3/3] Checking scripts..."
$scripts = @{
    "train" = "scripts\train.py"
    "evaluate" = "scripts\evaluate.py"
    "predict" = "scripts\predict.py"
}

foreach ($key in $scripts.Keys) {
    $scriptPath = Join-Path $ScriptDir $scripts[$key]
    if (Test-Path $scriptPath) {
        Write-ColorOutput "        ✓ $($scripts[$key]) exists" "Green"
    }
    else {
        Write-ColorOutput "        ✗ $($scripts[$key]) not found!" "Red"
        exit 1
    }
}

Write-Host ""
Write-ColorOutput "✓ All pre-flight checks passed!" "Green"
Write-Host ""

# Execute operation
Write-Separator
Write-ColorOutput "EXECUTING OPERATION: $($Operation.ToUpper())" "Yellow"
Write-Separator
Write-Host ""

switch ($Operation) {
    "train" {
        Write-ColorOutput "Training all models (XGBoost, LightGBM, CatBoost)..." "Cyan"
        Write-ColorOutput "This may take 3-5 minutes..." "Yellow"
        Write-Host ""
        
        python scripts\train.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Training completed successfully!" "Green"
        }
        else {
            Write-Host ""
            Write-ColorOutput "✗ Training failed!" "Red"
            exit 1
        }
    }
    
    "evaluate" {
        Write-ColorOutput "Evaluating $Model model..." "Cyan"
        Write-Host ""
        
        $args = @("scripts\evaluate.py", "--model", $Model)
        if ($SavePredictions) {
            $args += "--save-predictions"
        }
        
        python $args
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Evaluation completed successfully!" "Green"
        }
        else {
            Write-Host ""
            Write-ColorOutput "✗ Evaluation failed!" "Red"
            exit 1
        }
    }
    
    "predict" {
        Write-ColorOutput "Making predictions using $Model model..." "Cyan"
        Write-Host ""
        Write-ColorOutput "Input:  $InputFile" "White"
        Write-ColorOutput "Output: $OutputFile" "White"
        Write-Host ""
        
        python scripts\predict.py $InputFile $OutputFile --model $Model
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Predictions completed successfully!" "Green"
            Write-ColorOutput "✓ Output saved to: $OutputFile" "Green"
        }
        else {
            Write-Host ""
            Write-ColorOutput "✗ Prediction failed!" "Red"
            exit 1
        }
    }
    
    "all" {
        Write-ColorOutput "Running complete pipeline..." "Cyan"
        Write-Host ""
        
        # Train
        Write-ColorOutput "[1/3] Training models..." "Yellow"
        python scripts\train.py
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "✗ Training failed!" "Red"
            exit 1
        }
        Write-ColorOutput "✓ Training completed" "Green"
        Write-Host ""
        
        # Evaluate
        Write-ColorOutput "[2/3] Evaluating models..." "Yellow"
        python scripts\evaluate.py --model xgboost --save-predictions
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "✗ Evaluation failed!" "Red"
            exit 1
        }
        Write-ColorOutput "✓ Evaluation completed" "Green"
        Write-Host ""
        
        # Predict
        Write-ColorOutput "[3/3] Making predictions..." "Yellow"
        python scripts\predict.py $InputFile $OutputFile --model ensemble
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "✗ Prediction failed!" "Red"
            exit 1
        }
        Write-ColorOutput "✓ Predictions completed" "Green"
        Write-Host ""
        
        Write-ColorOutput "✓ Complete pipeline finished successfully!" "Green"
    }
}

Write-Host ""
Write-Separator
Write-ColorOutput "OPERATION COMPLETED" "Green"
Write-Separator
