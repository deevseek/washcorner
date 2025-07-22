"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDb = initDb;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pgSchema = __importStar(require("@shared/schema"));
const mysqlSchema = __importStar(require("@shared/schema-mysql"));
const db_config_1 = require("./db-config");
const promise_1 = __importDefault(require("mysql2/promise"));
const mysql2_1 = require("drizzle-orm/mysql2");
let db;
// Untuk penggunaan lokal/XAMPP, kita akan selalu menggunakan MySQL
const useMySQL = db_config_1.USE_MYSQL || process.env.USE_MYSQL === 'true';
console.log('🚀 Inisialisasi database...');
console.log('USE_MYSQL dari db-config:', db_config_1.USE_MYSQL);
console.log('USE_MYSQL dari environment:', process.env.USE_MYSQL);
console.log('Nilai useMySQL yang digunakan:', useMySQL);
// Fungsi untuk menghubungkan ke MySQL dan setup DB
async function setupMysqlDb() {
    try {
        console.log('🔄 Mencoba menggunakan database MySQL...');
        console.log('Mencoba koneksi ke MySQL dengan konfigurasi:');
        console.log('- Host:', db_config_1.MYSQL_CONFIG.host);
        console.log('- Port:', db_config_1.MYSQL_CONFIG.port);
        console.log('- User:', db_config_1.MYSQL_CONFIG.user);
        console.log('- Database:', db_config_1.MYSQL_CONFIG.database);
        const connection = await promise_1.default.createConnection({
            host: db_config_1.MYSQL_CONFIG.host,
            port: db_config_1.MYSQL_CONFIG.port,
            user: db_config_1.MYSQL_CONFIG.user,
            password: db_config_1.MYSQL_CONFIG.password,
            database: db_config_1.MYSQL_CONFIG.database,
        });
        console.log('✅ Koneksi MySQL berhasil dibuat');
        // Inisialisasi Drizzle dengan koneksi MySQL
        const mysqlDb = (0, mysql2_1.drizzle)(connection, { schema: mysqlSchema, mode: 'default' });
        console.log('✅ Database MySQL siap digunakan');
        return mysqlDb;
    }
    catch (error) {
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
    const pool = new pg_1.Pool(db_config_1.PG_CONFIG);
    // Inisialisasi drizzle dengan koneksi PostgreSQL
    const postgresDb = (0, node_postgres_1.drizzle)(pool, { schema: pgSchema });
    console.log('✅ Database PostgreSQL siap digunakan');
    return postgresDb;
}
// Fungsi async untuk menginisialisasi database
async function initDb() {
    if (useMySQL) {
        try {
            exports.db = db = await setupMysqlDb();
            return db;
        }
        catch (error) {
            console.error('❌ Gagal inisialisasi database MySQL:', error);
            console.log('Pastikan MySQL server sudah berjalan dan database wash_corner sudah dibuat');
            console.log('Anda bisa menjalankan `node setup-mysql.cjs` untuk membuat database');
            if (process.env.DATABASE_URL) {
                console.log('⚠️ Falling back to PostgreSQL karena MySQL tidak tersedia');
                exports.db = db = setupPostgresDb();
                return db;
            }
            else {
                throw error;
            }
        }
    }
    else {
        exports.db = db = setupPostgresDb();
        return db;
    }
}
