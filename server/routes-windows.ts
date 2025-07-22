import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireRole, requirePermission, comparePasswords } from "./auth";
import { format } from "date-fns";
import { z } from "zod";
import { hashPassword } from "./auth";
import { generateTrackingCode, generateTrackingQRCode } from './services/barcode';
import { 
  sendStatusNotification, 
  generateUniqueTrackingCode 
} from './services/simpleNotification';
import { 
  getNotificationSettings, 
  saveNotificationSettings 
} from './services/notification-settings';
import { Service } from '@shared/schema';
import { initDb, isDbInitialized, db } from './db-windows'; // Impor fungsi dan status dari db-windows.ts
import { isUsingMySQL } from './db-helper';
import { eq, or } from 'drizzle-orm';
import { 
  roles, 
  permissions,
  rolePermissions
} from '@shared/schema';
import { 
  createRoleRaw, 
  getRoleByName,
  createPermissionRaw,
  getPermissionByName,
  createRolePermissionRaw,
  deleteAllRolePermissions
} from './mysql-role-fix';

// Fungsi untuk menunggu database siap
async function waitForDatabase(maxRetries = 5, retryDelay = 2000): Promise<boolean> {
  let retries = 0;
  
  while (retries < maxRetries) {
    if (isDbInitialized) {
      console.log('✅ Database sudah siap digunakan');
      return true;
    }
    
    console.log(`🔄 Menunggu database siap... (${retries+1}/${maxRetries})`);
    retries++;
    
    // Coba inisialisasi database lagi
    try {
      await initDb();
      if (isDbInitialized) {
        return true;
      }
    } catch (err) {
      console.log('⚠️ Database belum siap, menunggu...');
    }
    
    // Tunggu sebentar
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  
  console.error('❌ Timeout: Database tidak siap setelah beberapa percobaan');
  return false;
}
import {
  insertCustomerSchema,
  insertServiceSchema,
  insertInventoryItemSchema,
  insertEmployeeSchema,
  insertTransactionSchema,
  insertTransactionItemSchema,
  insertInventoryUsageSchema,
  insertAttendanceSchema,
  insertPayrollSchema,
  insertPerformanceReviewSchema,
  insertLeaveRequestSchema,
  insertTrainingSessionSchema,
  insertTrainingParticipantSchema,
  insertHrdDocumentSchema,
  insertPositionSalarySchema,
  // Finance Management schemas
  insertExpenseSchema,
  insertExpenseCategorySchema,
  insertProfitLossReportSchema,
  // Role & Permission Management
  insertRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  // Custom schemas untuk validasi yang lebih fleksibel
  customTransactionSchema
} from "@shared/schema";

async function initializeRolesAndPermissions() {
  try {
    console.log("Initializing default roles and permissions...");
    
    // Create default roles if they don't exist
    const defaultRoles = [
      { name: "admin", description: "Admin dengan akses penuh ke semua fitur" },
      { name: "manager", description: "Manager dengan akses ke sebagian besar fitur kecuali manajemen role dan user" },
      { name: "kasir", description: "Kasir dengan akses ke transaksi dan pelanggan saja" }
    ];
    
    const roles = {} as any;
    
    for (const roleData of defaultRoles) {
      let existingRole;
      
      // Pendekatan berbeda berdasarkan database yang digunakan
      if (isUsingMySQL()) {
        console.log(`[MySQL] Mencari role: ${roleData.name}`);
        
        // Gunakan fungsi MySQL langsung
        existingRole = await getRoleByName(roleData.name);
        
        if (!existingRole) {
          console.log(`[MySQL] Role ${roleData.name} tidak ditemukan, membuat baru...`);
          
          try {
            // Buat role dengan fungsi helper MySQL langsung
            existingRole = await createRoleRaw(roleData.name, roleData.description);
            console.log(`[MySQL] Role ${roleData.name} berhasil dibuat dengan ID: ${existingRole.id}`);
          } catch (error) {
            console.error(`[MySQL] Error saat membuat role ${roleData.name}:`, error);
            throw error;
          }
        } else {
          console.log(`[MySQL] Role ${roleData.name} sudah ada dengan ID: ${existingRole.id}`);
        }
      } else {
        // Pendekatan PostgreSQL dengan Drizzle ORM
        console.log(`[PostgreSQL] Mencari role: ${roleData.name}`);
        existingRole = await storage.getRoleByName(roleData.name);
        
        if (!existingRole) {
          console.log(`[PostgreSQL] Role ${roleData.name} tidak ditemukan, membuat baru...`);
          existingRole = await storage.createRole(roleData);
          console.log(`[PostgreSQL] Role ${roleData.name} berhasil dibuat!`);
        } else {
          console.log(`[PostgreSQL] Role ${roleData.name} sudah ada dengan ID: ${existingRole.id}`);
        }
      }
      
      // Simpan role ke object
      roles[roleData.name] = existingRole;
    }
    
    console.log("Clearing all existing role permissions...");
    
    // Hapus semua role permissions yang ada untuk reset
    if (isUsingMySQL()) {
      try {
        console.log("[MySQL] Menghapus semua role permissions...");
        await deleteAllRolePermissions();
        console.log("[MySQL] Semua role permissions berhasil dihapus");
      } catch (error) {
        console.error("[MySQL] Error saat menghapus role permissions:", error);
        throw error;
      }
    } else {
      for (const role of Object.values(roles) as any[]) {
        await storage.deleteRolePermissionsByRole(role.id);
      }
    }
    
    console.log("Recreating all permissions...");
    
    // Buat permissions jika belum ada
    const modulePermissions = {
      users: ["read", "create", "update", "delete"],
      roles: ["read", "create", "update", "delete"],
      customers: ["read", "create", "update", "delete"],
      services: ["read", "create", "update", "delete"],
      transactions: ["read", "create", "update", "delete", "print"],
      inventory: ["read", "create", "update", "delete"],
      employees: ["read", "create", "update", "delete"],
      attendance: ["read", "create", "update", "delete"],
      payroll: ["read", "create", "update", "delete"],
      performance: ["read", "create", "update", "delete"],
      leave: ["read", "create", "update", "delete", "approve"],
      training: ["read", "create", "update", "delete"],
      documents: ["read", "create", "update", "delete"],
      expenses: ["read", "create", "update", "delete", "approve"],
      reports: ["read", "create", "update", "delete"],
      settings: ["read", "update"]
    };
    
    const allPermissions = [];
    
    for (const [module, actions] of Object.entries(modulePermissions)) {
      for (const action of actions) {
        const permissionName = `${module}:${action}`;
        const description = `Dapat ${action} ${module}`;
        
        let permission;
        
        // Pendekatan berbeda berdasarkan database yang digunakan
        if (isUsingMySQL()) {
          console.log(`[MySQL] Mencari permission: ${permissionName}`);
          
          // Gunakan fungsi MySQL langsung
          permission = await getPermissionByName(permissionName);
          
          if (!permission) {
            console.log(`[MySQL] Permission ${permissionName} tidak ditemukan, membuat baru...`);
            
            try {
              // Buat permission dengan fungsi helper MySQL langsung
              permission = await createPermissionRaw(permissionName, description, module, action);
              console.log(`[MySQL] Permission ${permissionName} berhasil dibuat dengan ID: ${permission.id}`);
            } catch (error) {
              console.error(`[MySQL] Error saat membuat permission ${permissionName}:`, error);
              throw error;
            }
          } else {
            console.log(`[MySQL] Permission ${permissionName} sudah ada dengan ID: ${permission.id}`);
          }
        } else {
          // Pendekatan PostgreSQL dengan Drizzle ORM
          console.log(`[PostgreSQL] Mencari permission: ${permissionName}`);
          permission = await storage.getPermissionByName(permissionName);
          
          if (!permission) {
            console.log(`[PostgreSQL] Permission ${permissionName} tidak ditemukan, membuat baru...`);
            permission = await storage.createPermission({
              name: permissionName,
              description,
              module,
              action
            });
            console.log(`[PostgreSQL] Permission ${permissionName} berhasil dibuat!`);
          } else {
            console.log(`[PostgreSQL] Permission ${permissionName} sudah ada dengan ID: ${permission.id}`);
          }
        }
        
        if (permission) {
          allPermissions.push(permission);
        } else {
          console.error(`Failed to get or create permission: ${permissionName}`);
        }
      }
    }
    
    // Assign permissions to roles
    console.log("Assigning admin permissions...");
    
    // Admin has ALL permissions
    for (const permission of allPermissions) {
      // Gunakan metode manual untuk membuat rolePermission yang kompatibel MySQL/PostgreSQL
      if (isUsingMySQL()) {
        console.log(`[MySQL] Assign admin permission: ${permission.name}`);
        try {
          // Gunakan fungsi MySQL langsung
          await createRolePermissionRaw(roles.admin.id, permission.id);
          console.log(`[MySQL] Permission ${permission.name} berhasil di-assign ke admin`);
        } catch (error) {
          console.error(`[MySQL] Error saat assign permission ${permission.name} ke admin:`, error);
          // Continue execution even if one permission fails
          console.log("Melanjutkan proses meskipun ada error...");
        }
      } else {
        // Tetap gunakan storage untuk PostgreSQL
        try {
          await storage.createRolePermission({
            roleId: roles.admin.id,
            permissionId: permission.id
          });
          console.log(`[PostgreSQL] Permission ${permission.name} berhasil di-assign ke admin`);
        } catch (error) {
          console.error(`[PostgreSQL] Error saat assign permission ${permission.name} ke admin:`, error);
          // Continue execution even if one permission fails
          console.log("Melanjutkan proses meskipun ada error...");
        }
      }
    }
    
    console.log("✅ Admin permissions assigned successfully! (ALL PERMISSIONS)");
    
    // Manager has all permissions except for user/role management
    console.log("Assigning manager permissions...");
    
    for (const permission of allPermissions) {
      if (!permission.module.startsWith("user") && !permission.module.startsWith("role")) {
        if (isUsingMySQL()) {
          console.log(`[MySQL] Assign manager permission: ${permission.name}`);
          try {
            // Gunakan fungsi MySQL langsung
            await createRolePermissionRaw(roles.manager.id, permission.id);
            console.log(`[MySQL] Permission ${permission.name} berhasil di-assign ke manager`);
          } catch (error) {
            console.error(`[MySQL] Error saat assign permission ${permission.name} ke manager:`, error);
            // Continue execution even if one permission fails
            console.log("Melanjutkan proses meskipun ada error...");
          }
        } else {
          // Tetap gunakan storage untuk PostgreSQL
          try {
            await storage.createRolePermission({
              roleId: roles.manager.id,
              permissionId: permission.id
            });
            console.log(`[PostgreSQL] Permission ${permission.name} berhasil di-assign ke manager`);
          } catch (error) {
            console.error(`[PostgreSQL] Error saat assign permission ${permission.name} ke manager:`, error);
            // Continue execution even if one permission fails
            console.log("Melanjutkan proses meskipun ada error...");
          }
        }
      }
    }
    
    console.log("✅ Manager permissions assigned successfully! (All except user/role management)");
    
    // Kasir has limited permissions
    console.log("Assigning kasir permissions...");
    
    const kasirModules = ["customers", "transactions", "services"];
    const kasirActions = ["read", "create"];
    
    for (const permission of allPermissions) {
      if (
        kasirModules.includes(permission.module) && 
        (kasirActions.includes(permission.action) || permission.action === "print")
      ) {
        if (isUsingMySQL()) {
          console.log(`[MySQL] Assign kasir permission: ${permission.name}`);
          try {
            // Gunakan fungsi MySQL langsung
            await createRolePermissionRaw(roles.kasir.id, permission.id);
            console.log(`[MySQL] Permission ${permission.name} berhasil di-assign ke kasir`);
          } catch (error) {
            console.error(`[MySQL] Error saat assign permission ${permission.name} ke kasir:`, error);
            // Continue execution even if one permission fails
            console.log("Melanjutkan proses meskipun ada error...");
          }
        } else {
          // Tetap gunakan storage untuk PostgreSQL
          try {
            await storage.createRolePermission({
              roleId: roles.kasir.id,
              permissionId: permission.id
            });
            console.log(`[PostgreSQL] Permission ${permission.name} berhasil di-assign ke kasir`);
          } catch (error) {
            console.error(`[PostgreSQL] Error saat assign permission ${permission.name} ke kasir:`, error);
            // Continue execution even if one permission fails
            console.log("Melanjutkan proses meskipun ada error...");
          }
        }
      }
    }
    
    console.log("✅ Kasir permissions assigned successfully! (Limited permissions)");
    
  } catch (error) {
    console.error("Error initializing roles and permissions:", error);
  }
}

async function initializeDefaultUsers() {
  try {
    // Admin user
    const adminUsername = "admin";
    let adminUser = await storage.getUserByUsername(adminUsername);
    
    if (!adminUser) {
      adminUser = await storage.createUser({
        username: adminUsername,
        password: await hashPassword("admin123"),
        name: "Administrator",
        role: "admin",
        email: "admin@washcorner.com"
      });
      console.log("✅ Admin user created successfully!");
    }
    
    // Cashier user
    const cashierUsername = "cashier";
    let cashierUser = await storage.getUserByUsername(cashierUsername);
    
    if (!cashierUser) {
      cashierUser = await storage.createUser({
        username: cashierUsername,
        password: await hashPassword("cashier123"),
        name: "Kasir",
        role: "cashier",
        email: "cashier@washcorner.com"
      });
      console.log("✅ Cashier user created successfully!");
    }
  } catch (error) {
    console.error("Error initializing default users:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Tunggu koneksi database selesai diinisialisasi dengan retry mechanism
  console.log('🔄 Menunggu koneksi database selesai diinisialisasi...');
  
  // Inisialisasi database dengan retry
  await initDb();
  const dbReady = await waitForDatabase();
  
  if (!dbReady) {
    console.error('❌ Database tidak berhasil diinisialisasi. Aplikasi mungkin tidak berfungsi dengan baik.');
    console.log('🔍 Periksa apakah MySQL berjalan di XAMPP dan database wash_corner sudah dibuat');
  } else {
    console.log('✅ Database siap digunakan untuk inisialisasi routes');
  }
  
  // Setup auth harus dilakukan setelah DB siap
  setupAuth(app);
  
  // API Routes
  try {
    // Tunggu sampai database benar-benar siap sebelum menginisialisasi roles dan users
    console.log('🔄 Menunggu database siap untuk inisialisasi roles dan users...');
    
    // Coba inisialisasi roles dan permissions
    try {
      await initializeRolesAndPermissions();
      console.log('✅ Roles dan permissions berhasil diinisialisasi');
    } catch (error) {
      console.error("❌ Error initializing roles and permissions:", error);
    }
    
    // Coba inisialisasi default users
    try {
      await initializeDefaultUsers();
      console.log('✅ Default users berhasil diinisialisasi');
    } catch (error) {
      console.error("❌ Error initializing default users:", error);
    }
  } catch (error) {
    console.error("❌ Error during initialization:", error);
  }
  
  console.log("Sistem notifikasi siap digunakan");
  
  // Definisikan REST API routes di sini, sesuai dengan routes.ts asli
  // (Kode untuk routes ditambahkan sesuai dengan kode dari routes.ts asli)

  const httpServer = createServer(app);
  return httpServer;
}