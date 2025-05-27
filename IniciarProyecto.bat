@echo off
REM Script para iniciar el proyecto React con Vite y el servidor Node.js

echo Iniciando el servidor backend...
cd server
echo Instalando dependencias del servidor (si es necesario)...
call npm install
echo Iniciando servidor Node.js en una nueva ventana...
start "Servidor Backend" cmd /k "npm start"
cd ..

echo.
echo Esperando unos segundos para que el servidor inicie completamente...
timeout /t 5 /nobreak > nul

echo.
echo Iniciando el cliente frontend...
cd client
echo Instalando dependencias del cliente (si es necesario)...
call npm install
echo Iniciando cliente Vite (React) en una nueva ventana...
start "Cliente Frontend (Vite)" cmd /k "npm run dev"
cd ..

echo.
echo Ambas partes del proyecto deberian estar iniciandose.
echo El servidor backend estara en una ventana llamada "Servidor Backend".
echo El cliente frontend estara en una ventana llamada "Cliente Frontend (Vite)".

pause