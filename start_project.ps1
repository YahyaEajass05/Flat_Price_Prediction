# Interactive Project Launcher
$ErrorActionPreference = "Stop"

function Show-Menu {
    Clear-Host
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "      FLAT PRICE PREDICTION AI - PROJECT LAUNCHER" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Start API Server" -ForegroundColor White
    Write-Host "  [2] Train Models" -ForegroundColor White
    Write-Host "  [3] Evaluate XGBoost Model" -ForegroundColor White
    Write-Host "  [4] Make Predictions" -ForegroundColor White
    Write-Host "  [5] Test API Endpoints" -ForegroundColor White
    Write-Host "  [Q] Quit" -ForegroundColor White
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            Clear-Host
            .\run_api.ps1
        }
        "2" {
            Clear-Host
            .\run_model.ps1 -Operation train
            Read-Host "`nPress Enter to continue"
        }
        "3" {
            Clear-Host
            .\run_model.ps1 -Operation evaluate -Model xgboost
            Read-Host "`nPress Enter to continue"
        }
        "4" {
            Clear-Host
            .\run_model.ps1 -Operation predict -Model ensemble
            Read-Host "`nPress Enter to continue"
        }
        "5" {
            Clear-Host
            Write-Host "Testing API..." -ForegroundColor Cyan
            python test_api_endpoints.py
            Read-Host "`nPress Enter to continue"
        }
        "Q" {
            Clear-Host
            Write-Host "Goodbye!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "Invalid choice!" -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($choice -ne "Q")
