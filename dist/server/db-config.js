"use strict";
// File konfigurasi untuk database
// Mendukung PostgreSQL (Replit) dan MySQL (XAMPP/localhost)
Object.defineProperty(exports, "__esModule", { value: true });
exports.PG_CONFIG = exports.MYSQL_CONFIG = exports.USE_MYSQL = void 0;
// Deteksi NODE_ENV untuk menentukan lingkungan
const isDevelopment = process.env.NODE_ENV === 'development';
// Variabel untuk menentukan apakah menggunakan MySQL atau PostgreSQL
// Di Replit, gunakan PostgreSQL (USE_MYSQL=false)
// Di Local/Windows, gunakan MySQL (USE_MYSQL=true)
exports.USE_MYSQL = process.env.USE_MYSQL === 'true';
console.log('Environment:', process.env.NODE_ENV);
console.log('USE_MYSQL dari env:', process.env.USE_MYSQL);
console.log('USE_MYSQL value:', exports.USE_MYSQL);
// Konfigurasi MySQL untuk localhost (XAMPP)
exports.MYSQL_CONFIG = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'wash_corner',
};
// Konfigurasi PostgreSQL menggunakan DATABASE_URL
exports.PG_CONFIG = {
    connectionString: process.env.DATABASE_URL,
};
