"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertProfitLossReportSchema = exports.profitLossReports = exports.insertExpenseSchema = exports.expenses = exports.insertExpenseCategorySchema = exports.expenseCategories = exports.insertHrdDocumentSchema = exports.hrdDocuments = exports.insertTrainingParticipantSchema = exports.trainingParticipants = exports.insertTrainingSessionSchema = exports.trainingSessions = exports.insertLeaveRequestSchema = exports.leaveRequests = exports.insertPerformanceReviewSchema = exports.performanceReviews = exports.insertPayrollSchema = exports.payrolls = exports.insertAttendanceSchema = exports.attendances = exports.insertPositionSalarySchema = exports.positionSalaries = exports.insertInventoryUsageSchema = exports.inventoryUsage = exports.insertTransactionItemSchema = exports.transactionItems = exports.customTransactionSchema = exports.insertTransactionSchema = exports.transactions = exports.insertEmployeeSchema = exports.employees = exports.insertInventoryItemSchema = exports.inventoryItems = exports.insertServiceSchema = exports.services = exports.insertCustomerSchema = exports.customers = exports.insertUserSchema = exports.users = exports.insertRolePermissionSchema = exports.rolePermissions = exports.insertPermissionSchema = exports.permissions = exports.insertRoleSchema = exports.roles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Roles schema
exports.roles = (0, mysql_core_1.mysqlTable)("roles", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 50 }).notNull().unique(),
    description: (0, mysql_core_1.text)("description"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertRoleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.roles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Permissions schema
exports.permissions = (0, mysql_core_1.mysqlTable)("permissions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, mysql_core_1.text)("description"),
    module: (0, mysql_core_1.varchar)("module", { length: 50 }).notNull(), // transactions, customers, employees, etc.
    action: (0, mysql_core_1.varchar)("action", { length: 50 }).notNull(), // read, create, update, delete
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertPermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.permissions).omit({
    id: true,
    createdAt: true,
});
// Role permissions (juntion table)
exports.rolePermissions = (0, mysql_core_1.mysqlTable)("role_permissions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    roleId: (0, mysql_core_1.int)("role_id").notNull(),
    permissionId: (0, mysql_core_1.int)("permission_id").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertRolePermissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rolePermissions).omit({
    id: true,
    createdAt: true,
});
// User schema 
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)("username", { length: 50 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    role: (0, mysql_core_1.varchar)("role", { length: 20 }).notNull().default("staff"),
    email: (0, mysql_core_1.varchar)("email", { length: 100 }),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Customers schema
exports.customers = (0, mysql_core_1.mysqlTable)("customers", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }),
    email: (0, mysql_core_1.varchar)("email", { length: 100 }),
    vehicleType: (0, mysql_core_1.varchar)("vehicle_type", { length: 20 }), // car, motorcycle
    vehicleBrand: (0, mysql_core_1.varchar)("vehicle_brand", { length: 50 }),
    vehicleModel: (0, mysql_core_1.varchar)("vehicle_model", { length: 50 }),
    licensePlate: (0, mysql_core_1.varchar)("license_plate", { length: 20 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertCustomerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Services schema
exports.services = (0, mysql_core_1.mysqlTable)("services", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    price: (0, mysql_core_1.int)("price").notNull(),
    duration: (0, mysql_core_1.int)("duration").notNull(), // in minutes
    vehicleType: (0, mysql_core_1.varchar)("vehicle_type", { length: 20 }).notNull(), // car, motorcycle
    isPopular: (0, mysql_core_1.boolean)("is_popular").default(false),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    imageUrl: (0, mysql_core_1.varchar)("image_url", { length: 255 }),
    warranty: (0, mysql_core_1.int)("warranty").default(0), // warranty in days
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertServiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.services).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Inventory items schema
exports.inventoryItems = (0, mysql_core_1.mysqlTable)("inventory_items", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    currentStock: (0, mysql_core_1.int)("current_stock").notNull().default(0),
    minimumStock: (0, mysql_core_1.int)("minimum_stock").notNull().default(5),
    unit: (0, mysql_core_1.varchar)("unit", { length: 20 }).notNull(),
    price: (0, mysql_core_1.int)("price").notNull(),
    category: (0, mysql_core_1.varchar)("category", { length: 50 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertInventoryItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryItems).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Employees schema
exports.employees = (0, mysql_core_1.mysqlTable)("employees", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    position: (0, mysql_core_1.varchar)("position", { length: 50 }).notNull(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }),
    email: (0, mysql_core_1.varchar)("email", { length: 100 }),
    joiningDate: (0, mysql_core_1.timestamp)("joining_date").defaultNow().notNull(),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    userId: (0, mysql_core_1.int)("user_id"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertEmployeeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.employees).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Transactions schema
exports.transactions = (0, mysql_core_1.mysqlTable)("transactions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    customerId: (0, mysql_core_1.int)("customer_id"),
    employeeId: (0, mysql_core_1.int)("employee_id"),
    date: (0, mysql_core_1.timestamp)("date").defaultNow(),
    total: (0, mysql_core_1.int)("total").notNull(),
    paymentMethod: (0, mysql_core_1.varchar)("payment_method", { length: 20 }).notNull().default("cash"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
    notes: (0, mysql_core_1.text)("notes"),
    trackingCode: (0, mysql_core_1.varchar)("tracking_code", { length: 50 }), // Unique code for each transaction for barcode tracking
    notificationsSent: (0, mysql_core_1.json)("notifications_sent"), // Track which notifications have been sent (status_update, reminder, etc)
    notificationsEnabled: (0, mysql_core_1.boolean)("notifications_enabled").default(true), // Allow customers to opt-out
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
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
exports.transactionItems = (0, mysql_core_1.mysqlTable)("transaction_items", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    transactionId: (0, mysql_core_1.int)("transaction_id"),
    serviceId: (0, mysql_core_1.int)("service_id"),
    price: (0, mysql_core_1.int)("price").notNull(),
    quantity: (0, mysql_core_1.int)("quantity").notNull().default(1),
    discount: (0, mysql_core_1.int)("discount").default(0),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertTransactionItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactionItems).omit({
    id: true,
    createdAt: true,
});
// Inventory usage (inventory items used in services)
exports.inventoryUsage = (0, mysql_core_1.mysqlTable)("inventory_usage", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    transactionId: (0, mysql_core_1.int)("transaction_id"),
    inventoryItemId: (0, mysql_core_1.int)("inventory_item_id"),
    quantity: (0, mysql_core_1.double)("quantity").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertInventoryUsageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryUsage).omit({
    id: true,
    createdAt: true,
});
// Position salary schema
exports.positionSalaries = (0, mysql_core_1.mysqlTable)("position_salaries", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    position: (0, mysql_core_1.varchar)("position", { length: 50 }).notNull().unique(),
    dailyRate: (0, mysql_core_1.int)("daily_rate").notNull(), // Gaji harian dalam Rupiah
    monthlySalary: (0, mysql_core_1.int)("monthly_salary").notNull(), // Gaji bulanan dalam Rupiah
    allowances: (0, mysql_core_1.json)("allowances"), // Tunjangan dan bonus tambahan
    description: (0, mysql_core_1.text)("description"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPositionSalarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.positionSalaries).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Attendance schema
exports.attendances = (0, mysql_core_1.mysqlTable)("attendances", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    employeeId: (0, mysql_core_1.int)("employee_id").notNull(),
    date: (0, mysql_core_1.timestamp)("date").defaultNow().notNull(),
    checkIn: (0, mysql_core_1.timestamp)("check_in").defaultNow().notNull(),
    checkOut: (0, mysql_core_1.timestamp)("check_out"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).notNull().default("present"), // present, absent, late, half-day
    notes: (0, mysql_core_1.text)("notes"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertAttendanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.attendances).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Payroll schema
exports.payrolls = (0, mysql_core_1.mysqlTable)("payrolls", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    employeeId: (0, mysql_core_1.int)("employee_id").notNull(),
    periodStart: (0, mysql_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, mysql_core_1.timestamp)("period_end").notNull(),
    paymentType: (0, mysql_core_1.varchar)("payment_type", { length: 20 }).default("monthly"), // daily, monthly
    baseSalary: (0, mysql_core_1.int)("base_salary").notNull(),
    allowance: (0, mysql_core_1.int)("allowance").default(35000), // Tunjangan default (Makan + Transport)
    bonus: (0, mysql_core_1.int)("bonus").default(0),
    deduction: (0, mysql_core_1.int)("deduction").default(0),
    totalAmount: (0, mysql_core_1.int)("total_amount").notNull(),
    paymentDate: (0, mysql_core_1.timestamp)("payment_date"),
    paymentMethod: (0, mysql_core_1.varchar)("payment_method", { length: 50 }).default("cash"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).default("pending"), // pending, paid, cancelled
    notes: (0, mysql_core_1.text)("notes"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
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
exports.performanceReviews = (0, mysql_core_1.mysqlTable)("performance_reviews", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    employeeId: (0, mysql_core_1.int)("employee_id").notNull(),
    reviewerId: (0, mysql_core_1.int)("reviewer_id"),
    reviewDate: (0, mysql_core_1.timestamp)("review_date").defaultNow().notNull(),
    performancePeriod: (0, mysql_core_1.varchar)("performance_period", { length: 50 }).notNull(),
    rating: (0, mysql_core_1.int)("rating").notNull(), // 1-5 rating
    attendanceScore: (0, mysql_core_1.int)("attendance_score").default(0), // 1-5 rating
    qualityScore: (0, mysql_core_1.int)("quality_score").default(0), // 1-5 rating
    productivityScore: (0, mysql_core_1.int)("productivity_score").default(0), // 1-5 rating
    comments: (0, mysql_core_1.text)("comments"),
    goals: (0, mysql_core_1.text)("goals"),
    nextReviewDate: (0, mysql_core_1.timestamp)("next_review_date"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertPerformanceReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.performanceReviews).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Leave requests schema
exports.leaveRequests = (0, mysql_core_1.mysqlTable)("leave_requests", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    employeeId: (0, mysql_core_1.int)("employee_id").notNull(),
    startDate: (0, mysql_core_1.timestamp)("start_date").notNull(),
    endDate: (0, mysql_core_1.timestamp)("end_date").notNull(),
    leaveType: (0, mysql_core_1.varchar)("leave_type", { length: 30 }).notNull().default("regular"), // regular, sick, emergency, other
    reason: (0, mysql_core_1.text)("reason"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
    approvedById: (0, mysql_core_1.int)("approved_by_id"),
    approvedAt: (0, mysql_core_1.timestamp)("approved_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertLeaveRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaveRequests).omit({
    id: true,
    approvedAt: true,
    createdAt: true,
    updatedAt: true,
});
// Training sessions schema
exports.trainingSessions = (0, mysql_core_1.mysqlTable)("training_sessions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)("title", { length: 100 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    trainer: (0, mysql_core_1.varchar)("trainer", { length: 100 }),
    startDate: (0, mysql_core_1.timestamp)("start_date").notNull(),
    endDate: (0, mysql_core_1.timestamp)("end_date").notNull(),
    location: (0, mysql_core_1.varchar)("location", { length: 100 }),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTrainingSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingSessions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Training participants schema
exports.trainingParticipants = (0, mysql_core_1.mysqlTable)("training_participants", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    trainingId: (0, mysql_core_1.int)("training_id").notNull(),
    employeeId: (0, mysql_core_1.int)("employee_id").notNull(),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).default("registered"), // registered, attended, completed, failed
    score: (0, mysql_core_1.int)("score"),
    feedback: (0, mysql_core_1.text)("feedback"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertTrainingParticipantSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingParticipants).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// HRD Documents schema
exports.hrdDocuments = (0, mysql_core_1.mysqlTable)("hrd_documents", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    employeeId: (0, mysql_core_1.int)("employee_id"),
    title: (0, mysql_core_1.varchar)("title", { length: 100 }).notNull(),
    documentType: (0, mysql_core_1.varchar)("document_type", { length: 50 }).notNull(), // contract, certificate, id, other
    fileUrl: (0, mysql_core_1.varchar)("file_url", { length: 255 }),
    issueDate: (0, mysql_core_1.timestamp)("issue_date").notNull(),
    expiryDate: (0, mysql_core_1.timestamp)("expiry_date"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).default("active"), // active, expired, archived
    notes: (0, mysql_core_1.text)("notes"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertHrdDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrdDocuments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Expense categories schema
exports.expenseCategories = (0, mysql_core_1.mysqlTable)("expense_categories", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, mysql_core_1.text)("description"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertExpenseCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenseCategories).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Expenses schema
exports.expenses = (0, mysql_core_1.mysqlTable)("expenses", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    categoryId: (0, mysql_core_1.int)("category_id"),
    amount: (0, mysql_core_1.int)("amount").notNull(),
    description: (0, mysql_core_1.text)("description"),
    date: (0, mysql_core_1.timestamp)("date").defaultNow().notNull(),
    paymentMethod: (0, mysql_core_1.varchar)("payment_method", { length: 50 }).default("cash"),
    receiptUrl: (0, mysql_core_1.varchar)("receipt_url", { length: 255 }),
    approvedById: (0, mysql_core_1.int)("approved_by_id"),
    status: (0, mysql_core_1.varchar)("status", { length: 20 }).default("pending"), // pending, approved, rejected
    createdById: (0, mysql_core_1.int)("created_by_id"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertExpenseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenses).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Profit and Loss Reports schema
exports.profitLossReports = (0, mysql_core_1.mysqlTable)("profit_loss_reports", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    period: (0, mysql_core_1.varchar)("period", { length: 20 }).notNull().unique(), // Format: YYYY-MM
    totalRevenue: (0, mysql_core_1.int)("total_revenue").notNull(),
    totalExpenses: (0, mysql_core_1.int)("total_expenses").notNull(),
    netProfit: (0, mysql_core_1.int)("net_profit").notNull(),
    details: (0, mysql_core_1.json)("details"), // Breakdown of revenue and expenses by category
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow(),
});
exports.insertProfitLossReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profitLossReports).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
