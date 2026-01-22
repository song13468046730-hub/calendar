# Calendar App - Full Docker Deployment Startup Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Calendar App - Full Docker Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Docker environment
Write-Host "Checking Docker environment..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if (-not $dockerVersion) {
    Write-Host "ERROR: Docker not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop first" -ForegroundColor Yellow
    Write-Host "Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host "OK: Docker installed: $dockerVersion" -ForegroundColor Green
Write-Host ""

# Start Docker MySQL container
Write-Host "Starting Docker MySQL container..." -ForegroundColor Yellow
docker-compose up mysql -d

# Wait for MySQL container to start
Write-Host "Waiting for MySQL container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check MySQL container status
Write-Host "Checking MySQL container status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$mysqlStatus = docker ps --filter "name=calendar-mysql" --format "table {{.Names}}\t{{.Status}}" 2>$null
if (-not $mysqlStatus) {
    Write-Host "ERROR: Failed to check MySQL container status" -ForegroundColor Red
    Write-Host "Please check Docker manually: docker ps" -ForegroundColor Yellow
    Read-Host "Press any key to exit"
    exit 1
}

# Check if container is in the output
$containerRunning = $false
if ($mysqlStatus -match "calendar-mysql") {
    $containerRunning = $true
} else {
    # Try alternative check
    $mysqlStatusSimple = docker ps --filter "name=calendar-mysql" --format "{{.Names}}" 2>$null
    if ($mysqlStatusSimple -and $mysqlStatusSimple -match "calendar-mysql") {
        $containerRunning = $true
    }
}

if (-not $containerRunning) {
    Write-Host "ERROR: MySQL container failed to start" -ForegroundColor Red
    Write-Host "Container status output:" -ForegroundColor Yellow
    Write-Host $mysqlStatus -ForegroundColor White
    Write-Host "Please check Docker logs: docker logs calendar-mysql" -ForegroundColor Yellow
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host "OK: Docker MySQL container is running" -ForegroundColor Green
Write-Host "Container status:" -ForegroundColor Cyan
Write-Host $mysqlStatus -ForegroundColor White
Write-Host ""

# Additional health check
Write-Host "Performing health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $healthCheck = docker exec calendar-mysql mysqladmin ping -h localhost -u root -ppassword123 2>$null
    if ($healthCheck -match "mysqld is alive") {
        Write-Host "OK: MySQL is ready for connections" -ForegroundColor Green
    } else {
        Write-Host "WARNING: MySQL health check inconclusive" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Could not perform MySQL health check" -ForegroundColor Yellow
}

# Display database configuration
Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 3308" -ForegroundColor White
Write-Host "  User: root" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host "  Database: calendar_app" -ForegroundColor White
Write-Host ""

# Create Docker MySQL configuration file
Write-Host "Creating Docker MySQL configuration..." -ForegroundColor Yellow
$envContent = @"
# Docker MySQL Configuration
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Docker MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password123
DB_NAME=calendar_app
DB_PORT=3308
"@

Set-Content -Path "server\.env.docker-full" -Value $envContent
Copy-Item "server\.env.docker-full" "server\.env" -Force
Write-Host "OK: Configuration file updated" -ForegroundColor Green
Write-Host ""

# Start backend server in new PowerShell window
Write-Host "Starting Backend Server (port 5000)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$PWD\server'; npm run dev`"" -PassThru -WindowStyle Normal

# Wait for backend server to start
Write-Host "Waiting for backend server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check backend server status
$backendPort = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if (-not $backendPort) {
    Write-Host "WARNING: Backend server may be starting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check again
    $backendPort = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
    if (-not $backendPort) {
        Write-Host "ERROR: Backend server failed to start" -ForegroundColor Red
        Write-Host "Please check the server logs manually" -ForegroundColor Yellow
    }
}

if ($backendPort) {
    Write-Host "OK: Backend server is running (port 5000)" -ForegroundColor Green
}
Write-Host ""

# Start frontend server in new PowerShell window
Write-Host "Starting Frontend Server (port 3000)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"cd '$PWD\client'; npm run dev`"" -PassThru -WindowStyle Normal

# Wait for frontend server to start
Write-Host "Waiting for frontend server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check frontend server status
$frontendPort = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
if (-not $frontendPort) {
    Write-Host "WARNING: Frontend server may be starting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

if ($frontendPort) {
    Write-Host "OK: Frontend server is running (port 3000)" -ForegroundColor Green
}
Write-Host ""

# Save process information for management
Write-Host "Saving deployment information..." -ForegroundColor Yellow
$processInfo = @{
    BackendPID = $backendProcess.Id
    FrontendPID = $frontendProcess.Id
    StartTime = Get-Date
}

$processInfo | ConvertTo-Json | Set-Content "deployment-info.json"
Write-Host "OK: Deployment information saved" -ForegroundColor Green
Write-Host ""

# Display deployment completion information
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Full Docker Deployment Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Deployment Mode: Docker MySQL + Local App Services" -ForegroundColor Cyan
Write-Host ""

Write-Host "Service Status:" -ForegroundColor Yellow
Write-Host "  Docker MySQL: localhost:3308 (Container)" -ForegroundColor White
Write-Host "  Backend API: localhost:5000 (Local)" -ForegroundColor White
Write-Host "  Frontend App: localhost:3000 (Local)" -ForegroundColor White
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

Write-Host "Docker Management Commands:" -ForegroundColor Yellow
Write-Host "  View MySQL logs: docker logs calendar-mysql" -ForegroundColor White
Write-Host "  Stop MySQL: docker-compose down" -ForegroundColor White
Write-Host "  Restart MySQL: docker-compose restart mysql" -ForegroundColor White
Write-Host ""

Write-Host "App Management Commands:" -ForegroundColor Yellow
Write-Host "  Restart: .\start-docker-full.ps1" -ForegroundColor White
Write-Host "  Local Mode: .\start-app.bat" -ForegroundColor White
Write-Host "  Docker Mode: .\start-docker-mysql.bat" -ForegroundColor White
Write-Host ""

Write-Host "Usage Instructions:" -ForegroundColor Yellow
Write-Host "  1. Open browser and visit http://localhost:3000" -ForegroundColor White
Write-Host "  2. Register a new user account" -ForegroundColor White
Write-Host "  3. Login and use calendar and check-in features" -ForegroundColor White
Write-Host "  4. All data will be stored in Docker MySQL container" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")