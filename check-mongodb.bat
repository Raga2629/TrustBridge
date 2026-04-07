@echo off
echo ========================================
echo   MongoDB Status Check
echo ========================================
echo.

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB is NOT installed
    echo.
    echo Download from: https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
) else (
    echo ✅ MongoDB is installed
)

echo.
echo Checking if MongoDB is running...
mongosh --eval "db.version()" >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB is NOT running
    echo.
    echo To start MongoDB, try one of these:
    echo   1. net start MongoDB
    echo   2. Open MongoDB Compass
    echo   3. mongod --dbpath "C:\data\db"
    echo.
    echo See MONGODB_FIX.md for detailed help.
) else (
    echo ✅ MongoDB is running
    echo.
    echo MongoDB Version:
    mongosh --quiet --eval "db.version()"
    echo.
    echo Checking TrustBridge database...
    mongosh --quiet --eval "use trustbridge; print('Collections: ' + db.getCollectionNames().length)"
)

echo.
echo ========================================
echo   Check Complete
echo ========================================
echo.
pause
