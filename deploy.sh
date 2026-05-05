#!/bin/bash
# ---------------------------------------------------------
# Deploy Script para Producción (Backend + Frontend)
# ---------------------------------------------------------

echo "Iniciando proceso de build..."

# 1. Build del Frontend (React + Vite)
echo "[1/2] Construyendo Frontend..."
cd frontend
npm install
# Vite usará .env.production para inyectar las URLs correctas
npm run build
cd ..

# 2. Build del Backend (Spring Boot)
echo "[2/2] Construyendo Backend (JAR)..."
cd car-sales
# Saltamos tests en el deploy si ya pasaron en CI, opcional
./mvnw clean package -DskipTests
cd ..

echo "=========================================================="
echo "Build completado con éxito."
echo "Archivos listos para producción:"
echo " - Frontend: /frontend/dist/"
echo " - Backend:  /car-sales/target/car-sales-0.0.1-SNAPSHOT.jar"
echo "=========================================================="
