@echo off
REM ---------------------------------------------------------
REM Deploy Script para Producción (Backend + Frontend) en Windows
REM ---------------------------------------------------------

echo Iniciando proceso de build...

REM 1. Build del Frontend (React + Vite)
echo [1/2] Construyendo Frontend...
cd frontend
call npm install
REM Vite usara .env.production
call npm run build
cd ..

REM 2. Build del Backend (Spring Boot)
echo [2/2] Construyendo Backend (JAR)...
cd car-sales
call mvnw.cmd clean package -DskipTests
cd ..

echo ==========================================================
echo Build completado con exito.
echo Archivos listos para produccion:
echo  - Frontend: /frontend/dist/
echo  - Backend:  /car-sales/target/car-sales-0.0.1-SNAPSHOT.jar
echo ==========================================================
pause
