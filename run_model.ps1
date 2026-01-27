# Model Operations Script
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("train", "evaluate", "predict")]
    [string]$Operation,
    
    [string]$Model = "xgboost"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         FLAT PRICE PREDICTION - $($Operation.ToUpper())" -ForegroundColor Yellow  
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

switch ($Operation) {
    "train" {
        Write-Host "Training all models..." -ForegroundColor Cyan
        python scripts\train.py
    }
    "evaluate" {
        Write-Host "Evaluating $Model model..." -ForegroundColor Cyan
        python scripts\evaluate.py --model $Model --save-predictions
    }
    "predict" {
        Write-Host "Making predictions with $Model model..." -ForegroundColor Cyan
        python scripts\predict.py data\raw\test.csv predictions.csv --model $Model
    }
}

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "Operation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Operation failed!" -ForegroundColor Red
}
