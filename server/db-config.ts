// File konfigurasi untuk database
// Mendukung PostgreSQL (Replit) dan MySQL (XAMPP/localhost)

// Deteksi NODE_ENV untuk menentukan lingkungan
const isDevelopment = process.env.NODE_ENV === 'development';

// Variabel untuk menentukan apakah menggunakan MySQL atau PostgreSQL
// Di Replit, gunakan PostgreSQL (USE_MYSQL=false)
// Di Local/Windows, gunakan MySQL (USE_MYSQL=true)
export const USE_MYSQL = process.env.USE_MYSQL === 'true'; // Baca dari environment variable

console.log('Environment:', process.env.NODE_ENV);
console.log('USE_MYSQL dari env:', process.env.USE_MYSQL);
console.log('USE_MYSQL value:', USE_MYSQL);

// Konfigurasi MySQL untuk localhost (XAMPP)
export const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'wash_corner',
};

// Konfigurasi PostgreSQL menggunakan DATABASE_URL
export const PG_CONFIG = {
  connectionString: process.env.DATABASE_URL,
};