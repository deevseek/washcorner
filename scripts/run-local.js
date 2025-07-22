// Script untuk menjalankan aplikasi dalam mode localhost dengan MySQL
// @ts-nocheck
/* eslint-disable */
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Path file .env dan .env-mysql
const envFilePath = path.resolve(__dirname, '../.env');
const mysqlEnvFilePath = path.resolve(__dirname, '../.env-mysql');

// Backup file .env yang saat ini (jika ada)
if (fs.existsSync(envFilePath)) {
  console.log('📦 Membuat backup file .env saat ini...');
  fs.copyFileSync(envFilePath, `${envFilePath}.backup`);
  console.log('✅ Backup file .env berhasil dibuat di .env.backup');
}

// Salin .env-mysql ke .env
console.log('🔄 Menggunakan konfigurasi MySQL...');
fs.copyFileSync(mysqlEnvFilePath, envFilePath);
console.log('✅ File .env berhasil diperbarui dengan konfigurasi MySQL');

// Jalankan npm run dev
console.log('🚀 Menjalankan aplikasi dalam mode development...');
const child = exec('npm run dev');

// Forward output dari proses ke console
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Handle exit
child.on('exit', (code) => {
  console.log(`🛑 Aplikasi berhenti dengan kode: ${code}`);
  
  // Restore .env backup jika ada
  if (fs.existsSync(`${envFilePath}.backup`)) {
    console.log('🔄 Mengembalikan file .env...');
    fs.copyFileSync(`${envFilePath}.backup`, envFilePath);
    console.log('✅ File .env berhasil dikembalikan dari backup');
  }
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Menghentikan aplikasi...');
  child.kill();
  
  // Restore .env backup jika ada
  if (fs.existsSync(`${envFilePath}.backup`)) {
    console.log('🔄 Mengembalikan file .env...');
    fs.copyFileSync(`${envFilePath}.backup`, envFilePath);
    console.log('✅ File .env berhasil dikembalikan dari backup');
  }
  
  process.exit(0);
});