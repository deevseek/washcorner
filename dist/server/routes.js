"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const auth_1 = require("./auth");
const zod_1 = require("zod");
const auth_2 = require("./auth");
const barcode_1 = require("./services/barcode");
const simpleNotification_1 = require("./services/simpleNotification");
const notification_settings_1 = require("./services/notification-settings");
const schema_1 = require("@shared/schema");
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
        for (const roleName in roles) {
            await storage_1.storage.deleteRolePermissionsByRole(roles[roleName].id);
        }
        // Create default permissions by module
        const modules = [
            "dashboard", "customers", "services", "inventory",
            "employees", "transactions", "hrd", "finance", "settings", "users", "roles",
            "reports", "service_history"
        ];
        const actions = ["view", "create", "update", "delete", "manage"];
        // Hapus dulu semua permission yang ada dan buat ulang
        console.log("Recreating all permissions...");
        const permissions = {};
        for (const module of modules) {
            for (const action of actions) {
                const permName = `${module}:${action}`;
                // Cek jika permission sudah ada
                let existingPerm = await storage_1.storage.getPermissionByName(permName);
                if (existingPerm) {
                    // Simpan ke objek permissions untuk digunakan nanti
                    permissions[permName] = existingPerm;
                }
                else {
                    // Buat permission baru
                    const newPerm = await storage_1.storage.createPermission({
                        name: permName,
                        description: `Dapat ${action} pada modul ${module}`,
                        module,
                        action
                    });
                    permissions[permName] = newPerm;
                    console.log(`Permission ${permName} created successfully!`);
                }
            }
        }
        // ADMIN: berikan semua permission
        console.log("Assigning admin permissions...");
        for (const permName in permissions) {
            await storage_1.storage.createRolePermission({
                roleId: roles.admin.id,
                permissionId: permissions[permName].id
            });
        }
        console.log("✅ Admin permissions assigned successfully! (ALL PERMISSIONS)");
        // MANAGER: semua kecuali manajemen user/role
        console.log("Assigning manager permissions...");
        const managerRestrictedModules = ["users", "roles"];
        for (const permName in permissions) {
            const [module] = permName.split(":");
            if (!managerRestrictedModules.includes(module)) {
                await storage_1.storage.createRolePermission({
                    roleId: roles.manager.id,
                    permissionId: permissions[permName].id
                });
            }
        }
        console.log("✅ Manager permissions assigned successfully! (All except user/role management)");
        // KASIR: transaksi dan pelanggan saja
        console.log("Assigning kasir permissions...");
        const kasirAllowedPermissions = [
            "dashboard:view",
            "customers:view", "customers:create",
            "transactions:view", "transactions:create", "transactions:update",
            "services:view",
            "service_history:view"
        ];
        for (const permName of kasirAllowedPermissions) {
            if (permissions[permName]) {
                await storage_1.storage.createRolePermission({
                    roleId: roles.kasir.id,
                    permissionId: permissions[permName].id
                });
            }
            else {
                console.log(`Warning: Permission ${permName} not found for kasir role`);
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
        // Inisialisasi user admin
        const existingAdmin = await storage_1.storage.getUserByUsername("admin");
        if (!existingAdmin) {
            console.log("Initializing admin user...");
            await storage_1.storage.createUser({
                username: "admin",
                password: await (0, auth_2.hashPassword)("admin123"),
                name: "Admin Wash Corner",
                role: "admin",
                email: "admin@washcorner.com",
                phone: "0812345678"
            });
            console.log("Admin user created successfully!");
        }
        // Inisialisasi user manager
        const existingManager = await storage_1.storage.getUserByUsername("manager");
        if (!existingManager) {
            console.log("Initializing manager user...");
            await storage_1.storage.createUser({
                username: "manager",
                password: await (0, auth_2.hashPassword)("manager123"),
                name: "Manager Wash Corner",
                role: "manager",
                email: "manager@washcorner.com",
                phone: "0812345679"
            });
            console.log("Manager user created successfully!");
        }
        // Inisialisasi user kasir
        const existingKasir = await storage_1.storage.getUserByUsername("kasir");
        if (!existingKasir) {
            console.log("Initializing kasir user...");
            await storage_1.storage.createUser({
                username: "kasir",
                password: await (0, auth_2.hashPassword)("kasir123"),
                name: "Kasir Wash Corner",
                role: "kasir",
                email: "kasir@washcorner.com",
                phone: "0812345680"
            });
            console.log("Kasir user created successfully!");
        }
    }
    catch (error) {
        console.error("Error initializing default users:", error);
    }
}
async function registerRoutes(app) {
    // Inisialisasi user admin, role dan permission
    await initializeRolesAndPermissions();
    await initializeDefaultUsers();
    // Set up authentication routes
    (0, auth_1.setupAuth)(app);
    // Menampilkan pesan startup
    console.log("Sistem notifikasi siap digunakan");
    // API Routes - prefixed with /api
    // Profile routes
    app.get("/api/profile", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            // Mengambil data user yang sedang login
            res.json({
                id: req.user.id,
                username: req.user.username,
                name: req.user.name,
                role: req.user.role,
                email: req.user.email || '',
                phone: req.user.phone || '',
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching profile data" });
        }
    });
    app.put("/api/profile", async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            const { name, email, phone } = req.body;
            // Validasi data profil
            if (!name) {
                return res.status(400).json({ message: "Nama tidak boleh kosong" });
            }
            // Update profil user
            const updatedUser = await storage_1.storage.updateUser(req.user.id, {
                name,
                email: email || null,
                phone: phone || null
            });
            if (!updatedUser) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }
            res.json({
                id: updatedUser.id,
                username: updatedUser.username,
                name: updatedUser.name,
                role: updatedUser.role,
                email: updatedUser.email || '',
                phone: updatedUser.phone || '',
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error updating profile: " + error.message });
        }
    });
    app.post("/api/change-password", async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        try {
            const { currentPassword, newPassword } = req.body;
            // Validasi data
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Current password dan new password harus diisi" });
            }
            // Validasi password lama
            const user = await storage_1.storage.getUser(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }
            const passwordValid = await (0, auth_1.comparePasswords)(currentPassword, user.password);
            if (!passwordValid) {
                return res.status(400).json({ message: "Password lama tidak cocok" });
            }
            // Update password
            const hashedPassword = await (0, auth_2.hashPassword)(newPassword);
            const updatedUser = await storage_1.storage.updateUser(req.user.id, { password: hashedPassword });
            if (!updatedUser) {
                return res.status(500).json({ message: "Gagal mengubah password" });
            }
            res.json({ message: "Password berhasil diubah" });
        }
        catch (error) {
            res.status(500).json({ message: "Error changing password: " + error.message });
        }
    });
    // Dashboard stats - available to all authenticated users
    app.get("/api/dashboard/stats", (0, auth_1.requirePermission)("dashboard:view"), async (req, res) => {
        try {
            const today = new Date();
            const stats = await storage_1.storage.getDailyStats(today);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching dashboard stats" });
        }
    });
    // Customer routes
    app.get("/api/customers", async (req, res) => {
        try {
            const customers = await storage_1.storage.getCustomers();
            res.json(customers);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching customers" });
        }
    });
    app.get("/api/customers/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const customer = await storage_1.storage.getCustomer(id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.json(customer);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching customer" });
        }
    });
    app.post("/api/customers", async (req, res) => {
        try {
            const customerData = schema_1.insertCustomerSchema.parse(req.body);
            const customer = await storage_1.storage.createCustomer(customerData);
            res.status(201).json(customer);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating customer" });
        }
    });
    app.put("/api/customers/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const customerData = schema_1.insertCustomerSchema.partial().parse(req.body);
            const customer = await storage_1.storage.updateCustomer(id, customerData);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.json(customer);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating customer" });
        }
    });
    app.delete("/api/customers/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteCustomer(id);
            if (!success) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting customer" });
        }
    });
    // Service routes
    app.get("/api/services", async (req, res) => {
        try {
            const vehicleType = req.query.vehicleType;
            let services;
            if (vehicleType) {
                services = await storage_1.storage.getServicesByVehicleType(vehicleType);
            }
            else {
                services = await storage_1.storage.getServices();
            }
            // Log service data for debugging
            console.log("SERVICE DATA:", JSON.stringify(services, null, 2));
            res.json(services);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching services" });
        }
    });
    app.get("/api/services/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const service = await storage_1.storage.getService(id);
            if (!service) {
                return res.status(404).json({ message: "Service not found" });
            }
            res.json(service);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching service" });
        }
    });
    app.post("/api/services", async (req, res) => {
        try {
            const serviceData = schema_1.insertServiceSchema.parse(req.body);
            const service = await storage_1.storage.createService(serviceData);
            res.status(201).json(service);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid service data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating service" });
        }
    });
    app.put("/api/services/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const serviceData = schema_1.insertServiceSchema.partial().parse(req.body);
            const service = await storage_1.storage.updateService(id, serviceData);
            if (!service) {
                return res.status(404).json({ message: "Service not found" });
            }
            res.json(service);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid service data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating service" });
        }
    });
    app.delete("/api/services/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteService(id);
            if (!success) {
                return res.status(404).json({ message: "Service not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting service" });
        }
    });
    // Inventory routes
    app.get("/api/inventory", async (req, res) => {
        try {
            const inventoryItems = await storage_1.storage.getInventoryItems();
            res.json(inventoryItems);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching inventory items" });
        }
    });
    app.get("/api/inventory/low-stock", async (req, res) => {
        try {
            const lowStockItems = await storage_1.storage.getLowStockItems();
            res.json(lowStockItems);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching low stock items" });
        }
    });
    app.get("/api/inventory/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await storage_1.storage.getInventoryItem(id);
            if (!item) {
                return res.status(404).json({ message: "Inventory item not found" });
            }
            res.json(item);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching inventory item" });
        }
    });
    app.post("/api/inventory", async (req, res) => {
        try {
            const itemData = schema_1.insertInventoryItemSchema.parse(req.body);
            const item = await storage_1.storage.createInventoryItem(itemData);
            res.status(201).json(item);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating inventory item" });
        }
    });
    app.put("/api/inventory/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const itemData = schema_1.insertInventoryItemSchema.partial().parse(req.body);
            const item = await storage_1.storage.updateInventoryItem(id, itemData);
            if (!item) {
                return res.status(404).json({ message: "Inventory item not found" });
            }
            res.json(item);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating inventory item" });
        }
    });
    app.delete("/api/inventory/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteInventoryItem(id);
            if (!success) {
                return res.status(404).json({ message: "Inventory item not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting inventory item" });
        }
    });
    // Employee routes - restricted to admin & manager
    app.get("/api/employees", (0, auth_1.requirePermission)("employees:view"), async (req, res) => {
        try {
            const employees = await storage_1.storage.getEmployees();
            res.json(employees);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching employees" });
        }
    });
    app.get("/api/employees/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const employee = await storage_1.storage.getEmployee(id);
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }
            res.json(employee);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching employee" });
        }
    });
    app.post("/api/employees", async (req, res) => {
        try {
            console.log("Employee data received:", JSON.stringify(req.body, null, 2));
            // Untuk debugging, coba gunakan objek baru yang sudah terdefinisi dengan baik
            const employeeData = {
                name: req.body.name || "",
                position: req.body.position || "",
                email: req.body.email || null,
                phone: req.body.phone || null,
                isActive: req.body.isActive !== undefined ? req.body.isActive : true,
                // Secara eksplisit konversi joiningDate ke Date atau gunakan default date
                joiningDate: req.body.joiningDate ? new Date(req.body.joiningDate) : new Date()
            };
            console.log("Preprocessed employee data:", JSON.stringify(employeeData, null, 2));
            console.log("JoiningDate type:", typeof employeeData.joiningDate);
            console.log("JoiningDate value:", employeeData.joiningDate);
            console.log("JoiningDate instanceof Date:", employeeData.joiningDate instanceof Date);
            // Buat skema khusus untuk operasi ini
            const customEmployeeSchema = zod_1.z.object({
                name: zod_1.z.string().min(1, "Nama karyawan harus diisi"),
                position: zod_1.z.string().min(1, "Jabatan karyawan harus diisi"),
                email: zod_1.z.string().email("Format email tidak valid").optional().nullable(),
                phone: zod_1.z.string().optional().nullable(),
                isActive: zod_1.z.boolean().default(true),
                joiningDate: zod_1.z.preprocess((val) => val instanceof Date ? val : new Date(val || new Date()), zod_1.z.date({
                    required_error: "Tanggal bergabung diperlukan",
                    invalid_type_error: "Format tanggal tidak valid",
                }))
            });
            // Parse data menggunakan skema khusus
            const parsedData = customEmployeeSchema.parse(employeeData);
            console.log("Parsed employee data:", JSON.stringify(parsedData, null, 2));
            const employee = await storage_1.storage.createEmployee(parsedData);
            console.log("Employee created successfully:", JSON.stringify(employee, null, 2));
            res.status(201).json(employee);
        }
        catch (error) {
            console.error("Error creating employee:", error);
            if (error instanceof zod_1.z.ZodError) {
                console.log("Validation error details:", JSON.stringify(error.format(), null, 2));
                return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating employee" });
        }
    });
    app.put("/api/employees/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            console.log("Updating employee id:", id);
            console.log("Update data received:", JSON.stringify(req.body, null, 2));
            // Untuk debugging
            console.log("Original request body:", JSON.stringify(req.body, null, 2));
            // Buat skema khusus untuk operasi update
            const updateEmployeeSchema = zod_1.z.object({
                name: zod_1.z.string().min(1, "Nama karyawan harus diisi").optional(),
                position: zod_1.z.string().min(1, "Jabatan karyawan harus diisi").optional(),
                email: zod_1.z.string().email("Format email tidak valid").optional().nullable(),
                phone: zod_1.z.string().optional().nullable(),
                isActive: zod_1.z.boolean().optional(),
                joiningDate: zod_1.z.preprocess((val) => val instanceof Date ? val : new Date(val || new Date()), zod_1.z.date({
                    invalid_type_error: "Format tanggal tidak valid",
                })).optional()
            });
            // Parse data menggunakan skema khusus
            const parsedData = updateEmployeeSchema.parse(req.body);
            console.log("Parsed employee data:", JSON.stringify(parsedData, null, 2));
            const employee = await storage_1.storage.updateEmployee(id, parsedData);
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }
            console.log("Employee updated successfully:", JSON.stringify(employee, null, 2));
            res.json(employee);
        }
        catch (error) {
            console.error("Error updating employee:", error);
            if (error instanceof zod_1.z.ZodError) {
                console.log("Validation error:", JSON.stringify(error.errors, null, 2));
                return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating employee" });
        }
    });
    app.delete("/api/employees/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteEmployee(id);
            if (!success) {
                return res.status(404).json({ message: "Employee not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting employee" });
        }
    });
    // Transaction routes
    app.get("/api/transactions", async (req, res) => {
        try {
            console.log("GET /api/transactions called");
            const transactions = await storage_1.storage.getTransactions();
            console.log(`Retrieved ${transactions.length} transactions`);
            // Enhance transactions with customer and service details
            const enhancedTransactions = await Promise.all(transactions.map(async (transaction) => {
                // Safe access for customerId (might be null)
                let customer = null;
                if (transaction.customerId !== null) {
                    customer = await storage_1.storage.getCustomer(transaction.customerId);
                }
                const items = await storage_1.storage.getTransactionItems(transaction.id);
                console.log(`Retrieved ${items.length} items for transaction #${transaction.id}`);
                const services = await Promise.all(items.map(async (item) => {
                    // Safe access for serviceId (might be null)
                    let service = null;
                    if (item.serviceId !== null) {
                        service = await storage_1.storage.getService(item.serviceId);
                        console.log(`Retrieved service data for item #${item.id}: ${service?.name || 'N/A'}`);
                    }
                    return {
                        ...item,
                        serviceName: service?.name || 'Tidak diketahui',
                        serviceDetails: service
                    };
                }));
                return {
                    ...transaction,
                    customer,
                    items: services
                };
            }));
            res.json(enhancedTransactions);
        }
        catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).json({ message: "Error fetching transactions" });
        }
    });
    app.get("/api/transactions/recent", async (req, res) => {
        try {
            console.log("GET /api/transactions/recent called");
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const transactions = await storage_1.storage.getRecentTransactions(limit);
            console.log(`Retrieved ${transactions.length} recent transactions (limit: ${limit})`);
            // For each transaction, also get the customer and the items
            const enhancedTransactions = await Promise.all(transactions.map(async (transaction) => {
                // Safe access for customerId (might be null)
                let customer = null;
                if (transaction.customerId !== null) {
                    customer = await storage_1.storage.getCustomer(transaction.customerId);
                }
                const items = await storage_1.storage.getTransactionItems(transaction.id);
                console.log(`Retrieved ${items.length} items for recent transaction #${transaction.id}`);
                const services = await Promise.all(items.map(async (item) => {
                    // Safe access for serviceId (might be null)
                    let service = null;
                    if (item.serviceId !== null) {
                        service = await storage_1.storage.getService(item.serviceId);
                        console.log(`Retrieved service data for recent item #${item.id}: ${service?.name || 'N/A'}`);
                    }
                    return {
                        ...item,
                        serviceName: service?.name || 'Tidak diketahui',
                        serviceDetails: service
                    };
                }));
                return {
                    ...transaction,
                    customer,
                    items: services
                };
            }));
            res.json(enhancedTransactions);
        }
        catch (error) {
            console.error("Error fetching recent transactions:", error);
            res.status(500).json({ message: "Error fetching recent transactions" });
        }
    });
    app.get("/api/transactions/daily", async (req, res) => {
        try {
            const dateParam = req.query.date;
            const date = dateParam ? new Date(dateParam) : new Date();
            const transactions = await storage_1.storage.getDailyTransactions(date);
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching daily transactions" });
        }
    });
    // Endpoint untuk menghapus semua transaksi (untuk testing)
    app.delete("/api/transactions/all", async (req, res) => {
        try {
            const count = await storage_1.storage.deleteAllTransactions();
            res.json({
                message: `Semua transaksi berhasil dihapus. Total ${count} transaksi dihapus.`,
                deletedCount: count
            });
        }
        catch (error) {
            console.error("Error deleting all transactions:", error);
            res.status(500).json({ message: "Error deleting all transactions" });
        }
    });
    // ========== HRD MANAGEMENT API ROUTES ==========
    // HRD Dashboard stats
    app.get("/api/hrd/dashboard/stats", async (req, res) => {
        try {
            const stats = await storage_1.storage.getHrdDashboardStats();
            res.json(stats);
        }
        catch (error) {
            console.error("Error fetching HRD dashboard stats:", error);
            res.status(500).json({ message: "Error fetching HRD dashboard stats" });
        }
    });
    // Attendance routes
    app.get("/api/hrd/attendances", async (req, res) => {
        try {
            const dateParam = req.query.date;
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            console.log(`Fetching attendances with filters - date: ${dateParam || 'undefined'}, employeeId: ${employeeId || 'undefined'}`);
            let attendances;
            if (dateParam) {
                // Get attendances for a specific date
                const date = new Date(dateParam);
                attendances = await storage_1.storage.getAttendancesByDate(date);
            }
            else if (employeeId) {
                // Get attendances for a specific employee
                attendances = await storage_1.storage.getAttendancesByEmployee(employeeId);
            }
            else {
                // Get all attendances
                attendances = await storage_1.storage.getAttendances();
            }
            // Jika ada data absensi, tambahkan informasi karyawan
            if (attendances.length > 0) {
                const employees = await storage_1.storage.getEmployees();
                const employeeMap = new Map();
                employees.forEach(employee => {
                    employeeMap.set(employee.id, {
                        name: employee.name,
                        position: employee.position
                    });
                });
                // Tambahkan data karyawan ke setiap absensi
                attendances = attendances.map(attendance => {
                    const employee = employeeMap.get(attendance.employeeId);
                    return {
                        ...attendance,
                        employeeName: employee ? employee.name : `Karyawan ID: ${attendance.employeeId}`,
                        employeePosition: employee ? employee.position : 'Posisi tidak tersedia'
                    };
                });
            }
            console.log(`Returning ${attendances.length} attendance records`);
            res.json(attendances);
        }
        catch (error) {
            console.error("Error fetching attendances:", error);
            res.status(500).json({ message: "Error fetching attendances" });
        }
    });
    app.get("/api/hrd/attendances/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const attendance = await storage_1.storage.getAttendance(id);
            if (!attendance) {
                return res.status(404).json({ message: "Attendance record not found" });
            }
            // Tambahkan informasi karyawan
            const employee = await storage_1.storage.getEmployee(attendance.employeeId);
            // Menggabungkan data absensi dengan data karyawan
            const attendanceWithEmployee = {
                ...attendance,
                employeeName: employee ? employee.name : `Karyawan ID: ${attendance.employeeId}`,
                employeePosition: employee ? employee.position : 'Posisi tidak tersedia'
            };
            res.json(attendanceWithEmployee);
        }
        catch (error) {
            console.error("Error fetching attendance:", error);
            res.status(500).json({ message: "Error fetching attendance" });
        }
    });
    app.post("/api/hrd/attendances", async (req, res) => {
        try {
            console.log("Attendance data received:", JSON.stringify(req.body, null, 2));
            // Preprocess data untuk lebih konsisten
            const processedData = {
                employeeId: req.body.employeeId,
                date: req.body.date ? new Date(req.body.date) : new Date(),
                status: req.body.status || "present",
                checkIn: req.body.checkIn ? new Date(req.body.checkIn) : new Date(),
                checkOut: req.body.checkOut ? new Date(req.body.checkOut) : null,
                notes: req.body.notes || null
            };
            console.log("Preprocessed attendance data:", JSON.stringify(processedData, null, 2));
            // Buat skema khusus untuk lebih fleksibel dan sesuai kebutuhan
            const customAttendanceSchema = zod_1.z.object({
                employeeId: zod_1.z.number({
                    required_error: "ID karyawan harus diisi",
                    invalid_type_error: "ID karyawan harus berupa angka"
                }),
                date: zod_1.z.preprocess((val) => val instanceof Date ? val : new Date(val), zod_1.z.date({
                    required_error: "Tanggal harus diisi",
                    invalid_type_error: "Format tanggal tidak valid"
                })),
                status: zod_1.z.string().default("present"),
                checkIn: zod_1.z.preprocess((val) => val instanceof Date ? val : new Date(val), zod_1.z.date({
                    invalid_type_error: "Format waktu check-in tidak valid"
                })),
                checkOut: zod_1.z.preprocess((val) => val === null ? null : (val instanceof Date ? val : new Date(val)), zod_1.z.date({
                    invalid_type_error: "Format waktu check-out tidak valid"
                }).nullable()),
                notes: zod_1.z.string().nullable().optional()
            });
            // Parse data dengan skema kustom
            const parsedData = customAttendanceSchema.parse(processedData);
            console.log("Parsed attendance data:", JSON.stringify(parsedData, null, 2));
            const attendance = await storage_1.storage.createAttendance(parsedData);
            console.log("Attendance created successfully:", JSON.stringify(attendance, null, 2));
            // Tambahkan informasi karyawan ke respons
            const employee = await storage_1.storage.getEmployee(attendance.employeeId);
            const attendanceWithEmployee = {
                ...attendance,
                employeeName: employee ? employee.name : `Karyawan ID: ${attendance.employeeId}`,
                employeePosition: employee ? employee.position : 'Posisi tidak tersedia'
            };
            res.status(201).json(attendanceWithEmployee);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.log("Validation error details:", JSON.stringify(error.format(), null, 2));
                return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
            }
            console.error("Error creating attendance:", error);
            res.status(500).json({ message: "Error creating attendance" });
        }
    });
    app.put("/api/hrd/attendances/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            console.log("Updating attendance id:", id);
            console.log("Update data received:", JSON.stringify(req.body, null, 2));
            // Preprocess data untuk lebih konsisten
            const processedData = {
                employeeId: req.body.employeeId,
                date: req.body.date ? new Date(req.body.date) : undefined,
                status: req.body.status,
                checkIn: req.body.checkIn ? new Date(req.body.checkIn) : undefined,
                checkOut: req.body.checkOut ? new Date(req.body.checkOut) : null,
                notes: req.body.notes
            };
            console.log("Preprocessed attendance data:", JSON.stringify(processedData, null, 2));
            // Buat skema khusus untuk update (semua field opsional)
            const updateAttendanceSchema = zod_1.z.object({
                employeeId: zod_1.z.number({
                    invalid_type_error: "ID karyawan harus berupa angka"
                }).optional(),
                date: zod_1.z.preprocess((val) => val === undefined ? undefined : (val instanceof Date ? val : new Date(val)), zod_1.z.date({
                    invalid_type_error: "Format tanggal tidak valid"
                }).optional()),
                status: zod_1.z.string().optional(),
                checkIn: zod_1.z.preprocess((val) => val === undefined ? undefined : (val instanceof Date ? val : new Date(val)), zod_1.z.date({
                    invalid_type_error: "Format waktu check-in tidak valid"
                }).optional()),
                checkOut: zod_1.z.preprocess((val) => val === null ? null : (val === undefined ? undefined : (val instanceof Date ? val : new Date(val))), zod_1.z.date({
                    invalid_type_error: "Format waktu check-out tidak valid"
                }).nullable().optional()),
                notes: zod_1.z.string().nullable().optional()
            });
            // Parse data dengan skema kustom
            const parsedData = updateAttendanceSchema.parse(processedData);
            console.log("Parsed attendance data for update:", JSON.stringify(parsedData, null, 2));
            const attendance = await storage_1.storage.updateAttendance(id, parsedData);
            if (!attendance) {
                return res.status(404).json({ message: "Attendance record not found" });
            }
            console.log("Attendance updated successfully:", JSON.stringify(attendance, null, 2));
            // Tambahkan informasi karyawan ke respons
            const employee = await storage_1.storage.getEmployee(attendance.employeeId);
            const attendanceWithEmployee = {
                ...attendance,
                employeeName: employee ? employee.name : `Karyawan ID: ${attendance.employeeId}`,
                employeePosition: employee ? employee.position : 'Posisi tidak tersedia'
            };
            res.json(attendanceWithEmployee);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.log("Validation error details:", JSON.stringify(error.format(), null, 2));
                return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
            }
            console.error("Error updating attendance:", error);
            res.status(500).json({ message: "Error updating attendance" });
        }
    });
    app.delete("/api/hrd/attendances/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteAttendance(id);
            if (!success) {
                return res.status(404).json({ message: "Attendance record not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting attendance:", error);
            res.status(500).json({ message: "Error deleting attendance" });
        }
    });
    // Payroll routes
    app.get("/api/hrd/payrolls", async (req, res) => {
        try {
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            let payrolls;
            if (employeeId) {
                // Get payrolls for a specific employee
                payrolls = await storage_1.storage.getPayrollsByEmployee(employeeId);
            }
            else if (startDate && endDate) {
                // Get payrolls for a specific period
                payrolls = await storage_1.storage.getPayrollsByPeriod(startDate, endDate);
            }
            else {
                // Get all payrolls
                payrolls = await storage_1.storage.getPayrolls();
            }
            res.json(payrolls);
        }
        catch (error) {
            console.error("Error fetching payrolls:", error);
            res.status(500).json({ message: "Error fetching payrolls" });
        }
    });
    app.get("/api/hrd/payrolls/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payroll = await storage_1.storage.getPayroll(id);
            if (!payroll) {
                return res.status(404).json({ message: "Payroll record not found" });
            }
            res.json(payroll);
        }
        catch (error) {
            console.error("Error fetching payroll:", error);
            res.status(500).json({ message: "Error fetching payroll" });
        }
    });
    app.post("/api/hrd/payrolls", async (req, res) => {
        try {
            console.log("Received payroll data:", JSON.stringify(req.body));
            // Buat objek tanpa baseSalary dan totalAmount karena akan dihitung otomatis di database
            const payrollData = {
                employeeId: parseInt(req.body.employeeId),
                periodStart: new Date(req.body.periodStart),
                periodEnd: new Date(req.body.periodEnd),
                paymentType: req.body.paymentType || 'monthly',
                dailyRate: req.body.dailyRate ? parseInt(req.body.dailyRate) : undefined,
                monthlySalary: req.body.monthlySalary ? parseInt(req.body.monthlySalary) : undefined,
                allowance: req.body.allowance ? parseInt(req.body.allowance) : 35000,
                bonus: req.body.bonus ? parseInt(req.body.bonus) : 0,
                deduction: req.body.deduction ? parseInt(req.body.deduction) : 0,
                paymentMethod: req.body.paymentMethod || 'cash',
                status: req.body.status || 'pending',
                notes: req.body.notes,
                paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined
            };
            console.log("Transformed payroll data:", JSON.stringify(payrollData));
            // Kirim langsung ke storage yang sudah memiliki implementasi perhitungan gaji otomatis
            // createPayroll di database-storage.ts akan menghitung baseSalary dan totalAmount
            const payroll = await storage_1.storage.createPayroll(payrollData);
            res.status(201).json(payroll);
        }
        catch (error) {
            console.error("Error creating payroll:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ message: `Error creating payroll: ${errorMessage}` });
        }
    });
    app.put("/api/hrd/payrolls/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payrollData = schema_1.insertPayrollSchema.partial().parse(req.body);
            const payroll = await storage_1.storage.updatePayroll(id, payrollData);
            if (!payroll) {
                return res.status(404).json({ message: "Payroll record not found" });
            }
            res.json(payroll);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid payroll data", errors: error.errors });
            }
            console.error("Error updating payroll:", error);
            res.status(500).json({ message: "Error updating payroll" });
        }
    });
    app.delete("/api/hrd/payrolls/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deletePayroll(id);
            if (!success) {
                return res.status(404).json({ message: "Payroll record not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting payroll:", error);
            res.status(500).json({ message: "Error deleting payroll" });
        }
    });
    // Performance Review routes
    app.get("/api/hrd/performance-reviews", async (req, res) => {
        try {
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            let reviews;
            if (employeeId) {
                // Get performance reviews for a specific employee
                reviews = await storage_1.storage.getPerformanceReviewsByEmployee(employeeId);
            }
            else {
                // Get all performance reviews
                reviews = await storage_1.storage.getPerformanceReviews();
            }
            res.json(reviews);
        }
        catch (error) {
            console.error("Error fetching performance reviews:", error);
            res.status(500).json({ message: "Error fetching performance reviews" });
        }
    });
    app.get("/api/hrd/performance-reviews/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const review = await storage_1.storage.getPerformanceReview(id);
            if (!review) {
                return res.status(404).json({ message: "Performance review not found" });
            }
            res.json(review);
        }
        catch (error) {
            console.error("Error fetching performance review:", error);
            res.status(500).json({ message: "Error fetching performance review" });
        }
    });
    app.post("/api/hrd/performance-reviews", async (req, res) => {
        try {
            const reviewData = schema_1.insertPerformanceReviewSchema.parse(req.body);
            const review = await storage_1.storage.createPerformanceReview(reviewData);
            res.status(201).json(review);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid performance review data", errors: error.errors });
            }
            console.error("Error creating performance review:", error);
            res.status(500).json({ message: "Error creating performance review" });
        }
    });
    app.put("/api/hrd/performance-reviews/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const reviewData = schema_1.insertPerformanceReviewSchema.partial().parse(req.body);
            const review = await storage_1.storage.updatePerformanceReview(id, reviewData);
            if (!review) {
                return res.status(404).json({ message: "Performance review not found" });
            }
            res.json(review);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid performance review data", errors: error.errors });
            }
            console.error("Error updating performance review:", error);
            res.status(500).json({ message: "Error updating performance review" });
        }
    });
    app.delete("/api/hrd/performance-reviews/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deletePerformanceReview(id);
            if (!success) {
                return res.status(404).json({ message: "Performance review not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting performance review:", error);
            res.status(500).json({ message: "Error deleting performance review" });
        }
    });
    // Leave Request routes
    app.get("/api/hrd/leave-requests", async (req, res) => {
        try {
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            const status = req.query.status;
            let requests;
            if (employeeId) {
                // Get leave requests for a specific employee
                requests = await storage_1.storage.getLeaveRequestsByEmployee(employeeId);
            }
            else if (status === 'pending') {
                // Get pending leave requests
                requests = await storage_1.storage.getPendingLeaveRequests();
            }
            else {
                // Get all leave requests
                requests = await storage_1.storage.getLeaveRequests();
            }
            res.json(requests);
        }
        catch (error) {
            console.error("Error fetching leave requests:", error);
            res.status(500).json({ message: "Error fetching leave requests" });
        }
    });
    app.get("/api/hrd/leave-requests/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const request = await storage_1.storage.getLeaveRequest(id);
            if (!request) {
                return res.status(404).json({ message: "Leave request not found" });
            }
            res.json(request);
        }
        catch (error) {
            console.error("Error fetching leave request:", error);
            res.status(500).json({ message: "Error fetching leave request" });
        }
    });
    app.post("/api/hrd/leave-requests", async (req, res) => {
        try {
            const requestData = schema_1.insertLeaveRequestSchema.parse(req.body);
            const request = await storage_1.storage.createLeaveRequest(requestData);
            res.status(201).json(request);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid leave request data", errors: error.errors });
            }
            console.error("Error creating leave request:", error);
            res.status(500).json({ message: "Error creating leave request" });
        }
    });
    app.put("/api/hrd/leave-requests/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const requestData = schema_1.insertLeaveRequestSchema.partial().parse(req.body);
            const request = await storage_1.storage.updateLeaveRequest(id, requestData);
            if (!request) {
                return res.status(404).json({ message: "Leave request not found" });
            }
            res.json(request);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid leave request data", errors: error.errors });
            }
            console.error("Error updating leave request:", error);
            res.status(500).json({ message: "Error updating leave request" });
        }
    });
    app.post("/api/hrd/leave-requests/:id/approve", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const approverId = req.body.approverId;
            if (!approverId) {
                return res.status(400).json({ message: "Approver ID is required" });
            }
            const request = await storage_1.storage.approveLeaveRequest(id, approverId);
            if (!request) {
                return res.status(404).json({ message: "Leave request not found" });
            }
            res.json(request);
        }
        catch (error) {
            console.error("Error approving leave request:", error);
            res.status(500).json({ message: "Error approving leave request" });
        }
    });
    app.post("/api/hrd/leave-requests/:id/reject", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const approverId = req.body.approverId;
            if (!approverId) {
                return res.status(400).json({ message: "Approver ID is required" });
            }
            const request = await storage_1.storage.rejectLeaveRequest(id, approverId);
            if (!request) {
                return res.status(404).json({ message: "Leave request not found" });
            }
            res.json(request);
        }
        catch (error) {
            console.error("Error rejecting leave request:", error);
            res.status(500).json({ message: "Error rejecting leave request" });
        }
    });
    app.delete("/api/hrd/leave-requests/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteLeaveRequest(id);
            if (!success) {
                return res.status(404).json({ message: "Leave request not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting leave request:", error);
            res.status(500).json({ message: "Error deleting leave request" });
        }
    });
    // Training Session routes
    app.get("/api/hrd/training-sessions", async (req, res) => {
        try {
            const upcoming = req.query.upcoming === 'true';
            let sessions;
            if (upcoming) {
                // Get upcoming training sessions
                sessions = await storage_1.storage.getUpcomingTrainingSessions();
            }
            else {
                // Get all training sessions
                sessions = await storage_1.storage.getTrainingSessions();
            }
            res.json(sessions);
        }
        catch (error) {
            console.error("Error fetching training sessions:", error);
            res.status(500).json({ message: "Error fetching training sessions" });
        }
    });
    app.get("/api/hrd/training-sessions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const session = await storage_1.storage.getTrainingSession(id);
            if (!session) {
                return res.status(404).json({ message: "Training session not found" });
            }
            res.json(session);
        }
        catch (error) {
            console.error("Error fetching training session:", error);
            res.status(500).json({ message: "Error fetching training session" });
        }
    });
    app.post("/api/hrd/training-sessions", async (req, res) => {
        try {
            const sessionData = schema_1.insertTrainingSessionSchema.parse(req.body);
            const session = await storage_1.storage.createTrainingSession(sessionData);
            res.status(201).json(session);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid training session data", errors: error.errors });
            }
            console.error("Error creating training session:", error);
            res.status(500).json({ message: "Error creating training session" });
        }
    });
    app.put("/api/hrd/training-sessions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const sessionData = schema_1.insertTrainingSessionSchema.partial().parse(req.body);
            const session = await storage_1.storage.updateTrainingSession(id, sessionData);
            if (!session) {
                return res.status(404).json({ message: "Training session not found" });
            }
            res.json(session);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid training session data", errors: error.errors });
            }
            console.error("Error updating training session:", error);
            res.status(500).json({ message: "Error updating training session" });
        }
    });
    app.delete("/api/hrd/training-sessions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteTrainingSession(id);
            if (!success) {
                return res.status(404).json({ message: "Training session not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting training session:", error);
            res.status(500).json({ message: "Error deleting training session" });
        }
    });
    // Training Participant routes
    app.get("/api/hrd/training-participants", async (req, res) => {
        try {
            const trainingId = req.query.trainingId ? parseInt(req.query.trainingId) : undefined;
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            let participants;
            if (trainingId) {
                // Get participants for a specific training session
                participants = await storage_1.storage.getTrainingParticipants(trainingId);
            }
            else if (employeeId) {
                // Get trainings for a specific employee
                participants = await storage_1.storage.getTrainingParticipantsByEmployee(employeeId);
            }
            else {
                // Can't get all participants without filtering
                return res.status(400).json({ message: "Either trainingId or employeeId parameter is required" });
            }
            res.json(participants);
        }
        catch (error) {
            console.error("Error fetching training participants:", error);
            res.status(500).json({ message: "Error fetching training participants" });
        }
    });
    app.get("/api/hrd/training-participants/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const participant = await storage_1.storage.getTrainingParticipant(id);
            if (!participant) {
                return res.status(404).json({ message: "Training participant not found" });
            }
            res.json(participant);
        }
        catch (error) {
            console.error("Error fetching training participant:", error);
            res.status(500).json({ message: "Error fetching training participant" });
        }
    });
    app.post("/api/hrd/training-participants", async (req, res) => {
        try {
            const participantData = schema_1.insertTrainingParticipantSchema.parse(req.body);
            const participant = await storage_1.storage.createTrainingParticipant(participantData);
            res.status(201).json(participant);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid training participant data", errors: error.errors });
            }
            console.error("Error creating training participant:", error);
            res.status(500).json({ message: "Error creating training participant" });
        }
    });
    app.put("/api/hrd/training-participants/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const participantData = schema_1.insertTrainingParticipantSchema.partial().parse(req.body);
            const participant = await storage_1.storage.updateTrainingParticipant(id, participantData);
            if (!participant) {
                return res.status(404).json({ message: "Training participant not found" });
            }
            res.json(participant);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid training participant data", errors: error.errors });
            }
            console.error("Error updating training participant:", error);
            res.status(500).json({ message: "Error updating training participant" });
        }
    });
    app.delete("/api/hrd/training-participants/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteTrainingParticipant(id);
            if (!success) {
                return res.status(404).json({ message: "Training participant not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting training participant:", error);
            res.status(500).json({ message: "Error deleting training participant" });
        }
    });
    // HRD Document routes
    app.get("/api/hrd/documents", async (req, res) => {
        try {
            const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
            const expiringDays = req.query.expiringDays ? parseInt(req.query.expiringDays) : undefined;
            let documents;
            if (employeeId) {
                // Get documents for a specific employee
                documents = await storage_1.storage.getHrdDocumentsByEmployee(employeeId);
            }
            else if (expiringDays) {
                // Get documents expiring within a number of days
                documents = await storage_1.storage.getExpiringHrdDocuments(expiringDays);
            }
            else {
                // Get all documents
                documents = await storage_1.storage.getHrdDocuments();
            }
            res.json(documents);
        }
        catch (error) {
            console.error("Error fetching HRD documents:", error);
            res.status(500).json({ message: "Error fetching HRD documents" });
        }
    });
    app.get("/api/hrd/documents/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const document = await storage_1.storage.getHrdDocument(id);
            if (!document) {
                return res.status(404).json({ message: "HRD document not found" });
            }
            res.json(document);
        }
        catch (error) {
            console.error("Error fetching HRD document:", error);
            res.status(500).json({ message: "Error fetching HRD document" });
        }
    });
    app.post("/api/hrd/documents", async (req, res) => {
        try {
            const documentData = schema_1.insertHrdDocumentSchema.parse(req.body);
            const document = await storage_1.storage.createHrdDocument(documentData);
            res.status(201).json(document);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid HRD document data", errors: error.errors });
            }
            console.error("Error creating HRD document:", error);
            res.status(500).json({ message: "Error creating HRD document" });
        }
    });
    app.put("/api/hrd/documents/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const documentData = schema_1.insertHrdDocumentSchema.partial().parse(req.body);
            const document = await storage_1.storage.updateHrdDocument(id, documentData);
            if (!document) {
                return res.status(404).json({ message: "HRD document not found" });
            }
            res.json(document);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid HRD document data", errors: error.errors });
            }
            console.error("Error updating HRD document:", error);
            res.status(500).json({ message: "Error updating HRD document" });
        }
    });
    app.delete("/api/hrd/documents/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteHrdDocument(id);
            if (!success) {
                return res.status(404).json({ message: "HRD document not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting HRD document:", error);
            res.status(500).json({ message: "Error deleting HRD document" });
        }
    });
    app.get("/api/transactions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            console.log(`GET /api/transactions/${id} called`);
            const transaction = await storage_1.storage.getTransaction(id);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            console.log(`Retrieved transaction #${id} with status: ${transaction.status}`);
            // Safe access for customerId (might be null)
            let customer = null;
            if (transaction.customerId !== null) {
                customer = await storage_1.storage.getCustomer(transaction.customerId);
                console.log(`Retrieved customer data: ${customer?.name || 'N/A'}`);
            }
            const items = await storage_1.storage.getTransactionItems(transaction.id);
            console.log(`Retrieved ${items.length} items for transaction #${transaction.id}`);
            const services = await Promise.all(items.map(async (item) => {
                // Safe access for serviceId (might be null)
                let service = null;
                if (item.serviceId !== null) {
                    service = await storage_1.storage.getService(item.serviceId);
                    console.log(`Retrieved service data for item #${item.id}: ${service?.name || 'N/A'}`);
                }
                return {
                    ...item,
                    serviceName: service?.name || 'Tidak diketahui',
                    serviceDetails: service
                };
            }));
            const result = {
                ...transaction,
                customer,
                items: services
            };
            res.json(result);
        }
        catch (error) {
            console.error("Error fetching transaction:", error);
            res.status(500).json({ message: "Error fetching transaction" });
        }
    });
    app.post("/api/transactions", async (req, res) => {
        try {
            console.log("Menerima data transaksi:", JSON.stringify(req.body, null, 2));
            // Validasi dasar
            if (!req.body.transaction) {
                return res.status(400).json({ message: "Data transaksi wajib diisi" });
            }
            if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
                return res.status(400).json({ message: "Item transaksi wajib diisi dan tidak boleh kosong" });
            }
            // Siapkan data transaksi tanpa validasi kompleks
            const trackingCode = (0, simpleNotification_1.generateUniqueTrackingCode)();
            const transactionData = {
                customerId: req.body.transaction.customerId || null,
                employeeId: req.body.transaction.employeeId || null,
                date: new Date(),
                total: req.body.transaction.total || 0,
                paymentMethod: req.body.transaction.paymentMethod || "cash",
                status: req.body.transaction.status || "pending",
                notes: req.body.transaction.notes || "",
                trackingCode: trackingCode // Tambahkan tracking code
            };
            console.log("Data transaksi yang diproses:", transactionData);
            // Simpan transaksi ke database
            const transaction = await storage_1.storage.createTransaction(transactionData);
            console.log("Transaksi berhasil dibuat:", transaction);
            // Proses setiap item transaksi
            const items = [];
            for (const itemData of req.body.items) {
                const itemToCreate = {
                    transactionId: transaction.id,
                    serviceId: itemData.serviceId || 0,
                    price: itemData.price || 0,
                    quantity: itemData.quantity || 1,
                    discount: itemData.discount || 0
                };
                try {
                    const item = await storage_1.storage.createTransactionItem(itemToCreate);
                    items.push(item);
                }
                catch (error) {
                    console.error("Error saat membuat item transaksi:", error);
                }
            }
            // Jika ada customer, kirim notifikasi WhatsApp untuk status transaksi
            if (transaction.customerId) {
                try {
                    const customer = await storage_1.storage.getCustomer(transaction.customerId);
                    if (customer && customer.phone) {
                        // Ambil service names untuk notifikasi
                        const serviceNames = [];
                        for (const item of items) {
                            if (item.serviceId) {
                                const service = await storage_1.storage.getService(item.serviceId);
                                if (service) {
                                    serviceNames.push(service.name);
                                }
                            }
                        }
                        // Siapkan data layanan untuk notifikasi (sesuai dengan struktur Service di schema.ts)
                        const serviceObjects = serviceNames.map(name => ({
                            id: 0, // ID tidak penting untuk notifikasi
                            name: name,
                            price: 0, // Harga tidak penting untuk notifikasi
                            description: null, // Deskripsi tidak penting untuk notifikasi
                            vehicleType: "car", // Default tipe kendaraan
                            duration: 0, // Durasi tidak penting untuk notifikasi
                            isActive: true, // Status aktif tidak penting untuk notifikasi
                            isPopular: false, // Tidak penting untuk notifikasi
                            imageUrl: null, // Tidak penting untuk notifikasi
                            warranty: null, // Tidak penting untuk notifikasi
                            createdAt: null, // Tidak penting untuk notifikasi
                            updatedAt: null // Tidak penting untuk notifikasi
                        }));
                        console.log(`[TRANSACTION CREATE] Sending notification with ${serviceObjects.length} services`);
                        console.log(`[TRANSACTION CREATE] Services: ${JSON.stringify(serviceObjects.map(s => s.name))}`);
                        // Kirim notifikasi status
                        const notificationResult = await (0, simpleNotification_1.sendStatusNotification)(transaction, customer, serviceObjects);
                        console.log("Hasil pengiriman notifikasi:", notificationResult);
                    }
                }
                catch (notifError) {
                    console.error("Error saat mengirim notifikasi:", notifError);
                    // Lanjutkan eksekusi meskipun ada error notifikasi
                }
            }
            // Kirim response sukses
            return res.status(201).json({
                transaction,
                items,
                trackingCode: transaction.trackingCode
            });
        }
        catch (error) {
            console.error("Error saat membuat transaksi:", error);
            return res.status(500).json({
                message: "Gagal membuat transaksi",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });
    app.put("/api/transactions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const transactionData = schema_1.insertTransactionSchema.partial().parse(req.body);
            const transaction = await storage_1.storage.updateTransaction(id, transactionData);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            res.json(transaction);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating transaction" });
        }
    });
    // Transaction status update endpoint
    app.patch("/api/transactions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            console.log(`Updating transaction #${id} status to '${status}'`);
            // Validasi status
            if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            // Pastikan ada tracking code
            let trackingCode;
            const existingTransaction = await storage_1.storage.getTransaction(id);
            if (!existingTransaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            // Jika tidak ada tracking code, generate baru
            if (!existingTransaction.trackingCode) {
                trackingCode = (0, simpleNotification_1.generateUniqueTrackingCode)();
                console.log(`Generated new tracking code for transaction #${id}: ${trackingCode}`);
            }
            else {
                trackingCode = existingTransaction.trackingCode;
                console.log(`Using existing tracking code for transaction #${id}: ${trackingCode}`);
            }
            // Update transaction status dan tracking code jika diperlukan
            const transaction = await storage_1.storage.updateTransaction(id, {
                status,
                trackingCode: trackingCode
            });
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }
            // Get full transaction details with related entities
            const fullTransaction = await storage_1.storage.getTransaction(id);
            if (!fullTransaction) {
                return res.status(404).json({ message: "Transaction not found after update" });
            }
            // Handle null customerId safely
            const customer = fullTransaction.customerId ?
                await storage_1.storage.getCustomer(fullTransaction.customerId) : null;
            const items = await storage_1.storage.getTransactionItems(id);
            // Proses items satu per satu untuk menghindari masalah dengan Promise.all
            const services = [];
            for (const item of items) {
                // Handle null serviceId safely
                const service = item.serviceId ?
                    await storage_1.storage.getService(item.serviceId) : null;
                services.push({
                    ...item,
                    serviceName: service?.name,
                    serviceDetails: service
                });
            }
            const result = {
                ...fullTransaction,
                customer,
                items: services
            };
            // Kirim notifikasi WhatsApp untuk perubahan status jika ada customer
            if (customer && customer.phone && fullTransaction) {
                try {
                    // Kumpulkan nama layanan
                    const serviceNames = services
                        .filter(s => s.serviceDetails !== null && s.serviceDetails !== undefined)
                        .map(s => s.serviceDetails?.name || '');
                    // Siapkan data layanan untuk notifikasi (sesuai dengan struktur Service di schema.ts)
                    const serviceObjects = serviceNames.map(name => ({
                        id: 0, // ID tidak penting untuk notifikasi
                        name: name,
                        price: 0, // Harga tidak penting untuk notifikasi
                        description: null, // Deskripsi tidak penting untuk notifikasi
                        vehicleType: "car", // Default tipe kendaraan
                        duration: 0, // Durasi tidak penting untuk notifikasi
                        isActive: true, // Status aktif tidak penting untuk notifikasi
                        isPopular: false, // Tidak penting untuk notifikasi
                        imageUrl: null, // Tidak penting untuk notifikasi
                        warranty: null, // Tidak penting untuk notifikasi
                        createdAt: null, // Tidak penting untuk notifikasi
                        updatedAt: null // Tidak penting untuk notifikasi
                    }));
                    console.log(`[TRANSACTION STATUS] Sending notification with ${serviceObjects.length} services`);
                    console.log(`[TRANSACTION STATUS] Services: ${JSON.stringify(serviceObjects.map(s => s.name))}`);
                    // Kirim notifikasi status
                    const notificationResult = await (0, simpleNotification_1.sendStatusNotification)(fullTransaction, customer, serviceObjects, status);
                    console.log("Hasil pengiriman notifikasi status:", notificationResult);
                }
                catch (notifError) {
                    console.error("Error saat mengirim notifikasi status:", notifError);
                    // Lanjutkan eksekusi meskipun ada error notifikasi
                }
            }
            // Pastikan response adalah JSON yang valid
            return res.status(200).json({
                success: true,
                transaction: result
            });
        }
        catch (error) {
            console.error("Error updating transaction status:", error);
            return res.status(500).json({ message: "Error updating transaction status" });
        }
    });
    // Position Salary routes
    app.get("/api/hrd/position-salaries", async (req, res) => {
        try {
            const salaries = await storage_1.storage.getPositionSalaries();
            res.json(salaries);
        }
        catch (error) {
            console.error("Error fetching position salaries:", error);
            res.status(500).json({ message: "Error fetching position salaries" });
        }
    });
    app.get("/api/hrd/position-salaries/position/:position", async (req, res) => {
        try {
            const position = req.params.position;
            const salary = await storage_1.storage.getPositionSalaryByPosition(position);
            if (!salary) {
                return res.status(404).json({ message: "Position salary not found" });
            }
            res.json(salary);
        }
        catch (error) {
            console.error("Error fetching position salary by position:", error);
            res.status(500).json({ message: "Error fetching position salary by position" });
        }
    });
    app.get("/api/hrd/position-salaries/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const salary = await storage_1.storage.getPositionSalary(id);
            if (!salary) {
                return res.status(404).json({ message: "Position salary not found" });
            }
            res.json(salary);
        }
        catch (error) {
            console.error("Error fetching position salary:", error);
            res.status(500).json({ message: "Error fetching position salary" });
        }
    });
    app.post("/api/hrd/position-salaries", async (req, res) => {
        try {
            console.log("Position salary data received:", JSON.stringify(req.body, null, 2));
            const salaryData = schema_1.insertPositionSalarySchema.parse(req.body);
            const salary = await storage_1.storage.createPositionSalary(salaryData);
            res.status(201).json(salary);
        }
        catch (error) {
            console.error("Error creating position salary:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid position salary data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating position salary" });
        }
    });
    app.put("/api/hrd/position-salaries/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            console.log("Updating position salary id:", id);
            console.log("Update data received:", JSON.stringify(req.body, null, 2));
            const salaryData = schema_1.insertPositionSalarySchema.partial().parse(req.body);
            const salary = await storage_1.storage.updatePositionSalary(id, salaryData);
            if (!salary) {
                return res.status(404).json({ message: "Position salary not found" });
            }
            console.log("Position salary updated successfully:", JSON.stringify(salary, null, 2));
            res.json(salary);
        }
        catch (error) {
            console.error("Error updating position salary:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid position salary data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating position salary" });
        }
    });
    app.delete("/api/hrd/position-salaries/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deletePositionSalary(id);
            if (!success) {
                return res.status(404).json({ message: "Position salary not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting position salary:", error);
            res.status(500).json({ message: "Error deleting position salary" });
        }
    });
    // ========== FINANCE MANAGEMENT ROUTES ==========
    // Expense Category routes
    app.get("/api/finance/expense-categories", async (req, res) => {
        try {
            const categories = await storage_1.storage.getExpenseCategories();
            res.json(categories);
        }
        catch (error) {
            console.error("Error fetching expense categories:", error);
            res.status(500).json({ message: "Error fetching expense categories" });
        }
    });
    app.get("/api/finance/expense-categories/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const category = await storage_1.storage.getExpenseCategory(id);
            if (!category) {
                return res.status(404).json({ message: "Kategori pengeluaran tidak ditemukan" });
            }
            res.json(category);
        }
        catch (error) {
            console.error("Error fetching expense category:", error);
            res.status(500).json({ message: "Error fetching expense category" });
        }
    });
    app.post("/api/finance/expense-categories", async (req, res) => {
        try {
            const categoryData = schema_1.insertExpenseCategorySchema.parse(req.body);
            const category = await storage_1.storage.createExpenseCategory(categoryData);
            res.status(201).json(category);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Data kategori pengeluaran tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error creating expense category:", error);
            res.status(500).json({ message: "Error creating expense category" });
        }
    });
    app.put("/api/finance/expense-categories/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const categoryData = schema_1.insertExpenseCategorySchema.partial().parse(req.body);
            const category = await storage_1.storage.updateExpenseCategory(id, categoryData);
            if (!category) {
                return res.status(404).json({ message: "Kategori pengeluaran tidak ditemukan" });
            }
            res.json(category);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Data kategori pengeluaran tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error updating expense category:", error);
            res.status(500).json({ message: "Error updating expense category" });
        }
    });
    app.delete("/api/finance/expense-categories/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteExpenseCategory(id);
            if (!success) {
                return res.status(404).json({ message: "Kategori pengeluaran tidak ditemukan" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting expense category:", error);
            res.status(500).json({ message: "Error deleting expense category" });
        }
    });
    // Expense routes
    app.get("/api/finance/expenses", async (req, res) => {
        try {
            // Check if we need to filter by date range
            if (req.query.startDate && req.query.endDate) {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
                const expenses = await storage_1.storage.getExpensesByDateRange(startDate, endDate);
                return res.json(expenses);
            }
            // Check if we need to filter by month
            if (req.query.year && req.query.month) {
                const year = parseInt(req.query.year);
                const month = parseInt(req.query.month);
                const expenses = await storage_1.storage.getExpensesByMonth(year, month);
                return res.json(expenses);
            }
            // Return all expenses if no filter
            const expenses = await storage_1.storage.getExpenses();
            res.json(expenses);
        }
        catch (error) {
            console.error("Error fetching expenses:", error);
            res.status(500).json({ message: "Error fetching expenses" });
        }
    });
    // Menangani kedua endpoint expenses/total dan expenses/monthly-total untuk kompatibilitas
    // Kedua endpoint ini melakukan hal yang sama
    app.get(["/api/finance/expenses/total", "/api/finance/expenses/monthly-total"], async (req, res) => {
        try {
            // Validasi parameter
            const yearStr = req.query.year;
            const monthStr = req.query.month;
            if (!yearStr || !monthStr) {
                return res.status(400).json({
                    message: "Parameter tahun dan bulan diperlukan"
                });
            }
            // Validasi format: pastikan hanya angka
            if (!/^\d+$/.test(yearStr) || !/^\d+$/.test(monthStr)) {
                return res.status(400).json({
                    message: "Format tahun dan bulan tidak valid, harus berupa angka"
                });
            }
            // Parse ke integer dengan radix 10 untuk keamanan
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            // Validasi range nilai
            if (isNaN(year) || isNaN(month) || year < 2000 || year > 2100 || month < 1 || month > 12) {
                return res.status(400).json({
                    message: "Nilai tahun atau bulan tidak valid"
                });
            }
            console.log(`Mendapatkan total pengeluaran untuk ${year}-${month}`);
            const total = await storage_1.storage.getTotalExpensesByMonth(year, month);
            res.json({ total });
        }
        catch (error) {
            console.error("Error calculating monthly expense total:", error);
            res.status(500).json({ message: "Error calculating monthly expense total" });
        }
    });
    app.get("/api/finance/expenses/:id", async (req, res) => {
        try {
            // Validasi ID
            const idString = req.params.id;
            if (!idString || !/^\d+$/.test(idString)) {
                return res.status(400).json({
                    message: "ID tidak valid, harus berupa angka"
                });
            }
            const id = parseInt(idString, 10);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID tidak valid"
                });
            }
            const expense = await storage_1.storage.getExpense(id);
            if (!expense) {
                return res.status(404).json({ message: "Pengeluaran tidak ditemukan" });
            }
            res.json(expense);
        }
        catch (error) {
            console.error("Error fetching expense:", error);
            res.status(500).json({ message: "Error fetching expense" });
        }
    });
    app.post("/api/finance/expenses", async (req, res) => {
        try {
            console.log("Received expense data:", JSON.stringify(req.body, null, 2));
            // Custom validation schema with date preprocessing
            const customExpenseSchema = zod_1.z.object({
                date: zod_1.z.preprocess((val) => val instanceof Date ? val : new Date(val), zod_1.z.date()),
                category: zod_1.z.string(),
                description: zod_1.z.string(),
                amount: zod_1.z.number(),
                receiptImage: zod_1.z.string().optional(),
                notes: zod_1.z.string().optional(),
                createdBy: zod_1.z.number().optional()
            });
            // Parse with our custom schema
            const parsedData = customExpenseSchema.parse(req.body);
            console.log("Parsed expense data:", JSON.stringify(parsedData, null, 2));
            const expense = await storage_1.storage.createExpense(parsedData);
            res.status(201).json(expense);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.log("Validation error details:", JSON.stringify(error.format(), null, 2));
                return res.status(400).json({
                    message: "Data pengeluaran tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error creating expense:", error);
            res.status(500).json({ message: "Error creating expense" });
        }
    });
    app.put("/api/finance/expenses/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const expenseData = schema_1.insertExpenseSchema.partial().parse(req.body);
            const expense = await storage_1.storage.updateExpense(id, expenseData);
            if (!expense) {
                return res.status(404).json({ message: "Pengeluaran tidak ditemukan" });
            }
            res.json(expense);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Data pengeluaran tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error updating expense:", error);
            res.status(500).json({ message: "Error updating expense" });
        }
    });
    app.delete("/api/finance/expenses/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteExpense(id);
            if (!success) {
                return res.status(404).json({ message: "Pengeluaran tidak ditemukan" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting expense:", error);
            res.status(500).json({ message: "Error deleting expense" });
        }
    });
    // Profit-Loss Report routes
    app.get("/api/finance/profit-loss-reports", async (req, res) => {
        try {
            // Filter by period if specified
            if (req.query.period) {
                const report = await storage_1.storage.getProfitLossReportByPeriod(req.query.period);
                if (report) {
                    return res.json(report);
                }
                else {
                    // If report doesn't exist, calculate it on the fly
                    const calculatedData = await storage_1.storage.calculateProfitLossReport(req.query.period);
                    return res.json({
                        id: 0,
                        period: req.query.period,
                        totalRevenue: calculatedData.totalRevenue,
                        totalExpenses: calculatedData.totalExpenses,
                        totalSalaries: calculatedData.totalSalaries,
                        profit: calculatedData.profit,
                        notes: null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
            // Return all reports if no filter
            const reports = await storage_1.storage.getProfitLossReports();
            res.json(reports);
        }
        catch (error) {
            console.error("Error fetching profit-loss reports:", error);
            res.status(500).json({ message: "Error fetching profit-loss reports" });
        }
    });
    app.get("/api/finance/profit-loss-reports/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const report = await storage_1.storage.getProfitLossReport(id);
            if (!report) {
                return res.status(404).json({ message: "Laporan laba/rugi tidak ditemukan" });
            }
            res.json(report);
        }
        catch (error) {
            console.error("Error fetching profit-loss report:", error);
            res.status(500).json({ message: "Error fetching profit-loss report" });
        }
    });
    app.post("/api/finance/profit-loss-reports", async (req, res) => {
        try {
            // If period is provided but no calculations, calculate them automatically
            if (req.body.period && (!req.body.totalRevenue || !req.body.totalExpenses || !req.body.totalSalaries || !req.body.profit)) {
                const calculatedData = await storage_1.storage.calculateProfitLossReport(req.body.period);
                const reportData = {
                    period: req.body.period,
                    totalRevenue: calculatedData.totalRevenue,
                    totalExpenses: calculatedData.totalExpenses,
                    totalSalaries: calculatedData.totalSalaries,
                    profit: calculatedData.profit,
                    notes: req.body.notes || null
                };
                const report = await storage_1.storage.createProfitLossReport(reportData);
                return res.status(201).json(report);
            }
            // Otherwise, use the provided data
            const reportData = schema_1.insertProfitLossReportSchema.parse(req.body);
            const report = await storage_1.storage.createProfitLossReport(reportData);
            res.status(201).json(report);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Data laporan laba/rugi tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error creating profit-loss report:", error);
            res.status(500).json({ message: "Error creating profit-loss report" });
        }
    });
    app.put("/api/finance/profit-loss-reports/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const reportData = schema_1.insertProfitLossReportSchema.partial().parse(req.body);
            const report = await storage_1.storage.updateProfitLossReport(id, reportData);
            if (!report) {
                return res.status(404).json({ message: "Laporan laba/rugi tidak ditemukan" });
            }
            res.json(report);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: "Data laporan laba/rugi tidak valid",
                    errors: error.errors
                });
            }
            console.error("Error updating profit-loss report:", error);
            res.status(500).json({ message: "Error updating profit-loss report" });
        }
    });
    app.delete("/api/finance/profit-loss-reports/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteProfitLossReport(id);
            if (!success) {
                return res.status(404).json({ message: "Laporan laba/rugi tidak ditemukan" });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting profit-loss report:", error);
            res.status(500).json({ message: "Error deleting profit-loss report" });
        }
    });
    // API for getting a calculated report without creating it
    app.get("/api/finance/calculate-profit-loss", async (req, res) => {
        try {
            if (!req.query.period) {
                return res.status(400).json({ message: "Parameter 'period' diperlukan (format: YYYY-MM)" });
            }
            const calculatedData = await storage_1.storage.calculateProfitLossReport(req.query.period);
            // Ubah nama property profit menjadi netProfit agar konsisten dengan frontend
            const response = {
                totalRevenue: calculatedData.totalRevenue,
                totalExpenses: calculatedData.totalExpenses,
                totalSalaries: calculatedData.totalSalaries,
                netProfit: calculatedData.profit
            };
            res.json(response);
        }
        catch (error) {
            console.error("Error calculating profit-loss report:", error);
            res.status(500).json({ message: "Error calculating profit-loss report" });
        }
    });
    // API untuk membuat atau memperbarui laporan berdasarkan perhitungan
    app.post("/api/finance/save-profit-loss", async (req, res) => {
        try {
            console.log("Saving profit-loss report for period:", req.body.period);
            const { period, totalRevenue, totalExpenses, totalSalaries, netProfit, notes } = req.body;
            if (!period || !/^\d{4}-\d{2}$/.test(period)) {
                return res.status(400).json({
                    message: "Format periode tidak valid. Gunakan format: YYYY-MM"
                });
            }
            // Check if report for this period already exists
            const existingReport = await storage_1.storage.getProfitLossReportByPeriod(period);
            let report;
            if (existingReport) {
                // Update existing report
                report = await storage_1.storage.updateProfitLossReport(existingReport.id, {
                    totalRevenue,
                    totalExpenses,
                    totalSalaries,
                    profit: netProfit, // Menggunakan kolom profit di database
                    notes: notes || `Laporan diperbarui pada ${new Date().toLocaleString('id-ID')}`
                });
                console.log("Updated existing profit-loss report:", report);
            }
            else {
                // Create new report
                report = await storage_1.storage.createProfitLossReport({
                    period,
                    totalRevenue,
                    totalExpenses,
                    totalSalaries,
                    profit: netProfit, // Menggunakan kolom profit di database
                    notes: notes || `Laporan dibuat pada ${new Date().toLocaleString('id-ID')}`
                });
                console.log("Created new profit-loss report:", report);
            }
            // Parse year and month from period string
            const [year, month] = period.split('-').map(Number);
            // Check if report exists
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: "Report not found"
                });
            }
            // Send response with the detailed info
            res.status(200).json({
                success: true,
                report: report,
                details: {
                    period: period,
                    year: year,
                    month: month,
                    transactionRevenue: totalRevenue,
                    expenses: totalExpenses,
                    salaries: totalSalaries,
                    netProfit: report.profit, // Sekarang aman karena sudah dicek
                    monthName: new Date(year, month - 1, 1).toLocaleString('id-ID', { month: 'long' })
                }
            });
        }
        catch (error) {
            console.error("Error saving profit-loss report:", error);
            res.status(500).json({ message: "Error saving profit-loss report" });
        }
    });
    // Role Management Routes
    app.get("/api/roles", async (req, res) => {
        try {
            const roles = await storage_1.storage.getRoles();
            res.json(roles);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching roles" });
        }
    });
    app.get("/api/roles/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const role = await storage_1.storage.getRole(id);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            res.json(role);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching role" });
        }
    });
    app.post("/api/roles", async (req, res) => {
        try {
            // Verify user is admin
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Admin access required" });
            }
            const roleData = schema_1.insertRoleSchema.parse(req.body);
            const role = await storage_1.storage.createRole(roleData);
            res.status(201).json(role);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid role data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating role" });
        }
    });
    app.put("/api/roles/:id", async (req, res) => {
        try {
            // Verify user is admin
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Admin access required" });
            }
            const id = parseInt(req.params.id);
            const roleData = schema_1.insertRoleSchema.partial().parse(req.body);
            const role = await storage_1.storage.updateRole(id, roleData);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            res.json(role);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid role data", errors: error.errors });
            }
            res.status(500).json({ message: "Error updating role" });
        }
    });
    app.delete("/api/roles/:id", async (req, res) => {
        try {
            // Verify user is admin
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Admin access required" });
            }
            const id = parseInt(req.params.id);
            // Don't allow deleting built-in roles
            const role = await storage_1.storage.getRole(id);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            if (["admin", "manager", "kasir"].includes(role.name)) {
                return res.status(400).json({ message: "Cannot delete built-in roles" });
            }
            // Delete role permissions first
            await storage_1.storage.deleteRolePermissionsByRole(id);
            // Then delete role
            const success = await storage_1.storage.deleteRole(id);
            if (!success) {
                return res.status(404).json({ message: "Role not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting role" });
        }
    });
    // Permission Management Routes
    app.get("/api/permissions", async (req, res) => {
        try {
            let permissions;
            if (req.query.module) {
                permissions = await storage_1.storage.getPermissionsByModule(req.query.module);
            }
            else {
                permissions = await storage_1.storage.getPermissions();
            }
            res.json(permissions);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching permissions" });
        }
    });
    app.get("/api/permissions/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const permission = await storage_1.storage.getPermission(id);
            if (!permission) {
                return res.status(404).json({ message: "Permission not found" });
            }
            res.json(permission);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching permission" });
        }
    });
    // Role Permissions Management
    app.get("/api/roles/:id/permissions", async (req, res) => {
        try {
            const roleId = parseInt(req.params.id);
            const role = await storage_1.storage.getRole(roleId);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            const permissions = await storage_1.storage.getPermissionsByRole(roleId);
            res.json(permissions);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching role permissions" });
        }
    });
    app.post("/api/roles/:id/permissions", async (req, res) => {
        try {
            // Verify user is admin
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Admin access required" });
            }
            const roleId = parseInt(req.params.id);
            const role = await storage_1.storage.getRole(roleId);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            // Validate request body
            const data = zod_1.z.object({
                permissionIds: zod_1.z.array(zod_1.z.number())
            }).parse(req.body);
            // Clear existing permissions
            await storage_1.storage.deleteRolePermissionsByRole(roleId);
            // Add new permissions
            const results = [];
            for (const permissionId of data.permissionIds) {
                const permission = await storage_1.storage.getPermission(permissionId);
                if (permission) {
                    const rolePermission = await storage_1.storage.createRolePermission({
                        roleId,
                        permissionId
                    });
                    results.push(rolePermission);
                }
            }
            res.status(201).json(results);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid data", errors: error.errors });
            }
            res.status(500).json({ message: "Error assigning permissions to role" });
        }
    });
    // User Management Routes - extensions beyond basic auth
    app.get("/api/users", async (req, res) => {
        try {
            // Verify user is admin or manager
            if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
                return res.status(403).json({ message: "Unauthorized: Admin or Manager access required" });
            }
            const users = await storage_1.storage.getUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching users" });
        }
    });
    // Endpoint to get current user's permissions
    // Users and Roles Management (Admin Only)
    app.get("/api/users", (0, auth_1.requirePermission)("users:view"), async (req, res) => {
        try {
            const users = await storage_1.storage.getUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching users" });
        }
    });
    app.get("/api/roles", (0, auth_1.requirePermission)("roles:view"), async (req, res) => {
        try {
            const roles = await storage_1.storage.getRoles();
            res.json(roles);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching roles" });
        }
    });
    app.get("/api/permissions", (0, auth_1.requirePermission)("roles:view"), async (req, res) => {
        try {
            const permissions = await storage_1.storage.getPermissions();
            res.json(permissions);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching permissions" });
        }
    });
    app.get("/api/role-permissions/:roleId", (0, auth_1.requirePermission)("roles:view"), async (req, res) => {
        try {
            const roleId = parseInt(req.params.roleId);
            const permissions = await storage_1.storage.getPermissionsByRole(roleId);
            res.json(permissions);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching role permissions" });
        }
    });
    app.post("/api/role-permissions", (0, auth_1.requirePermission)("roles:manage"), async (req, res) => {
        try {
            const rolePermData = schema_1.insertRolePermissionSchema.parse(req.body);
            const rolePermission = await storage_1.storage.createRolePermission(rolePermData);
            res.status(201).json(rolePermission);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: "Invalid role permission data", errors: error.errors });
            }
            res.status(500).json({ message: "Error creating role permission" });
        }
    });
    app.delete("/api/role-permissions/:id", (0, auth_1.requirePermission)("roles:manage"), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const success = await storage_1.storage.deleteRolePermission(id);
            if (!success) {
                return res.status(404).json({ message: "Role permission not found" });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting role permission" });
        }
    });
    // Endpoint to get current user's permissions
    app.get("/api/current-user-permissions", async (req, res) => {
        try {
            if (!req.isAuthenticated() || !req.user) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            // Get permissions for the user's role
            const role = await storage_1.storage.getRoleByName(req.user.role);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
            const permissions = await storage_1.storage.getPermissionsByRole(role.id);
            res.json({
                user: req.user,
                permissions
            });
        }
        catch (error) {
            console.error("Error fetching user permissions:", error);
            res.status(500).json({ message: "Error fetching user permissions" });
        }
    });
    // Notification System Status & Settings
    app.get("/api/notification/status", (0, auth_1.requireRole)("admin"), async (req, res) => {
        try {
            res.json({
                ready: true,
                mode: "Simple notification (simulated mode)",
                info: "Sistem notifikasi sederhana dalam mode simulasi yang digunakan untuk pengujian"
            });
        }
        catch (error) {
            console.error("Error fetching notification status:", error);
            res.status(500).json({ message: "Error fetching notification status" });
        }
    });
    // Get notification settings
    app.get("/api/notification/settings", (0, auth_1.requireRole)("admin"), async (req, res) => {
        try {
            const settings = (0, notification_settings_1.getNotificationSettings)();
            res.json(settings);
        }
        catch (error) {
            console.error("Error fetching notification settings:", error);
            res.status(500).json({ message: "Error fetching notification settings" });
        }
    });
    // Save notification settings
    app.post("/api/notification/settings", (0, auth_1.requireRole)("admin"), async (req, res) => {
        try {
            const settings = req.body;
            // Validate settings
            if (!settings || !settings.templates) {
                return res.status(400).json({ message: "Invalid settings format" });
            }
            const success = (0, notification_settings_1.saveNotificationSettings)(settings);
            if (success) {
                res.json({ message: "Settings saved successfully", settings });
            }
            else {
                res.status(500).json({ message: "Failed to save settings" });
            }
        }
        catch (error) {
            console.error("Error saving notification settings:", error);
            res.status(500).json({ message: "Error saving notification settings" });
        }
    });
    // Transaction Tracking System
    app.get("/api/tracking/:code", async (req, res) => {
        try {
            const trackingCode = req.params.code;
            // Validasi format tracking code
            if (!trackingCode || !trackingCode.startsWith('WC-')) {
                return res.status(400).json({ message: "Invalid tracking code format" });
            }
            // Cari transaksi berdasarkan tracking code
            const transactions = await storage_1.storage.getTransactions();
            const transaction = transactions.find(t => t.trackingCode === trackingCode);
            if (!transaction) {
                return res.status(404).json({ message: "Tracking code not found" });
            }
            // Ambil data customer dan service items jika transaksi ditemukan
            const customer = transaction.customerId
                ? await storage_1.storage.getCustomer(transaction.customerId)
                : null;
            const transactionItems = await storage_1.storage.getTransactionItems(transaction.id);
            // Ambil detail layanan untuk setiap item
            const serviceDetails = [];
            for (const item of transactionItems) {
                if (item.serviceId) {
                    const service = await storage_1.storage.getService(item.serviceId);
                    if (service) {
                        serviceDetails.push({
                            ...service,
                            quantity: item.quantity,
                            price: item.price,
                            discount: item.discount
                        });
                    }
                }
            }
            // Generate QR code untuk tracking page
            const qrCodeDataUrl = await (0, barcode_1.generateTrackingQRCode)(trackingCode);
            res.json({
                transaction: {
                    id: transaction.id,
                    trackingCode: transaction.trackingCode,
                    date: transaction.date,
                    status: transaction.status,
                    total: transaction.total,
                    notes: transaction.notes,
                },
                customer: customer ? {
                    name: customer.name,
                    phone: customer.phone,
                    vehicleType: customer.vehicleType,
                    licensePlate: customer.licensePlate
                } : null,
                services: serviceDetails,
                qrCode: qrCodeDataUrl
            });
        }
        catch (error) {
            console.error("Error fetching tracking information:", error);
            res.status(500).json({ message: "Error fetching tracking information" });
        }
    });
    // Endpoint khusus untuk halaman public tracking
    app.get("/api/public/tracking/:code", async (req, res) => {
        try {
            const trackingCode = req.params.code;
            // Validasi format tracking code
            if (!trackingCode || !trackingCode.startsWith('WC-')) {
                return res.status(400).json({ message: "Invalid tracking code format" });
            }
            // Cari transaksi berdasarkan tracking code
            const transactions = await storage_1.storage.getTransactions();
            const transaction = transactions.find(t => t.trackingCode === trackingCode);
            if (!transaction) {
                return res.status(404).json({ message: "Tracking code not found" });
            }
            // Ambil data customer dan service items jika transaksi ditemukan
            const customer = transaction.customerId
                ? await storage_1.storage.getCustomer(transaction.customerId)
                : null;
            const transactionItems = await storage_1.storage.getTransactionItems(transaction.id);
            // Ambil detail layanan untuk setiap item (nama saja)
            const serviceNames = [];
            for (const item of transactionItems) {
                if (item.serviceId) {
                    const service = await storage_1.storage.getService(item.serviceId);
                    if (service) {
                        serviceNames.push(service.name);
                    }
                }
            }
            // Data yang aman untuk ditampilkan di halaman publik
            res.json({
                trackingCode: transaction.trackingCode,
                status: transaction.status,
                date: transaction.date,
                vehicle: customer ? {
                    type: customer.vehicleType,
                    plate: customer.licensePlate
                } : null,
                services: serviceNames
            });
        }
        catch (error) {
            console.error("Error fetching public tracking information:", error);
            res.status(500).json({ message: "Error fetching tracking information" });
        }
    });
    // Create HTTP server
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
