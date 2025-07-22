// Script untuk mengimpor data dari file SQL ke database MySQL
// Digunakan untuk memastikan data pada wash_corner.sql terimport dengan benar

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function importMySQLData() {
  console.log('=========================================');
  console.log('IMPORT DATA SQL KE DATABASE MYSQL');
  console.log('=========================================');
  
  const sqlFilePath = path.join(__dirname, 'wash_corner.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('File SQL tidak ditemukan:', sqlFilePath);
    return;
  }
  
  console.log('File SQL ditemukan:', sqlFilePath);
  
  // Koneksi ke MySQL
  try {
    // Cek apakah MySQL sedang berjalan
    console.log('Memeriksa koneksi MySQL...');
    
    try {
      // Coba koneksi tanpa database terlebih dahulu
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true // Penting untuk menjalankan multiple queries
      });
      
      console.log('✅ Berhasil terhubung ke server MySQL');

      // Pastikan database wash_corner ada
      await connection.query('CREATE DATABASE IF NOT EXISTS wash_corner');
      
      console.log('✅ Database wash_corner siap digunakan');
      
      // Tutup koneksi awal
      await connection.end();
      
      // Cara 1: Menggunakan mysql2 untuk membaca dan mengeksekusi file SQL
      console.log('Mengimpor data menggunakan mysql2 (Metode 1)...');
      try {
        // Buka koneksi baru dengan database yang dipilih
        const dbConnection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'wash_corner',
          multipleStatements: true
        });
        
        // Baca file SQL
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Eksekusi SQL
        await dbConnection.query(sqlContent);
        
        console.log('✅ Data berhasil diimpor menggunakan metode 1!');
        await dbConnection.end();
      } catch (importErr1) {
        console.error('❌ Gagal mengimpor data dengan metode 1:', importErr1.message);
        
        // Cara 2: Menggunakan perintah mysql CLI langsung (lebih handal untuk file SQL besar)
        console.log('\nMencoba mengimpor menggunakan perintah mysql CLI (Metode 2)...');
        try {
          const cmd = `mysql -h localhost -u root --password= wash_corner < "${sqlFilePath}"`;
          await execPromise(cmd);
          console.log('✅ Data berhasil diimpor menggunakan metode 2!');
        } catch (importErr2) {
          console.error('❌ Gagal mengimpor data dengan metode 2:', importErr2.message);
          
          console.log('\nSaran untuk import manual:');
          console.log('1. Buka XAMPP Control Panel');
          console.log('2. Klik "Shell" untuk membuka command prompt');
          console.log('3. Jalankan perintah berikut:');
          console.log(`   mysql -u root wash_corner < "${sqlFilePath.replace(/\\/g, '/')}"`);
        }
      }
      
    } catch (err) {
      console.error('❌ Gagal terhubung ke MySQL:', err.message);
      console.log('\nSaran:');
      console.log('1. Pastikan XAMPP Control Panel berjalan');
      console.log('2. Pastikan MySQL service aktif di XAMPP');
      console.log('3. Coba restart MySQL service di XAMPP');
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

importMySQLData();