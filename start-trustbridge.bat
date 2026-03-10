@echo off
echo ========================================
echo   TrustBridge - Starting Servers
echo ========================================
echo.

echo [1/4] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Checking MongoDB...
mongosh --eval "db.version()" >nul 2>&1
if errorlevel 1 (
    echo MongoDB is not running. Attempting to start...
    net start MongoDB 2>nul
    if errorlevel 1 (
        echo.
        echo ========================================
        echo   WARNING: MongoDB Not Running!
        echo ========================================
        echo.
        echo MongoDB could not be started automatically.
        echo.
        echo Please start MongoDB manually:
        echo   Option 1: net start MongoDB
        echo   Option 2: Open MongoDB Compass
        echo   Option 3: mongod --dbpath "C:\data\db"
        echo.
        echo See MONGODB_FIX.md for detailed instructions.
        echo.
        echo Press any key to continue anyway...
        pause >nul
    ) else (
        echo MongoDB started successfully!
        timeout /t 3 /nobreak >nul
    )
) else (
    echo MongoDB is already running!
)

echo [3/4] Starting Backend Server...
start "TrustBridge Backend" cmd /k "cd trustbridge-backend && npm start"
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server...
start "TrustBridge Frontend" cmd /k "cd trustbridge-v2 && npm run dev"

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
