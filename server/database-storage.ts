import { db } from "./db";
import { IStorage } from "./storage";
import { eq, and, desc, gte, lte, or, sql } from "drizzle-orm";
import { dbInsert, dbUpdate, isUsingMySQL, shouldUseMySQL } from "./db-helper";
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  users,
  customers,
  services,
  inventoryItems,
  employees,
  transactions,
  transactionItems,
  inventoryUsage,
  attendances,
  payrolls,
  performanceReviews,
  leaveRequests,
  trainingSessions,
  trainingParticipants,
  hrdDocuments,
  positionSalaries,
  expenses,
  expenseCategories,
  profitLossReports,
  roles,
  permissions,
  rolePermissions,
  User,
  InsertUser,
  Customer,
  InsertCustomer,
  Service,
  Role,
  InsertRole,
  Permission,
  InsertPermission,
  RolePermission,
  InsertRolePermission,
  InsertService,
  InventoryItem,
  InsertInventoryItem,
  Employee,
  InsertEmployee,
  Transaction,
  InsertTransaction,
  TransactionItem,
  InsertTransactionItem,
  InventoryUsage,
  InsertInventoryUsage,
  Attendance,
  InsertAttendance,
  Payroll,
  InsertPayroll,
  PerformanceReview,
  InsertPerformanceReview,
  LeaveRequest,
  InsertLeaveRequest,
  TrainingSession,
  InsertTrainingSession,
  TrainingParticipant,
  InsertTrainingParticipant,
  HrdDocument,
  InsertHrdDocument,
  PositionSalary,
  InsertPositionSalary,
  Expense,
  InsertExpense,
  ExpenseCategory,
  InsertExpenseCategory,
  ProfitLossReport,
  InsertProfitLossReport,
} from "@shared/schema";
import { startOfDay, endOfDay } from "date-fns";

// Create memory store for session data
const MemoryStore = createMemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Database akan diinisialisasi oleh routes.ts dengan inisialisasi role dan permission
    // Tidak perlu inisialisasi database di sini untuk mencegah error
  }

  // Function to initialize database, e.g., create admin user if none exists
  async initializeDatabase() {
    try {
      // Periksa apakah koneksi database aktif
      try {
        await db.select().from(users).limit(1);
        console.log("Koneksi database aktif dan siap digunakan");
      } catch (err) {
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
          email: "admin@washcorner.com",
        });
        console.log("Admin user created successfully");
      }

      return true;
    } catch (error) {
      console.error("Error initializing database:", error);
      return false;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  // Di database-storage.ts
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Password seharusnya sudah di-hash oleh pemanggil sebelum masuk ke sini
      console.log("[DB Storage] Attempting to create user:", {
        ...insertUser,
        password: "*** HASHED ***",
      });

      const result = await db
        .insert(users) // 'users' adalah objek tabel Drizzle Anda
        .values(insertUser);

      // Untuk mysql2 driver di Drizzle, hasil insert adalah array dengan ResultSetHeader di indeks 0
      // ResultSetHeader memiliki properti insertId
      const resultSetHeader =
        result && result[0] ? (result[0] as any) : undefined;
      const newUserId = resultSetHeader?.insertId;

      if (typeof newUserId !== "number" || newUserId === 0) {
        // Jika insertId tidak didapatkan atau 0 (yang berarti insert gagal untuk auto_increment di MySQL)
        console.error(
          "[DB Storage] Failed to obtain a valid insertId for the new user:",
          insertUser.username,
          "Insert result:",
          result
        );
        // Cobalah mengambil user berdasarkan username sebagai upaya terakhir jika tabel tidak punya auto_increment id
        // atau jika insertId tidak ter-populate karena alasan lain.
        // Namun, ini mengasumsikan username unik dan insert berhasil meski ID tidak kembali.
        const userByName = await this.getUserByUsername(insertUser.username);
        if (userByName) {
          console.warn(
            "[DB Storage] Retrieved user by username after insertId was not available:",
            userByName.username
          );
          return userByName as User;
        }
        throw new Error(
          `Failed to create user or obtain ID for '${insertUser.username}'.`
        );
      }

      // Ambil record yang baru di-insert menggunakan newUserId
      const [retrievedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId))
        .limit(1);

      if (!retrievedUser) {
        console.error(
          "[DB Storage] Failed to retrieve user after insert, even with insertId, for ID:",
          newUserId
        );
        throw new Error(
          "Failed to retrieve the created user record using insertId."
        );
      }

      console.log("[DB Storage] User created and retrieved successfully:", {
        ...retrievedUser,
        password: "***",
      });
      return retrievedUser as User;
    } catch (dbError) {
      console.error("[DB Storage] Error in createUser:", dbError);
      // Lemparkan kembali error agar bisa ditangani oleh pemanggil
      if (dbError instanceof Error) {
        throw new Error(`Database error creating user: ${dbError.message}`);
      }
      throw new Error("Unknown database error creating user.");
    }
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<User | undefined> {
    return await dbUpdate(users, userData, eq(users.id, id));
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    return await dbInsert(customers, insertCustomer);
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer | undefined> {
    return await dbUpdate(customers, customerData, eq(customers.id, id));
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return true; // PostgreSQL tidak memberikan detail rowsAffected
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async createService(insertService: InsertService): Promise<Service> {
    return await dbInsert(services, insertService);
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServicesByVehicleType(vehicleType: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.vehicleType, vehicleType));
  }

  async updateService(
    id: number,
    serviceData: Partial<Service>
  ): Promise<Service | undefined> {
    return await dbUpdate(services, serviceData, eq(services.id, id));
  }

  async deleteService(id: number): Promise<boolean> {
    await db.delete(services).where(eq(services.id, id));
    return true;
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const result = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));
    return result[0];
  }

  async createInventoryItem(
    insertItem: InsertInventoryItem
  ): Promise<InventoryItem> {
    return await dbInsert(inventoryItems, insertItem);
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(gte(inventoryItems.minimumStock, inventoryItems.currentStock))
      );
  }

  async updateInventoryItem(
    id: number,
    itemData: Partial<InventoryItem>
  ): Promise<InventoryItem | undefined> {
    return await dbUpdate(inventoryItems, itemData, eq(inventoryItems.id, id));
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return true;
  }

  // Employee methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return result[0];
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    return await dbInsert(employees, insertEmployee);
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async updateEmployee(
    id: number,
    employeeData: Partial<Employee>
  ): Promise<Employee | undefined> {
    return await dbUpdate(employees, employeeData, eq(employees.id, id));
  }

  async deleteEmployee(id: number): Promise<boolean> {
    await db.delete(employees).where(eq(employees.id, id));
    return true;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result[0];
  }

  async createTransaction(
    insertTransaction: InsertTransaction
  ): Promise<Transaction> {
    return await dbInsert(transactions, insertTransaction);
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date))
      .limit(limit);
  }

  async getDailyTransactions(date: Date): Promise<Transaction[]> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    return await db
      .select()
      .from(transactions)
      .where(
        and(gte(transactions.date, startDate), lte(transactions.date, endDate))
      );
  }

  async updateTransaction(
    id: number,
    transactionData: Partial<Transaction>
  ): Promise<Transaction | undefined> {
    return await dbUpdate(
      transactions,
      transactionData,
      eq(transactions.id, id)
    );
  }

  async deleteAllTransactions(): Promise<number> {
    // Hapus terlebih dahulu item transaksi dan penggunaan inventaris
    await db.delete(transactionItems);
    await db.delete(inventoryUsage);

    // Kemudian hapus semua transaksi
    const result = await db.delete(transactions);
    return 1; // PostgreSQL doesn't return affected rows in Drizzle ORM, so we return 1 to indicate success
  }

  // Transaction Item methods
  async getTransactionItems(transactionId: number): Promise<TransactionItem[]> {
    return await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));
  }

  async createTransactionItem(
    insertItem: InsertTransactionItem
  ): Promise<TransactionItem> {
    return await dbInsert(transactionItems, insertItem);
  }

  // Inventory Usage methods
  async createInventoryUsage(
    insertUsage: InsertInventoryUsage
  ): Promise<InventoryUsage> {
    return await dbInsert(inventoryUsage, insertUsage);
  }

  async getInventoryUsage(transactionId: number): Promise<InventoryUsage[]> {
    return await db
      .select()
      .from(inventoryUsage)
      .where(eq(inventoryUsage.transactionId, transactionId));
  }

  // Dashboard stats methods untuk menampilkan semua data dari database - mendukung MySQL dan PostgreSQL
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
    console.log("========== DASHBOARD STATS ===========");
    // Log informasi database yang sedang digunakan
    console.log("USE_MYSQL (configured) =", shouldUseMySQL());
    console.log("USE_MYSQL (actual) =", isUsingMySQL());

    try {
      // Ambil data yang diperlukan untuk dashboard
      const [allTransactions, allCustomers, allServices] = await Promise.all([
        this.getTransactions(),
        this.getCustomers(),
        this.getServices(),
      ]);

      console.log(`Loaded ${allTransactions.length} transactions`);
      console.log(`Loaded ${allCustomers.length} customers`);
      console.log(`Loaded ${allServices.length} services`);

      // Debug: Tampilkan contoh data
      if (allTransactions.length > 0) {
        console.log(
          "Sample transaction data:",
          JSON.stringify(allTransactions[0])
        );
      }

      // INCOME: Hitung total pendapatan dari transaksi selesai
      const completedTransactions = allTransactions.filter(
        (t) => t.status === "completed"
      );
      const income = completedTransactions.reduce((sum, transaction) => {
        const total =
          typeof transaction.total === "number"
            ? transaction.total
            : parseInt(transaction.total as any, 10) || 0;
        return sum + total;
      }, 0);

      // CUSTOMERS: Hitung jumlah pelanggan unik dari transaksi
      const uniqueCustomerIds = new Set();
      allTransactions.forEach((t) => {
        if (t.customerId != null) {
          uniqueCustomerIds.add(t.customerId);
        }
      });
      const customerCount = uniqueCustomerIds.size || allCustomers.length;

      // AVG_PER_TRANSACTION: Hitung rata-rata per transaksi
      const avgPerTransaction =
        completedTransactions.length > 0
          ? Math.round(income / completedTransactions.length)
          : 0;

      // Dapatkan semua item transaksi
      const allItems: any[] = [];
      for (const transaction of allTransactions) {
        const items = await this.getTransactionItems(transaction.id);
        if (items && items.length > 0) {
          allItems.push(...items);
        }
      }
      console.log(`Loaded ${allItems.length} transaction items`);

      // VEHICLE COUNTS: Hitung mobil dan motor dari item transaksi
      let carCount = 0;
      let motorcycleCount = 0;

      // Pemetaan serviceId ke vehicleType untuk mempercepat lookup
      const serviceMap = allServices.reduce((map, service) => {
        map[service.id] = service.vehicleType;
        return map;
      }, {} as Record<number, string>);

      // Hitung berdasarkan jenis kendaraan pada setiap layanan
      for (const item of allItems) {
        if (item.serviceId) {
          const vehicleType = serviceMap[item.serviceId];
          const quantity = item.quantity || 1;

          if (vehicleType === "car") {
            carCount += quantity;
          } else if (vehicleType === "motorcycle") {
            motorcycleCount += quantity;
          }
        }
      }

      // Fallback: Gunakan jenis kendaraan dari pelanggan jika belum ada data
      if (carCount === 0 && motorcycleCount === 0) {
        console.log("Fallback: Menggunakan data kendaraan dari pelanggan");
        allCustomers.forEach((customer) => {
          if (customer.vehicleType === "car") {
            carCount++;
          } else if (customer.vehicleType === "motorcycle") {
            motorcycleCount++;
          }
        });
      }

      // NEW_CUSTOMERS: Semua pelanggan untuk saat ini
      const newCustomers = allCustomers.length;

      // QUEUE: Hitung antrian dari transaksi yang belum selesai
      const pendingTransactions = allTransactions.filter(
        (t) => t.status === "pending" || t.status === "in_progress"
      );
      const queueCount = pendingTransactions.length;

      // AVG_WAIT_TIME: Estimasi waktu tunggu berdasarkan jumlah antrian
      const avgWaitTime = queueCount > 0 ? queueCount * 15 : 0; // 15 menit per pelanggan

      // Hasil akhir
      const stats = {
        income,
        customerCount,
        carCount,
        motorcycleCount,
        avgPerTransaction,
        newCustomers,
        avgWaitTime,
        queueCount,
      };

      console.log("Final dashboard stats:", stats);
      console.log("========== END DASHBOARD STATS ===========");
      return stats;
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      // Nilai fallback jika terjadi error
      return {
        income: 0,
        customerCount: 0,
        carCount: 0,
        motorcycleCount: 0,
        avgPerTransaction: 0,
        newCustomers: 0,
        avgWaitTime: 0,
        queueCount: 0,
      };
    }
  }

  // ========== HRD MANAGEMENT METHODS ==========

  // Attendance methods
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const result = await db
      .select()
      .from(attendances)
      .where(eq(attendances.id, id));
    return result[0];
  }

  async createAttendance(
    insertAttendance: InsertAttendance
  ): Promise<Attendance> {
    return await dbInsert(attendances, insertAttendance);
  }

  async getAttendances(): Promise<Attendance[]> {
    return await db.select().from(attendances);
  }

  async getAttendancesByEmployee(employeeId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendances)
      .where(eq(attendances.employeeId, employeeId));
  }

  async getAttendancesByDate(date: Date): Promise<Attendance[]> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    return await db
      .select()
      .from(attendances)
      .where(
        and(gte(attendances.date, startDate), lte(attendances.date, endDate))
      );
  }

  async updateAttendance(
    id: number,
    attendanceData: Partial<Attendance>
  ): Promise<Attendance | undefined> {
    const [result] = await db
      .update(attendances)
      .set(attendanceData)
      .where(eq(attendances.id, id))
      .returning();
    return result;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    await db.delete(attendances).where(eq(attendances.id, id));
    return true;
  }

  // Payroll methods
  async getPayroll(id: number): Promise<Payroll | undefined> {
    const result = await db.select().from(payrolls).where(eq(payrolls.id, id));
    return result[0];
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    try {
      console.log(
        "CreatePayroll menerima input:",
        JSON.stringify(insertPayroll)
      );

      // Ambil data karyawan untuk mendapatkan posisinya
      const employee = await this.getEmployee(insertPayroll.employeeId);
      if (!employee) {
        throw new Error("Karyawan tidak ditemukan");
      }
      console.log("Data karyawan:", JSON.stringify(employee));

      // Ambil data posisi gaji berdasarkan posisi karyawan
      const positionSalary = await this.getPositionSalaryByPosition(
        employee.position
      );
      // Tambahkan fallback untuk gaji posisi yang belum diatur
      if (!positionSalary) {
        console.log(
          `Gaji untuk posisi ${employee.position} belum diatur, menggunakan nilai dari form input.`
        );
      } else {
        console.log("Data posisi:", JSON.stringify(positionSalary));
      }

      // Tentukan perhitungan gaji berdasarkan tipe penggajian (harian atau bulanan)
      let baseSalary = 0;
      const paymentType = insertPayroll.paymentType || "monthly"; // Default ke bulanan jika tidak ditentukan
      console.log("Tipe pembayaran:", paymentType);

      if (paymentType === "daily") {
        // Debugging untuk tarif harian
        const customDailyRate = (insertPayroll as any).dailyRate;
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
        const attendanceRecords = await db
          .select()
          .from(attendances)
          .where(
            and(
              eq(attendances.employeeId, insertPayroll.employeeId),
              gte(attendances.date, periodStart),
              lte(attendances.date, periodEnd),
              eq(attendances.status, "present")
            )
          );

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
      } else {
        // Debugging untuk gaji bulanan
        const customMonthlySalary = (insertPayroll as any).monthlySalary;
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
      let allowancesTotal = (insertPayroll as any).allowance || 35000;
      console.log("Tunjangan dari form:", allowancesTotal);

      // Jika tidak ada tunjangan yang diberikan secara eksplisit, gunakan dari posisi
      if (!allowancesTotal && positionSalary && positionSalary.allowances) {
        try {
          // Konversi JSON ke objek jika perlu
          const allowances =
            typeof positionSalary.allowances === "string"
              ? JSON.parse(positionSalary.allowances)
              : positionSalary.allowances;

          console.log(
            "Processed allowances from position:",
            allowances,
            "Type:",
            typeof allowances
          );

          // Hitung total tunjangan
          if (typeof allowances === "object" && allowances !== null) {
            allowancesTotal = 0; // Reset karena akan menghitung dari objek
            for (const [key, value] of Object.entries(allowances)) {
              console.log(`- Tunjangan ${key}:`, value, "Type:", typeof value);
              allowancesTotal += Number(value);
            }
          } else {
            console.error("Allowances bukan objek yang valid:", allowances);
          }
        } catch (err) {
          console.error("Error memproses tunjangan:", err);
          // Gunakan default jika ada error
          allowancesTotal = 35000;
        }
      } else {
        console.log("Menggunakan tunjangan default:", allowancesTotal);
      }

      // Hitung total gaji (gaji pokok + bonus + tunjangan - potongan)
      console.log("Perhitungan total:");
      console.log("- Gaji pokok:", baseSalary);
      console.log("- Bonus:", insertPayroll.bonus || 0);
      console.log("- Allowances:", allowancesTotal);
      console.log("- Potongan:", insertPayroll.deduction || 0);

      const totalAmount =
        baseSalary +
        (insertPayroll.bonus || 0) +
        allowancesTotal -
        (insertPayroll.deduction || 0);
      console.log("= Total amount:", totalAmount);

      // Update data payroll dengan info yang dihitung
      const payrollData = {
        ...insertPayroll,
        baseSalary,
        totalAmount,
        status: insertPayroll.status || "pending",
      };

      // Simpan data payroll
      console.log(
        "[DB Storage] Attempting to create payroll with final data:",
        payrollData
      );

      const insertResult = await db
        .insert(payrolls) // 'payrolls' adalah objek tabel Drizzle Anda
        .values(payrollData);

      let newPayrollId: number | undefined;
      // Coba dapatkan insertId dari ResultSetHeader (umum untuk mysql2 driver)
      if (
        insertResult &&
        insertResult[0] &&
        typeof (insertResult[0] as any).insertId === "number"
      ) {
        newPayrollId = (insertResult[0] as any).insertId;
      } else {
        console.error(
          "[DB Storage] Failed to obtain insertId for the new payroll. Insert result:",
          insertResult
        );
        // Untuk payroll, kita sangat bergantung pada ID. Jika tidak ada, lempar error.
        // Anda bisa mencoba fallback lain jika struktur tabel Anda memungkinkan (misalnya, mengambil berdasarkan employeeId dan periodStart jika unik)
        // tapi itu kurang ideal.
        throw new Error(
          `Failed to obtain ID for new payroll for employeeId '${payrollData.employeeId}' for period starting ${payrollData.periodStart}.`
        );
      }

      if (typeof newPayrollId !== "number" || newPayrollId === 0) {
        console.error(
          "[DB Storage] Invalid insertId obtained for the new payroll:",
          newPayrollId
        );
        throw new Error(
          `Invalid ID obtained for new payroll for employeeId '${payrollData.employeeId}'.`
        );
      }

      // Ambil record yang baru di-insert menggunakan newPayrollId
      const [retrievedPayroll] = await db
        .select()
        .from(payrolls) // Gunakan objek tabel Drizzle Anda
        .where(eq(payrolls.id, newPayrollId)) // Asumsi kolom primary key adalah 'id'
        .limit(1);

      if (!retrievedPayroll) {
        console.error(
          "[DB Storage] Failed to retrieve payroll after insert for ID:",
          newPayrollId
        );
        throw new Error(
          "Failed to retrieve the created payroll record using insertId."
        );
      }

      console.log(
        "[DB Storage] Payroll created and retrieved successfully:",
        retrievedPayroll
      );
      return retrievedPayroll as Payroll; // Pastikan tipe Payroll sesuai dengan Selectable<typeof payrolls>
    } catch (error) {
      console.error("Error creating payroll:", error);
      throw error;
    }
  }

  async getPayrolls(): Promise<Payroll[]> {
    return await db.select().from(payrolls);
  }

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.employeeId, employeeId));
  }

  async getPayrollsByPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<Payroll[]> {
    return await db
      .select()
      .from(payrolls)
      .where(
        and(
          gte(payrolls.periodStart, startDate),
          lte(payrolls.periodStart, endDate)
        )
      );
  }

  // VERSI BARU untuk database-storage.ts
  async updatePayroll(
    id: number,
    payrollData: Partial<Payroll>
  ): Promise<Payroll | undefined> {
    try {
      console.log(
        `[DB Storage] Attempting to update payroll ID: ${id} with data:`,
        payrollData
      );

      // Tambahkan updatedAt secara manual jika ada di skema Anda dan tidak di-handle otomatis oleh DB
      const dataToUpdate: Partial<Payroll> = {
        ...payrollData,
        updatedAt: new Date(), // Asumsi Anda punya kolom updatedAt
      };

      const updateResult = await db
        .update(payrolls) // 'payrolls' adalah objek tabel Drizzle Anda
        .set(dataToUpdate)
        .where(eq(payrolls.id, id));

      // Untuk mysql2, updateResult[0] adalah ResultSetHeader
      // Kita bisa cek affectedRows untuk memastikan update terjadi
      const resultSetHeader =
        updateResult && updateResult[0] ? (updateResult[0] as any) : undefined;
      if (!resultSetHeader || resultSetHeader.affectedRows === 0) {
        console.warn(
          `[DB Storage] Payroll with ID: ${id} not found or no rows affected by update.`
        );
        return undefined; // Atau lemparkan error jika update harusnya selalu berhasil
      }

      console.log(
        `[DB Storage] Payroll ID: ${id} update affected ${resultSetHeader.affectedRows} row(s).`
      );

      // Ambil record yang baru di-update menggunakan ID
      const [retrievedPayroll] = await db
        .select()
        .from(payrolls)
        .where(eq(payrolls.id, id))
        .limit(1);

      if (!retrievedPayroll) {
        console.error(
          "[DB Storage] Failed to retrieve payroll after update for ID:",
          id
        );
        // Ini aneh jika update berhasil tapi tidak bisa diambil, tapi bisa terjadi jika ada race condition atau ID salah
        return undefined;
      }

      console.log(
        "[DB Storage] Payroll updated and retrieved successfully:",
        retrievedPayroll
      );
      return retrievedPayroll as Payroll; // Sesuaikan 'Payroll' dengan tipe Select Anda dari schema
    } catch (dbError) {
      console.error(
        `[DB Storage] Error in updatePayroll for ID ${id}:`,
        dbError
      );
      if (dbError instanceof Error) {
        throw new Error(`Database error updating payroll: ${dbError.message}`);
      }
      throw new Error("Unknown database error updating payroll.");
    }
  }

  async deletePayroll(id: number): Promise<boolean> {
    await db.delete(payrolls).where(eq(payrolls.id, id));
    return true;
  }

  // Performance Review methods
  async getPerformanceReview(
    id: number
  ): Promise<PerformanceReview | undefined> {
    const result = await db
      .select()
      .from(performanceReviews)
      .where(eq(performanceReviews.id, id));
    return result[0];
  }

  async createPerformanceReview(
    insertReview: InsertPerformanceReview
  ): Promise<PerformanceReview> {
    const [result] = await db
      .insert(performanceReviews)
      .values(insertReview)
      .returning();
    return result;
  }

  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    return await db.select().from(performanceReviews);
  }

  async getPerformanceReviewsByEmployee(
    employeeId: number
  ): Promise<PerformanceReview[]> {
    return await db
      .select()
      .from(performanceReviews)
      .where(eq(performanceReviews.employeeId, employeeId));
  }

  async updatePerformanceReview(
    id: number,
    reviewData: Partial<PerformanceReview>
  ): Promise<PerformanceReview | undefined> {
    const [result] = await db
      .update(performanceReviews)
      .set(reviewData)
      .where(eq(performanceReviews.id, id))
      .returning();
    return result;
  }

  async deletePerformanceReview(id: number): Promise<boolean> {
    await db.delete(performanceReviews).where(eq(performanceReviews.id, id));
    return true;
  }

  // Leave Request methods
  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    const result = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id));
    return result[0];
  }

  async createLeaveRequest(
    insertRequest: InsertLeaveRequest
  ): Promise<LeaveRequest> {
    const [result] = await db
      .insert(leaveRequests)
      .values(insertRequest)
      .returning();
    return result;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests);
  }

  async getLeaveRequestsByEmployee(
    employeeId: number
  ): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.employeeId, employeeId));
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.status, "pending"));
  }

  async updateLeaveRequest(
    id: number,
    requestData: Partial<LeaveRequest>
  ): Promise<LeaveRequest | undefined> {
    const [result] = await db
      .update(leaveRequests)
      .set(requestData)
      .where(eq(leaveRequests.id, id))
      .returning();
    return result;
  }

  async approveLeaveRequest(
    id: number,
    approverId: number
  ): Promise<LeaveRequest | undefined> {
    const now = new Date();
    const [result] = await db
      .update(leaveRequests)
      .set({
        status: "approved",
        approvedById: approverId,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return result;
  }

  async rejectLeaveRequest(
    id: number,
    approverId: number
  ): Promise<LeaveRequest | undefined> {
    const now = new Date();
    const [result] = await db
      .update(leaveRequests)
      .set({
        status: "rejected",
        approvedById: approverId,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return result;
  }

  async deleteLeaveRequest(id: number): Promise<boolean> {
    await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
    return true;
  }

  // Training Session methods
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const result = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, id));
    return result[0];
  }

  async createTrainingSession(
    insertSession: InsertTrainingSession
  ): Promise<TrainingSession> {
    const [result] = await db
      .insert(trainingSessions)
      .values(insertSession)
      .returning();
    return result;
  }

  async getTrainingSessions(): Promise<TrainingSession[]> {
    return await db.select().from(trainingSessions);
  }

  async getUpcomingTrainingSessions(): Promise<TrainingSession[]> {
    const now = new Date();
    return await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          gte(trainingSessions.startDate, now),
          eq(trainingSessions.status, "scheduled")
        )
      );
  }

  async updateTrainingSession(
    id: number,
    sessionData: Partial<TrainingSession>
  ): Promise<TrainingSession | undefined> {
    const [result] = await db
      .update(trainingSessions)
      .set(sessionData)
      .where(eq(trainingSessions.id, id))
      .returning();
    return result;
  }

  async deleteTrainingSession(id: number): Promise<boolean> {
    await db.delete(trainingSessions).where(eq(trainingSessions.id, id));
    return true;
  }

  // Training Participant methods
  async getTrainingParticipant(
    id: number
  ): Promise<TrainingParticipant | undefined> {
    const result = await db
      .select()
      .from(trainingParticipants)
      .where(eq(trainingParticipants.id, id));
    return result[0];
  }

  async createTrainingParticipant(
    insertParticipant: InsertTrainingParticipant
  ): Promise<TrainingParticipant> {
    const [result] = await db
      .insert(trainingParticipants)
      .values(insertParticipant)
      .returning();
    return result;
  }

  async getTrainingParticipants(
    trainingId: number
  ): Promise<TrainingParticipant[]> {
    return await db
      .select()
      .from(trainingParticipants)
      .where(eq(trainingParticipants.trainingId, trainingId));
  }

  async getTrainingParticipantsByEmployee(
    employeeId: number
  ): Promise<TrainingParticipant[]> {
    return await db
      .select()
      .from(trainingParticipants)
      .where(eq(trainingParticipants.employeeId, employeeId));
  }

  async updateTrainingParticipant(
    id: number,
    participantData: Partial<TrainingParticipant>
  ): Promise<TrainingParticipant | undefined> {
    const [result] = await db
      .update(trainingParticipants)
      .set(participantData)
      .where(eq(trainingParticipants.id, id))
      .returning();
    return result;
  }

  async deleteTrainingParticipant(id: number): Promise<boolean> {
    await db
      .delete(trainingParticipants)
      .where(eq(trainingParticipants.id, id));
    return true;
  }

  // HRD Document methods
  async getHrdDocument(id: number): Promise<HrdDocument | undefined> {
    const result = await db
      .select()
      .from(hrdDocuments)
      .where(eq(hrdDocuments.id, id));
    return result[0];
  }

  async createHrdDocument(
    insertDocument: InsertHrdDocument
  ): Promise<HrdDocument> {
    const [result] = await db
      .insert(hrdDocuments)
      .values(insertDocument)
      .returning();
    return result;
  }

  async getHrdDocuments(): Promise<HrdDocument[]> {
    return await db.select().from(hrdDocuments);
  }

  async getHrdDocumentsByEmployee(employeeId: number): Promise<HrdDocument[]> {
    return await db
      .select()
      .from(hrdDocuments)
      .where(eq(hrdDocuments.employeeId, employeeId));
  }

  async getExpiringHrdDocuments(daysThreshold: number): Promise<HrdDocument[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return await db
      .select()
      .from(hrdDocuments)
      .where(
        and(
          lte(hrdDocuments.expiryDate, thresholdDate),
          gte(hrdDocuments.expiryDate, today)
        )
      );
  }

  async updateHrdDocument(
    id: number,
    documentData: Partial<HrdDocument>
  ): Promise<HrdDocument | undefined> {
    const [result] = await db
      .update(hrdDocuments)
      .set(documentData)
      .where(eq(hrdDocuments.id, id))
      .returning();
    return result;
  }

  async deleteHrdDocument(id: number): Promise<boolean> {
    await db.delete(hrdDocuments).where(eq(hrdDocuments.id, id));
    return true;
  }

  // Position Salary methods
  async getPositionSalary(id: number): Promise<PositionSalary | undefined> {
    const result = await db
      .select()
      .from(positionSalaries)
      .where(eq(positionSalaries.id, id));
    return result[0];
  }

  async getPositionSalaryByPosition(
    position: string
  ): Promise<PositionSalary | undefined> {
    const result = await db
      .select()
      .from(positionSalaries)
      .where(eq(positionSalaries.position, position));
    return result[0];
  }

  async createPositionSalary(
    insertSalary: InsertPositionSalary
  ): Promise<PositionSalary> {
    const [result] = await db
      .insert(positionSalaries)
      .values(insertSalary)
      .returning();
    return result;
  }

  async getPositionSalaries(): Promise<PositionSalary[]> {
    return await db.select().from(positionSalaries);
  }

  async updatePositionSalary(
    id: number,
    salaryData: Partial<PositionSalary>
  ): Promise<PositionSalary | undefined> {
    const [result] = await db
      .update(positionSalaries)
      .set(salaryData)
      .where(eq(positionSalaries.id, id))
      .returning();
    return result;
  }

  async deletePositionSalary(id: number): Promise<boolean> {
    await db.delete(positionSalaries).where(eq(positionSalaries.id, id));
    return true;
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.name, name));
    return result[0];
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    try {
      console.log(
        "[DB Storage] Attempting to create role with data:",
        insertRole
      );

      // MySQL dengan Drizzle tidak mendukung .returning() secara universal pada insert.
      // Kita insert dulu, lalu select untuk mendapatkan data lengkap termasuk ID auto-increment.
      const insertResult = await db
        .insert(roles) // 'roles' adalah objek tabel Drizzle Anda
        .values(insertRole);

      // Dapatkan ID yang baru di-insert (jika 'id' adalah auto_increment)
      // Cara ini mungkin bergantung pada driver mysql2, insertId adalah non-standar Drizzle API
      // tapi sering ada di hasil ResultSetHeader.
      let newRoleId: number | undefined;
      if (
        insertResult &&
        insertResult[0] &&
        typeof (insertResult[0] as any).insertId === "number"
      ) {
        newRoleId = (insertResult[0] as any).insertId;
      } else {
        // Fallback jika insertId tidak ada: coba ambil berdasarkan nama (asumsi nama unik)
        // Ini kurang ideal karena race condition bisa terjadi, tapi untuk inisialisasi mungkin oke.
        console.warn(
          "[DB Storage] insertId not found directly for new role. Attempting to retrieve by name:",
          insertRole.name
        );
        const tempRole = await this.getRoleByName(insertRole.name);
        if (tempRole) newRoleId = tempRole.id;
      }

      if (!newRoleId) {
        console.error(
          "[DB Storage] Failed to obtain ID for the newly created role:",
          insertRole.name
        );
        throw new Error(
          `Failed to obtain ID for new role '${
            insertRole.name
          }'. Insert result: ${JSON.stringify(insertResult)}`
        );
      }

      const [retrievedRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, newRoleId))
        .limit(1);

      if (!retrievedRole) {
        console.error(
          "[DB Storage] Failed to retrieve role after insert for ID:",
          newRoleId
        );
        throw new Error("Failed to retrieve the created role record.");
      }

      console.log("[DB Storage] Role created and retrieved:", retrievedRole);
      return retrievedRole as Role;
    } catch (dbError) {
      console.error("[DB Storage] Error in createRole:", dbError);
      if (dbError instanceof Error) {
        throw new Error(`Database error creating role: ${dbError.message}`);
      }
      throw new Error("Unknown database error creating role.");
    }
  }

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async updateRole(
    id: number,
    roleData: Partial<Role>
  ): Promise<Role | undefined> {
    const [result] = await db
      .update(roles)
      .set(roleData)
      .where(eq(roles.id, id))
      .returning();
    return result;
  }

  async deleteRole(id: number): Promise<boolean> {
    await db.delete(roles).where(eq(roles.id, id));
    return true;
  }

  // Permission methods
  async getPermission(id: number): Promise<Permission | undefined> {
    const result = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id));
    return result[0];
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const result = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, name));
    return result[0];
  }

  // VERSI BARU untuk database-storage.ts
  async createPermission(
    insertPermission: InsertPermission
  ): Promise<Permission> {
    try {
      console.log(
        "[DB Storage] Attempting to create permission with data:",
        insertPermission
      );

      const insertResult = await db
        .insert(permissions) // 'permissions' adalah objek tabel Drizzle Anda
        .values(insertPermission);

      let newPermissionId: number | undefined;
      if (
        insertResult &&
        insertResult[0] &&
        typeof (insertResult[0] as any).insertId === "number"
      ) {
        newPermissionId = (insertResult[0] as any).insertId;
      } else {
        console.warn(
          "[DB Storage] insertId not found directly for new permission. Attempting to retrieve by name:",
          insertPermission.name
        );
        const tempPerm = await this.getPermissionByName(insertPermission.name); // Asumsi Anda punya getPermissionByName
        if (tempPerm) newPermissionId = tempPerm.id;
      }

      if (!newPermissionId) {
        console.error(
          "[DB Storage] Failed to obtain ID for the newly created permission:",
          insertPermission.name
        );
        throw new Error(
          `Failed to obtain ID for new permission '${
            insertPermission.name
          }'. Insert result: ${JSON.stringify(insertResult)}`
        );
      }

      const [retrievedPermission] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.id, newPermissionId))
        .limit(1);

      if (!retrievedPermission) {
        console.error(
          "[DB Storage] Failed to retrieve permission after insert for ID:",
          newPermissionId
        );
        throw new Error("Failed to retrieve the created permission record.");
      }

      console.log(
        "[DB Storage] Permission created and retrieved:",
        retrievedPermission
      );
      return retrievedPermission as Permission; // Sesuaikan 'Permission' dengan tipe Select Anda
    } catch (dbError) {
      console.error("[DB Storage] Error in createPermission:", dbError);
      if (dbError instanceof Error) {
        throw new Error(
          `Database error creating permission: ${dbError.message}`
        );
      }
      throw new Error("Unknown database error creating permission.");
    }
  }

  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return await db
      .select()
      .from(permissions)
      .where(eq(permissions.module, module));
  }

  async updatePermission(
    id: number,
    permissionData: Partial<Permission>
  ): Promise<Permission | undefined> {
    const [result] = await db
      .update(permissions)
      .set(permissionData)
      .where(eq(permissions.id, id))
      .returning();
    return result;
  }

  async deletePermission(id: number): Promise<boolean> {
    await db.delete(permissions).where(eq(permissions.id, id));
    return true;
  }

  // Role Permission methods
  async getRolePermission(id: number): Promise<RolePermission | undefined> {
    const result = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.id, id));
    return result[0];
  }

  // VERSI BARU untuk database-storage.ts
  async createRolePermission(
    insertRolePermission: InsertRolePermission
  ): Promise<RolePermission> {
    try {
      console.log(
        "[DB Storage] Attempting to create role permission with data:",
        insertRolePermission
      );

      // Jalankan INSERT tanpa .returning()
      const insertResult = await db
        .insert(rolePermissions) // Pastikan 'rolePermissions' adalah objek tabel Drizzle Anda
        .values(insertRolePermission);

      console.log(
        "[DB Storage] Role permission insert result (MySQL might not return useful info here):",
        insertResult
      );

      // Untuk MySQL, .returning() tidak berfungsi. Kita perlu mengambil data yang baru di-insert secara manual.
      // Asumsikan kombinasi roleId dan permissionId adalah unik atau yang ingin kita ambil.
      // Atau jika tabel rolePermissions memiliki primary key 'id' sendiri yang auto-increment,
      // cara mengambilnya akan bergantung pada driver dan konfigurasi Drizzle Anda untuk MySQL.
      // (insertResult as any).insertId mungkin tersedia untuk beberapa driver MySQL.

      // Pendekatan paling umum: SELECT lagi data yang baru saja di-insert.
      // Ini mengasumsikan bahwa tabel 'rolePermissions' memiliki kolom 'roleId' dan 'permissionId'
      // dan Anda ingin mengembalikan record yang cocok dengan itu.
      // Pastikan tabel 'rolePermissions' didefinisikan dengan benar di schema Drizzle Anda.
      const [retrievedEntry] = await db
        .select()
        .from(rolePermissions) // Gunakan objek tabel Drizzle Anda
        .where(
          and(
            eq(rolePermissions.roleId, insertRolePermission.roleId),
            eq(rolePermissions.permissionId, insertRolePermission.permissionId)
          )
        )
        .limit(1); // Ambil satu saja, karena seharusnya unik jika baru di-insert

      if (!retrievedEntry) {
        console.error(
          "[DB Storage] Failed to retrieve role permission after insert for data:",
          insertRolePermission
        );
        // Jika Anda menggunakan skema Zod untuk SELECT (SelectRolePermission) yang memiliki kolom 'id',
        // dan tabel Anda tidak memiliki 'id' atau Anda tidak mengquery-nya, ini bisa jadi masalah.
        // Untuk sekarang, kita coba kembalikan objek yang mungkin tidak punya 'id' jika tabelnya memang begitu.
        // Atau lemparkan error jika memang harus ada.
        throw new Error(
          "Failed to retrieve the created role permission record."
        );
      }

      console.log(
        "[DB Storage] Role permission created and retrieved:",
        retrievedEntry
      );
      // Pastikan tipe 'retrievedEntry' sesuai dengan 'RolePermission' (atau SelectRolePermission)
      // Anda mungkin perlu melakukan type assertion atau mapping jika fieldnya berbeda.
      return retrievedEntry as RolePermission; // Sesuaikan 'RolePermission' dengan tipe Select Anda dari schema
    } catch (dbError) {
      console.error("[DB Storage] Error in createRolePermission:", dbError);
      // Lemparkan error yang lebih spesifik atau yang sudah ada
      if (dbError instanceof Error) {
        throw new Error(
          `Database error creating role permission: ${dbError.message}`
        );
      }
      throw new Error("Unknown database error creating role permission.");
    }
  }

  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    return await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
  }

  async deleteRolePermission(id: number): Promise<boolean> {
    await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
    return true;
  }

  async deleteRolePermissionsByRole(roleId: number): Promise<boolean> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    return true;
  }

  async getPermissionsByRole(roleId: number): Promise<Permission[]> {
    const rolePerms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    const permissionIds = rolePerms.map((rp: any) => rp.permissionId);

    if (permissionIds.length === 0) {
      return [];
    }

    // Handle each permission separately with OR
    const conditions = permissionIds.map((id: number) =>
      eq(permissions.id, id)
    );

    // Handle single permission case
    if (conditions.length === 1) {
      return await db.select().from(permissions).where(conditions[0]);
    }

    // Handle multiple permissions with OR
    return await db
      .select()
      .from(permissions)
      .where(or(...conditions));
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
    const allEmployees = await db.select().from(employees);
    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter(
      (emp: any) => emp.isActive === true
    ).length;

    // Get attendance stats for today
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const todayAttendances = await db
      .select()
      .from(attendances)
      .where(
        and(
          gte(attendances.date, startOfToday),
          lte(attendances.date, endOfToday)
        )
      );

    const absentToday = todayAttendances.filter(
      (att: any) => att.status === "absent"
    ).length;
    const presentToday = todayAttendances.filter(
      (att: any) => att.status === "present"
    ).length;
    const lateToday = todayAttendances.filter(
      (att: any) => att.status === "late"
    ).length;

    // Get pending leave requests
    const pendingLeaveRequests = (
      await db
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.status, "pending"))
    ).length;

    // Get upcoming trainings
    const upcomingTrainings = (
      await db
        .select()
        .from(trainingSessions)
        .where(
          and(
            gte(trainingSessions.startDate, today),
            eq(trainingSessions.status, "scheduled")
          )
        )
    ).length;

    // Get documents expiring soon (in the next 30 days)
    const thirtyDaysFromToday = new Date();
    thirtyDaysFromToday.setDate(today.getDate() + 30);

    const expiringSoonDocuments = (
      await db
        .select()
        .from(hrdDocuments)
        .where(
          and(
            lte(hrdDocuments.expiryDate, thirtyDaysFromToday),
            gte(hrdDocuments.expiryDate, today)
          )
        )
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      absentToday,
      presentToday,
      lateToday,
      pendingLeaveRequests,
      upcomingTrainings,
      expiringSoonDocuments,
    };
  }

  // ========== FINANCE MANAGEMENT METHODS ==========

  // Expense Category methods
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(
    insertCategory: InsertExpenseCategory
  ): Promise<ExpenseCategory> {
    const [category] = await db
      .insert(expenseCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return db.select().from(expenseCategories);
  }

  async updateExpenseCategory(
    id: number,
    categoryData: Partial<ExpenseCategory>
  ): Promise<ExpenseCategory | undefined> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(expenseCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number): Promise<boolean> {
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
    return true;
  }

  // Expense methods
  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense;
  }

  // VERSI BARU untuk database-storage.ts
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    try {
      console.log(
        "[DB Storage] Attempting to create expense with data:",
        insertExpense
      );

      const insertResult = await db
        .insert(expenses) // 'expenses' adalah objek tabel Drizzle Anda
        .values(insertExpense);

      let newExpenseId: number | undefined;
      // Coba dapatkan insertId (spesifik MySQL melalui beberapa driver Drizzle)
      // ResultSetHeader ada di indeks 0 dari array hasil untuk mysql2
      if (
        insertResult &&
        insertResult[0] &&
        typeof (insertResult[0] as any).insertId === "number"
      ) {
        newExpenseId = (insertResult[0] as any).insertId;
      } else {
        // Jika insertId tidak ada, ini menjadi masalah karena kita butuh ID untuk mengambil kembali record lengkap.
        // Untuk tabel expense, biasanya ada ID auto-increment.
        console.error(
          "[DB Storage] Failed to obtain insertId for the new expense. Insert result:",
          insertResult
        );
        // Anda bisa mencoba mengambil berdasarkan kombinasi unik lain jika ada, tapi ID adalah yang terbaik.
        // Jika tidak ada cara lain, lempar error.
        throw new Error(
          `Failed to obtain ID for new expense. Data: ${JSON.stringify(
            insertExpense
          )}`
        );
      }

      if (typeof newExpenseId !== "number" || newExpenseId === 0) {
        console.error(
          "[DB Storage] Invalid insertId obtained for the new expense:",
          newExpenseId
        );
        throw new Error(
          `Invalid ID obtained for new expense '${insertExpense.description}'.`
        );
      }

      // Ambil record yang baru di-insert menggunakan newExpenseId
      const [retrievedExpense] = await db
        .select()
        .from(expenses) // Gunakan objek tabel Drizzle Anda
        .where(eq(expenses.id, newExpenseId)) // Asumsi kolom primary key adalah 'id'
        .limit(1);

      if (!retrievedExpense) {
        console.error(
          "[DB Storage] Failed to retrieve expense after insert for ID:",
          newExpenseId
        );
        throw new Error(
          "Failed to retrieve the created expense record using insertId."
        );
      }

      console.log(
        "[DB Storage] Expense created and retrieved successfully:",
        retrievedExpense
      );
      return retrievedExpense as Expense; // Sesuaikan 'Expense' dengan tipe Select Anda dari schema
    } catch (dbError) {
      console.error("[DB Storage] Error in createExpense:", dbError);
      if (dbError instanceof Error) {
        throw new Error(`Database error creating expense: ${dbError.message}`);
      }
      throw new Error("Unknown database error creating expense.");
    }
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpensesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    return db
      .select()
      .from(expenses)
      .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
      .orderBy(expenses.date);
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

  async updateExpense(
    id: number,
    expenseData: Partial<Expense> // Tipe Expense dari @shared/schema
  ): Promise<Expense | undefined> {
    // === AWAL KODE PENGGANTI ===
    try {
      console.log(
        `[DB Storage] Attempting to update expense ID: ${id} with data:`,
        JSON.stringify(expenseData, null, 2)
      );

      // Siapkan data yang akan diupdate.
      // Tambahkan updatedAt secara manual jika kolomnya ada dan tidak dihandle otomatis oleh DB.
      const dataToUpdate: Partial<Expense> = {
        ...expenseData,
        updatedAt: new Date(), // Asumsi Anda punya kolom updatedAt di tabel 'expenses'
      };

      // Lakukan operasi UPDATE tanpa .returning()
      const updateResult = await db
        .update(expenses) // 'expenses' adalah objek tabel Drizzle Anda
        .set(dataToUpdate)
        .where(eq(expenses.id, id));

      // Untuk driver mysql2 di Drizzle, hasil update biasanya adalah array
      // dengan ResultSetHeader di indeks 0.
      const resultSetHeader =
        updateResult && Array.isArray(updateResult) && updateResult[0]
          ? (updateResult[0] as any) // Type assertion ke any untuk akses properti non-standar
          : undefined;

      // Periksa apakah ada baris yang terpengaruh oleh update.
      // Properti 'affectedRows' ada di ResultSetHeader untuk MySQL.
      if (
        !resultSetHeader ||
        typeof resultSetHeader.affectedRows !== "number" ||
        resultSetHeader.affectedRows === 0
      ) {
        console.warn(
          `[DB Storage] Expense with ID: ${id} not found or no rows affected by update. ResultSetHeader:`,
          resultSetHeader
        );
        return undefined; // Kembalikan undefined jika tidak ada yang diupdate (misalnya, ID tidak ditemukan)
      }

      console.log(
        `[DB Storage] Expense ID: ${id} update affected ${resultSetHeader.affectedRows} row(s).`
      );

      // Jika update berhasil (ada baris yang terpengaruh),
      // ambil kembali record yang baru di-update menggunakan ID-nya.
      const [retrievedExpense] = await db
        .select()
        .from(expenses) // Gunakan objek tabel Drizzle 'expenses' Anda
        .where(eq(expenses.id, id)) // Asumsi kolom primary key adalah 'id'
        .limit(1);

      if (!retrievedExpense) {
        console.error(
          "[DB Storage] Failed to retrieve expense after successful update for ID:",
          id
        );
        // Ini seharusnya tidak terjadi jika affectedRows > 0, tapi sebagai tindakan pencegahan.
        return undefined;
      }

      console.log(
        "[DB Storage] Expense updated and retrieved successfully:",
        JSON.stringify(retrievedExpense, null, 2)
      );
      return retrievedExpense as Expense; // Pastikan tipe 'Expense' sesuai dengan Selectable<typeof expenses>
    } catch (dbError) {
      console.error(
        `[DB Storage] Error in updateExpense for ID ${id}:`,
        dbError
      );
      // Lemparkan kembali error agar bisa ditangani oleh pemanggil di routes.ts
      if (dbError instanceof Error) {
        throw new Error(`Database error updating expense: ${dbError.message}`);
      }
      throw new Error("Unknown database error updating expense.");
    }
    // === AKHIR KODE PENGGANTI ===
  }

  async deleteExpense(id: number): Promise<boolean> {
    await db.delete(expenses).where(eq(expenses.id, id));
    return true;
  }

  // Profit-Loss Report methods
  async getProfitLossReport(id: number): Promise<ProfitLossReport | undefined> {
    const [report] = await db
      .select()
      .from(profitLossReports)
      .where(eq(profitLossReports.id, id));
    return report;
  }

  async getProfitLossReportByPeriod(
    period: string
  ): Promise<ProfitLossReport | undefined> {
    const [report] = await db
      .select()
      .from(profitLossReports)
      .where(eq(profitLossReports.period, period));
    return report;
  }

  // === METODE BARU SEBAGAI PENGGANTI ===
  async createProfitLossReport(
    insertReport: InsertProfitLossReport
  ): Promise<ProfitLossReport> {
    try {
      console.log(
        "[DB Storage] Attempting to create ProfitLossReport with data:",
        JSON.stringify(insertReport, null, 2)
      );

      // Lakukan operasi INSERT tanpa .returning()
      const insertResult = await db
        .insert(profitLossReports) // 'profitLossReports' adalah objek tabel Drizzle Anda
        .values(insertReport);

      // Untuk driver mysql2 di Drizzle, hasil insert biasanya adalah array
      // dengan ResultSetHeader di indeks 0, yang memiliki properti 'insertId'.
      let newReportId: number | undefined;
      const resultSetHeader =
        insertResult && Array.isArray(insertResult) && insertResult[0]
          ? (insertResult[0] as any) // Type assertion ke any untuk akses properti non-standar
          : undefined;

      if (
        resultSetHeader &&
        typeof resultSetHeader.insertId === "number" &&
        resultSetHeader.insertId > 0
      ) {
        newReportId = resultSetHeader.insertId;
        console.log("[DB Storage] New ProfitLossReport insertId:", newReportId);
      } else {
        // Jika insertId tidak didapatkan (misalnya, tabel tidak punya auto_increment atau driver berbeda)
        // Anda mungkin perlu fallback untuk mengambil berdasarkan kriteria unik lain,
        // atau ini bisa jadi error jika ID sangat penting.
        console.error(
          "[DB Storage] Failed to obtain a valid insertId for the new ProfitLossReport. ResultSetHeader:",
          resultSetHeader
        );
        // Untuk laporan laba rugi, ID yang baru dibuat biasanya penting.
        throw new Error(
          `Failed to create ProfitLossReport or obtain ID for period '${insertReport.period}'.`
        );
      }

      // Ambil record yang baru di-insert menggunakan newReportId
      const [retrievedReport] = await db
        .select()
        .from(profitLossReports) // Gunakan objek tabel Drizzle Anda
        .where(eq(profitLossReports.id, newReportId)) // Asumsi kolom primary key adalah 'id'
        .limit(1);

      if (!retrievedReport) {
        console.error(
          "[DB Storage] Failed to retrieve ProfitLossReport after insert, even with insertId, for ID:",
          newReportId
        );
        throw new Error(
          "Failed to retrieve the created ProfitLossReport record using insertId."
        );
      }

      console.log(
        "[DB Storage] ProfitLossReport created and retrieved successfully:",
        JSON.stringify(retrievedReport, null, 2)
      );
      return retrievedReport as ProfitLossReport; // Pastikan tipe ProfitLossReport sesuai
    } catch (dbError) {
      console.error("[DB Storage] Error in createProfitLossReport:", dbError);
      if (dbError instanceof Error) {
        throw new Error(
          `Database error creating ProfitLossReport: ${dbError.message}`
        );
      }
      throw new Error("Unknown database error creating ProfitLossReport.");
    }
  }
  // === AKHIR DARI METODE BARU ===

  async getProfitLossReports(): Promise<ProfitLossReport[]> {
    return db
      .select()
      .from(profitLossReports)
      .orderBy(desc(profitLossReports.createdAt));
  }

  async updateProfitLossReport(
    id: number,
    reportData: Partial<ProfitLossReport>
  ): Promise<ProfitLossReport | undefined> {
    const [updatedReport] = await db
      .update(profitLossReports)
      .set({ ...reportData, updatedAt: new Date() })
      .where(eq(profitLossReports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteProfitLossReport(id: number): Promise<boolean> {
    await db.delete(profitLossReports).where(eq(profitLossReports.id, id));
    return true;
  }

  async calculateProfitLossReport(period: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    totalSalaries: number;
    profit: number;
  }> {
    // Parse period string (format: 'YYYY-MM')
    const [year, month] = period.split("-").map(Number);

    // Get start and end date for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Calculate total revenue from transactions
    const periodTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(gte(transactions.date, startDate), lte(transactions.date, endDate))
      );
    const totalRevenue = periodTransactions.reduce(
      (sum: number, tx: any) => sum + tx.total,
      0
    );

    // Calculate total expenses
    const expenses = await this.getExpensesByMonth(year, month);
    const totalExpenses = expenses.reduce(
      (sum: number, expense: any) => sum + expense.amount,
      0
    );

    // Calculate total salaries
    const payrolls = await this.getPayrollsByPeriod(startDate, endDate);
    const totalSalaries = payrolls.reduce(
      (sum: number, payroll: any) => sum + payroll.totalAmount,
      0
    );

    // Calculate profit (revenue - expenses - salaries)
    const profit = totalRevenue - totalExpenses - totalSalaries;

    return {
      totalRevenue,
      totalExpenses,
      totalSalaries,
      profit,
    };
  }
}
