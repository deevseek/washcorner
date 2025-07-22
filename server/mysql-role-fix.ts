// Fungsi helper untuk melakukan operasi SQL langsung untuk mendukung MySQL
// tanpa menggunakan Drizzle ORM untuk menghindari error "Cannot read properties of undefined"

import { createHash } from 'crypto';
import mysql from 'mysql2/promise';
import { MYSQL_CONFIG } from './db-config';

// Setup koneksi MySQL
let pool: mysql.Pool | null = null;

// Inisialisasi koneksi MySQL
export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool({
      host: MYSQL_CONFIG.host,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      database: MYSQL_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

// Eksekusi SQL query
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  try {
    const pool = await getPool();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
}

// Buat role
export async function createRoleRaw(name: string, description: string): Promise<any> {
  try {
    const sql = `INSERT INTO roles (name, description, created_at, updated_at) 
                VALUES (?, ?, NOW(), NOW())`;
    const result = await executeQuery(sql, [name, description]);
    
    // Ambil ID yang baru dibuat
    const insertId = result.insertId;
    
    // Get created role
    const [createdRole] = await executeQuery('SELECT * FROM roles WHERE id = ?', [insertId]);
    return createdRole;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

// Ambil role berdasarkan ID
export async function getRoleById(id: number): Promise<any> {
  try {
    const [role] = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
    return role;
  } catch (error) {
    console.error('Error getting role by ID:', error);
    throw error;
  }
}

// Ambil role berdasarkan nama
export async function getRoleByName(name: string): Promise<any> {
  try {
    const [role] = await executeQuery('SELECT * FROM roles WHERE name = ?', [name]);
    return role;
  } catch (error) {
    console.error('Error getting role by name:', error);
    throw error;
  }
}

// Buat permission
export async function createPermissionRaw(name: string, description: string, module: string, action: string): Promise<any> {
  try {
    const sql = `INSERT INTO permissions (name, description, module, action, created_at) 
                VALUES (?, ?, ?, ?, NOW())`;
    const result = await executeQuery(sql, [name, description, module, action]);
    
    // Ambil ID yang baru dibuat
    const insertId = result.insertId;
    
    // Get created permission
    const [createdPermission] = await executeQuery('SELECT * FROM permissions WHERE id = ?', [insertId]);
    return createdPermission;
  } catch (error) {
    console.error('Error creating permission:', error);
    throw error;
  }
}

// Ambil permission berdasarkan nama
export async function getPermissionByName(name: string): Promise<any> {
  try {
    const [permission] = await executeQuery('SELECT * FROM permissions WHERE name = ?', [name]);
    return permission;
  } catch (error) {
    console.error('Error getting permission by name:', error);
    throw error;
  }
}

// Buat role_permission
export async function createRolePermissionRaw(roleId: number, permissionId: number): Promise<any> {
  try {
    // Cek apakah sudah ada untuk menghindari duplicate
    const [existing] = await executeQuery(
      'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?', 
      [roleId, permissionId]
    );
    
    if (existing) {
      console.log(`Role permission entry already exists for roleId ${roleId} and permissionId ${permissionId}`);
      return existing;
    }
    
    const sql = `INSERT INTO role_permissions (role_id, permission_id, created_at) 
                VALUES (?, ?, NOW())`;
    const result = await executeQuery(sql, [roleId, permissionId]);
    
    // Ambil ID yang baru dibuat
    const insertId = result.insertId;
    
    // Get created role_permission
    const [createdRolePermission] = await executeQuery('SELECT * FROM role_permissions WHERE id = ?', [insertId]);
    return createdRolePermission;
  } catch (error) {
    console.error('Error creating role_permission:', error);
    throw error;
  }
}

// Hapus semua role_permissions untuk reset
export async function deleteAllRolePermissions(): Promise<any> {
  try {
    return await executeQuery('DELETE FROM role_permissions');
  } catch (error) {
    console.error('Error deleting all role_permissions:', error);
    throw error;
  }
}

// Buat default user (admin/password)
export async function createDefaultUserRaw(username: string, password: string, roleId: number): Promise<any> {
  try {
    // Hash password (SHA-256)
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    
    // Cek apakah user sudah ada
    const [existingUser] = await executeQuery('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUser) {
      console.log(`User ${username} already exists`);
      return existingUser;
    }
    
    const sql = `INSERT INTO users (username, password, role_id, created_at, updated_at) 
                VALUES (?, ?, ?, NOW(), NOW())`;
    const result = await executeQuery(sql, [username, hashedPassword, roleId]);
    
    // Ambil ID yang baru dibuat
    const insertId = result.insertId;
    
    // Get created user
    const [createdUser] = await executeQuery('SELECT * FROM users WHERE id = ?', [insertId]);
    return createdUser;
  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;
  }
}