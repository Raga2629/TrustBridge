@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe
echo.
echo All Node.js processes stopped!
echo.
echo Now you can run: npm start
pause
