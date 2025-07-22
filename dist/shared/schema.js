"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertProfitLossReportSchema = exports.profitLossReports = exports.insertExpenseCategorySchema = exports.expenseCategories = exports.insertExpenseSchema = exports.expenses = exports.insertHrdDocumentSchema = exports.hrdDocuments = exports.insertTrainingParticipantSchema = exports.trainingParticipants = exports.insertTrainingSessionSchema = exports.trainingSessions = exports.insertLeaveRequestSchema = exports.leaveRequests = exports.insertPerformanceReviewSchema = exports.performanceReviews = exports.insertPayrollSchema = exports.payrolls = exports.insertAttendanceSchema = exports.attendances = exports.insertPositionSalarySchema = exports.positionSalaries = exports.insertInventoryUsageSchema = exports.inventoryUsage = exports.insertTransactionItemSchema = exports.transactionItems = exports.customTransactionSchema = exports.insertTransactionSchema = exports.transactions = exports.insertEmployeeSchema = exports.employees = exports.insertInventoryItemSchema = exports.inventoryItems = exports.insertServiceSchema = exports.services = exports.insertCustomerSchema = exports.customers = exports.insertUserSchema = exports.users = exports.insertRolePermissionSchema = exports.rolePermissions = exports.insertPermissionSchema = exports.permissions = exports.insertRoleSchema = exports.roles = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Roles schema
exports.roles = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertRoleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.roles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Permissions schema
exports.permissions = (0, pg_core_1.pgTable)("permissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    module: (0, pg_core_1.varchar)("module", { length: 50 }).notNull(), // transactions, customers, employees, etc.
    action: (0, pg_core_1.varchar)("action", { length: 50 }).notNull(), // read, create, update, delete
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertPermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.permissions).omit({
    id: true,
    createdAt: true,
});
// Role permissions (juntion table)
exports.rolePermissions = (0, pg_core_1.pgTable)("role_permissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roleId: (0, pg_core_1.integer)("role_id").references(() => exports.roles.id).notNull(),
    permissionId: (0, pg_core_1.integer)("permission_id").references(() => exports.permissions.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertRolePermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rolePermissions).omit({
    id: true,
    createdAt: true,
});
// User schema 
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 50 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 20 }).notNull().default("staff"),
    email: (0, pg_core_1.varchar)("email", { length: 100 }),
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Customers schema
exports.customers = (0, pg_core_1.pgTable)("customers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }),
    email: (0, pg_core_1.varchar)("email", { length: 100 }),
    vehicleType: (0, pg_core_1.varchar)("vehicle_type", { length: 20 }), // car, motorcycle
    vehicleBrand: (0, pg_core_1.varchar)("vehicle_brand", { length: 50 }),
    vehicleModel: (0, pg_core_1.varchar)("vehicle_model", { length: 50 }),
    licensePlate: (0, pg_core_1.varchar)("license_plate", { length: 20 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertCustomerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Services schema
exports.services = (0, pg_core_1.pgTable)("services", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.integer)("price").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(), // in minutes
    vehicleType: (0, pg_core_1.varchar)("vehicle_type", { length: 20 }).notNull(), // car, motorcycle
    isPopular: (0, pg_core_1.boolean)("is_popular").default(false),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    imageUrl: (0, pg_core_1.varchar)("image_url", { length: 255 }),
    warranty: (0, pg_core_1.integer)("warranty").default(0), // warranty in days
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertServiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.services).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Inventory items schema
exports.inventoryItems = (0, pg_core_1.pgTable)("inventory_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    currentStock: (0, pg_core_1.integer)("current_stock").notNull().default(0),
    minimumStock: (0, pg_core_1.integer)("minimum_stock").notNull().default(5),
    unit: (0, pg_core_1.varchar)("unit", { length: 20 }).notNull(),
    price: (0, pg_core_1.integer)("price").notNull(),
    category: (0, pg_core_1.varchar)("category", { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertInventoryItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryItems).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Employees schema
exports.employees = (0, pg_core_1.pgTable)("employees", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    position: (0, pg_core_1.varchar)("position", { length: 50 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }),
    email: (0, pg_core_1.varchar)("email", { length: 100 }),
    joiningDate: (0, pg_core_1.timestamp)("joining_date").defaultNow().notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertEmployeeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.employees).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Transactions schema
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    customerId: (0, pg_core_1.integer)("customer_id").references(() => exports.customers.id),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id),
    date: (0, pg_core_1.timestamp)("date").defaultNow(),
    total: (0, pg_core_1.integer)("total").notNull(),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 20 }).notNull().default("cash"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
    notes: (0, pg_core_1.text)("notes"),
    trackingCode: (0, pg_core_1.varchar)("tracking_code", { length: 50 }), // Unique code for each transaction for barcode tracking
    notificationsSent: (0, pg_core_1.jsonb)("notifications_sent"), // Track which notifications have been sent (status_update, reminder, etc)
    notificationsEnabled: (0, pg_core_1.boolean)("notifications_enabled").default(true), // Allow customers to opt-out
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Schema transaksi khusus yang mendukung employeeId null tanpa validasi yang ketat
exports.customTransactionSchema = zod_1.z.object({
    customerId: zod_1.z.number().optional().nullable().default(null),
    employeeId: zod_1.z.number().optional().nullable().default(null),
    date: zod_1.z.date().optional().default(() => new Date()),
    total: zod_1.z.number().default(0),
    paymentMethod: zod_1.z.string().default("cash"),
    status: zod_1.z.string().default("pending"),
    notes: zod_1.z.string().optional().nullable().default(null),
    trackingCode: zod_1.z.string().optional(),
    notificationsEnabled: zod_1.z.boolean().optional().default(true)
});
// Transaction items schema (services in a transaction)
exports.transactionItems = (0, pg_core_1.pgTable)("transaction_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    transactionId: (0, pg_core_1.integer)("transaction_id").references(() => exports.transactions.id),
    serviceId: (0, pg_core_1.integer)("service_id").references(() => exports.services.id),
    price: (0, pg_core_1.integer)("price").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull().default(1),
    discount: (0, pg_core_1.integer)("discount").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertTransactionItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactionItems).omit({
    id: true,
    createdAt: true,
});
// Inventory usage (inventory items used in services)
exports.inventoryUsage = (0, pg_core_1.pgTable)("inventory_usage", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    transactionId: (0, pg_core_1.integer)("transaction_id").references(() => exports.transactions.id),
    inventoryItemId: (0, pg_core_1.integer)("inventory_item_id").references(() => exports.inventoryItems.id),
    quantity: (0, pg_core_1.doublePrecision)("quantity").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertInventoryUsageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryUsage).omit({
    id: true,
    createdAt: true,
});
// ========== HRD MANAGEMENT SCHEMAS ==========
// Position salary schema
exports.positionSalaries = (0, pg_core_1.pgTable)("position_salaries", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    position: (0, pg_core_1.varchar)("position", { length: 50 }).notNull().unique(),
    dailyRate: (0, pg_core_1.integer)("daily_rate").notNull(), // Gaji harian dalam Rupiah
    monthlySalary: (0, pg_core_1.integer)("monthly_salary").notNull(), // Gaji bulanan dalam Rupiah
    allowances: (0, pg_core_1.jsonb)("allowances"), // Tunjangan dan bonus tambahan
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPositionSalarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.positionSalaries).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Attendance schema
exports.attendances = (0, pg_core_1.pgTable)("attendances", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id).notNull(),
    date: (0, pg_core_1.timestamp)("date").defaultNow().notNull(),
    checkIn: (0, pg_core_1.timestamp)("check_in").defaultNow().notNull(),
    checkOut: (0, pg_core_1.timestamp)("check_out"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull().default("present"), // present, absent, late, half-day
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertAttendanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.attendances).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Payroll schema
exports.payrolls = (0, pg_core_1.pgTable)("payrolls", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id).notNull(),
    periodStart: (0, pg_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end").notNull(),
    paymentType: (0, pg_core_1.varchar)("payment_type", { length: 20 }).default("monthly"), // daily, monthly
    baseSalary: (0, pg_core_1.integer)("base_salary").notNull(),
    allowance: (0, pg_core_1.integer)("allowance").default(35000), // Tunjangan default (Makan + Transport)
    bonus: (0, pg_core_1.integer)("bonus").default(0),
    deduction: (0, pg_core_1.integer)("deduction").default(0),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(),
    paymentDate: (0, pg_core_1.timestamp)("payment_date"),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 50 }).default("cash"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("pending"), // pending, paid, cancelled
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPayrollSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payrolls).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    baseSalary: true, // Akan dihitung otomatis berdasarkan posisi
    totalAmount: true, // Akan dihitung otomatis berdasarkan posisi + tunjangan - potongan
}).extend({
    dailyRate: zod_1.z.number().optional(), // Tambahkan field untuk tarif harian kustom
    monthlySalary: zod_1.z.number().optional(), // Tambahkan field untuk gaji bulanan kustom
    allowance: zod_1.z.number().default(35000), // Tunjangan default (Makan: 20.000 + Transport: 15.000)
});
// Performance reviews schema
exports.performanceReviews = (0, pg_core_1.pgTable)("performance_reviews", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id).notNull(),
    reviewerId: (0, pg_core_1.integer)("reviewer_id").references(() => exports.employees.id),
    reviewDate: (0, pg_core_1.timestamp)("review_date").defaultNow().notNull(),
    performancePeriod: (0, pg_core_1.varchar)("performance_period", { length: 50 }).notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(), // 1-5 rating
    attendanceScore: (0, pg_core_1.integer)("attendance_score").default(0), // 1-5 rating
    qualityScore: (0, pg_core_1.integer)("quality_score").default(0), // 1-5 rating
    productivityScore: (0, pg_core_1.integer)("productivity_score").default(0), // 1-5 rating
    comments: (0, pg_core_1.text)("comments"),
    goals: (0, pg_core_1.text)("goals"),
    nextReviewDate: (0, pg_core_1.timestamp)("next_review_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPerformanceReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.performanceReviews).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Leave requests schema
exports.leaveRequests = (0, pg_core_1.pgTable)("leave_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    leaveType: (0, pg_core_1.varchar)("leave_type", { length: 30 }).notNull().default("regular"), // regular, sick, emergency, other
    reason: (0, pg_core_1.text)("reason"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
    approvedById: (0, pg_core_1.integer)("approved_by_id").references(() => exports.employees.id),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertLeaveRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaveRequests).omit({
    id: true,
    approvedAt: true,
    createdAt: true,
    updatedAt: true,
});
// Training sessions schema
exports.trainingSessions = (0, pg_core_1.pgTable)("training_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    trainer: (0, pg_core_1.varchar)("trainer", { length: 100 }),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    location: (0, pg_core_1.varchar)("location", { length: 100 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTrainingSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingSessions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Training participants schema
exports.trainingParticipants = (0, pg_core_1.pgTable)("training_participants", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    trainingId: (0, pg_core_1.integer)("training_id").references(() => exports.trainingSessions.id).notNull(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("registered"), // registered, attended, completed, failed
    score: (0, pg_core_1.integer)("score"),
    feedback: (0, pg_core_1.text)("feedback"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTrainingParticipantSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingParticipants).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// HRD Documents schema
exports.hrdDocuments = (0, pg_core_1.pgTable)("hrd_documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    employeeId: (0, pg_core_1.integer)("employee_id").references(() => exports.employees.id),
    title: (0, pg_core_1.varchar)("title", { length: 100 }).notNull(),
    documentType: (0, pg_core_1.varchar)("document_type", { length: 50 }).notNull(), // contract, certificate, id, other
    fileUrl: (0, pg_core_1.varchar)("file_url", { length: 255 }),
    expiryDate: (0, pg_core_1.timestamp)("expiry_date"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertHrdDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrdDocuments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// ========== FINANCE MANAGEMENT SCHEMAS ==========
// Pengeluaran (Expenses) schema
exports.expenses = (0, pg_core_1.pgTable)("expenses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    date: (0, pg_core_1.timestamp)("date").defaultNow().notNull(),
    category: (0, pg_core_1.varchar)("category", { length: 50 }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    receiptImage: (0, pg_core_1.varchar)("receipt_image", { length: 255 }),
    notes: (0, pg_core_1.text)("notes"),
    createdBy: (0, pg_core_1.integer)("created_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertExpenseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenses).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Kategori Pengeluaran schema
exports.expenseCategories = (0, pg_core_1.pgTable)("expense_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertExpenseCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenseCategories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Laporan Laba Rugi schema
exports.profitLossReports = (0, pg_core_1.pgTable)("profit_loss_reports", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    period: (0, pg_core_1.varchar)("period", { length: 7 }).notNull(), // Format: YYYY-MM (tahun-bulan)
    totalRevenue: (0, pg_core_1.integer)("total_revenue").notNull(),
    totalExpenses: (0, pg_core_1.integer)("total_expenses").notNull(),
    totalSalaries: (0, pg_core_1.integer)("total_salaries").notNull(),
    profit: (0, pg_core_1.integer)("profit").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    createdBy: (0, pg_core_1.integer)("created_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertProfitLossReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profitLossReports).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
