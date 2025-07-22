import {
  pgTable,
  varchar,
  serial,
  boolean,
  timestamp,
  doublePrecision,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Roles schema
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Permissions schema
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(), // transactions, customers, employees, etc.
  action: varchar("action", { length: 50 }).notNull(), // read, create, update, delete
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

// Role permissions (juntion table)
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
  permissionId: integer("permission_id")
    .references(() => permissions.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(
  rolePermissions
).omit({
  id: true,
  createdAt: true,
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("staff"),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Customers schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  vehicleType: varchar("vehicle_type", { length: 20 }), // car, motorcycle
  vehicleBrand: varchar("vehicle_brand", { length: 50 }),
  vehicleModel: varchar("vehicle_model", { length: 50 }),
  licensePlate: varchar("license_plate", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Services schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(), // in minutes
  vehicleType: varchar("vehicle_type", { length: 20 }).notNull(), // car, motorcycle
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url", { length: 255 }),
  warranty: integer("warranty").default(0), // warranty in days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inventory items schema
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(5),
  unit: varchar("unit", { length: 20 }).notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(
  inventoryItems
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Employees schema
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  joiningDate: timestamp("joining_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  employeeId: integer("employee_id").references(() => employees.id),
  date: timestamp("date").defaultNow(),
  total: integer("total").notNull(),
  paymentMethod: varchar("payment_method", { length: 20 })
    .notNull()
    .default("cash"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  notes: text("notes"),
  trackingCode: varchar("tracking_code", { length: 50 }), // Unique code for each transaction for barcode tracking
  notificationsSent: jsonb("notifications_sent"), // Track which notifications have been sent (status_update, reminder, etc)
  notificationsEnabled: boolean("notifications_enabled").default(true), // Allow customers to opt-out
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema transaksi khusus yang mendukung employeeId null tanpa validasi yang ketat
export const customTransactionSchema = z.object({
  customerId: z.number().optional().nullable().default(null),
  employeeId: z.number().optional().nullable().default(null),
  date: z
    .date()
    .optional()
    .default(() => new Date()),
  total: z.number().default(0),
  paymentMethod: z.string().default("cash"),
  status: z.string().default("pending"),
  notes: z.string().optional().nullable().default(null),
  trackingCode: z.string().optional(),
  notificationsEnabled: z.boolean().optional().default(true),
});

// Transaction items schema (services in a transaction)
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  serviceId: integer("service_id").references(() => services.id),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  discount: integer("discount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionItemSchema = createInsertSchema(
  transactionItems
).omit({
  id: true,
  createdAt: true,
});

// Inventory usage (inventory items used in services)
export const inventoryUsage = pgTable("inventory_usage", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  inventoryItemId: integer("inventory_item_id").references(
    () => inventoryItems.id
  ),
  quantity: doublePrecision("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryUsageSchema = createInsertSchema(
  inventoryUsage
).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;

export type InventoryUsage = typeof inventoryUsage.$inferSelect;
export type InsertInventoryUsage = z.infer<typeof insertInventoryUsageSchema>;

// ========== HRD MANAGEMENT SCHEMAS ==========

// Position salary schema
export const positionSalaries = pgTable("position_salaries", {
  id: serial("id").primaryKey(),
  position: varchar("position", { length: 50 }).notNull().unique(),
  dailyRate: integer("daily_rate").notNull(), // Gaji harian dalam Rupiah
  monthlySalary: integer("monthly_salary").notNull(), // Gaji bulanan dalam Rupiah
  allowances: jsonb("allowances"), // Tunjangan dan bonus tambahan
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPositionSalarySchema = createInsertSchema(
  positionSalaries
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Attendance schema
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
  date: timestamp("date").defaultNow().notNull(),
  checkIn: timestamp("check_in").defaultNow().notNull(),
  checkOut: timestamp("check_out"),
  status: varchar("status", { length: 20 }).notNull().default("present"), // present, absent, late, half-day
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Payroll schema
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  paymentType: varchar("payment_type", { length: 20 }).default("monthly"), // daily, monthly
  baseSalary: integer("base_salary").notNull(),
  allowance: integer("allowance").default(35000), // Tunjangan default (Makan + Transport)
  bonus: integer("bonus").default(0),
  deduction: integer("deduction").default(0),
  totalAmount: integer("total_amount").notNull(),
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPayrollSchema = createInsertSchema(payrolls)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    baseSalary: true, // Akan dihitung otomatis berdasarkan posisi
    totalAmount: true, // Akan dihitung otomatis berdasarkan posisi + tunjangan - potongan
  })
  .extend({
    dailyRate: z.number().optional(), // Tambahkan field untuk tarif harian kustom
    monthlySalary: z.number().optional(), // Tambahkan field untuk gaji bulanan kustom
    allowance: z.number().default(35000), // Tunjangan default (Makan: 20.000 + Transport: 15.000)
  });

// Performance reviews schema
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
  reviewerId: integer("reviewer_id").references(() => employees.id),
  reviewDate: timestamp("review_date").defaultNow().notNull(),
  performancePeriod: varchar("performance_period", { length: 50 }).notNull(),
  rating: integer("rating").notNull(), // 1-5 rating
  attendanceScore: integer("attendance_score").default(0), // 1-5 rating
  qualityScore: integer("quality_score").default(0), // 1-5 rating
  productivityScore: integer("productivity_score").default(0), // 1-5 rating
  comments: text("comments"),
  goals: text("goals"),
  nextReviewDate: timestamp("next_review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformanceReviewSchema = createInsertSchema(
  performanceReviews
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Leave requests schema
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  leaveType: varchar("leave_type", { length: 30 }).notNull().default("regular"), // regular, sick, emergency, other
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  approvedById: integer("approved_by_id").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Training sessions schema
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  trainer: varchar("trainer", { length: 100 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 100 }),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrainingSessionSchema = createInsertSchema(
  trainingSessions
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Training participants schema
export const trainingParticipants = pgTable("training_participants", {
  id: serial("id").primaryKey(),
  trainingId: integer("training_id")
    .references(() => trainingSessions.id)
    .notNull(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
  status: varchar("status", { length: 20 }).default("registered"), // registered, attended, completed, failed
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrainingParticipantSchema = createInsertSchema(
  trainingParticipants
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// HRD Documents schema
export const hrdDocuments = pgTable("hrd_documents", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  title: varchar("title", { length: 100 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // contract, certificate, id, other
  fileUrl: varchar("file_url", { length: 255 }),
  expiryDate: timestamp("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHrdDocumentSchema = createInsertSchema(hrdDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export all HRD types
export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = z.infer<
  typeof insertPerformanceReviewSchema
>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;

export type TrainingParticipant = typeof trainingParticipants.$inferSelect;
export type InsertTrainingParticipant = z.infer<
  typeof insertTrainingParticipantSchema
>;

export type HrdDocument = typeof hrdDocuments.$inferSelect;
export type InsertHrdDocument = z.infer<typeof insertHrdDocumentSchema>;

export type PositionSalary = typeof positionSalaries.$inferSelect;
export type InsertPositionSalary = z.infer<typeof insertPositionSalarySchema>;

// ========== FINANCE MANAGEMENT SCHEMAS ==========

// Pengeluaran (Expenses) schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  receiptImage: varchar("receipt_image", { length: 255 }),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Kategori Pengeluaran schema
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExpenseCategorySchema = createInsertSchema(
  expenseCategories
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Laporan Laba Rugi schema
export const profitLossReports = pgTable("profit_loss_reports", {
  id: serial("id").primaryKey(),
  period: varchar("period", { length: 7 }).notNull(), // Format: YYYY-MM (tahun-bulan)
  totalRevenue: integer("revenue").notNull(),
  totalExpenses: integer("expenses").notNull(),
  totalSalaries: integer("total_salaries").notNull(),
  profit: integer("profit").notNull(),
  notes: text("report_data"),
  createdBy: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfitLossReportSchema = createInsertSchema(
  profitLossReports
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export Finance Management types
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

export type ProfitLossReport = typeof profitLossReports.$inferSelect;
export type InsertProfitLossReport = z.infer<
  typeof insertProfitLossReportSchema
>;

// Export role and permission types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
