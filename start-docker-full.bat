@echo off
chcp 65001 >nul
echo ========================================
echo   Calendar App - Full Docker Deployment
echo ========================================
echo.

echo Checking Docker environment...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not installed or not running
    echo Please install Docker Desktop first
    echo Download: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo OK: Docker is installed
echo.

echo Starting Docker MySQL container...
docker-compose up mysql -d

echo Waiting for MySQL to start...
timeout /t 10 /nobreak >nul

echo Checking MySQL container status...
docker ps | findstr "calendar-mysql" >nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL container failed to start
    echo Please check Docker logs: docker logs calendar-mysql
    pause
    exit /b 1
)

echo OK: Docker MySQL is running on port 3308
echo.

echo Database Configuration:
echo   Host: localhost
echo   Port: 3308
echo   User: root
echo   Password: password123
echo   Database: calendar_app
echo.

echo Creating Docker MySQL configuration...
(
echo # Docker MySQL Configuration
echo NODE_ENV=development
echo PORT=5000
echo JWT_SECRET=your_jwt_secret_key_here_change_in_production
echo.
echo # Docker MySQL Database Configuration
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=password123
echo DB_NAME=calendar_app
echo DB_PORT=3308
) > "server\.env.docker-full"

copy "server\.env.docker-full" "server\.env" >nul

echo Starting Backend Server (port 5000)...
start "Calendar Backend (Docker MySQL)" cmd /k "cd /d "f:\calendar\server" && npm run dev"

echo Waiting for backend server...
timeout /t 8 /nobreak >nul

echo Starting Frontend Server (port 3000)...
start "Calendar Frontend" cmd /k "cd /d "f:\calendar\client" && npm run dev"

echo.
echo ========================================
echo Full Docker Deployment Started!
echo ========================================
echo.
echo Deployment Mode: Docker MySQL + Local App Services
echo.
echo Service Status:
echo   Docker MySQL: localhost:3308 (Container)
echo   Backend API: localhost:5000 (Local)
echo   Frontend App: localhost:3000 (Local)
echo.
echo Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:5000
echo.
echo Docker Management:
echo   View MySQL logs: docker logs calendar-mysql
echo   Stop MySQL: docker-compose down
echo   Restart MySQL: docker-compose restart mysql
echo.
echo Press any key to close this window...
pause >nul