@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   VCX Nano Pro - Windows C++ Native One-Click Build
echo ===================================================
echo.
echo This script will build the C++ native modules (serialport, better-sqlite3)
echo for Electron and package the final Windows executable.
echo.

echo [1/6] Checking for Visual Studio Build Tools...
set "VS_FOUND=0"
if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" (
    for /f "usebackq tokens=*" %%i in (`"%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2^>nul`) do (
        set "VS_PATH=%%i"
        set "VS_FOUND=1"
    )
)

if "!VS_FOUND!"=="1" (
    echo Found Visual Studio with C++ tools at: !VS_PATH!
) else (
    echo [WARNING] Visual Studio with C++ tools not found!
    echo Native modules like serialport and better-sqlite3 require C++ build tools.
    echo Please install "Desktop development with C++" via Visual Studio Installer.
    echo.
    set /p INSTALL_VS="Would you like to download the VS Build Tools installer now? (Y/N): "
    if /i "!INSTALL_VS!"=="Y" (
        echo Downloading vs_buildtools.exe...
        curl -L -o vs_buildtools.exe "https://aka.ms/vs/17/release/vs_buildtools.exe"
        echo Launching installer... Please select "Desktop development with C++" and install.
        start vs_buildtools.exe
        echo Please restart this script after installation is complete.
        pause
        exit /b 1
    )
)

call npm config set msvs_version 2022
echo.

echo [2/6] Cleaning previous builds...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"
if exist "package-lock.json" del /f /q "package-lock.json"

echo.
echo [3/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/6] Rebuilding C++ Native Modules for Electron...
call npx electron-builder install-app-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to rebuild C++ native modules.
    echo Please ensure you have Visual Studio with C++ tools installed.
    pause
    exit /b %errorlevel%
)

echo.
echo [5/6] Building React Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend.
    pause
    exit /b %errorlevel%
)

echo.
echo [6/6] Packaging Windows Executable...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [ERROR] Failed to package executable.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   Build Complete! 
echo   Your native Windows .exe is in the "release" folder.
echo ===================================================
pause
