# Calendar App - Full Docker Deployment Stop Script

Write-Host "========================================" -ForegroundColor Red
Write-Host "  Calendar App - Stop Docker Deployment" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check deployment info file
if (Test-Path "deployment-info.json") {
    Write-Host "Reading deployment information..." -ForegroundColor Yellow
    $deploymentInfo = Get-Content "deployment-info.json" | ConvertFrom-Json
    
    # Stop backend process
    if ($deploymentInfo.BackendPID) {
        Write-Host "Stopping backend server (PID: $($deploymentInfo.BackendPID))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $deploymentInfo.BackendPID -Force -ErrorAction SilentlyContinue
            Write-Host "BACKEND SERVER STOPPED" -ForegroundColor Green
        } catch {
            Write-Host "BACKEND PROCESS MAY ALREADY BE STOPPED" -ForegroundColor Yellow
        }
    }
    
    # Stop frontend process
    if ($deploymentInfo.FrontendPID) {
        Write-Host "Stopping frontend server (PID: $($deploymentInfo.FrontendPID))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $deploymentInfo.FrontendPID -Force -ErrorAction SilentlyContinue
            Write-Host "FRONTEND SERVER STOPPED" -ForegroundColor Green
        } catch {
            Write-Host "FRONTEND PROCESS MAY ALREADY BE STOPPED" -ForegroundColor Yellow
        }
    }
    
    # Remove deployment info file
    Remove-Item "deployment-info.json" -Force -ErrorAction SilentlyContinue
    Write-Host "DEPLOYMENT INFO FILE CLEANED" -ForegroundColor Green
}

# Stop Docker MySQL container
Write-Host "Stopping Docker MySQL container..." -ForegroundColor Yellow
$mysqlStatus = docker ps --filter "name=calendar-mysql" --format "{{.Names}}" 2>$null
if ($mysqlStatus -and $mysqlStatus -match "calendar-mysql") {
    docker-compose down
    Write-Host "DOCKER MYSQL CONTAINER STOPPED" -ForegroundColor Green
} else {
    Write-Host "DOCKER MYSQL CONTAINER NOT RUNNING" -ForegroundColor Yellow
}

# Clean up port usage
Write-Host "Cleaning up port usage..." -ForegroundColor Yellow

# Stop processes on port 5000
$port5000 = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if ($port5000) {
    $pid5000 = ($port5000 -split "\s+")[-1]
    if ($pid5000 -and $pid5000 -match "^\d+$") {
        Write-Host "Stopping process on port 5000 (PID: $pid5000)..." -ForegroundColor Yellow
        Stop-Process -Id $pid5000 -Force -ErrorAction SilentlyContinue
    }
}

# Stop processes on port 3000
$port3000 = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
if ($port3000) {
    $pid3000 = ($port3000 -split "\s+")[-1]
    if ($pid3000 -and $pid3000 -match "^\d+$") {
        Write-Host "Stopping process on port 3000 (PID: $pid3000)..." -ForegroundColor Yellow
        Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "PORT CLEANUP COMPLETED" -ForegroundColor Green
Write-Host ""

# Display stop completion information
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STOPPED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Stopped Services:" -ForegroundColor Yellow
Write-Host "  Docker MySQL Container" -ForegroundColor White
Write-Host "  Backend API Server (port 5000)" -ForegroundColor White
Write-Host "  Frontend Development Server (port 3000)" -ForegroundColor White
Write-Host ""

Write-Host "Restart Commands:" -ForegroundColor Yellow
Write-Host "  Full Docker Deployment: .\start-docker-full.ps1" -ForegroundColor Cyan
Write-Host "  Local MySQL Mode: .\start-app.bat" -ForegroundColor Cyan
Write-Host "  Docker MySQL Mode: .\start-docker-mysql.bat" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")