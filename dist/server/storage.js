"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
class MemStorage {
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
    async initializeServices() {
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
    async initializeInventoryItems() {
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
    async getUser(id) {
        return this.usersData.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.usersData.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.userIdCounter++;
        const now = new Date();
        const user = {
            ...insertUser,
            id,
            createdAt: now
        };
        this.usersData.set(id, user);
        return user;
    }
    async getUsers() {
        return Array.from(this.usersData.values());
    }
    async updateUser(id, userData) {
        const user = this.usersData.get(id);
        if (!user)
            return undefined;
        const updatedUser = { ...user, ...userData };
        this.usersData.set(id, updatedUser);
        return updatedUser;
    }
    // Customer methods
    async getCustomer(id) {
        return this.customersData.get(id);
    }
    async createCustomer(insertCustomer) {
        const id = this.customerIdCounter++;
        const now = new Date();
        const customer = {
            ...insertCustomer,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.customersData.set(id, customer);
        return customer;
    }
    async getCustomers() {
        return Array.from(this.customersData.values());
    }
    async updateCustomer(id, customerData) {
        const customer = this.customersData.get(id);
        if (!customer)
            return undefined;
        const now = new Date();
        const updatedCustomer = {
            ...customer,
            ...customerData,
            updatedAt: now
        };
        this.customersData.set(id, updatedCustomer);
        return updatedCustomer;
    }
    async deleteCustomer(id) {
        return this.customersData.delete(id);
    }
    // Service methods
    async getService(id) {
        return this.servicesData.get(id);
    }
    async createService(insertService) {
        const id = this.serviceIdCounter++;
        const now = new Date();
        const service = {
            ...insertService,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.servicesData.set(id, service);
        return service;
    }
    async getServices() {
        return Array.from(this.servicesData.values());
    }
    async getServicesByVehicleType(vehicleType) {
        return Array.from(this.servicesData.values())
            .filter(service => service.vehicleType === vehicleType && service.isActive);
    }
    async updateService(id, serviceData) {
        const service = this.servicesData.get(id);
        if (!service)
            return undefined;
        const now = new Date();
        const updatedService = {
            ...service,
            ...serviceData,
            updatedAt: now
        };
        this.servicesData.set(id, updatedService);
        return updatedService;
    }
    async deleteService(id) {
        return this.servicesData.delete(id);
    }
    // Inventory methods
    async getInventoryItem(id) {
        return this.inventoryItemsData.get(id);
    }
    async createInventoryItem(insertItem) {
        const id = this.inventoryItemIdCounter++;
        const now = new Date();
        const item = {
            ...insertItem,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.inventoryItemsData.set(id, item);
        return item;
    }
    async getInventoryItems() {
        return Array.from(this.inventoryItemsData.values());
    }
    async getLowStockItems() {
        return Array.from(this.inventoryItemsData.values())
            .filter(item => item.currentStock <= item.minimumStock);
    }
    async updateInventoryItem(id, itemData) {
        const item = this.inventoryItemsData.get(id);
        if (!item)
            return undefined;
        const now = new Date();
        const updatedItem = {
            ...item,
            ...itemData,
            updatedAt: now
        };
        this.inventoryItemsData.set(id, updatedItem);
        return updatedItem;
    }
    async deleteInventoryItem(id) {
        return this.inventoryItemsData.delete(id);
    }
    // Employee methods
    async getEmployee(id) {
        return this.employeesData.get(id);
    }
    async createEmployee(insertEmployee) {
        const id = this.employeeIdCounter++;
        const now = new Date();
        const employee = {
            ...insertEmployee,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.employeesData.set(id, employee);
        return employee;
    }
    async getEmployees() {
        return Array.from(this.employeesData.values());
    }
    async updateEmployee(id, employeeData) {
        const employee = this.employeesData.get(id);
        if (!employee)
            return undefined;
        const now = new Date();
        const updatedEmployee = {
            ...employee,
            ...employeeData,
            updatedAt: now
        };
        this.employeesData.set(id, updatedEmployee);
        return updatedEmployee;
    }
    async deleteEmployee(id) {
        return this.employeesData.delete(id);
    }
    // Transaction methods
    async getTransaction(id) {
        return this.transactionsData.get(id);
    }
    async deleteAllTransactions() {
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
    async createTransaction(insertTransaction) {
        const id = this.transactionIdCounter++;
        const now = new Date();
        const transaction = {
            ...insertTransaction,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.transactionsData.set(id, transaction);
        return transaction;
    }
    async getTransactions() {
        return Array.from(this.transactionsData.values());
    }
    async getRecentTransactions(limit) {
        return Array.from(this.transactionsData.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }
    async getDailyTransactions(date) {
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
    async updateTransaction(id, transactionData) {
        const transaction = this.transactionsData.get(id);
        if (!transaction)
            return undefined;
        const now = new Date();
        const updatedTransaction = {
            ...transaction,
            ...transactionData,
            updatedAt: now
        };
        this.transactionsData.set(id, updatedTransaction);
        return updatedTransaction;
    }
    // Transaction Item methods
    async getTransactionItems(transactionId) {
        return Array.from(this.transactionItemsData.values())
            .filter(item => item.transactionId === transactionId);
    }
    async createTransactionItem(insertItem) {
        const id = this.transactionItemIdCounter++;
        const now = new Date();
        const item = {
            ...insertItem,
            id,
            createdAt: now
        };
        this.transactionItemsData.set(id, item);
        return item;
    }
    // Inventory Usage methods
    async createInventoryUsage(insertUsage) {
        const id = this.inventoryUsageIdCounter++;
        const now = new Date();
        const usage = {
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
    async getInventoryUsage(transactionId) {
        return Array.from(this.inventoryUsageData.values())
            .filter(usage => usage.transactionId === transactionId);
    }
    // Dashboard stats methods
    async getDailyStats(date) {
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
                    }
                    else if (service.vehicleType === 'motorcycle') {
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
        const queueCount = dailyTransactions.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
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
        return this.attendancesData.get(id);
    }
    async createAttendance(insertAttendance) {
        const id = this.attendanceIdCounter++;
        const now = new Date();
        const attendance = {
            ...insertAttendance,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.attendancesData.set(id, attendance);
        return attendance;
    }
    async getAttendances() {
        return Array.from(this.attendancesData.values());
    }
    async getAttendancesByEmployee(employeeId) {
        return Array.from(this.attendancesData.values())
            .filter(attendance => attendance.employeeId === employeeId);
    }
    async getAttendancesByDate(date) {
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
    async updateAttendance(id, attendanceData) {
        const attendance = this.attendancesData.get(id);
        if (!attendance)
            return undefined;
        const now = new Date();
        const updatedAttendance = {
            ...attendance,
            ...attendanceData,
            updatedAt: now
        };
        this.attendancesData.set(id, updatedAttendance);
        return updatedAttendance;
    }
    async deleteAttendance(id) {
        return this.attendancesData.delete(id);
    }
    // Payroll methods
    async getPayroll(id) {
        return this.payrollsData.get(id);
    }
    async createPayroll(insertPayroll) {
        const id = this.payrollIdCounter++;
        const now = new Date();
        const payroll = {
            ...insertPayroll,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.payrollsData.set(id, payroll);
        return payroll;
    }
    async getPayrolls() {
        return Array.from(this.payrollsData.values());
    }
    async getPayrollsByEmployee(employeeId) {
        return Array.from(this.payrollsData.values())
            .filter(payroll => payroll.employeeId === employeeId);
    }
    async getPayrollsByPeriod(startDate, endDate) {
        return Array.from(this.payrollsData.values())
            .filter(payroll => {
            const periodStart = new Date(payroll.periodStart);
            return periodStart >= startDate && periodStart <= endDate;
        });
    }
    async updatePayroll(id, payrollData) {
        const payroll = this.payrollsData.get(id);
        if (!payroll)
            return undefined;
        const now = new Date();
        const updatedPayroll = {
            ...payroll,
            ...payrollData,
            updatedAt: now
        };
        this.payrollsData.set(id, updatedPayroll);
        return updatedPayroll;
    }
    async deletePayroll(id) {
        return this.payrollsData.delete(id);
    }
    // Performance Review methods
    async getPerformanceReview(id) {
        return this.performanceReviewsData.get(id);
    }
    async createPerformanceReview(insertReview) {
        const id = this.performanceReviewIdCounter++;
        const now = new Date();
        const review = {
            ...insertReview,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.performanceReviewsData.set(id, review);
        return review;
    }
    async getPerformanceReviews() {
        return Array.from(this.performanceReviewsData.values());
    }
    async getPerformanceReviewsByEmployee(employeeId) {
        return Array.from(this.performanceReviewsData.values())
            .filter(review => review.employeeId === employeeId);
    }
    async updatePerformanceReview(id, reviewData) {
        const review = this.performanceReviewsData.get(id);
        if (!review)
            return undefined;
        const now = new Date();
        const updatedReview = {
            ...review,
            ...reviewData,
            updatedAt: now
        };
        this.performanceReviewsData.set(id, updatedReview);
        return updatedReview;
    }
    async deletePerformanceReview(id) {
        return this.performanceReviewsData.delete(id);
    }
    // Leave Request methods
    async getLeaveRequest(id) {
        return this.leaveRequestsData.get(id);
    }
    async createLeaveRequest(insertRequest) {
        const id = this.leaveRequestIdCounter++;
        const now = new Date();
        const request = {
            ...insertRequest,
            id,
            createdAt: now,
            updatedAt: now,
            approvedAt: null
        };
        this.leaveRequestsData.set(id, request);
        return request;
    }
    async getLeaveRequests() {
        return Array.from(this.leaveRequestsData.values());
    }
    async getLeaveRequestsByEmployee(employeeId) {
        return Array.from(this.leaveRequestsData.values())
            .filter(request => request.employeeId === employeeId);
    }
    async getPendingLeaveRequests() {
        return Array.from(this.leaveRequestsData.values())
            .filter(request => request.status === 'pending');
    }
    async updateLeaveRequest(id, requestData) {
        const request = this.leaveRequestsData.get(id);
        if (!request)
            return undefined;
        const now = new Date();
        const updatedRequest = {
            ...request,
            ...requestData,
            updatedAt: now
        };
        this.leaveRequestsData.set(id, updatedRequest);
        return updatedRequest;
    }
    async approveLeaveRequest(id, approverId) {
        const request = this.leaveRequestsData.get(id);
        if (!request)
            return undefined;
        const now = new Date();
        const updatedRequest = {
            ...request,
            status: 'approved',
            approvedById: approverId,
            approvedAt: now,
            updatedAt: now
        };
        this.leaveRequestsData.set(id, updatedRequest);
        return updatedRequest;
    }
    async rejectLeaveRequest(id, approverId) {
        const request = this.leaveRequestsData.get(id);
        if (!request)
            return undefined;
        const now = new Date();
        const updatedRequest = {
            ...request,
            status: 'rejected',
            approvedById: approverId,
            approvedAt: now,
            updatedAt: now
        };
        this.leaveRequestsData.set(id, updatedRequest);
        return updatedRequest;
    }
    async deleteLeaveRequest(id) {
        return this.leaveRequestsData.delete(id);
    }
    // Training Session methods
    async getTrainingSession(id) {
        return this.trainingSessionsData.get(id);
    }
    async createTrainingSession(insertSession) {
        const id = this.trainingSessionIdCounter++;
        const now = new Date();
        const session = {
            ...insertSession,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.trainingSessionsData.set(id, session);
        return session;
    }
    async getTrainingSessions() {
        return Array.from(this.trainingSessionsData.values());
    }
    async getUpcomingTrainingSessions() {
        const now = new Date();
        return Array.from(this.trainingSessionsData.values())
            .filter(session => {
            const startDate = new Date(session.startDate);
            return startDate > now && session.status === 'scheduled';
        });
    }
    async updateTrainingSession(id, sessionData) {
        const session = this.trainingSessionsData.get(id);
        if (!session)
            return undefined;
        const now = new Date();
        const updatedSession = {
            ...session,
            ...sessionData,
            updatedAt: now
        };
        this.trainingSessionsData.set(id, updatedSession);
        return updatedSession;
    }
    async deleteTrainingSession(id) {
        return this.trainingSessionsData.delete(id);
    }
    // Training Participant methods
    async getTrainingParticipant(id) {
        return this.trainingParticipantsData.get(id);
    }
    async createTrainingParticipant(insertParticipant) {
        const id = this.trainingParticipantIdCounter++;
        const now = new Date();
        const participant = {
            ...insertParticipant,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.trainingParticipantsData.set(id, participant);
        return participant;
    }
    async getTrainingParticipants(trainingId) {
        return Array.from(this.trainingParticipantsData.values())
            .filter(participant => participant.trainingId === trainingId);
    }
    async getTrainingParticipantsByEmployee(employeeId) {
        return Array.from(this.trainingParticipantsData.values())
            .filter(participant => participant.employeeId === employeeId);
    }
    async updateTrainingParticipant(id, participantData) {
        const participant = this.trainingParticipantsData.get(id);
        if (!participant)
            return undefined;
        const now = new Date();
        const updatedParticipant = {
            ...participant,
            ...participantData,
            updatedAt: now
        };
        this.trainingParticipantsData.set(id, updatedParticipant);
        return updatedParticipant;
    }
    async deleteTrainingParticipant(id) {
        return this.trainingParticipantsData.delete(id);
    }
    // HRD Document methods
    async getHrdDocument(id) {
        return this.hrdDocumentsData.get(id);
    }
    async createHrdDocument(insertDocument) {
        const id = this.hrdDocumentIdCounter++;
        const now = new Date();
        const document = {
            ...insertDocument,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.hrdDocumentsData.set(id, document);
        return document;
    }
    async getHrdDocuments() {
        return Array.from(this.hrdDocumentsData.values());
    }
    async getHrdDocumentsByEmployee(employeeId) {
        return Array.from(this.hrdDocumentsData.values())
            .filter(document => document.employeeId === employeeId);
    }
    async getExpiringHrdDocuments(daysThreshold) {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);
        return Array.from(this.hrdDocumentsData.values())
            .filter(document => {
            if (!document.expiryDate)
                return false;
            const expiryDate = new Date(document.expiryDate);
            return expiryDate <= thresholdDate && expiryDate >= today;
        });
    }
    async updateHrdDocument(id, documentData) {
        const document = this.hrdDocumentsData.get(id);
        if (!document)
            return undefined;
        const now = new Date();
        const updatedDocument = {
            ...document,
            ...documentData,
            updatedAt: now
        };
        this.hrdDocumentsData.set(id, updatedDocument);
        return updatedDocument;
    }
    async deleteHrdDocument(id) {
        return this.hrdDocumentsData.delete(id);
    }
    // Position Salary methods
    async getPositionSalary(id) {
        return this.positionSalariesData.get(id);
    }
    async getPositionSalaryByPosition(position) {
        return Array.from(this.positionSalariesData.values()).find((salary) => salary.position === position);
    }
    async createPositionSalary(insertSalary) {
        const id = this.positionSalaryIdCounter++;
        const now = new Date();
        const salary = {
            ...insertSalary,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.positionSalariesData.set(id, salary);
        return salary;
    }
    async getPositionSalaries() {
        return Array.from(this.positionSalariesData.values());
    }
    async updatePositionSalary(id, salaryData) {
        const salary = this.positionSalariesData.get(id);
        if (!salary)
            return undefined;
        const now = new Date();
        const updatedSalary = {
            ...salary,
            ...salaryData,
            updatedAt: now
        };
        this.positionSalariesData.set(id, updatedSalary);
        return updatedSalary;
    }
    async deletePositionSalary(id) {
        return this.positionSalariesData.delete(id);
    }
    // HRD Dashboard methods
    async getHrdDashboardStats() {
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
    async getExpenseCategory(id) {
        return this.expenseCategoriesData.get(id);
    }
    async createExpenseCategory(insertCategory) {
        const id = this.expenseCategoryIdCounter++;
        const now = new Date();
        const category = {
            ...insertCategory,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.expenseCategoriesData.set(id, category);
        return category;
    }
    async getExpenseCategories() {
        return Array.from(this.expenseCategoriesData.values());
    }
    async updateExpenseCategory(id, categoryData) {
        const category = this.expenseCategoriesData.get(id);
        if (!category)
            return undefined;
        const now = new Date();
        const updatedCategory = {
            ...category,
            ...categoryData,
            updatedAt: now
        };
        this.expenseCategoriesData.set(id, updatedCategory);
        return updatedCategory;
    }
    async deleteExpenseCategory(id) {
        return this.expenseCategoriesData.delete(id);
    }
    // Expense methods
    async getExpense(id) {
        return this.expensesData.get(id);
    }
    async createExpense(insertExpense) {
        const id = this.expenseIdCounter++;
        const now = new Date();
        const expense = {
            ...insertExpense,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.expensesData.set(id, expense);
        return expense;
    }
    async getExpenses() {
        return Array.from(this.expensesData.values());
    }
    async getExpensesByDateRange(startDate, endDate) {
        return Array.from(this.expensesData.values())
            .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
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
        const expense = this.expensesData.get(id);
        if (!expense)
            return undefined;
        const now = new Date();
        const updatedExpense = {
            ...expense,
            ...expenseData,
            updatedAt: now
        };
        this.expensesData.set(id, updatedExpense);
        return updatedExpense;
    }
    async deleteExpense(id) {
        return this.expensesData.delete(id);
    }
    // Profit-Loss Report methods
    async getProfitLossReport(id) {
        return this.profitLossReportsData.get(id);
    }
    async getProfitLossReportByPeriod(period) {
        return Array.from(this.profitLossReportsData.values()).find((report) => report.period === period);
    }
    async createProfitLossReport(insertReport) {
        const id = this.profitLossReportIdCounter++;
        const now = new Date();
        const report = {
            ...insertReport,
            id,
            createdAt: now,
            updatedAt: now
        };
        this.profitLossReportsData.set(id, report);
        return report;
    }
    async getProfitLossReports() {
        return Array.from(this.profitLossReportsData.values());
    }
    async updateProfitLossReport(id, reportData) {
        const report = this.profitLossReportsData.get(id);
        if (!report)
            return undefined;
        const now = new Date();
        const updatedReport = {
            ...report,
            ...reportData,
            updatedAt: now
        };
        this.profitLossReportsData.set(id, updatedReport);
        return updatedReport;
    }
    async deleteProfitLossReport(id) {
        return this.profitLossReportsData.delete(id);
    }
    async calculateProfitLossReport(period) {
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
exports.MemStorage = MemStorage;
const database_storage_1 = require("./database-storage");
// Menggunakan DatabaseStorage dengan MySQL untuk penyimpanan data yang persisten
exports.storage = new database_storage_1.DatabaseStorage();
