@echo off
echo ==========================================
echo      BCMHammer Build Script (Windows)
echo ==========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Dependencies installed.
echo.

echo Step 2: Building application...
call npm run electron:build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Build complete!
echo.

echo The executable can be found in the 'release' folder.
echo.
pause
