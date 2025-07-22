// Script untuk menjalankan aplikasi di Windows menggunakan cross-env
// Simpan file ini sebagai run-dev.js dan jalankan dengan: node run-dev.js

const { execSync } = require('child_process');
const os = require('os');

// Deteksi sistem operasi
const isWindows = os.platform() === 'win32';

console.log('====================================');
console.log('Wash Corner - Development Launcher');
console.log('====================================');
console.log();

try {
  // Command untuk menjalankan aplikasi
  let command;
  
  if (isWindows) {
    console.log('🖥️ Terdeteksi sistem operasi Windows');
    console.log('Menjalankan dengan cross-env...');
    command = 'cross-env NODE_ENV=development USE_MYSQL=true tsx server/index-windows.ts';
  } else {
    console.log('🖥️ Terdeteksi sistem operasi non-Windows');
    console.log('Menjalankan dengan command normal...');
    command = 'NODE_ENV=development tsx server/index.ts';
  }
  
  console.log(`\nMenjalankan: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error saat menjalankan aplikasi:', error.message);
  console.log();
  console.log('Cara menjalankan aplikasi di Windows:');
  console.log('1. Pastikan cross-env sudah diinstall: npm install -g cross-env');
  console.log('2. Jalankan: cross-env NODE_ENV=development USE_MYSQL=true tsx server/index-windows.ts');
  process.exit(1);
}