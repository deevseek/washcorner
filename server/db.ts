import { Pool as PgPool } from "pg";
import {
  drizzle as drizzlePg,
  NodePgDatabase,
} from "drizzle-orm/node-postgres"; // Import NodePgDatabase
import * as pgSchema from "@shared/schema";
import * as mysqlSchema from "@shared/schema-mysql";
import { PG_CONFIG, MYSQL_CONFIG } from "./db-config"; // Asumsi USE_MYSQL sudah dihandle di sini atau dari process.env
import mysql from "mysql2/promise";
import { drizzle as drizzleMysql, MySql2Database } from "drizzle-orm/mysql2"; // Import MySql2Database
import { sql } from "drizzle-orm";
// import { setActualDatabaseType } from './db-helper'; // Jika masih digunakan, pastikan ada

// Variabel untuk menyimpan instance db yang sudah diinisialisasi
// Beri tipe yang lebih spesifik jika memungkinkan, atau `any` jika benar-benar dinamis
let dbInstance:
  | NodePgDatabase<typeof pgSchema>
  | MySql2Database<typeof mysqlSchema>
  | undefined;

// Ambil nilai dari .env sekali saja di sini
const useMySQLConfig = process.env.USE_MYSQL === "true";

console.log("🚀 Database module loaded.");
console.log("USE_MYSQL from environment (db.ts):", process.env.USE_MYSQL);
console.log("Effective useMySQLConfig (db.ts):", useMySQLConfig);

const initPostgres = (): NodePgDatabase<typeof pgSchema> => {
  console.log("🔄 Initializing PostgreSQL database...");
  if (!process.env.DATABASE_URL) {
    // DATABASE_URL biasanya digunakan untuk PostgreSQL
    console.error(
      "DATABASE_URL environment variable is not set for PostgreSQL."
    );
    throw new Error("DATABASE_URL must be set for PostgreSQL connection.");
  }
  const pool = new PgPool(PG_CONFIG); // PG_CONFIG harus berisi connectionString dari DATABASE_URL atau detail lainnya
  const postgresDb = drizzlePg(pool, { schema: pgSchema });
  console.log("✅ PostgreSQL Drizzle instance created.");
  // setActualDatabaseType('postgres'); // Jika Anda punya helper ini
  return postgresDb;
};

const initMysql = async (): Promise<MySql2Database<typeof mysqlSchema>> => {
  console.log("🔄 Initializing MySQL database...");
  try {
    console.log("Attempting MySQL connection with config:", {
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      database: MYSQL_CONFIG.database,
      // Jangan log password
    });
    const connection = await mysql.createConnection({
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      database: MYSQL_CONFIG.database,
      connectTimeout: 10000,
    });
    console.log("✅ MySQL connection successful.");
    const mysqlDb = drizzleMysql(connection, {
      schema: mysqlSchema,
      mode: "default",
    });
    console.log("✅ MySQL Drizzle instance created.");
    // setActualDatabaseType('mysql'); // Jika Anda punya helper ini
    return mysqlDb;
  } catch (error) {
    console.error("❌ Failed to initialize MySQL Drizzle instance:", error);
    throw error;
  }
};

// Fungsi utama yang akan dipanggil dari server/index.ts
export async function initializeDatabaseConnection() {
  if (dbInstance) {
    console.log("ℹ️ Database connection already initialized.");
    return dbInstance;
  }

  console.log(
    "🚀 Attempting to initialize database connection (from initializeDatabaseConnection)..."
  );

  if (useMySQLConfig) {
    try {
      dbInstance = await initMysql();
      console.log("✅ MySQL database is ready to use.");
    } catch (mysqlError) {
      console.error(
        "❌❌❌ CRITICAL: MySQL initialization failed.",
        mysqlError
      );
      // Opsi fallback ke PostgreSQL jika MySQL gagal dan DATABASE_URL ada
      if (process.env.DATABASE_URL && PG_CONFIG.connectionString) {
        // Pastikan PG_CONFIG juga valid
        console.warn(
          "⚠️ MySQL failed, attempting to fallback to PostgreSQL..."
        );
        try {
          dbInstance = initPostgres(); // initPostgres adalah sinkron jika pool sudah ada
          console.log(
            "✅ Fallback to PostgreSQL successful. PostgreSQL is ready to use."
          );
        } catch (pgError) {
          console.error(
            "❌❌❌ CRITICAL: Fallback to PostgreSQL also failed.",
            pgError
          );
          throw new Error(
            "Failed to initialize any database connection (MySQL then PostgreSQL)."
          );
        }
      } else {
        console.error(
          "❌ No PostgreSQL fallback possible (DATABASE_URL or PG_CONFIG missing)."
        );
        throw new Error(
          "Failed to initialize MySQL database connection and no fallback available."
        );
      }
    }
  } else {
    // Jika tidak menggunakan MySQL, berarti menggunakan PostgreSQL
    if (!process.env.DATABASE_URL && !PG_CONFIG.connectionString) {
      console.error(
        "❌ PostgreSQL selected, but DATABASE_URL or PG_CONFIG.connectionString is not set."
      );
      throw new Error("PostgreSQL configuration is missing.");
    }
    try {
      dbInstance = initPostgres();
      console.log("✅ PostgreSQL database is ready to use.");
    } catch (pgError) {
      console.error(
        "❌❌❌ CRITICAL: PostgreSQL initialization failed.",
        pgError
      );
      throw new Error("Failed to initialize PostgreSQL database connection.");
    }
  }

  if (!dbInstance) {
    throw new Error("Database instance could not be initialized.");
  }

  // Lakukan query tes sederhana untuk memastikan koneksi benar-benar aktif
  try {
    console.log("🧪 Performing a test query on the initialized database...");
    // @ts-ignore // Sementara untuk mengatasi masalah tipe dinamis dbInstance
    await dbInstance.select({ test: sql`1` }); // Anda mungkin perlu import `sql` dari drizzle-orm
    console.log("✅ Test query successful. Database is live.");
  } catch (testQueryError) {
    console.error(
      "❌ Test query failed after Drizzle instance creation:",
      testQueryError
    );
    throw new Error(
      "Database test query failed, connection might not be fully live."
    );
  }

  return dbInstance;
}

// Ekspor instance db yang akan diisi oleh initializeDatabaseConnection
// Modul lain yang mengimpor 'db' akan mendapatkan instance ini setelah diinisialisasi.
export { dbInstance as db };
