const mysql = require('mysql2/promise');

async function main() {
  console.log('Setup database MySQL untuk Wash Corner...');
  console.log('Menghubungkan ke server MySQL...');

  try {
    // Koneksi ke MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Berhasil terhubung ke server MySQL');

    // Cek dan buat database jika belum ada
    console.log('Memeriksa database "wash_corner"...');
    await connection.query('CREATE DATABASE IF NOT EXISTS wash_corner');
    console.log('Database "wash_corner" siap digunakan');

    // Pilih database
    await connection.query('USE wash_corner');

    console.log('Membuat tabel-tabel database...');

    // Table roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table permissions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table role_permissions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        name VARCHAR(100),
        role_id INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table customers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table services
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration INT,
        vehicle_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table transactions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_code VARCHAR(20) NOT NULL UNIQUE,
        customer_id INT,
        user_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_status VARCHAR(20) DEFAULT 'pending',
        vehicle_number VARCHAR(20),
        vehicle_type VARCHAR(50),
        vehicle_brand VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table transaction_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        service_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 1,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table inventory_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        quantity INT NOT NULL DEFAULT 0,
        min_stock INT DEFAULT 10,
        unit VARCHAR(20),
        price_per_unit DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table inventory_usage
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_item_id INT NOT NULL,
        transaction_id INT NOT NULL,
        quantity_used DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table employees
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table attendances - Perbaikan untuk check_out
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in DATETIME,
        check_out DATETIME NULL,
        status VARCHAR(20) DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Buat data default
    console.log('Membuat data default...');

    // Tambahkan role default jika belum ada
    const [roles] = await connection.query('SELECT * FROM roles');
    if (roles.length === 0) {
      await connection.query(`
        INSERT INTO roles (name, description) VALUES
        ('admin', 'Administrator dengan akses penuh'),
        ('manager', 'Manager dengan akses terbatas ke fitur admin'),
        ('cashier', 'Kasir dengan akses hanya ke transaksi')
      `);
      console.log('Role default berhasil dibuat');
    }

    // Tambahkan user default jika belum ada
    const [users] = await connection.query('SELECT * FROM users');
    if (users.length === 0) {
      // Password: admin123 dan cashier123
      const adminPassword = '$2b$10$zrBhh09ij6RA3Pu65Hxb5OuQgZVZVxpr9jTepgSuHwbAvaXKJV5m6';
      const cashierPassword = '$2b$10$rO6i/rAb3YSZjRRVIGBPZeIFe7Ucn/d3HwW9OM.sZ2qGafTNC0DEG';
      
      await connection.query(`
        INSERT INTO users (username, password, email, name, role_id) VALUES
        ('admin', '${adminPassword}', 'admin@washcorner.com', 'Administrator', 1),
        ('cashier', '${cashierPassword}', 'cashier@washcorner.com', 'Kasir', 3)
      `);
      console.log('User default berhasil dibuat');
    }

    // Tambahkan service default jika belum ada
    const [services] = await connection.query('SELECT * FROM services');
    if (services.length === 0) {
      await connection.query(`
        INSERT INTO services (name, description, price, duration, vehicle_type) VALUES
        ('Cuci Motor Standar', 'Cuci motor biasa dengan sabun dan air', 15000, 30, 'motorcycle'),
        ('Cuci Motor + Wax', 'Cuci motor dengan tambahan wax', 25000, 45, 'motorcycle'),
        ('Cuci Mobil Sedan', 'Cuci mobil sedan standar', 35000, 45, 'car'),
        ('Cuci Mobil SUV/MPV', 'Cuci mobil untuk tipe SUV/MPV', 40000, 60, 'car'),
        ('Detailing Mobil', 'Cuci mobil detail dengan wax dan poles', 150000, 180, 'car')
      `);
      console.log('Service default berhasil dibuat');
    }

    console.log('Setup database berhasil!');
    await connection.end();
  } catch (err) {
    console.error('Error saat setup database:', err);
    process.exit(1);
  }
}

main();