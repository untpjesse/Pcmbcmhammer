@echo off
echo ===================================================
echo   BCMHammer Final Windows Build
echo ===================================================

echo.
echo [1/3] Cleaning old files...
taskkill /F /IM BCMHammer.exe /T >nul 2>&1
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"

echo.
echo [2/3] Installing dependencies and building native modules from source...
call npm install

echo.
echo [3/3] Packaging the final .exe file...
call npm run electron:build

echo.
echo ===================================================
echo   Build Complete! 
echo   Your .exe is located in the "release" folder.
echo ===================================================
pause
