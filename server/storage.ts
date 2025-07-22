import { 
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  services, type Service, type InsertService,
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  employees, type Employee, type InsertEmployee,
  transactions, type Transaction, type InsertTransaction,
  transactionItems, type TransactionItem, type InsertTransactionItem,
  inventoryUsage, type InventoryUsage, type InsertInventoryUsage,
  // HRD Management types and schemas
  attendances, type Attendance, type InsertAttendance,
  payrolls, type Payroll, type InsertPayroll,
  performanceReviews, type PerformanceReview, type InsertPerformanceReview,
  leaveRequests, type LeaveRequest, type InsertLeaveRequest,
  trainingSessions, type TrainingSession, type InsertTrainingSession,
  trainingParticipants, type TrainingParticipant, type InsertTrainingParticipant,
  hrdDocuments, type HrdDocument, type InsertHrdDocument,
  positionSalaries, type PositionSalary, type InsertPositionSalary,
  // Finance Management types and schemas
  expenses, type Expense, type InsertExpense,
  expenseCategories, type ExpenseCategory, type InsertExpenseCategory,
  profitLossReports, type ProfitLossReport, type InsertProfitLossReport
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(): Promise<Customer[]>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Service methods
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  getServices(): Promise<Service[]>;
  getServicesByVehicleType(vehicleType: string): Promise<Service[]>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Inventory methods
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItems(): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Employee methods
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit: number): Promise<Transaction[]>;
  getDailyTransactions(date: Date): Promise<Transaction[]>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteAllTransactions(): Promise<number>;
  
  // Transaction Item methods
  getTransactionItems(transactionId: number): Promise<TransactionItem[]>;
  createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  
  // Inventory Usage methods
  createInventoryUsage(usage: InsertInventoryUsage): Promise<InventoryUsage>;
  getInventoryUsage(transactionId: number): Promise<InventoryUsage[]>;
  
  // Dashboard stats methods
  getDailyStats(date: Date): Promise<{ 
    income: number;
    customerCount: number;
    carCount: number;
    motorcycleCount: number;
    avgPerTransaction: number;
    newCustomers: number;
    avgWaitTime: number;
    queueCount: number;
  }>;

  // ========== HRD MANAGEMENT METHODS ==========
  
  // Attendance methods
  getAttendance(id: number): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendances(): Promise<Attendance[]>;
  getAttendancesByEmployee(employeeId: number): Promise<Attendance[]>;
  getAttendancesByDate(date: Date): Promise<Attendance[]>;
  updateAttendance(id: number, attendance: Partial<Attendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;
  
  // Payroll methods
  getPayroll(id: number): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  getPayrolls(): Promise<Payroll[]>;
  getPayrollsByEmployee(employeeId: number): Promise<Payroll[]>;
  getPayrollsByPeriod(startDate: Date, endDate: Date): Promise<Payroll[]>;
  updatePayroll(id: number, payroll: Partial<Payroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
  
  // Performance Review methods
  getPerformanceReview(id: number): Promise<PerformanceReview | undefined>;
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;
  getPerformanceReviews(): Promise<PerformanceReview[]>;
  getPerformanceReviewsByEmployee(employeeId: number): Promise<PerformanceReview[]>;
  updatePerformanceReview(id: number, review: Partial<PerformanceReview>): Promise<PerformanceReview | undefined>;
  deletePerformanceReview(id: number): Promise<boolean>;
  
  // Leave Request methods
  getLeaveRequest(id: number): Promise<LeaveRequest | undefined>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]>;
  getPendingLeaveRequests(): Promise<LeaveRequest[]>;
  updateLeaveRequest(id: number, request: Partial<LeaveRequest>): Promise<LeaveRequest | undefined>;
  approveLeaveRequest(id: number, approverId: number): Promise<LeaveRequest | undefined>;
  rejectLeaveRequest(id: number, approverId: number): Promise<LeaveRequest | undefined>;
  deleteLeaveRequest(id: number): Promise<boolean>;
  
  // Training Session methods
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  getTrainingSessions(): Promise<TrainingSession[]>;
  getUpcomingTrainingSessions(): Promise<TrainingSession[]>;
  updateTrainingSession(id: number, session: Partial<TrainingSession>): Promise<TrainingSession | undefined>;
  deleteTrainingSession(id: number): Promise<boolean>;
  
  // Training Participant methods
  getTrainingParticipant(id: number): Promise<TrainingParticipant | undefined>;
  createTrainingParticipant(participant: InsertTrainingParticipant): Promise<TrainingParticipant>;
  getTrainingParticipants(trainingId: number): Promise<TrainingParticipant[]>;
  getTrainingParticipantsByEmployee(employeeId: number): Promise<TrainingParticipant[]>;
  updateTrainingParticipant(id: number, participant: Partial<TrainingParticipant>): Promise<TrainingParticipant | undefined>;
  deleteTrainingParticipant(id: number): Promise<boolean>;
  
  // HRD Document methods
  getHrdDocument(id: number): Promise<HrdDocument | undefined>;
  createHrdDocument(document: InsertHrdDocument): Promise<HrdDocument>;
  getHrdDocuments(): Promise<HrdDocument[]>;
  getHrdDocumentsByEmployee(employeeId: number): Promise<HrdDocument[]>;
  getExpiringHrdDocuments(daysThreshold: number): Promise<HrdDocument[]>;
  updateHrdDocument(id: number, document: Partial<HrdDocument>): Promise<HrdDocument | undefined>;
  deleteHrdDocument(id: number): Promise<boolean>;
  
  // Position Salary methods
  getPositionSalary(id: number): Promise<PositionSalary | undefined>;
  getPositionSalaryByPosition(position: string): Promise<PositionSalary | undefined>;
  createPositionSalary(salary: InsertPositionSalary): Promise<PositionSalary>;
  getPositionSalaries(): Promise<PositionSalary[]>;
  updatePositionSalary(id: number, salary: Partial<PositionSalary>): Promise<PositionSalary | undefined>;
  deletePositionSalary(id: number): Promise<boolean>;
  
  // HRD Dashboard methods
  getHrdDashboardStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    absentToday: number;
    presentToday: number;
    lateToday: number;
    pendingLeaveRequests: number;
    upcomingTrainings: number;
    expiringSoonDocuments: number;
  }>;
  
  // ========== FINANCE MANAGEMENT METHODS ==========
  
  // Expense Category methods
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  updateExpenseCategory(id: number, category: Partial<ExpenseCategory>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: number): Promise<boolean>;
  
  // Expense methods
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
  getTotalExpensesByMonth(year: number, month: number): Promise<number>;
  updateExpense(id: number, expense: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Profit-Loss Report methods
  getProfitLossReport(id: number): Promise<ProfitLossReport | undefined>;
  getProfitLossReportByPeriod(period: string): Promise<ProfitLossReport | undefined>;
  createProfitLossReport(report: InsertProfitLossReport): Promise<ProfitLossReport>;
  getProfitLossReports(): Promise<ProfitLossReport[]>;
  updateProfitLossReport(id: number, report: Partial<ProfitLossReport>): Promise<ProfitLossReport | undefined>;
  deleteProfitLossReport(id: number): Promise<boolean>;
  calculateProfitLossReport(period: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    totalSalaries: number;
    profit: number;
  }>;

  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private customersData: Map<number, Customer>;
  private servicesData: Map<number, Service>;
  private inventoryItemsData: Map<number, InventoryItem>;
  private employeesData: Map<number, Employee>;
  private transactionsData: Map<number, Transaction>;
  private transactionItemsData: Map<number, TransactionItem>;
  private inventoryUsageData: Map<number, InventoryUsage>;
  
  // HRD Management data
  private attendancesData: Map<number, Attendance>;
  private payrollsData: Map<number, Payroll>;
  private performanceReviewsData: Map<number, PerformanceReview>;
  private leaveRequestsData: Map<number, LeaveRequest>;
  private trainingSessionsData: Map<number, TrainingSession>;
  private trainingParticipantsData: Map<number, TrainingParticipant>;
  private hrdDocumentsData: Map<number, HrdDocument>;
  private positionSalariesData: Map<number, PositionSalary>;
  
  // Finance Management data
  private expensesData: Map<number, Expense>;
  private expenseCategoriesData: Map<number, ExpenseCategory>;
  private profitLossReportsData: Map<number, ProfitLossReport>;
  
  sessionStore: any;
  
  // IDs for auto-increment
  private userIdCounter: number;
  private customerIdCounter: number;
  private serviceIdCounter: number;
  private inventoryItemIdCounter: number;
  private employeeIdCounter: number;
  private transactionIdCounter: number;
  private transactionItemIdCounter: number;
  private inventoryUsageIdCounter: number;
  
  // HRD Management ID counters
  private attendanceIdCounter: number;
  private payrollIdCounter: number;
  private performanceReviewIdCounter: number;
  private leaveRequestIdCounter: number;
  private trainingSessionIdCounter: number;
  private trainingParticipantIdCounter: number;
  private hrdDocumentIdCounter: number;
  private positionSalaryIdCounter: number;
  
  // Finance Management ID counters
  private expenseIdCounter: number;
  private expenseCategoryIdCounter: number;
  private profitLossReportIdCounter: number;

  constructor() {
    // Initialize main data storage
    this.usersData = new Map();
    this.customersData = new Map();
    this.servicesData = new Map();
    this.inventoryItemsData = new Map();
    this.employeesData = new Map();
    this.transactionsData = new Map();
    this.transactionItemsData = new Map();
    this.inventoryUsageData = new Map();
    
    // Initialize HRD Management data storage
    this.attendancesData = new Map();
    this.payrollsData = new Map();
    this.performanceReviewsData = new Map();
    this.leaveRequestsData = new Map();
    this.trainingSessionsData = new Map();
    this.trainingParticipantsData = new Map();
    this.hrdDocumentsData = new Map();
    this.positionSalariesData = new Map();
    
    // Initialize Finance Management data storage
    this.expensesData = new Map();
    this.expenseCategoriesData = new Map();
    this.profitLossReportsData = new Map();
    
    // Initialize main ID counters
    this.userIdCounter = 1;
    this.customerIdCounter = 1;
    this.serviceIdCounter = 1;
    this.inventoryItemIdCounter = 1;
    this.employeeIdCounter = 1;
    this.transactionIdCounter = 1;
    this.transactionItemIdCounter = 1;
    this.inventoryUsageIdCounter = 1;
    
    // Initialize HRD Management ID counters
    this.attendanceIdCounter = 1;
    this.payrollIdCounter = 1;
    this.performanceReviewIdCounter = 1;
    this.leaveRequestIdCounter = 1;
    this.trainingSessionIdCounter = 1;
    this.trainingParticipantIdCounter = 1;
    this.hrdDocumentIdCounter = 1;
    this.positionSalaryIdCounter = 1;
    
    // Initialize Finance Management ID counters
    this.expenseIdCounter = 1;
    this.expenseCategoryIdCounter = 1;
    this.profitLossReportIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed in auth.ts
      name: "Admin Wash",
      role: "admin",
      email: "admin@washcorner.com",
      phone: "0812345678"
    });

    // Initialize with sample services
    this.initializeServices();
    
    // Initialize with sample inventory items
    this.initializeInventoryItems();
  }

  // Initialize some sample services
  private async initializeServices() {
    await this.createService({
      name: "Cuci Mobil Premium",
      description: "Cuci eksterior, interior, vacuum, semir ban, parfum",
      price: 85000,
      duration: 45,
      vehicleType: "car",
      isPopular: true,
      warranty: 1,
      imageUrl: "https://images.unsplash.com/photo-1605587285067-400c87d9653b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });
    
    await this.createService({
      name: "Cuci Motor Premium",
      description: "Cuci menyeluruh, poles body, semir ban, pembersihan rantai",
      price: 45000,
      duration: 20,
      vehicleType: "motorcycle",
      isPopular: true,
      warranty: 1,
      imageUrl: "https://images.unsplash.com/photo-1669230227463-ce055bc9664e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });
    
    await this.createService({
      name: "Cuci Mobil Premium + Wax",
      description: "Cuci premium lengkap dengan waxing & polish eksterior",
      price: 150000,
      duration: 75,
      vehicleType: "car",
      isPopular: false,
      warranty: 3,
      imageUrl: "https://images.unsplash.com/photo-1657482788844-0a94210b8442?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });
    
    await this.createService({
      name: "Cuci Motor Standar",
      description: "Cuci eksterior, pembersihan ringan, dan pengering",
      price: 25000,
      duration: 15,
      vehicleType: "motorcycle",
      isPopular: false,
      warranty: 1,
      imageUrl: "https://images.unsplash.com/photo-1591656671149-85954211f8e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });
  }

  // Initialize some sample inventory items
  private async initializeInventoryItems() {
    await this.createInventoryItem({
      name: "Shampo Mobil Premium",
      description: "Shampo khusus untuk mencuci mobil",
      currentStock: 2,
      minimumStock: 5,
      unit: "botol",
      price: 75000,
      category: "cleaning"
    });
    
    await this.createInventoryItem({
      name: "Pengkilap Ban",
      description: "Cairan untuk membuat ban mengkilap",
      currentStock: 5,
      minimumStock: 8,
      unit: "botol",
      price: 45000,
      category: "detailing"
    });
    
    await this.createInventoryItem({
      name: "Wax Mobil",
      description: "Wax untuk memoles body mobil",
      currentStock: 3,
      minimumStock: 5,
      unit: "kaleng",
      price: 120000,
      category: "detailing"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now 
    };
    this.usersData.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersData.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const now = new Date();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.customersData.set(id, customer);
    return customer;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customersData.values());
  }

  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customersData.get(id);
    if (!customer) return undefined;
    
    const now = new Date();
    const updatedCustomer: Customer = { 
      ...customer, 
      ...customerData, 
      updatedAt: now 
    };
    this.customersData.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customersData.delete(id);
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.servicesData.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const now = new Date();
    const service: Service = { 
      ...insertService, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.servicesData.set(id, service);
    return service;
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.servicesData.values());
  }

  async getServicesByVehicleType(vehicleType: string): Promise<Service[]> {
    return Array.from(this.servicesData.values())
      .filter(service => service.vehicleType === vehicleType && service.isActive);
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = this.servicesData.get(id);
    if (!service) return undefined;
    
    const now = new Date();
    const updatedService: Service = { 
      ...service, 
      ...serviceData, 
      updatedAt: now 
    };
    this.servicesData.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.servicesData.delete(id);
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItemsData.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemIdCounter++;
    const now = new Date();
    const item: InventoryItem = { 
      ...insertItem, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.inventoryItemsData.set(id, item);
    return item;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItemsData.values());
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItemsData.values())
      .filter(item => item.currentStock <= item.minimumStock);
  }

  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItemsData.get(id);
    if (!item) return undefined;
    
    const now = new Date();
    const updatedItem: InventoryItem = { 
      ...item, 
      ...itemData, 
      updatedAt: now 
    };
    this.inventoryItemsData.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItemsData.delete(id);
  }

  // Employee methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employeesData.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const now = new Date();
    const employee: Employee = { 
      ...insertEmployee, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.employeesData.set(id, employee);
    return employee;
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employeesData.values());
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employeesData.get(id);
    if (!employee) return undefined;
    
    const now = new Date();
    const updatedEmployee: Employee = { 
      ...employee, 
      ...employeeData, 
      updatedAt: now 
    };
    this.employeesData.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employeesData.delete(id);
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsData.get(id);
  }
  
  async deleteAllTransactions(): Promise<number> {
    // First clear transaction items
    this.transactionItemsData.clear();
    
    // Then clear inventory usage
    this.inventoryUsageData.clear();
    
    // Finally clear transactions
    const count = this.transactionsData.size;
    this.transactionsData.clear();
    
    // Reset IDs
    this.transactionIdCounter = 1;
    this.transactionItemIdCounter = 1;
    this.inventoryUsageIdCounter = 1;
    
    return count;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.transactionsData.set(id, transaction);
    return transaction;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsData.values());
  }

  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    return Array.from(this.transactionsData.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getDailyTransactions(date: Date): Promise<Transaction[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.transactionsData.values())
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startOfDay && transactionDate <= endOfDay;
      });
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactionsData.get(id);
    if (!transaction) return undefined;
    
    const now = new Date();
    const updatedTransaction: Transaction = { 
      ...transaction, 
      ...transactionData, 
      updatedAt: now 
    };
    this.transactionsData.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Transaction Item methods
  async getTransactionItems(transactionId: number): Promise<TransactionItem[]> {
    return Array.from(this.transactionItemsData.values())
      .filter(item => item.transactionId === transactionId);
  }

  async createTransactionItem(insertItem: InsertTransactionItem): Promise<TransactionItem> {
    const id = this.transactionItemIdCounter++;
    const now = new Date();
    const item: TransactionItem = { 
      ...insertItem, 
      id,
      createdAt: now
    };
    this.transactionItemsData.set(id, item);
    return item;
  }

  // Inventory Usage methods
  async createInventoryUsage(insertUsage: InsertInventoryUsage): Promise<InventoryUsage> {
    const id = this.inventoryUsageIdCounter++;
    const now = new Date();
    const usage: InventoryUsage = { 
      ...insertUsage, 
      id,
      createdAt: now
    };
    this.inventoryUsageData.set(id, usage);
    
    // Update inventory item stock
    const item = await this.getInventoryItem(insertUsage.inventoryItemId);
    if (item) {
      await this.updateInventoryItem(item.id, {
        currentStock: item.currentStock - insertUsage.quantity
      });
    }
    
    return usage;
  }

  async getInventoryUsage(transactionId: number): Promise<InventoryUsage[]> {
    return Array.from(this.inventoryUsageData.values())
      .filter(usage => usage.transactionId === transactionId);
  }

  // Dashboard stats methods
  async getDailyStats(date: Date): Promise<{
    income: number;
    customerCount: number;
    carCount: number;
    motorcycleCount: number;
    avgPerTransaction: number;
    newCustomers: number;
    avgWaitTime: number;
    queueCount: number;
  }> {
    const dailyTransactions = await this.getDailyTransactions(date);
    
    // Get total income from completed transactions
    const completedTransactions = dailyTransactions.filter(t => t.status === 'completed');
    const income = completedTransactions.reduce((sum, t) => sum + t.total, 0);
    
    // Count customers
    const customerIds = new Set(dailyTransactions.map(t => t.customerId));
    const customerCount = customerIds.size;
    
    // Count car and motorcycle services
    let carCount = 0;
    let motorcycleCount = 0;
    
    for (const transaction of dailyTransactions) {
      const items = await this.getTransactionItems(transaction.id);
      for (const item of items) {
        const service = await this.getService(item.serviceId);
        if (service) {
          if (service.vehicleType === 'car') {
            carCount += item.quantity;
          } else if (service.vehicleType === 'motorcycle') {
            motorcycleCount += item.quantity;
          }
        }
      }
    }
    
    // Average per transaction
    const avgPerTransaction = completedTransactions.length > 0 
      ? Math.round(income / completedTransactions.length) 
      : 0;
    
    // Count new customers created today
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const newCustomers = Array.from(this.customersData.values())
      .filter(customer => {
        const createdDate = new Date(customer.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      }).length;
    
    // Mock average wait time (would be calculated from actual service times)
    const avgWaitTime = 15;
    
    // Count current queue (transactions in pending or in_progress status)
    const queueCount = dailyTransactions.filter(
      t => t.status === 'pending' || t.status === 'in_progress'
    ).length;
    
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
  async getAttendance(id: number): Promise<Attendance | undefined> {
    return this.attendancesData.get(id);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceIdCounter++;
    const now = new Date();
    const attendance: Attendance = { 
      ...insertAttendance, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.attendancesData.set(id, attendance);
    return attendance;
  }

  async getAttendances(): Promise<Attendance[]> {
    return Array.from(this.attendancesData.values());
  }

  async getAttendancesByEmployee(employeeId: number): Promise<Attendance[]> {
    return Array.from(this.attendancesData.values())
      .filter(attendance => attendance.employeeId === employeeId);
  }

  async getAttendancesByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.attendancesData.values())
      .filter(attendance => {
        const attendanceDate = new Date(attendance.date);
        return attendanceDate >= startOfDay && attendanceDate <= endOfDay;
      });
  }

  async updateAttendance(id: number, attendanceData: Partial<Attendance>): Promise<Attendance | undefined> {
    const attendance = this.attendancesData.get(id);
    if (!attendance) return undefined;
    
    const now = new Date();
    const updatedAttendance: Attendance = { 
      ...attendance, 
      ...attendanceData, 
      updatedAt: now 
    };
    this.attendancesData.set(id, updatedAttendance);
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendancesData.delete(id);
  }
  
  // Payroll methods
  async getPayroll(id: number): Promise<Payroll | undefined> {
    return this.payrollsData.get(id);
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const id = this.payrollIdCounter++;
    const now = new Date();
    const payroll: Payroll = { 
      ...insertPayroll, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.payrollsData.set(id, payroll);
    return payroll;
  }

  async getPayrolls(): Promise<Payroll[]> {
    return Array.from(this.payrollsData.values());
  }

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return Array.from(this.payrollsData.values())
      .filter(payroll => payroll.employeeId === employeeId);
  }

  async getPayrollsByPeriod(startDate: Date, endDate: Date): Promise<Payroll[]> {
    return Array.from(this.payrollsData.values())
      .filter(payroll => {
        const periodStart = new Date(payroll.periodStart);
        return periodStart >= startDate && periodStart <= endDate;
      });
  }

  async updatePayroll(id: number, payrollData: Partial<Payroll>): Promise<Payroll | undefined> {
    const payroll = this.payrollsData.get(id);
    if (!payroll) return undefined;
    
    const now = new Date();
    const updatedPayroll: Payroll = { 
      ...payroll, 
      ...payrollData, 
      updatedAt: now 
    };
    this.payrollsData.set(id, updatedPayroll);
    return updatedPayroll;
  }

  async deletePayroll(id: number): Promise<boolean> {
    return this.payrollsData.delete(id);
  }
  
  // Performance Review methods
  async getPerformanceReview(id: number): Promise<PerformanceReview | undefined> {
    return this.performanceReviewsData.get(id);
  }

  async createPerformanceReview(insertReview: InsertPerformanceReview): Promise<PerformanceReview> {
    const id = this.performanceReviewIdCounter++;
    const now = new Date();
    const review: PerformanceReview = { 
      ...insertReview, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.performanceReviewsData.set(id, review);
    return review;
  }

  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    return Array.from(this.performanceReviewsData.values());
  }

  async getPerformanceReviewsByEmployee(employeeId: number): Promise<PerformanceReview[]> {
    return Array.from(this.performanceReviewsData.values())
      .filter(review => review.employeeId === employeeId);
  }

  async updatePerformanceReview(id: number, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview | undefined> {
    const review = this.performanceReviewsData.get(id);
    if (!review) return undefined;
    
    const now = new Date();
    const updatedReview: PerformanceReview = { 
      ...review, 
      ...reviewData, 
      updatedAt: now 
    };
    this.performanceReviewsData.set(id, updatedReview);
    return updatedReview;
  }

  async deletePerformanceReview(id: number): Promise<boolean> {
    return this.performanceReviewsData.delete(id);
  }
  
  // Leave Request methods
  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    return this.leaveRequestsData.get(id);
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = this.leaveRequestIdCounter++;
    const now = new Date();
    const request: LeaveRequest = { 
      ...insertRequest, 
      id,
      createdAt: now,
      updatedAt: now,
      approvedAt: null
    };
    this.leaveRequestsData.set(id, request);
    return request;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequestsData.values());
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequestsData.values())
      .filter(request => request.employeeId === employeeId);
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequestsData.values())
      .filter(request => request.status === 'pending');
  }

  async updateLeaveRequest(id: number, requestData: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequestsData.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest: LeaveRequest = { 
      ...request, 
      ...requestData, 
      updatedAt: now 
    };
    this.leaveRequestsData.set(id, updatedRequest);
    return updatedRequest;
  }

  async approveLeaveRequest(id: number, approverId: number): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequestsData.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest: LeaveRequest = { 
      ...request, 
      status: 'approved',
      approvedById: approverId,
      approvedAt: now,
      updatedAt: now 
    };
    this.leaveRequestsData.set(id, updatedRequest);
    return updatedRequest;
  }

  async rejectLeaveRequest(id: number, approverId: number): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequestsData.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest: LeaveRequest = { 
      ...request, 
      status: 'rejected',
      approvedById: approverId,
      approvedAt: now,
      updatedAt: now 
    };
    this.leaveRequestsData.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteLeaveRequest(id: number): Promise<boolean> {
    return this.leaveRequestsData.delete(id);
  }
  
  // Training Session methods
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    return this.trainingSessionsData.get(id);
  }

  async createTrainingSession(insertSession: InsertTrainingSession): Promise<TrainingSession> {
    const id = this.trainingSessionIdCounter++;
    const now = new Date();
    const session: TrainingSession = { 
      ...insertSession, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.trainingSessionsData.set(id, session);
    return session;
  }

  async getTrainingSessions(): Promise<TrainingSession[]> {
    return Array.from(this.trainingSessionsData.values());
  }

  async getUpcomingTrainingSessions(): Promise<TrainingSession[]> {
    const now = new Date();
    return Array.from(this.trainingSessionsData.values())
      .filter(session => {
        const startDate = new Date(session.startDate);
        return startDate > now && session.status === 'scheduled';
      });
  }

  async updateTrainingSession(id: number, sessionData: Partial<TrainingSession>): Promise<TrainingSession | undefined> {
    const session = this.trainingSessionsData.get(id);
    if (!session) return undefined;
    
    const now = new Date();
    const updatedSession: TrainingSession = { 
      ...session, 
      ...sessionData, 
      updatedAt: now 
    };
    this.trainingSessionsData.set(id, updatedSession);
    return updatedSession;
  }

  async deleteTrainingSession(id: number): Promise<boolean> {
    return this.trainingSessionsData.delete(id);
  }
  
  // Training Participant methods
  async getTrainingParticipant(id: number): Promise<TrainingParticipant | undefined> {
    return this.trainingParticipantsData.get(id);
  }

  async createTrainingParticipant(insertParticipant: InsertTrainingParticipant): Promise<TrainingParticipant> {
    const id = this.trainingParticipantIdCounter++;
    const now = new Date();
    const participant: TrainingParticipant = { 
      ...insertParticipant, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.trainingParticipantsData.set(id, participant);
    return participant;
  }

  async getTrainingParticipants(trainingId: number): Promise<TrainingParticipant[]> {
    return Array.from(this.trainingParticipantsData.values())
      .filter(participant => participant.trainingId === trainingId);
  }

  async getTrainingParticipantsByEmployee(employeeId: number): Promise<TrainingParticipant[]> {
    return Array.from(this.trainingParticipantsData.values())
      .filter(participant => participant.employeeId === employeeId);
  }

  async updateTrainingParticipant(id: number, participantData: Partial<TrainingParticipant>): Promise<TrainingParticipant | undefined> {
    const participant = this.trainingParticipantsData.get(id);
    if (!participant) return undefined;
    
    const now = new Date();
    const updatedParticipant: TrainingParticipant = { 
      ...participant, 
      ...participantData, 
      updatedAt: now 
    };
    this.trainingParticipantsData.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteTrainingParticipant(id: number): Promise<boolean> {
    return this.trainingParticipantsData.delete(id);
  }
  
  // HRD Document methods
  async getHrdDocument(id: number): Promise<HrdDocument | undefined> {
    return this.hrdDocumentsData.get(id);
  }

  async createHrdDocument(insertDocument: InsertHrdDocument): Promise<HrdDocument> {
    const id = this.hrdDocumentIdCounter++;
    const now = new Date();
    const document: HrdDocument = { 
      ...insertDocument, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.hrdDocumentsData.set(id, document);
    return document;
  }

  async getHrdDocuments(): Promise<HrdDocument[]> {
    return Array.from(this.hrdDocumentsData.values());
  }

  async getHrdDocumentsByEmployee(employeeId: number): Promise<HrdDocument[]> {
    return Array.from(this.hrdDocumentsData.values())
      .filter(document => document.employeeId === employeeId);
  }

  async getExpiringHrdDocuments(daysThreshold: number): Promise<HrdDocument[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return Array.from(this.hrdDocumentsData.values())
      .filter(document => {
        if (!document.expiryDate) return false;
        const expiryDate = new Date(document.expiryDate);
        return expiryDate <= thresholdDate && expiryDate >= today;
      });
  }

  async updateHrdDocument(id: number, documentData: Partial<HrdDocument>): Promise<HrdDocument | undefined> {
    const document = this.hrdDocumentsData.get(id);
    if (!document) return undefined;
    
    const now = new Date();
    const updatedDocument: HrdDocument = { 
      ...document, 
      ...documentData, 
      updatedAt: now 
    };
    this.hrdDocumentsData.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteHrdDocument(id: number): Promise<boolean> {
    return this.hrdDocumentsData.delete(id);
  }

  // Position Salary methods
  async getPositionSalary(id: number): Promise<PositionSalary | undefined> {
    return this.positionSalariesData.get(id);
  }

  async getPositionSalaryByPosition(position: string): Promise<PositionSalary | undefined> {
    return Array.from(this.positionSalariesData.values()).find(
      (salary) => salary.position === position
    );
  }

  async createPositionSalary(insertSalary: InsertPositionSalary): Promise<PositionSalary> {
    const id = this.positionSalaryIdCounter++;
    const now = new Date();
    const salary: PositionSalary = {
      ...insertSalary,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.positionSalariesData.set(id, salary);
    return salary;
  }

  async getPositionSalaries(): Promise<PositionSalary[]> {
    return Array.from(this.positionSalariesData.values());
  }

  async updatePositionSalary(id: number, salaryData: Partial<PositionSalary>): Promise<PositionSalary | undefined> {
    const salary = this.positionSalariesData.get(id);
    if (!salary) return undefined;
    
    const now = new Date();
    const updatedSalary: PositionSalary = {
      ...salary,
      ...salaryData,
      updatedAt: now
    };
    this.positionSalariesData.set(id, updatedSalary);
    return updatedSalary;
  }

  async deletePositionSalary(id: number): Promise<boolean> {
    return this.positionSalariesData.delete(id);
  }
  
  // HRD Dashboard methods
  async getHrdDashboardStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    absentToday: number;
    presentToday: number;
    lateToday: number;
    pendingLeaveRequests: number;
    upcomingTrainings: number;
    expiringSoonDocuments: number;
  }> {
    const today = new Date();
    
    // Get total employees and active employees
    const employees = await this.getEmployees();
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    
    // Get attendance stats for today
    const todayAttendances = await this.getAttendancesByDate(today);
    const absentToday = todayAttendances.filter(att => att.status === 'absent').length;
    const presentToday = todayAttendances.filter(att => att.status === 'present').length;
    const lateToday = todayAttendances.filter(att => att.status === 'late').length;
    
    // Get pending leave requests
    const pendingLeaveRequests = (await this.getPendingLeaveRequests()).length;
    
    // Get upcoming trainings
    const upcomingTrainings = (await this.getUpcomingTrainingSessions()).length;
    
    // Get documents expiring soon (in the next 30 days)
    const expiringSoonDocuments = (await this.getExpiringHrdDocuments(30)).length;
    
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
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategoriesData.get(id);
  }
  
  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.expenseCategoryIdCounter++;
    const now = new Date();
    const category: ExpenseCategory = { 
      ...insertCategory, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.expenseCategoriesData.set(id, category);
    return category;
  }
  
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategoriesData.values());
  }
  
  async updateExpenseCategory(id: number, categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const category = this.expenseCategoriesData.get(id);
    if (!category) return undefined;
    
    const now = new Date();
    const updatedCategory: ExpenseCategory = { 
      ...category, 
      ...categoryData, 
      updatedAt: now 
    };
    this.expenseCategoriesData.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteExpenseCategory(id: number): Promise<boolean> {
    return this.expenseCategoriesData.delete(id);
  }
  
  // Expense methods
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expensesData.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const now = new Date();
    const expense: Expense = { 
      ...insertExpense, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.expensesData.set(id, expense);
    return expense;
  }
  
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expensesData.values());
  }
  
  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expensesData.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
  }
  
  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1); // January is 0 in JavaScript Date
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return this.getExpensesByDateRange(startDate, endDate);
  }
  
  async getTotalExpensesByMonth(year: number, month: number): Promise<number> {
    const expenses = await this.getExpensesByMonth(year, month);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
  
  async updateExpense(id: number, expenseData: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expensesData.get(id);
    if (!expense) return undefined;
    
    const now = new Date();
    const updatedExpense: Expense = { 
      ...expense, 
      ...expenseData, 
      updatedAt: now 
    };
    this.expensesData.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expensesData.delete(id);
  }
  
  // Profit-Loss Report methods
  async getProfitLossReport(id: number): Promise<ProfitLossReport | undefined> {
    return this.profitLossReportsData.get(id);
  }
  
  async getProfitLossReportByPeriod(period: string): Promise<ProfitLossReport | undefined> {
    return Array.from(this.profitLossReportsData.values()).find(
      (report) => report.period === period
    );
  }
  
  async createProfitLossReport(insertReport: InsertProfitLossReport): Promise<ProfitLossReport> {
    const id = this.profitLossReportIdCounter++;
    const now = new Date();
    const report: ProfitLossReport = { 
      ...insertReport, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.profitLossReportsData.set(id, report);
    return report;
  }
  
  async getProfitLossReports(): Promise<ProfitLossReport[]> {
    return Array.from(this.profitLossReportsData.values());
  }
  
  async updateProfitLossReport(id: number, reportData: Partial<ProfitLossReport>): Promise<ProfitLossReport | undefined> {
    const report = this.profitLossReportsData.get(id);
    if (!report) return undefined;
    
    const now = new Date();
    const updatedReport: ProfitLossReport = { 
      ...report, 
      ...reportData, 
      updatedAt: now 
    };
    this.profitLossReportsData.set(id, updatedReport);
    return updatedReport;
  }
  
  async deleteProfitLossReport(id: number): Promise<boolean> {
    return this.profitLossReportsData.delete(id);
  }
  
  async calculateProfitLossReport(period: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    totalSalaries: number;
    profit: number;
  }> {
    // Parse period string (format: 'YYYY-MM')
    const [year, month] = period.split('-').map(Number);
    
    // Get start and end date for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Calculate total revenue from transactions
    const transactions = await this.getTransactions();
    const periodTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });
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

import { DatabaseStorage } from "./database-storage";

// Menggunakan DatabaseStorage dengan MySQL untuk penyimpanan data yang persisten
export const storage = new DatabaseStorage();
