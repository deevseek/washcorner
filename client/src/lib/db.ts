import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema-mysql";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!dbInstance) {
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "wash_corner",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    dbInstance = drizzle(pool, {
      schema,
      mode: "mysql" as any, // cast supaya tidak error
    });
  }
  return dbInstance;
}
