"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const auth_1 = require("./auth");
const auth_2 = require("./auth");
const db_windows_1 = require("./db-windows"); // Impor fungsi initDb dari db-windows.ts
async function initializeRolesAndPermissions() {
    try {
        console.log("Initializing default roles and permissions...");
        // Create default roles if they don't exist
        const defaultRoles = [
            { name: "admin", description: "Admin dengan akses penuh ke semua fitur" },
            { name: "manager", description: "Manager dengan akses ke sebagian besar fitur kecuali manajemen role dan user" },
            { name: "kasir", description: "Kasir dengan akses ke transaksi dan pelanggan saja" }
        ];
        const roles = {};
        for (const roleData of defaultRoles) {
            let existingRole = await storage_1.storage.getRoleByName(roleData.name);
            if (!existingRole) {
                existingRole = await storage_1.storage.createRole(roleData);
                console.log(`Role ${roleData.name} created successfully!`);
            }
            roles[roleData.name] = existingRole;
        }
        console.log("Clearing all existing role permissions...");
        // Hapus semua role permissions yang ada untuk reset
        for (const role of Object.values(roles)) {
            await storage_1.storage.deleteRolePermissionsByRole(role.id);
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
                let permission = await storage_1.storage.getPermissionByName(permissionName);
                if (!permission) {
                    permission = await storage_1.storage.createPermission({
                        name: permissionName,
                        description,
                        module,
                        action
                    });
                }
                allPermissions.push(permission);
            }
        }
        // Assign permissions to roles
        console.log("Assigning admin permissions...");
        // Admin has ALL permissions
        for (const permission of allPermissions) {
            await storage_1.storage.createRolePermission({
                roleId: roles.admin.id,
                permissionId: permission.id
            });
        }
        console.log("✅ Admin permissions assigned successfully! (ALL PERMISSIONS)");
        // Manager has all permissions except for user/role management
        console.log("Assigning manager permissions...");
        for (const permission of allPermissions) {
            if (!permission.module.startsWith("user") && !permission.module.startsWith("role")) {
                await storage_1.storage.createRolePermission({
                    roleId: roles.manager.id,
                    permissionId: permission.id
                });
            }
        }
        console.log("✅ Manager permissions assigned successfully! (All except user/role management)");
        // Kasir has limited permissions
        console.log("Assigning kasir permissions...");
        const kasirModules = ["customers", "transactions", "services"];
        const kasirActions = ["read", "create"];
        for (const permission of allPermissions) {
            if (kasirModules.includes(permission.module) &&
                (kasirActions.includes(permission.action) || permission.action === "print")) {
                await storage_1.storage.createRolePermission({
                    roleId: roles.kasir.id,
                    permissionId: permission.id
                });
            }
        }
        console.log("✅ Kasir permissions assigned successfully! (Limited permissions)");
    }
    catch (error) {
        console.error("Error initializing roles and permissions:", error);
    }
}
async function initializeDefaultUsers() {
    try {
        // Admin user
        const adminUsername = "admin";
        let adminUser = await storage_1.storage.getUserByUsername(adminUsername);
        if (!adminUser) {
            adminUser = await storage_1.storage.createUser({
                username: adminUsername,
                password: await (0, auth_2.hashPassword)("admin123"),
                name: "Administrator",
                role: "admin",
                email: "admin@washcorner.com"
            });
            console.log("✅ Admin user created successfully!");
        }
        // Cashier user
        const cashierUsername = "cashier";
        let cashierUser = await storage_1.storage.getUserByUsername(cashierUsername);
        if (!cashierUser) {
            cashierUser = await storage_1.storage.createUser({
                username: cashierUsername,
                password: await (0, auth_2.hashPassword)("cashier123"),
                name: "Kasir",
                role: "cashier",
                email: "cashier@washcorner.com"
            });
            console.log("✅ Cashier user created successfully!");
        }
    }
    catch (error) {
        console.error("Error initializing default users:", error);
    }
}
async function registerRoutes(app) {
    // Tunggu koneksi database selesai diinisialisasi
    await (0, db_windows_1.initDb)();
    (0, auth_1.setupAuth)(app);
    // API Routes
    try {
        await initializeRolesAndPermissions();
        await initializeDefaultUsers();
    }
    catch (error) {
        console.error("Error during initialization:", error);
    }
    console.log("Sistem notifikasi siap digunakan");
    // Definisikan REST API routes di sini, sesuai dengan routes.ts asli
    // (Kode untuk routes ditambahkan sesuai dengan kode dari routes.ts asli)
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
