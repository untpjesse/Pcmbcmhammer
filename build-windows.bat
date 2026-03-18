@echo off
echo ===================================================
echo   BCMHammer One-Click Windows Build (VS 2026)
echo ===================================================

echo.
echo [1/5] Cleaning old build files to prevent conflicts...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"

echo.
echo [2/5] Preparing build environment...
set GYP_MSVS_VERSION=
set npm_config_msvs_version=

echo.
echo [3/5] Updating node-gyp build tools...
call npm install -g node-gyp

echo.
echo [4/5] Installing dependencies and rebuilding native modules...
call npm install electron@33.0.0 --save-dev
call npm install
call npx electron-builder install-app-deps

echo.
echo [5/5] Packaging the final .exe file...
call npm run electron:build

echo.
echo ===================================================
echo   Build Complete! 
echo   Your .exe is located in the "release" folder.
echo ===================================================
pause
