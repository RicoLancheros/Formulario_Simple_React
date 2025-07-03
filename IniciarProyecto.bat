@echo off
REM Script para iniciar el proyecto completo: React + Node.js + Go

echo ===========================================
echo    INICIANDO SISTEMA DE EMPLEADOS
echo ===========================================

echo.
echo 1. Iniciando el servicio de notificaciones (Go)...
cd notification-service
echo Iniciando servicio Go en una nueva ventana...
start "Servicio Notificaciones (Go)" cmd /k "go run cmd/main.go"
cd ..

echo.
echo Esperando que el servicio Go inicie...
timeout /t 3 /nobreak > nul

echo.
echo 2. Iniciando el servidor backend (Node.js)...
cd server
echo Instalando dependencias del servidor (si es necesario)...
call npm install
echo Iniciando servidor Node.js en una nueva ventana...
start "Servidor Backend (Node.js)" cmd /k "npm start"
cd ..

echo.
echo Esperando que el servidor backend inicie...
timeout /t 5 /nobreak > nul

echo.
echo 3. Iniciando el cliente frontend (React + Vite)...
cd client
echo Instalando dependencias del cliente (si es necesario)...
call npm install
echo Iniciando cliente Vite (React) en una nueva ventana...
start "Cliente Frontend (React)" cmd /k "npm run dev"
cd ..

echo.
echo ===========================================
echo    PROYECTO INICIADO COMPLETAMENTE
echo ===========================================
echo.
echo Los tres servicios estan ejecutandose:
echo.
echo [Go]      Servicio Notificaciones: http://localhost:8080
echo [Node.js] Servidor Backend:        http://localhost:3001  
echo [React]   Cliente Frontend:        http://localhost:5173
echo.
echo Para verificar el estado del servicio Go:
echo GET http://localhost:8080/api/notifications/health
echo.

pause