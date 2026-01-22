# Calendar App - Full Docker Deployment Status Check Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Calendar App - Deployment Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker MySQL container status
Write-Host "Docker MySQL Container Status:" -ForegroundColor Yellow
$mysqlStatus = docker ps --filter "name=calendar-mysql" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
if ($mysqlStatus -and $mysqlStatus -match "calendar-mysql") {
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host $mysqlStatus -ForegroundColor White
    
    # Test database connection
    Write-Host ""
    Write-Host "Database Connection Test:" -ForegroundColor Yellow
    try {
        $dbTest = docker exec calendar-mysql mysql -u root -ppassword123 -e "SHOW DATABASES;" 2>$null
        if ($dbTest -and $dbTest -match "calendar_app") {
            Write-Host "CONNECTION OK" -ForegroundColor Green
            
            # Check table structure
            $tables = docker exec calendar-mysql mysql -u root -ppassword123 calendar_app -e "SHOW TABLES;" 2>$null
            if ($tables) {
                Write-Host "TABLE STRUCTURE OK" -ForegroundColor Green
                $tableCount = ($tables | Measure-Object -Line).Lines - 1
                Write-Host "   Table Count: $tableCount" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "CONNECTION FAILED" -ForegroundColor Red
    }
} else {
    Write-Host "NOT RUNNING" -ForegroundColor Red
}
Write-Host ""

# Check backend server status
Write-Host "Backend Server Status (port 5000):" -ForegroundColor Yellow
$backendPort = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if ($backendPort) {
    Write-Host "RUNNING" -ForegroundColor Green
    $pid5000 = ($backendPort -split "\s+")[-1]
    Write-Host "   Process PID: $pid5000" -ForegroundColor White
    
    # Test API connection
    Write-Host ""
    Write-Host "API Connection Test:" -ForegroundColor Yellow
    try {
        $apiResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 3
        if ($apiResponse.status -eq "ok") {
            Write-Host "API SERVICE OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "API SERVICE MAY BE STARTING" -ForegroundColor Yellow
    }
} else {
    Write-Host "NOT RUNNING" -ForegroundColor Red
}
Write-Host ""

# Check frontend server status
Write-Host "Frontend Server Status (port 3000):" -ForegroundColor Yellow
$frontendPort = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
if ($frontendPort) {
    Write-Host "RUNNING" -ForegroundColor Green
    $pid3000 = ($frontendPort -split "\s+")[-1]
    Write-Host "   Process PID: $pid3000" -ForegroundColor White
    
    # Test frontend connection
    Write-Host ""
    Write-Host "Frontend Connection Test:" -ForegroundColor Yellow
    try {
        $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 3
        if ($webResponse.StatusCode -eq 200) {
            Write-Host "FRONTEND SERVICE OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "FRONTEND SERVICE MAY BE STARTING" -ForegroundColor Yellow
    }
} else {
    Write-Host "NOT RUNNING" -ForegroundColor Red
}
Write-Host ""

# Display deployment information
Write-Host "Deployment Information:" -ForegroundColor Yellow
if (Test-Path "deployment-info.json") {
    $deploymentInfo = Get-Content "deployment-info.json" | ConvertFrom-Json
    Write-Host "   Start Time: $($deploymentInfo.StartTime)" -ForegroundColor White
    Write-Host "   Backend PID: $($deploymentInfo.BackendPID)" -ForegroundColor White
    Write-Host "   Frontend PID: $($deploymentInfo.FrontendPID)" -ForegroundColor White
} else {
    Write-Host "   No deployment info recorded" -ForegroundColor Gray
}
Write-Host ""

# Display access information
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Display management commands
Write-Host "Management Commands:" -ForegroundColor Yellow
Write-Host "   Start: .\start-docker-full.ps1" -ForegroundColor White
Write-Host "   Stop: .\stop-docker-full.ps1" -ForegroundColor White
Write-Host "   Status: .\status-docker-full.ps1" -ForegroundColor White
Write-Host "   Local Mode: .\start-app.bat" -ForegroundColor White
Write-Host "   Docker Mode: .\start-docker-mysql.bat" -ForegroundColor White
Write-Host ""

# Overall status assessment
Write-Host "Overall Status:" -ForegroundColor Yellow
$servicesRunning = 0
$totalServices = 3

if ($mysqlStatus -and $mysqlStatus -match "calendar-mysql") { $servicesRunning++ }
if ($backendPort) { $servicesRunning++ }
if ($frontendPort) { $servicesRunning++ }

if ($servicesRunning -eq $totalServices) {
    Write-Host "ALL SERVICES RUNNING ($servicesRunning/$totalServices)" -ForegroundColor Green
} elseif ($servicesRunning -gt 0) {
    Write-Host "SOME SERVICES RUNNING ($servicesRunning/$totalServices)" -ForegroundColor Yellow
} else {
    Write-Host "NO SERVICES RUNNING" -ForegroundColor Red
}
Write-Host ""

Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")