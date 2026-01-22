@echo off
chcp 65001 >nul
echo ========================================
echo   Calendar Application - Local MySQL
echo ========================================
echo.

echo Database Configuration:
echo   Host: localhost
echo   Port: 3306
echo   User: root
echo   Password: ********
echo   Database: calendar_app
echo.

echo Starting Backend Server (port 5000)...
start "Calendar Backend" cmd /k "cd /d "f:\calendar\server" && npm run dev"

echo Waiting for backend server...
timeout /t 8 /nobreak >nul

echo Starting Frontend Server (port 3000)...
start "Calendar Frontend" cmd /k "cd /d "f:\calendar\client" && npm run dev"

echo.
echo ========================================
echo Application Started Successfully!
echo ========================================
echo.
echo Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:5000
echo.
echo Press any key to close this window...
pause >nul