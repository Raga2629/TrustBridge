@echo off
echo Checking if backend is running...
echo.

curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is NOT running
    echo.
    echo To start backend:
    echo   cd trustbridge-backend
    echo   npm run dev
    echo.
) else (
    echo ✅ Backend is running on port 5000
    curl -s http://localhost:5000
    echo.
)

echo.
pause
