// Skrip untuk membuat tabel database di MySQL
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Konfigurasi MySQL dari variabel lingkungan
const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'wash_corner',
};

// SQL untuk membuat tabel
const createTableSQL = `
-- Tabel Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  email VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  vehicle_type VARCHAR(20),
  vehicle_brand VARCHAR(50),
  vehicle_model VARCHAR(50),
  license_plate VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Services
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  duration INT NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  warranty INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  current_stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 5,
  unit VARCHAR(20) NOT NULL,
  price INT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  joining_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  employee_id INT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total INT NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  tracking_code VARCHAR(50),
  notifications_sent JSON,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT,
  service_id INT,
  price INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  discount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Inventory Usage
CREATE TABLE IF NOT EXISTS inventory_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT,
  inventory_item_id INT,
  quantity DOUBLE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Position Salaries
CREATE TABLE IF NOT EXISTS position_salaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position VARCHAR(50) NOT NULL UNIQUE,
  daily_rate INT NOT NULL,
  monthly_salary INT NOT NULL,
  allowances JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Attendances
CREATE TABLE IF NOT EXISTS attendances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  check_out TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Payrolls
CREATE TABLE IF NOT EXISTS payrolls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  payment_type VARCHAR(20) DEFAULT 'monthly',
  base_salary INT NOT NULL,
  allowance INT DEFAULT 35000,
  bonus INT DEFAULT 0,
  deduction INT DEFAULT 0,
  total_amount INT NOT NULL,
  payment_date TIMESTAMP,
  payment_method VARCHAR(50) DEFAULT 'cash',
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  reviewer_id INT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  performance_period VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  attendance_score INT DEFAULT 0,
  quality_score INT DEFAULT 0,
  productivity_score INT DEFAULT 0,
  comments TEXT,
  goals TEXT,
  next_review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  leave_type VARCHAR(30) NOT NULL DEFAULT 'regular',
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approved_by_id INT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Training Sessions
CREATE TABLE IF NOT EXISTS training_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  trainer VARCHAR(100),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Training Participants
CREATE TABLE IF NOT EXISTS training_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  training_id INT NOT NULL,
  employee_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'registered',
  score INT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel HRD Documents
CREATE TABLE IF NOT EXISTS hrd_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  title VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(255),
  issue_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  amount INT NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  receipt_url VARCHAR(255),
  approved_by_id INT,
  status VARCHAR(20) DEFAULT 'pending',
  created_by_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Profit Loss Reports
CREATE TABLE IF NOT EXISTS profit_loss_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(20) NOT NULL UNIQUE,
  total_revenue INT NOT NULL,
  total_expenses INT NOT NULL,
  net_profit INT NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL untuk seed data awal (users, roles, dll)
const seedDataSQL = `
-- Seed data untuk roles
INSERT INTO roles (name, description) VALUES 
('admin', 'Administrator dengan akses penuh'),
('manajer', 'Manajer dengan akses terbatas'),
('kasir', 'Kasir dengan akses minimal')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Seed data untuk module permissions
INSERT INTO permissions (name, module, action, description) VALUES 
-- Customer permissions
('customer:read', 'customers', 'read', 'Melihat daftar pelanggan'),
('customer:create', 'customers', 'create', 'Menambah pelanggan baru'),
('customer:update', 'customers', 'update', 'Memperbarui data pelanggan'),
('customer:delete', 'customers', 'delete', 'Menghapus pelanggan'),

-- Transaction permissions
('transaction:read', 'transactions', 'read', 'Melihat daftar transaksi'),
('transaction:create', 'transactions', 'create', 'Membuat transaksi baru'),
('transaction:update', 'transactions', 'update', 'Memperbarui transaksi'),
('transaction:delete', 'transactions', 'delete', 'Menghapus transaksi'),
('transaction:report', 'transactions', 'report', 'Melihat laporan transaksi'),

-- Service permissions
('service:read', 'services', 'read', 'Melihat daftar layanan'),
('service:create', 'services', 'create', 'Menambah layanan baru'),
('service:update', 'services', 'update', 'Memperbarui layanan'),
('service:delete', 'services', 'delete', 'Menghapus layanan'),

-- Employee permissions
('employee:read', 'employees', 'read', 'Melihat daftar karyawan'),
('employee:create', 'employees', 'create', 'Menambah karyawan baru'),
('employee:update', 'employees', 'update', 'Memperbarui data karyawan'),
('employee:delete', 'employees', 'delete', 'Menghapus karyawan'),

-- User & Role permissions
('user:read', 'users', 'read', 'Melihat daftar pengguna'),
('user:create', 'users', 'create', 'Menambah pengguna baru'),
('user:update', 'users', 'update', 'Memperbarui data pengguna'),
('user:delete', 'users', 'delete', 'Menghapus pengguna'),
('role:read', 'roles', 'read', 'Melihat daftar peran'),
('role:create', 'roles', 'create', 'Menambah peran baru'),
('role:update', 'roles', 'update', 'Memperbarui peran'),
('role:delete', 'roles', 'delete', 'Menghapus peran'),

-- Inventory permissions
('inventory:read', 'inventory', 'read', 'Melihat inventaris'),
('inventory:create', 'inventory', 'create', 'Menambah item inventaris'),
('inventory:update', 'inventory', 'update', 'Memperbarui inventaris'),
('inventory:delete', 'inventory', 'delete', 'Menghapus item inventaris'),

-- HRD permissions
('attendance:read', 'attendance', 'read', 'Melihat kehadiran'),
('attendance:create', 'attendance', 'create', 'Menambah catatan kehadiran'),
('attendance:update', 'attendance', 'update', 'Memperbarui catatan kehadiran'),
('attendance:delete', 'attendance', 'delete', 'Menghapus catatan kehadiran'),
('payroll:read', 'payroll', 'read', 'Melihat penggajian'),
('payroll:create', 'payroll', 'create', 'Membuat penggajian'),
('payroll:update', 'payroll', 'update', 'Memperbarui penggajian'),
('payroll:delete', 'payroll', 'delete', 'Menghapus penggajian'),

-- Admin-only permissions
('settings:update', 'settings', 'update', 'Memperbarui pengaturan sistem'),
('dashboard:view', 'dashboard', 'view', 'Melihat dashboard'),
('report:view', 'report', 'view', 'Melihat laporan')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Seed default users
INSERT INTO users (username, password, name, role, email, phone) VALUES 
('admin', '$2b$10$vPzEg.xO5ZNtUQ6PEbbMlODOTfXj9AymjjV.iS.0zIXy6M6jkWS5i', 'Administrator', 'admin', 'admin@washcorner.com', '08123456789'),
('kasir', '$2b$10$9lkqE/KDuOYFazq7fHAEae/9DaLiNvY7TwIr5.keLZFOBZKmFFNpu', 'Kasir', 'kasir', 'kasir@washcorner.com', '08123456790')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Seed default services
INSERT INTO services (name, description, price, duration, vehicle_type, is_popular, is_active) VALUES 
('MOTOR STANDART', 'Pelayanan Cuci Motor Standart tanpa Detailing', 20000, 30, 'motorcycle', TRUE, TRUE),
('Mobil Salon', 'Cuci Mobil dan detailing cleaning', 50000, 60, 'car', TRUE, TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);
`;

async function setupDatabase() {
  let connection;

  try {
    console.log('🔄 Menghubungkan ke server MySQL...');
    
    // Pertama, coba terhubung tanpa database untuk memastikan dapat membuat database jika belum ada
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    
    console.log('✅ Berhasil terhubung ke server MySQL');

    // Cek apakah database sudah ada, jika belum, buat database
    console.log(`🔄 Memeriksa database "${config.database}"...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    console.log(`✅ Database "${config.database}" siap digunakan`);
    
    // Tutup koneksi awal dan buat koneksi baru dengan database yang dipilih
    await connection.end();
    
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: true, // Memungkinkan eksekusi beberapa statement SQL sekaligus
    });
    
    // Jalankan SQL untuk membuat tabel
    console.log('🔄 Membuat tabel-tabel database...');
    await connection.query(createTableSQL);
    console.log('✅ Semua tabel berhasil dibuat');
    
    // Jalankan SQL untuk mengisi data awal
    console.log('🔄 Mengisi data awal...');
    await connection.query(seedDataSQL);
    console.log('✅ Data awal berhasil dimasukkan');
    
    console.log('🎉 Setup database MySQL berhasil!');
    console.log(`\nAnda sekarang dapat menjalankan aplikasi dengan perintah:`);
    console.log(`\nnpm run dev\n`);
  } catch (error) {
    console.error('❌ Error saat setup database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Jalankan fungsi setup
setupDatabase();