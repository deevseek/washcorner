// Fungsi helper untuk database operations yang mendukung MySQL dan PostgreSQL

import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import * as fs from 'fs';
import * as path from 'path';
import { 
  users, 
  customers, 
  services 
} from "@shared/schema";

// Fungsi sederhana untuk mendeteksi database dari environment variable
export function isUsingMySQL() {
  return process.env.USE_MYSQL === 'true';
}

// Alias untuk konsistensi kode
export function shouldUseMySQL() {
  return isUsingMySQL();
}

// Fungsi ini tetap disimpan untuk kompatibilitas dengan kode yang ada
// tapi implementasinya disederhanakan
export function setActualDatabaseType(type: 'mysql' | 'postgresql') {
  console.log(`🔍 Database digunakan: ${type}`);
  // Tidak menyimpan state untuk menghindari kesalahan
}

// Fungsi tambahan untuk memeriksa apakah database sudah diisi data
export function checkDatabaseHasData() {
  return new Promise(async (resolve) => {
    try {
      // Cek jumlah data di beberapa tabel utama
      const usersResult = await db.select({ count: sql`COUNT(*)` }).from(users);
      const customersResult = await db.select({ count: sql`COUNT(*)` }).from(customers);
      const servicesResult = await db.select({ count: sql`COUNT(*)` }).from(services);
      
      const hasData = 
        (usersResult?.[0]?.count || 0) > 0 ||
        (customersResult?.[0]?.count || 0) > 0 ||
        (servicesResult?.[0]?.count || 0) > 0;
      
      if (!hasData && isUsingMySQL()) {
        console.log('⚠️ Database kosong, mungkin perlu import data dari wash_corner.sql');
        console.log('⚠️ Jalankan: node import-mysql-data.cjs (Windows) atau node import-mysql-data.js (Linux/Mac)');
      }
      
      resolve(hasData);
    } catch (err) {
      console.error('Error saat memeriksa data database:', err);
      resolve(false);
    }
  });
}

// Fungsi untuk handle insert yang compatible dengan MySQL dan PostgreSQL
export async function dbInsert(table: any, data: any) {
  try {
    if (isUsingMySQL()) {
      console.log(`Menggunakan metode MySQL untuk insert ke ${table.name || 'table'}`);
      // Cara MySQL (tanpa .returning())
      const result = await db.insert(table).values(data);
      const newId = result[0].insertId;
      
      // Fetch record yang baru dibuat dengan query terpisah
      const [newRecord] = await db.select().from(table).where(eq(table.id, newId));
      return newRecord;
    } else {
      console.log(`Menggunakan metode PostgreSQL untuk insert ke ${table.name || 'table'}`);
      // Cara PostgreSQL (dengan .returning())
      const [newRecord] = await db.insert(table).values(data).returning();
      return newRecord;
    }
  } catch (error) {
    console.error(`Error dalam dbInsert:`, error);
    throw error;
  }
}

// Fungsi untuk handle update yang compatible dengan MySQL dan PostgreSQL
export async function dbUpdate(table: any, data: any, condition: any) {
  try {
    if (isUsingMySQL()) {
      console.log(`Menggunakan metode MySQL untuk update`);
      // Cara MySQL (tanpa .returning())
      await db.update(table).set(data).where(condition);
      
      // Fetch record yang diupdate dengan query terpisah
      const [updatedRecord] = await db.select().from(table).where(condition);
      return updatedRecord;
    } else {
      console.log(`Menggunakan metode PostgreSQL untuk update`);
      // Cara PostgreSQL (dengan .returning())
      const [updatedRecord] = await db.update(table).set(data).where(condition).returning();
      return updatedRecord;
    }
  } catch (error) {
    console.error(`Error dalam dbUpdate:`, error);
    throw error;
  }
}