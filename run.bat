@echo off
title UCRIP - Unified Cyber Resource Intelligence Platform
set ROOT_DIR=%~dp0

echo ==========================================
echo    UCRIP TACTICAL COMMAND CENTER
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it to continue.
    pause
    exit /b
)

:: 1. Intelligence Engine (Backend) Setup
echo [1/4] Initializing Intelligence Engine (Backend)...
cd /d "%ROOT_DIR%server"

if not exist "node_modules\" (
    echo [INFO] Installing backend dependencies...
    call npm install
)

:: Sync Database
echo [2/4] Synchronizing Tactical Database...
call npx prisma db push

:: Seed Database
echo [3/4] Seeding Intelligence Data...
call npm run seed

:: 2. Situational Awareness (Frontend) Check
cd /d "%ROOT_DIR%client"
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

:: 3. Launch Operations
echo.
echo [4/4] Launching UCRIP Operations Center...
echo.

:: Start Backend in a new window
echo [SYSTEM] Starting Backend Server (Port 5000)...
start "UCRIP Backend" /d "%ROOT_DIR%server" npm run dev

:: Start Frontend in a new window
echo [SYSTEM] Starting Frontend Dashboard (Port 3000)...
start "UCRIP Frontend" /d "%ROOT_DIR%client" npm run dev

echo.
echo ==========================================
echo    OPERATIONS CENTER INITIALIZED
echo ==========================================
echo  Backend: http://localhost:5000
echo  Frontend: http://localhost:3000
echo ==========================================
echo.
echo Press any key to exit this launcher...
pause >nul
