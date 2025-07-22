// Script universal untuk menjalankan aplikasi Wash Corner
// Berfungsi di semua sistem operasi: Windows, Mac dan Linux
// Jalankan dengan: node start.js

import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Modules workaround untuk __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deteksi sistem operasi
const isWindows = os.platform() === 'win32';

console.log('====================================');
console.log('Wash Corner - Universal Launcher');
console.log('====================================');
console.log();

function updateEnvFile(useMySQL) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update USE_MYSQL value
    envContent = envContent.replace(
      /USE_MYSQL=(true|false)/,
      `USE_MYSQL=${useMySQL}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ File .env diperbarui dengan USE_MYSQL=${useMySQL}`);
  } catch (error) {
    console.error('❌ Error saat mengupdate file .env:', error.message);
  }
}

function checkDatabaseConnection() {
  if (isWindows) {
    console.log('⚠️ Pastikan MySQL sudah berjalan di XAMPP');
    console.log('⚠️ Pastikan database wash_corner sudah dibuat dan tabel sudah diimport');
  } else {
    console.log('ℹ️ Di Replit menggunakan PostgreSQL secara otomatis');
  }
}

try {
  // Setup berdasarkan platform
  if (isWindows) {
    console.log('🖥️ Terdeteksi sistem operasi Windows');
    console.log('Menyiapkan konfigurasi untuk Windows + MySQL...');
    
    // Update .env untuk menggunakan MySQL
    updateEnvFile('true');
    
    // Persiapkan file vite untuk Windows
    try {
      const viteWindowsPath = path.join(__dirname, 'server', 'vite-windows.ts');
      const viteTargetPath = path.join(__dirname, 'server', 'vite.ts');
      
      if (fs.existsSync(viteWindowsPath)) {
        fs.copyFileSync(viteWindowsPath, viteTargetPath);
        console.log('✅ File vite.ts diperbarui untuk Windows');
      }
    } catch (error) {
      console.error('❌ Error saat menyalin file vite.ts:', error.message);
    }
    
    // Cek database
    checkDatabaseConnection();
    
    console.log('\nMenjalankan aplikasi di Windows...');
    execSync('npx cross-env NODE_ENV=development USE_MYSQL=true tsx server/index-windows.ts', { stdio: 'inherit' });
  } else {
    console.log('🖥️ Terdeteksi sistem operasi non-Windows');
    console.log('Menyiapkan konfigurasi untuk Replit + PostgreSQL...');
    
    // Update .env untuk menggunakan PostgreSQL
    updateEnvFile('false');
    
    // Cek database
    checkDatabaseConnection();
    
    console.log('\nMenjalankan aplikasi di Replit...');
    execSync('NODE_ENV=development tsx server/index.ts', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('\n❌ Error saat menjalankan aplikasi:', error.message);
  console.log();
  console.log('Panduan Troubleshooting:');
  
  if (isWindows) {
    console.log('1. Install cross-env secara global: npm install -g cross-env');
    console.log('2. Install ts-node secara global: npm install -g ts-node');
    console.log('3. Pastikan MySQL berjalan di XAMPP');
    console.log('4. Jalankan secara manual: cross-env NODE_ENV=development USE_MYSQL=true tsx server/index-windows.ts');
    console.log('5. Jika masih error, jalankan: node --require ts-node/register server/index-windows.ts');
  } else {
    console.log('1. Pastikan Anda memiliki izin untuk menjalankan script');
    console.log('2. Jalankan secara manual: NODE_ENV=development tsx server/index.ts');
  }
  
  process.exit(1);
}