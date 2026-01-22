@echo off
chcp 65001 >nul
echo ========================================
echo   Calendar App - Docker MySQL Mode
echo ========================================
echo.

echo Checking Docker MySQL container...
docker ps | findstr "calendar-mysql" >nul
if %errorlevel% neq 0 (
    echo ERROR: Docker MySQL container not running
    echo Starting Docker MySQL container...
    docker-compose -f docker-compose-mysql-only.yml up -d
    echo Waiting for MySQL to start...
    timeout /t 10 /nobreak >nul
)

echo OK: Docker MySQL is running
echo.

echo Database Configuration:
echo   Host: localhost
echo   Port: 3307
echo   User: root
echo   Password: password123
echo   Database: calendar_app
echo.

echo Copying Docker MySQL configuration...
copy "server\.env.docker-mysql" "server\.env" >nul

echo Starting Backend Server (port 5000)...
start "Calendar Backend (Docker MySQL)" cmd /k "cd /d "f:\calendar\server" && npm run dev"

echo Waiting for backend server...
timeout /t 8 /nobreak >nul

echo Starting Frontend Server (port 3000)...
start "Calendar Frontend" cmd /k "cd /d "f:\calendar\client" && npm run dev"

echo.
echo ========================================
echo Application Started with Docker MySQL!
echo ========================================
echo.
echo Database Mode: Docker MySQL Container
echo Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:5000
echo.
echo Docker Management:
echo   View MySQL logs: docker logs calendar-mysql
echo   Stop MySQL: docker-compose -f docker-compose-mysql-only.yml down
echo.
echo Press any key to close this window...
pause >nul