@echo off
:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges...
    goto :start
) else (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:start
echo ========================================
echo   TrustBridge - Starting Servers
echo   (Administrator Mode)
echo ========================================
echo.

echo [1/4] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Starting MongoDB...
net start MongoDB 2>nul
if errorlevel 1 (
    echo MongoDB service not found or already running.
    echo Checking if MongoDB is accessible...
    mongosh --eval "db.version()" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ========================================
        echo   WARNING: MongoDB Not Running!
        echo ========================================
        echo.
        echo Please use one of these methods:
        echo   1. Open MongoDB Compass and click Connect
        echo   2. Run: mongod --dbpath "C:\data\db"
        echo.
        echo See ADMIN_PRIVILEGES_FIX.md for help.
        echo.
        pause
        exit /b 1
    ) else (
        echo MongoDB is already running!
    )
) else (
    echo MongoDB started successfully!
    timeout /t 3 /nobreak >nul
)

echo [3/4] Starting Backend Server...
start "TrustBridge Backend" cmd /k "cd /d D:\TrustBridge\trustbridge-backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server...
start "TrustBridge Frontend" cmd /k "cd /d D:\TrustBridge\trustbridge-v2 && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two terminal windows will open.
echo Wait for both to show "running" messages.
echo.
echo Press any key to exit this window...
pause >nul
