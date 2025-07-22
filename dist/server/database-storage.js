"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseStorage = void 0;
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const schema_1 = require("@shared/schema");
const date_fns_1 = require("date-fns");
// Create memory store for session data
const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
class DatabaseStorage {
    constructor() {
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000 // 24 hours
        });
        // Database akan diinisialisasi oleh routes.ts dengan inisialisasi role dan permission
        // Tidak perlu inisialisasi database di sini untuk mencegah error
    }
    // Function to initialize database, e.g., create admin user if none exists
    async initializeDatabase() {
        try {
            // Periksa apakah koneksi database aktif
            try {
                await db_1.db.select().from(schema_1.users).limit(1);
                console.log("Koneksi database aktif dan siap digunakan");
            }
            catch (err) {
                console.error("Koneksi database belum siap:", err);
                throw new Error("Database connection not ready");
            }
            // Check if admin user exists
            const adminUser = await this.getUserByUsername("admin");
            // If no admin user, create one
            if (!adminUser) {
                await this.createUser({
                    username: "admin",
                    password: "admin123", // This will be hashed in auth.ts
                    name: "Admin Wash Corner",
                    role: "admin", // Gunakan role, bukan role_id
                    email: "admin@washcorner.com"
                });
                console.log("Admin user created successfully");
            }
            return true;
        }
        catch (error) {
            console.error("Error initializing database:", error);
            return false;
        }
    }
    // User methods
    async getUser(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return result[0];
    }
    async getUserByUsername(username) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        return result[0];
    }
    async createUser(insertUser) {
        const [result] = await db_1.db.insert(schema_1.users).values(insertUser).returning();
        return result;
    }
    async getUsers() {
        return await db_1.db.select().from(schema_1.users);
    }
    async updateUser(id, userData) {
        const [result] = await db_1.db.update(schema_1.users).set(userData).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning();
        return result;
    }
    // Customer methods
    async getCustomer(id) {
        const result = await db_1.db.select().from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id));
        return result[0];
    }
    async createCustomer(insertCustomer) {
        const [result] = await db_1.db.insert(schema_1.customers).values(insertCustomer).returning();
        return result;
    }
    async getCustomers() {
        return await db_1.db.select().from(schema_1.customers);
    }
    async updateCustomer(id, customerData) {
        const [result] = await db_1.db.update(schema_1.customers).set(customerData).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id)).returning();
        return result;
    }
    async deleteCustomer(id) {
        const result = await db_1.db.delete(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id));
        return true; // PostgreSQL tidak memberikan detail rowsAffected
    }
    // Service methods
    async getService(id) {
        const result = await db_1.db.select().from(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.id, id));
        return result[0];
    }
    async createService(insertService) {
        const [result] = await db_1.db.insert(schema_1.services).values(insertService).returning();
        return result;
    }
    async getServices() {
        return await db_1.db.select().from(schema_1.services);
    }
    async getServicesByVehicleType(vehicleType) {
        return await db_1.db.select().from(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.vehicleType, vehicleType));
    }
    async updateService(id, serviceData) {
        const [result] = await db_1.db.update(schema_1.services).set(serviceData).where((0, drizzle_orm_1.eq)(schema_1.services.id, id)).returning();
        return result;
    }
    async deleteService(id) {
        await db_1.db.delete(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.id, id));
        return true;
    }
    // Inventory methods
    async getInventoryItem(id) {
        const result = await db_1.db.select().from(schema_1.inventoryItems).where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, id));
        return result[0];
    }
    async createInventoryItem(insertItem) {
        const [result] = await db_1.db.insert(schema_1.inventoryItems).values(insertItem).returning();
        return result;
    }
    async getInventoryItems() {
        return await db_1.db.select().from(schema_1.inventoryItems);
    }
    async getLowStockItems() {
        return await db_1.db.select().from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.inventoryItems.minimumStock, schema_1.inventoryItems.currentStock)));
    }
    async updateInventoryItem(id, itemData) {
        const [result] = await db_1.db.update(schema_1.inventoryItems).set(itemData).where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, id)).returning();
        return result;
    }
    async deleteInventoryItem(id) {
        await db_1.db.delete(schema_1.inventoryItems).where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, id));
        return true;
    }
    // Employee methods
    async getEmployee(id) {
        const result = await db_1.db.select().from(schema_1.employees).where((0, drizzle_orm_1.eq)(schema_1.employees.id, id));
        return result[0];
    }
    async createEmployee(insertEmployee) {
        const [result] = await db_1.db.insert(schema_1.employees).values(insertEmployee).returning();
        return result;
    }
    async getEmployees() {
        return await db_1.db.select().from(schema_1.employees);
    }
    async updateEmployee(id, employeeData) {
        const [result] = await db_1.db.update(schema_1.employees).set(employeeData).where((0, drizzle_orm_1.eq)(schema_1.employees.id, id)).returning();
        return result;
    }
    async deleteEmployee(id) {
        await db_1.db.delete(schema_1.employees).where((0, drizzle_orm_1.eq)(schema_1.employees.id, id));
        return true;
    }
    // Transaction methods
    async getTransaction(id) {
        const result = await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id));
        return result[0];
    }
    async createTransaction(insertTransaction) {
        const [result] = await db_1.db.insert(schema_1.transactions).values(insertTransaction).returning();
        return result;
    }
    async getTransactions() {
        return await db_1.db.select().from(schema_1.transactions);
    }
    async getRecentTransactions(limit) {
        return await db_1.db.select().from(schema_1.transactions).orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.date)).limit(limit);
    }
    async getDailyTransactions(date) {
        const startDate = (0, date_fns_1.startOfDay)(date);
        const endDate = (0, date_fns_1.endOfDay)(date);
        return await db_1.db.select().from(schema_1.transactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.transactions.date, startDate), (0, drizzle_orm_1.lte)(schema_1.transactions.date, endDate)));
    }
    async updateTransaction(id, transactionData) {
        const [result] = await db_1.db.update(schema_1.transactions).set(transactionData).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id)).returning();
        return result;
    }
    async deleteAllTransactions() {
        // Hapus terlebih dahulu item transaksi dan penggunaan inventaris
        await db_1.db.delete(schema_1.transactionItems);
        await db_1.db.delete(schema_1.inventoryUsage);
        // Kemudian hapus semua transaksi
        const result = await db_1.db.delete(schema_1.transactions);
        return 1; // PostgreSQL doesn't return affected rows in Drizzle ORM, so we return 1 to indicate success
    }
    // Transaction Item methods
    async getTransactionItems(transactionId) {
        return await db_1.db.select().from(schema_1.transactionItems).where((0, drizzle_orm_1.eq)(schema_1.transactionItems.transactionId, transactionId));
    }
    async createTransactionItem(insertItem) {
        const [result] = await db_1.db.insert(schema_1.transactionItems).values(insertItem).returning();
        return result;
    }
    // Inventory Usage methods
    async createInventoryUsage(insertUsage) {
        const [result] = await db_1.db.insert(schema_1.inventoryUsage).values(insertUsage).returning();
        return result;
    }
    async getInventoryUsage(transactionId) {
        return await db_1.db.select().from(schema_1.inventoryUsage).where((0, drizzle_orm_1.eq)(schema_1.inventoryUsage.transactionId, transactionId));
    }
    // Dashboard stats methods
    async getDailyStats(date) {
        // Get daily transactions
        const dailyTransactions = await this.getDailyTransactions(date);
        // Calculate income
        const income = dailyTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
        // Calculate average per transaction
        const avgPerTransaction = dailyTransactions.length > 0
            ? Math.round(income / dailyTransactions.length)
            : 0;
        // Get transaction IDs
        const transactionIds = dailyTransactions.map(t => t.id);
        // Customer count (unique customers)
        const uniqueCustomerIds = new Set(dailyTransactions.map(t => t.customerId));
        const customerCount = uniqueCustomerIds.size;
        // Start of day for date
        const startDate = (0, date_fns_1.startOfDay)(date);
        // New customers registered today
        const newCustomersData = await db_1.db.select().from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.customers.createdAt, startDate), (0, drizzle_orm_1.lte)(schema_1.customers.createdAt, (0, date_fns_1.endOfDay)(date))));
        const newCustomers = newCustomersData.length;
        // Get vehicle types (car vs motorcycle)
        // This requires a join with customers table
        // For simplicity in this implementation, we'll use mock data
        const carCount = Math.round(customerCount * 0.6); // Assuming 60% cars
        const motorcycleCount = customerCount - carCount;
        // Average wait time and queue count (mock data for this implementation)
        const avgWaitTime = 15; // 15 minutes average wait time
        const queueCount = 3; // 3 customers in queue
        return {
            income,
            customerCount,
            carCount,
            motorcycleCount,
            avgPerTransaction,
            newCustomers,
            avgWaitTime,
            queueCount
        };
    }
    // ========== HRD MANAGEMENT METHODS ==========
    // Attendance methods
    async getAttendance(id) {
        const result = await db_1.db.select().from(schema_1.attendances).where((0, drizzle_orm_1.eq)(schema_1.attendances.id, id));
        return result[0];
    }
    async createAttendance(insertAttendance) {
        const [result] = await db_1.db.insert(schema_1.attendances).values(insertAttendance).returning();
        return result;
    }
    async getAttendances() {
        return await db_1.db.select().from(schema_1.attendances);
    }
    async getAttendancesByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.attendances).where((0, drizzle_orm_1.eq)(schema_1.attendances.employeeId, employeeId));
    }
    async getAttendancesByDate(date) {
        const startDate = (0, date_fns_1.startOfDay)(date);
        const endDate = (0, date_fns_1.endOfDay)(date);
        return await db_1.db.select().from(schema_1.attendances)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.attendances.date, startDate), (0, drizzle_orm_1.lte)(schema_1.attendances.date, endDate)));
    }
    async updateAttendance(id, attendanceData) {
        const [result] = await db_1.db.update(schema_1.attendances).set(attendanceData).where((0, drizzle_orm_1.eq)(schema_1.attendances.id, id)).returning();
        return result;
    }
    async deleteAttendance(id) {
        await db_1.db.delete(schema_1.attendances).where((0, drizzle_orm_1.eq)(schema_1.attendances.id, id));
        return true;
    }
    // Payroll methods
    async getPayroll(id) {
        const result = await db_1.db.select().from(schema_1.payrolls).where((0, drizzle_orm_1.eq)(schema_1.payrolls.id, id));
        return result[0];
    }
    async createPayroll(insertPayroll) {
        try {
            console.log("CreatePayroll menerima input:", JSON.stringify(insertPayroll));
            // Ambil data karyawan untuk mendapatkan posisinya
            const employee = await this.getEmployee(insertPayroll.employeeId);
            if (!employee) {
                throw new Error("Karyawan tidak ditemukan");
            }
            console.log("Data karyawan:", JSON.stringify(employee));
            // Ambil data posisi gaji berdasarkan posisi karyawan
            const positionSalary = await this.getPositionSalaryByPosition(employee.position);
            // Tambahkan fallback untuk gaji posisi yang belum diatur
            if (!positionSalary) {
                console.log(`Gaji untuk posisi ${employee.position} belum diatur, menggunakan nilai dari form input.`);
            }
            else {
                console.log("Data posisi:", JSON.stringify(positionSalary));
            }
            // Tentukan perhitungan gaji berdasarkan tipe penggajian (harian atau bulanan)
            let baseSalary = 0;
            const paymentType = insertPayroll.paymentType || 'monthly'; // Default ke bulanan jika tidak ditentukan
            console.log("Tipe pembayaran:", paymentType);
            if (paymentType === 'daily') {
                // Debugging untuk tarif harian
                const customDailyRate = insertPayroll.dailyRate;
                console.log("Custom daily rate:", customDailyRate);
                // Nilai default jika tidak ada positionSalary
                let positionDailyRate = 0;
                if (positionSalary) {
                    positionDailyRate = positionSalary.dailyRate;
                    console.log("Position daily rate:", positionDailyRate);
                }
                // Hitung jumlah hari kerja dalam periode
                const periodStart = new Date(insertPayroll.periodStart);
                const periodEnd = new Date(insertPayroll.periodEnd);
                console.log("Period start:", periodStart.toISOString());
                console.log("Period end:", periodEnd.toISOString());
                // Ambil data absensi dalam periode
                const attendanceRecords = await db_1.db.select()
                    .from(schema_1.attendances)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.attendances.employeeId, insertPayroll.employeeId), (0, drizzle_orm_1.gte)(schema_1.attendances.date, periodStart), (0, drizzle_orm_1.lte)(schema_1.attendances.date, periodEnd), (0, drizzle_orm_1.eq)(schema_1.attendances.status, 'present')));
                console.log("Attendance records found:", attendanceRecords.length);
                console.log("Attendance records:", JSON.stringify(attendanceRecords));
                // Jika tidak ada catatan kehadiran, gunakan minimal 1 hari kerja untuk gaji harian
                const workDays = attendanceRecords?.length || 1;
                console.log("Work days used for calculation:", workDays);
                // Gunakan dailyRate kustom jika disediakan, jika tidak gunakan tarif dari positionSalary
                const dailyRate = customDailyRate || positionDailyRate;
                console.log("Daily rate used for calculation:", dailyRate);
                baseSalary = workDays * dailyRate;
                console.log("Calculated base salary:", baseSalary);
            }
            else {
                // Debugging untuk gaji bulanan
                const customMonthlySalary = insertPayroll.monthlySalary;
                console.log("Custom monthly salary:", customMonthlySalary);
                // Nilai default jika tidak ada positionSalary
                let positionMonthlySalary = 0;
                if (positionSalary) {
                    positionMonthlySalary = positionSalary.monthlySalary;
                    console.log("Position monthly salary:", positionMonthlySalary);
                }
                // Gunakan monthlySalary kustom jika disediakan, jika tidak gunakan gaji dari positionSalary
                baseSalary = customMonthlySalary || positionMonthlySalary;
                console.log("Monthly salary used for calculation:", baseSalary);
            }
            // Gunakan tunjangan dari parameter form yang dikirim atau gunakan default 35000
            let allowancesTotal = insertPayroll.allowance || 35000;
            console.log("Tunjangan dari form:", allowancesTotal);
            // Jika tidak ada tunjangan yang diberikan secara eksplisit, gunakan dari posisi
            if (!allowancesTotal && positionSalary && positionSalary.allowances) {
                try {
                    // Konversi JSON ke objek jika perlu
                    const allowances = typeof positionSalary.allowances === 'string'
                        ? JSON.parse(positionSalary.allowances)
                        : positionSalary.allowances;
                    console.log("Processed allowances from position:", allowances, "Type:", typeof allowances);
                    // Hitung total tunjangan
                    if (typeof allowances === 'object' && allowances !== null) {
                        allowancesTotal = 0; // Reset karena akan menghitung dari objek
                        for (const [key, value] of Object.entries(allowances)) {
                            console.log(`- Tunjangan ${key}:`, value, "Type:", typeof value);
                            allowancesTotal += Number(value);
                        }
                    }
                    else {
                        console.error("Allowances bukan objek yang valid:", allowances);
                    }
                }
                catch (err) {
                    console.error("Error memproses tunjangan:", err);
                    // Gunakan default jika ada error
                    allowancesTotal = 35000;
                }
            }
            else {
                console.log("Menggunakan tunjangan default:", allowancesTotal);
            }
            // Hitung total gaji (gaji pokok + bonus + tunjangan - potongan)
            console.log("Perhitungan total:");
            console.log("- Gaji pokok:", baseSalary);
            console.log("- Bonus:", insertPayroll.bonus || 0);
            console.log("- Allowances:", allowancesTotal);
            console.log("- Potongan:", insertPayroll.deduction || 0);
            const totalAmount = baseSalary + (insertPayroll.bonus || 0) + allowancesTotal - (insertPayroll.deduction || 0);
            console.log("= Total amount:", totalAmount);
            // Update data payroll dengan info yang dihitung
            const payrollData = {
                ...insertPayroll,
                baseSalary,
                totalAmount,
                status: insertPayroll.status || 'pending'
            };
            // Simpan data payroll
            const [result] = await db_1.db.insert(schema_1.payrolls).values(payrollData).returning();
            return result;
        }
        catch (error) {
            console.error("Error creating payroll:", error);
            throw error;
        }
    }
    async getPayrolls() {
        return await db_1.db.select().from(schema_1.payrolls);
    }
    async getPayrollsByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.payrolls).where((0, drizzle_orm_1.eq)(schema_1.payrolls.employeeId, employeeId));
    }
    async getPayrollsByPeriod(startDate, endDate) {
        return await db_1.db.select().from(schema_1.payrolls)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.payrolls.periodStart, startDate), (0, drizzle_orm_1.lte)(schema_1.payrolls.periodStart, endDate)));
    }
    async updatePayroll(id, payrollData) {
        const [result] = await db_1.db.update(schema_1.payrolls).set(payrollData).where((0, drizzle_orm_1.eq)(schema_1.payrolls.id, id)).returning();
        return result;
    }
    async deletePayroll(id) {
        await db_1.db.delete(schema_1.payrolls).where((0, drizzle_orm_1.eq)(schema_1.payrolls.id, id));
        return true;
    }
    // Performance Review methods
    async getPerformanceReview(id) {
        const result = await db_1.db.select().from(schema_1.performanceReviews).where((0, drizzle_orm_1.eq)(schema_1.performanceReviews.id, id));
        return result[0];
    }
    async createPerformanceReview(insertReview) {
        const [result] = await db_1.db.insert(schema_1.performanceReviews).values(insertReview).returning();
        return result;
    }
    async getPerformanceReviews() {
        return await db_1.db.select().from(schema_1.performanceReviews);
    }
    async getPerformanceReviewsByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.performanceReviews).where((0, drizzle_orm_1.eq)(schema_1.performanceReviews.employeeId, employeeId));
    }
    async updatePerformanceReview(id, reviewData) {
        const [result] = await db_1.db.update(schema_1.performanceReviews).set(reviewData).where((0, drizzle_orm_1.eq)(schema_1.performanceReviews.id, id)).returning();
        return result;
    }
    async deletePerformanceReview(id) {
        await db_1.db.delete(schema_1.performanceReviews).where((0, drizzle_orm_1.eq)(schema_1.performanceReviews.id, id));
        return true;
    }
    // Leave Request methods
    async getLeaveRequest(id) {
        const result = await db_1.db.select().from(schema_1.leaveRequests).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.id, id));
        return result[0];
    }
    async createLeaveRequest(insertRequest) {
        const [result] = await db_1.db.insert(schema_1.leaveRequests).values(insertRequest).returning();
        return result;
    }
    async getLeaveRequests() {
        return await db_1.db.select().from(schema_1.leaveRequests);
    }
    async getLeaveRequestsByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.leaveRequests).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.employeeId, employeeId));
    }
    async getPendingLeaveRequests() {
        return await db_1.db.select().from(schema_1.leaveRequests).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.status, 'pending'));
    }
    async updateLeaveRequest(id, requestData) {
        const [result] = await db_1.db.update(schema_1.leaveRequests).set(requestData).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.id, id)).returning();
        return result;
    }
    async approveLeaveRequest(id, approverId) {
        const now = new Date();
        const [result] = await db_1.db.update(schema_1.leaveRequests)
            .set({
            status: 'approved',
            approvedById: approverId,
            approvedAt: now,
            updatedAt: now
        })
            .where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.id, id))
            .returning();
        return result;
    }
    async rejectLeaveRequest(id, approverId) {
        const now = new Date();
        const [result] = await db_1.db.update(schema_1.leaveRequests)
            .set({
            status: 'rejected',
            approvedById: approverId,
            approvedAt: now,
            updatedAt: now
        })
            .where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.id, id))
            .returning();
        return result;
    }
    async deleteLeaveRequest(id) {
        await db_1.db.delete(schema_1.leaveRequests).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.id, id));
        return true;
    }
    // Training Session methods
    async getTrainingSession(id) {
        const result = await db_1.db.select().from(schema_1.trainingSessions).where((0, drizzle_orm_1.eq)(schema_1.trainingSessions.id, id));
        return result[0];
    }
    async createTrainingSession(insertSession) {
        const [result] = await db_1.db.insert(schema_1.trainingSessions).values(insertSession).returning();
        return result;
    }
    async getTrainingSessions() {
        return await db_1.db.select().from(schema_1.trainingSessions);
    }
    async getUpcomingTrainingSessions() {
        const now = new Date();
        return await db_1.db.select().from(schema_1.trainingSessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.trainingSessions.startDate, now), (0, drizzle_orm_1.eq)(schema_1.trainingSessions.status, 'scheduled')));
    }
    async updateTrainingSession(id, sessionData) {
        const [result] = await db_1.db.update(schema_1.trainingSessions).set(sessionData).where((0, drizzle_orm_1.eq)(schema_1.trainingSessions.id, id)).returning();
        return result;
    }
    async deleteTrainingSession(id) {
        await db_1.db.delete(schema_1.trainingSessions).where((0, drizzle_orm_1.eq)(schema_1.trainingSessions.id, id));
        return true;
    }
    // Training Participant methods
    async getTrainingParticipant(id) {
        const result = await db_1.db.select().from(schema_1.trainingParticipants).where((0, drizzle_orm_1.eq)(schema_1.trainingParticipants.id, id));
        return result[0];
    }
    async createTrainingParticipant(insertParticipant) {
        const [result] = await db_1.db.insert(schema_1.trainingParticipants).values(insertParticipant).returning();
        return result;
    }
    async getTrainingParticipants(trainingId) {
        return await db_1.db.select().from(schema_1.trainingParticipants).where((0, drizzle_orm_1.eq)(schema_1.trainingParticipants.trainingId, trainingId));
    }
    async getTrainingParticipantsByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.trainingParticipants).where((0, drizzle_orm_1.eq)(schema_1.trainingParticipants.employeeId, employeeId));
    }
    async updateTrainingParticipant(id, participantData) {
        const [result] = await db_1.db.update(schema_1.trainingParticipants).set(participantData).where((0, drizzle_orm_1.eq)(schema_1.trainingParticipants.id, id)).returning();
        return result;
    }
    async deleteTrainingParticipant(id) {
        await db_1.db.delete(schema_1.trainingParticipants).where((0, drizzle_orm_1.eq)(schema_1.trainingParticipants.id, id));
        return true;
    }
    // HRD Document methods
    async getHrdDocument(id) {
        const result = await db_1.db.select().from(schema_1.hrdDocuments).where((0, drizzle_orm_1.eq)(schema_1.hrdDocuments.id, id));
        return result[0];
    }
    async createHrdDocument(insertDocument) {
        const [result] = await db_1.db.insert(schema_1.hrdDocuments).values(insertDocument).returning();
        return result;
    }
    async getHrdDocuments() {
        return await db_1.db.select().from(schema_1.hrdDocuments);
    }
    async getHrdDocumentsByEmployee(employeeId) {
        return await db_1.db.select().from(schema_1.hrdDocuments).where((0, drizzle_orm_1.eq)(schema_1.hrdDocuments.employeeId, employeeId));
    }
    async getExpiringHrdDocuments(daysThreshold) {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);
        return await db_1.db.select().from(schema_1.hrdDocuments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.hrdDocuments.expiryDate, thresholdDate), (0, drizzle_orm_1.gte)(schema_1.hrdDocuments.expiryDate, today)));
    }
    async updateHrdDocument(id, documentData) {
        const [result] = await db_1.db.update(schema_1.hrdDocuments).set(documentData).where((0, drizzle_orm_1.eq)(schema_1.hrdDocuments.id, id)).returning();
        return result;
    }
    async deleteHrdDocument(id) {
        await db_1.db.delete(schema_1.hrdDocuments).where((0, drizzle_orm_1.eq)(schema_1.hrdDocuments.id, id));
        return true;
    }
    // Position Salary methods
    async getPositionSalary(id) {
        const result = await db_1.db.select().from(schema_1.positionSalaries).where((0, drizzle_orm_1.eq)(schema_1.positionSalaries.id, id));
        return result[0];
    }
    async getPositionSalaryByPosition(position) {
        const result = await db_1.db.select().from(schema_1.positionSalaries).where((0, drizzle_orm_1.eq)(schema_1.positionSalaries.position, position));
        return result[0];
    }
    async createPositionSalary(insertSalary) {
        const [result] = await db_1.db.insert(schema_1.positionSalaries).values(insertSalary).returning();
        return result;
    }
    async getPositionSalaries() {
        return await db_1.db.select().from(schema_1.positionSalaries);
    }
    async updatePositionSalary(id, salaryData) {
        const [result] = await db_1.db.update(schema_1.positionSalaries).set(salaryData).where((0, drizzle_orm_1.eq)(schema_1.positionSalaries.id, id)).returning();
        return result;
    }
    async deletePositionSalary(id) {
        await db_1.db.delete(schema_1.positionSalaries).where((0, drizzle_orm_1.eq)(schema_1.positionSalaries.id, id));
        return true;
    }
    // Role methods
    async getRole(id) {
        const result = await db_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
        return result[0];
    }
    async getRoleByName(name) {
        const result = await db_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.name, name));
        return result[0];
    }
    async createRole(insertRole) {
        const [result] = await db_1.db.insert(schema_1.roles).values(insertRole).returning();
        return result;
    }
    async getRoles() {
        return await db_1.db.select().from(schema_1.roles);
    }
    async updateRole(id, roleData) {
        const [result] = await db_1.db.update(schema_1.roles).set(roleData).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).returning();
        return result;
    }
    async deleteRole(id) {
        await db_1.db.delete(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
        return true;
    }
    // Permission methods
    async getPermission(id) {
        const result = await db_1.db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, id));
        return result[0];
    }
    async getPermissionByName(name) {
        const result = await db_1.db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.name, name));
        return result[0];
    }
    async createPermission(insertPermission) {
        const [result] = await db_1.db.insert(schema_1.permissions).values(insertPermission).returning();
        return result;
    }
    async getPermissions() {
        return await db_1.db.select().from(schema_1.permissions);
    }
    async getPermissionsByModule(module) {
        return await db_1.db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.module, module));
    }
    async updatePermission(id, permissionData) {
        const [result] = await db_1.db.update(schema_1.permissions).set(permissionData).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, id)).returning();
        return result;
    }
    async deletePermission(id) {
        await db_1.db.delete(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, id));
        return true;
    }
    // Role Permission methods
    async getRolePermission(id) {
        const result = await db_1.db.select().from(schema_1.rolePermissions).where((0, drizzle_orm_1.eq)(schema_1.rolePermissions.id, id));
        return result[0];
    }
    async createRolePermission(insertRolePermission) {
        const [result] = await db_1.db.insert(schema_1.rolePermissions).values(insertRolePermission).returning();
        return result;
    }
    async getRolePermissions(roleId) {
        return await db_1.db.select().from(schema_1.rolePermissions).where((0, drizzle_orm_1.eq)(schema_1.rolePermissions.roleId, roleId));
    }
    async deleteRolePermission(id) {
        await db_1.db.delete(schema_1.rolePermissions).where((0, drizzle_orm_1.eq)(schema_1.rolePermissions.id, id));
        return true;
    }
    async deleteRolePermissionsByRole(roleId) {
        await db_1.db.delete(schema_1.rolePermissions).where((0, drizzle_orm_1.eq)(schema_1.rolePermissions.roleId, roleId));
        return true;
    }
    async getPermissionsByRole(roleId) {
        const rolePerms = await db_1.db.select()
            .from(schema_1.rolePermissions)
            .where((0, drizzle_orm_1.eq)(schema_1.rolePermissions.roleId, roleId));
        const permissionIds = rolePerms.map(rp => rp.permissionId);
        if (permissionIds.length === 0) {
            return [];
        }
        // Handle each permission separately with OR
        const conditions = permissionIds.map(id => (0, drizzle_orm_1.eq)(schema_1.permissions.id, id));
        // Handle single permission case
        if (conditions.length === 1) {
            return await db_1.db.select()
                .from(schema_1.permissions)
                .where(conditions[0]);
        }
        // Handle multiple permissions with OR
        return await db_1.db.select()
            .from(schema_1.permissions)
            .where((0, drizzle_orm_1.or)(...conditions));
    }
    // HRD Dashboard methods
    async getHrdDashboardStats() {
        const today = new Date();
        // Get total employees and active employees
        const allEmployees = await db_1.db.select().from(schema_1.employees);
        const totalEmployees = allEmployees.length;
        const activeEmployees = allEmployees.filter((emp) => emp.isActive === true).length;
        // Get attendance stats for today
        const startOfToday = (0, date_fns_1.startOfDay)(today);
        const endOfToday = (0, date_fns_1.endOfDay)(today);
        const todayAttendances = await db_1.db.select().from(schema_1.attendances)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.attendances.date, startOfToday), (0, drizzle_orm_1.lte)(schema_1.attendances.date, endOfToday)));
        const absentToday = todayAttendances.filter((att) => att.status === 'absent').length;
        const presentToday = todayAttendances.filter((att) => att.status === 'present').length;
        const lateToday = todayAttendances.filter((att) => att.status === 'late').length;
        // Get pending leave requests
        const pendingLeaveRequests = (await db_1.db.select().from(schema_1.leaveRequests).where((0, drizzle_orm_1.eq)(schema_1.leaveRequests.status, 'pending'))).length;
        // Get upcoming trainings
        const upcomingTrainings = (await db_1.db.select().from(schema_1.trainingSessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.trainingSessions.startDate, today), (0, drizzle_orm_1.eq)(schema_1.trainingSessions.status, 'scheduled')))).length;
        // Get documents expiring soon (in the next 30 days)
        const thirtyDaysFromToday = new Date();
        thirtyDaysFromToday.setDate(today.getDate() + 30);
        const expiringSoonDocuments = (await db_1.db.select().from(schema_1.hrdDocuments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.hrdDocuments.expiryDate, thirtyDaysFromToday), (0, drizzle_orm_1.gte)(schema_1.hrdDocuments.expiryDate, today)))).length;
        return {
            totalEmployees,
            activeEmployees,
            absentToday,
            presentToday,
            lateToday,
            pendingLeaveRequests,
            upcomingTrainings,
            expiringSoonDocuments
        };
    }
    // ========== FINANCE MANAGEMENT METHODS ==========
    // Expense Category methods
    async getExpenseCategory(id) {
        const [category] = await db_1.db.select().from(schema_1.expenseCategories).where((0, drizzle_orm_1.eq)(schema_1.expenseCategories.id, id));
        return category;
    }
    async createExpenseCategory(insertCategory) {
        const [category] = await db_1.db.insert(schema_1.expenseCategories).values(insertCategory).returning();
        return category;
    }
    async getExpenseCategories() {
        return db_1.db.select().from(schema_1.expenseCategories);
    }
    async updateExpenseCategory(id, categoryData) {
        const [updatedCategory] = await db_1.db.update(schema_1.expenseCategories)
            .set({ ...categoryData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.expenseCategories.id, id))
            .returning();
        return updatedCategory;
    }
    async deleteExpenseCategory(id) {
        await db_1.db.delete(schema_1.expenseCategories).where((0, drizzle_orm_1.eq)(schema_1.expenseCategories.id, id));
        return true;
    }
    // Expense methods
    async getExpense(id) {
        const [expense] = await db_1.db.select().from(schema_1.expenses).where((0, drizzle_orm_1.eq)(schema_1.expenses.id, id));
        return expense;
    }
    async createExpense(insertExpense) {
        const [expense] = await db_1.db.insert(schema_1.expenses).values(insertExpense).returning();
        return expense;
    }
    async getExpenses() {
        return db_1.db.select().from(schema_1.expenses).orderBy((0, drizzle_orm_1.desc)(schema_1.expenses.date));
    }
    async getExpensesByDateRange(startDate, endDate) {
        return db_1.db.select().from(schema_1.expenses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.expenses.date, startDate), (0, drizzle_orm_1.lte)(schema_1.expenses.date, endDate)))
            .orderBy(schema_1.expenses.date);
    }
    async getExpensesByMonth(year, month) {
        const startDate = new Date(year, month - 1, 1); // January is 0 in JavaScript Date
        const endDate = new Date(year, month, 0); // Last day of the month
        return this.getExpensesByDateRange(startDate, endDate);
    }
    async getTotalExpensesByMonth(year, month) {
        const expenses = await this.getExpensesByMonth(year, month);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }
    async updateExpense(id, expenseData) {
        const [updatedExpense] = await db_1.db.update(schema_1.expenses)
            .set({ ...expenseData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.expenses.id, id))
            .returning();
        return updatedExpense;
    }
    async deleteExpense(id) {
        await db_1.db.delete(schema_1.expenses).where((0, drizzle_orm_1.eq)(schema_1.expenses.id, id));
        return true;
    }
    // Profit-Loss Report methods
    async getProfitLossReport(id) {
        const [report] = await db_1.db.select().from(schema_1.profitLossReports).where((0, drizzle_orm_1.eq)(schema_1.profitLossReports.id, id));
        return report;
    }
    async getProfitLossReportByPeriod(period) {
        const [report] = await db_1.db.select().from(schema_1.profitLossReports).where((0, drizzle_orm_1.eq)(schema_1.profitLossReports.period, period));
        return report;
    }
    async createProfitLossReport(insertReport) {
        const [report] = await db_1.db.insert(schema_1.profitLossReports).values(insertReport).returning();
        return report;
    }
    async getProfitLossReports() {
        return db_1.db.select().from(schema_1.profitLossReports).orderBy((0, drizzle_orm_1.desc)(schema_1.profitLossReports.createdAt));
    }
    async updateProfitLossReport(id, reportData) {
        const [updatedReport] = await db_1.db.update(schema_1.profitLossReports)
            .set({ ...reportData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.profitLossReports.id, id))
            .returning();
        return updatedReport;
    }
    async deleteProfitLossReport(id) {
        await db_1.db.delete(schema_1.profitLossReports).where((0, drizzle_orm_1.eq)(schema_1.profitLossReports.id, id));
        return true;
    }
    async calculateProfitLossReport(period) {
        // Parse period string (format: 'YYYY-MM')
        const [year, month] = period.split('-').map(Number);
        // Get start and end date for the period
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        // Calculate total revenue from transactions
        const periodTransactions = await db_1.db.select().from(schema_1.transactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.transactions.date, startDate), (0, drizzle_orm_1.lte)(schema_1.transactions.date, endDate)));
        const totalRevenue = periodTransactions.reduce((sum, tx) => sum + tx.total, 0);
        // Calculate total expenses
        const expenses = await this.getExpensesByMonth(year, month);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        // Calculate total salaries
        const payrolls = await this.getPayrollsByPeriod(startDate, endDate);
        const totalSalaries = payrolls.reduce((sum, payroll) => sum + payroll.totalAmount, 0);
        // Calculate profit (revenue - expenses - salaries)
        const profit = totalRevenue - totalExpenses - totalSalaries;
        return {
            totalRevenue,
            totalExpenses,
            totalSalaries,
            profit
        };
    }
}
exports.DatabaseStorage = DatabaseStorage;
