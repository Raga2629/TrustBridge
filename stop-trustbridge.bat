@echo off
echo ========================================
echo   TrustBridge - Stopping Servers
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul

if errorlevel 1 (
    echo No Node.js processes found.
) else (
    echo All Node.js processes stopped!
)

echo.
echo ========================================
echo   Servers Stopped
echo ========================================
echo.
pause
