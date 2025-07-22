#!/bin/bash
# Script untuk menjalankan Wash Corner di Replit

echo "==================================="
echo "Menjalankan Wash Corner di Replit"
echo "==================================="
echo

# Pastikan USE_MYSQL=false untuk menggunakan PostgreSQL
grep -q "USE_MYSQL=false" .env || (
  echo "Menyesuaikan konfigurasi untuk Replit..."
  sed -i 's/USE_MYSQL=true/USE_MYSQL=false/' .env
  echo "- .env sudah diperbarui untuk menggunakan PostgreSQL"
)

echo "Menjalankan aplikasi..."
npm run dev

echo "Aplikasi telah berhenti."