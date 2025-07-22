import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as pgSchema from "@shared/schema";
import * as mysqlSchema from "@shared/schema-mysql";
import { USE_MYSQL, PG_CONFIG, MYSQL_CONFIG } from './db-config';
import mysql from 'mysql2/promise';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';

// Export variabel db secara langsung agar bisa diakses dari mana saja
export let db: any = null;
export let isDbInitialized = false;

// Untuk penggunaan lokal/XAMPP, kita akan selalu menggunakan MySQL
const useMySQL = USE_MYSQL || process.env.USE_MYSQL === 'true';

console.log('🚀 Inisialisasi database...');
console.log('USE_MYSQL dari db-config:', USE_MYSQL);
console.log('USE_MYSQL dari environment:', process.env.USE_MYSQL);
console.log('Nilai useMySQL yang digunakan:', useMySQL);

// Fungsi untuk menghubungkan ke MySQL dan setup DB
async function setupMysqlDb() {
  try {
    console.log('🔄 Mencoba menggunakan database MySQL...');
    console.log('Mencoba koneksi ke MySQL dengan konfigurasi:');
    console.log('- Host:', MYSQL_CONFIG.host);
    console.log('- Port:', MYSQL_CONFIG.port);
    console.log('- User:', MYSQL_CONFIG.user);
    console.log('- Database:', MYSQL_CONFIG.database);
    
    const connection = await mysql.createConnection({
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      database: MYSQL_CONFIG.database,
    });
    
    console.log('✅ Koneksi MySQL berhasil dibuat');
    
    // Inisialisasi Drizzle dengan koneksi MySQL
    const mysqlDb = drizzleMysql(connection, { schema: mysqlSchema, mode: 'default' });
    console.log('✅ Database MySQL siap digunakan');
    
    return mysqlDb;
  } catch (error) {
    console.error('❌ Gagal terhubung ke MySQL:', error);
    throw error;
  }
}

// Fungsi untuk PostgreSQL
function setupPostgresDb() {
  console.log('🔄 Menggunakan database PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  
  // Konfigurasi koneksi PostgreSQL
  const pool = new PgPool(PG_CONFIG);
  
  // Inisialisasi drizzle dengan koneksi PostgreSQL
  const postgresDb = drizzlePg(pool, { schema: pgSchema });
  console.log('✅ Database PostgreSQL siap digunakan');
  return postgresDb;
}

// Fungsi untuk mencoba koneksi berkali-kali (retry)
async function connectWithRetry(setupFn: Function, maxRetries = 3, retryDelay = 2000): Promise<any> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const connection = await setupFn();
      return connection;
    } catch (error) {
      retries++;
      console.log(`Koneksi gagal, percobaan ke-${retries} dari ${maxRetries}...`);
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Tunggu sebentar sebelum mencoba lagi
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Fungsi async untuk menginisialisasi database
export async function initDb() {
  if (isDbInitialized && db) {
    console.log('🔄 Database sudah diinisialisasi sebelumnya, menggunakan koneksi yang ada');
    return db;
  }
  
  if (useMySQL) {
    try {
      console.log('🔄 Mencoba menginisialisasi MySQL dengan retry mechanism...');
      db = await connectWithRetry(setupMysqlDb);
      console.log('✅ Koneksi MySQL berhasil dengan retry mechanism');
      isDbInitialized = true;
      return db;
    } catch (error) {
      console.error('❌ Gagal inisialisasi database MySQL setelah beberapa percobaan:', error);
      console.log('Pastikan MySQL server sudah berjalan dan database wash_corner sudah dibuat');
      console.log('Anda bisa menjalankan `node setup-mysql.cjs` untuk membuat database');
      
      if (process.env.DATABASE_URL) {
        console.log('⚠️ Falling back to PostgreSQL karena MySQL tidak tersedia');
        db = setupPostgresDb();
        isDbInitialized = true;
        return db;
      } else {
        throw error;
      }
    }
  } else {
    db = setupPostgresDb();
    isDbInitialized = true;
    return db;
  }
}