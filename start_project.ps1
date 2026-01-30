# Start the Complete Flat Price Prediction Project
# This script starts both backend and frontend servers in separate windows

$ErrorActionPreference = "Continue"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   Flat Price Prediction - Project Starter" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# Check if backend and frontend directories exist
if (-not (Test-Path "backend")) {
    Write-Host "ERROR: Backend directory not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "ERROR: Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Checking MongoDB..." -ForegroundColor Cyan
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "MongoDB is running" -ForegroundColor Green
}
else {
    Write-Host "WARNING: MongoDB is not running!" -ForegroundColor Yellow
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Clean up any processes on ports 5000 and 3000
Write-Host "`nCleaning up ports..." -ForegroundColor Cyan

# Kill processes on port 5000 (backend)
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "Stopping process on port 5000: $($proc.Name)" -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force
    }
}

Start-Sleep -Seconds 2

Write-Host "Ports cleaned" -ForegroundColor Green

# Start Backend
Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\start-backend-quiet.ps1"
Write-Host "Backend starting in new window" -ForegroundColor Green

# Wait for backend to initialize
Write-Host "`nWaiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 5
    Write-Host "Backend is responding!" -ForegroundColor Green
}
catch {
    Write-Host "Backend may still be starting..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "`nStarting Frontend Server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
Write-Host "Frontend starting in new window" -ForegroundColor Green

# Summary
Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   Project Started Successfully!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:5000/api" -ForegroundColor White

Write-Host "`nTips:" -ForegroundColor Cyan
Write-Host "  - Both servers are running in separate windows" -ForegroundColor Gray
Write-Host "  - Close the windows or press Ctrl+C to stop servers" -ForegroundColor Gray
Write-Host "  - Backend logs will show in the backend window" -ForegroundColor Gray

Write-Host "`nOpen http://localhost:3000 in your browser to start!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to open browser
$openBrowser = Read-Host "Open browser now? (Y/N)"
if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
    Start-Process "http://localhost:3000"
}
