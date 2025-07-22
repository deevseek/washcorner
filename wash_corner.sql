-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 19 Bulan Mei 2025 pada 14.08
-- Versi server: 10.4.17-MariaDB
-- Versi PHP: 7.3.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wash_corner`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendances`
--

CREATE TABLE `attendances` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_in` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_out` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `attendances`
--

INSERT INTO `attendances` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-05-17 17:13:19', '2025-05-17 18:00:00', NULL, 'present', NULL, '2025-05-18 00:13:35', '2025-05-18 00:13:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `vehicle_type` varchar(20) DEFAULT NULL,
  `vehicle_brand` varchar(50) DEFAULT NULL,
  `vehicle_model` varchar(50) DEFAULT NULL,
  `license_plate` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `vehicle_type`, `vehicle_brand`, `vehicle_model`, `license_plate`, `created_at`, `updated_at`) VALUES
(1, 'Tarmuji', '082124567345', 'tarmuji@gmail.com', 'car', 'Honda', 'Jazz', 'H 1243 NZ', '2025-05-17 15:28:14', '2025-05-17 15:28:14'),
(2, 'Mariatun Minul', '082124567345', 'mariatun@gmail.com', 'motorcycle', 'Yamaha', 'Vario', 'H 7654 ZN', '2025-05-18 00:37:37', '2025-05-18 00:37:37'),
(3, 'Tawar', '082287654234', 'tawar@gmail.com', 'car', 'Suzuki', 'Baleno', 'H 9876 NZ', '2025-05-19 06:37:36', '2025-05-19 06:37:36');

-- --------------------------------------------------------

--
-- Struktur dari tabel `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `joining_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `employees`
--

INSERT INTO `employees` (`id`, `name`, `position`, `phone`, `email`, `joining_date`, `is_active`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Budi Santoso', 'Manager', '081234567890', 'budi@washcorner.com', '2022-12-31 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'Dewi Kartika', 'Supervisor', '081234567891', 'dewi@washcorner.com', '2023-01-14 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'Agus Wahyudi', 'Cashier', '081234567892', 'agus@washcorner.com', '2023-01-31 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'Rudi Hermawan', 'Washer', '081234567893', 'rudi@washcorner.com', '2023-02-09 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(5, 'Siti Rahayu', 'Washer', '081234567894', 'siti@washcorner.com', '2023-02-28 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(6, 'Joko Susilo', 'Detailer', '081234567895', 'joko@washcorner.com', '2023-03-14 17:00:00', 1, NULL, '2025-05-16 22:46:54', '2025-05-16 22:46:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT 'cash',
  `receipt_url` varchar(255) DEFAULT NULL,
  `approved_by_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(255) DEFAULT NULL,
  `receipt_image` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `expenses`
--

INSERT INTO `expenses` (`id`, `category_id`, `amount`, `description`, `date`, `payment_method`, `receipt_url`, `approved_by_id`, `status`, `created_by_id`, `created_at`, `updated_at`, `category`, `receipt_image`, `notes`, `created_by`) VALUES
(1, NULL, 50000, 'service sanyo', '2025-05-17 17:00:00', 'cash', NULL, NULL, 'pending', NULL, '2025-05-17 23:59:41', '2025-05-17 23:59:41', 'Maintenance', NULL, NULL, NULL),
(2, NULL, 50000, 'beli sabun', '2025-05-18 17:00:00', 'cash', NULL, NULL, 'pending', NULL, '2025-05-19 07:42:25', '2025-05-19 01:50:25', 'Supplies', NULL, NULL, NULL),
(3, NULL, 50000, 'beli silikon', '2025-05-18 17:00:00', 'cash', NULL, NULL, 'pending', NULL, '2025-05-19 08:51:14', '2025-05-19 08:51:14', 'Supplies', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Utilities', 'Electricity, water, internet', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'Supplies', 'Cleaning supplies, office supplies', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'Maintenance', 'Equipment maintenance, facility repair', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'Salaries', 'Employee salaries and wages', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(5, 'Rent', 'Rent for facility', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(6, 'Marketing', 'Marketing and promotion', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(7, 'Other', 'Miscellaneous expenses', '2025-05-16 22:46:54', '2025-05-16 22:46:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `hrd_documents`
--

CREATE TABLE `hrd_documents` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expiry_date` timestamp NULL DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `current_stock` int(11) NOT NULL DEFAULT 0,
  `minimum_stock` int(11) NOT NULL DEFAULT 5,
  `unit` varchar(20) NOT NULL,
  `price` int(11) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `name`, `description`, `current_stock`, `minimum_stock`, `unit`, `price`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Shampoo Mobil', 'Shampoo khusus untuk mencuci mobil', 50, 10, 'Liter', 50000, 'Cleaning Supplies', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'Shampoo Motor', 'Shampoo khusus untuk mencuci motor', 40, 8, 'Liter', 40000, 'Cleaning Supplies', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'Microfiber Cloth', 'Kain lap microfiber premium', 100, 20, 'Pcs', 15000, 'Cleaning Tools', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'Wax', 'Wax untuk finishing mobil dan motor', 20, 5, 'Botol', 85000, 'Finishing', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(5, 'Glass Cleaner', 'Pembersih kaca khusus', 25, 5, 'Botol', 35000, 'Cleaning Supplies', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(6, 'Tyre Shine', 'Cairan untuk mengkilapkan ban', 30, 6, 'Botol', 45000, 'Finishing', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(7, 'Engine Degreaser', 'Pembersih mesin', 15, 3, 'Botol', 65000, 'Cleaning Supplies', '2025-05-16 22:46:54', '2025-05-16 22:46:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_usage`
--

CREATE TABLE `inventory_usage` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `inventory_item_id` int(11) DEFAULT NULL,
  `quantity` double NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `leave_type` varchar(30) NOT NULL DEFAULT 'regular',
  `reason` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `approved_by_id` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payrolls`
--

CREATE TABLE `payrolls` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `period_start` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `period_end` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `payment_type` varchar(20) DEFAULT 'monthly',
  `base_salary` int(11) NOT NULL,
  `allowance` int(11) DEFAULT 35000,
  `bonus` int(11) DEFAULT 0,
  `deduction` int(11) DEFAULT 0,
  `total_amount` int(11) NOT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'cash',
  `status` varchar(20) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `payrolls`
--

INSERT INTO `payrolls` (`id`, `employee_id`, `period_start`, `period_end`, `payment_type`, `base_salary`, `allowance`, `bonus`, `deduction`, `total_amount`, `payment_date`, `payment_method`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-05-18 00:36:21', '2025-05-17 17:00:00', 'monthly', 2000000, 5000, 0, 1900000, 105000, NULL, 'transfer', 'approved', 'bon 1900000', '2025-05-18 00:32:19', '2025-05-17 17:36:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `review_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `performance_period` varchar(50) NOT NULL,
  `rating` int(11) NOT NULL,
  `attendance_score` int(11) DEFAULT 0,
  `quality_score` int(11) DEFAULT 0,
  `productivity_score` int(11) DEFAULT 0,
  `comments` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `next_review_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `module`, `action`, `created_at`) VALUES
(1, 'users.create', 'Allow creating new users', 'Users', 'create', '2025-05-17 17:37:08'),
(2, 'users.read', 'Allow viewing user details', 'Users', 'read', '2025-05-17 17:37:08'),
(3, 'users.update', 'Allow updating user details', 'Users', 'update', '2025-05-17 17:37:08'),
(4, 'users.delete', 'Allow deleting users', 'Users', 'delete', '2025-05-17 17:37:08'),
(5, 'users.manage_roles', 'Allow assigning roles to users', 'Users', 'manage_roles', '2025-05-17 17:37:08'),
(6, 'roles.create', 'Allow creating new roles', 'Roles', 'create', '2025-05-17 17:37:08'),
(7, 'roles.read', 'Allow viewing role details', 'Roles', 'read', '2025-05-17 17:37:08'),
(8, 'roles.update', 'Allow updating role details', 'Roles', 'update', '2025-05-17 17:37:08'),
(9, 'roles.delete', 'Allow deleting roles', 'Roles', 'delete', '2025-05-17 17:37:08'),
(10, 'permissions.manage', 'Allow managing permissions and assignments', 'Permissions', 'manage', '2025-05-17 17:37:08'),
(11, 'customers.create', 'Allow creating new customers', 'Customers', 'create', '2025-05-17 17:37:08'),
(12, 'customers.read', 'Allow viewing customer details', 'Customers', 'read', '2025-05-17 17:37:08'),
(13, 'customers.update', 'Allow updating customer details', 'Customers', 'update', '2025-05-17 17:37:08'),
(14, 'customers.delete', 'Allow deleting customers', 'Customers', 'delete', '2025-05-17 17:37:08'),
(15, 'services.create', 'Allow creating new services', 'Services', 'create', '2025-05-17 17:37:08'),
(16, 'services.read', 'Allow viewing service details', 'Services', 'read', '2025-05-17 17:37:08'),
(17, 'services.update', 'Allow updating service details', 'Services', 'update', '2025-05-17 17:37:08'),
(18, 'services.delete', 'Allow deleting services', 'Services', 'delete', '2025-05-17 17:37:08'),
(19, 'inventory.create', 'Allow creating new inventory items', 'Inventory', 'create', '2025-05-17 17:37:08'),
(20, 'inventory.read', 'Allow viewing inventory items', 'Inventory', 'read', '2025-05-17 17:37:08'),
(21, 'inventory.update', 'Allow updating inventory items (stock)', 'Inventory', 'update', '2025-05-17 17:37:08'),
(22, 'inventory.delete', 'Allow deleting inventory items', 'Inventory', 'delete', '2025-05-17 17:37:08'),
(23, 'inventory.record_usage', 'Allow recording inventory usage for transactions', 'Inventory', 'record_usage', '2025-05-17 17:37:08'),
(24, 'employees.create', 'Allow creating new employees', 'Employees', 'create', '2025-05-17 17:37:08'),
(25, 'employees.read', 'Allow viewing employee details', 'Employees', 'read', '2025-05-17 17:37:08'),
(26, 'employees.update', 'Allow updating employee details', 'Employees', 'update', '2025-05-17 17:37:08'),
(27, 'employees.delete', 'Allow deleting employees', 'Employees', 'delete', '2025-05-17 17:37:08'),
(28, 'transactions.create', 'Allow creating new transactions', 'Transactions', 'create', '2025-05-17 17:37:08'),
(29, 'transactions.read_all', 'Allow viewing all transactions', 'Transactions', 'read_all', '2025-05-17 17:37:08'),
(30, 'transactions.read_own', 'Allow viewing own assigned/created transactions', 'Transactions', 'read_own', '2025-05-17 17:37:08'),
(31, 'transactions.update', 'Allow updating transaction status/notes', 'Transactions', 'update', '2025-05-17 17:37:08'),
(32, 'transactions.delete', 'Allow deleting transactions', 'Transactions', 'delete', '2025-05-17 17:37:08'),
(33, 'transactions.process_payment', 'Allow processing payments for transactions', 'Transactions', 'process_payment', '2025-05-17 17:37:08'),
(34, 'hr.attendance.manage', 'Manage employee attendance records', 'HR', 'manage_attendance', '2025-05-17 17:37:08'),
(35, 'hr.payroll.manage', 'Manage employee payroll', 'HR', 'manage_payroll', '2025-05-17 17:37:08'),
(36, 'hr.reviews.manage', 'Manage employee performance reviews', 'HR', 'manage_reviews', '2025-05-17 17:37:08'),
(37, 'hr.leave.manage', 'Manage employee leave requests', 'HR', 'manage_leave', '2025-05-17 17:37:08'),
(38, 'hr.training.manage', 'Manage training sessions and participants', 'HR', 'manage_training', '2025-05-17 17:37:08'),
(39, 'hr.documents.manage', 'Manage HRD documents', 'HR', 'manage_documents', '2025-05-17 17:37:08'),
(40, 'hr.positions.manage', 'Manage position salaries', 'HR', 'manage_positions', '2025-05-17 17:37:08'),
(41, 'expenses.create', 'Allow creating new expenses', 'Expenses', 'create', '2025-05-17 17:37:08'),
(42, 'expenses.read', 'Allow viewing expenses', 'Expenses', 'read', '2025-05-17 17:37:08'),
(43, 'expenses.update', 'Allow updating expenses', 'Expenses', 'update', '2025-05-17 17:37:08'),
(44, 'expenses.delete', 'Allow deleting expenses', 'Expenses', 'delete', '2025-05-17 17:37:08'),
(45, 'expenses.approve', 'Allow approving expenses', 'Expenses', 'approve', '2025-05-17 17:37:08'),
(46, 'expense_categories.manage', 'Manage expense categories', 'Expenses', 'manage_categories', '2025-05-17 17:37:08'),
(47, 'reports.view.financial', 'Allow viewing financial reports (P&L)', 'Reports', 'view_financial', '2025-05-17 17:37:08'),
(48, 'reports.generate.financial', 'Allow generating financial reports', 'Reports', 'generate_financial', '2025-05-17 17:37:08'),
(49, 'reports.view.operational', 'Allow viewing operational reports (sales, inventory)', 'Reports', 'view_operational', '2025-05-17 17:37:08'),
(50, 'dashboard.view', 'Dapat view pada modul dashboard', 'dashboard', 'view', '2025-05-17 22:38:43'),
(51, 'customers.view', 'Dapat view pada modul customers', 'customers', 'view', '2025-05-17 22:38:43'),
(52, 'services.view', 'Dapat view pada modul services', 'services', 'view', '2025-05-17 22:38:43'),
(53, 'inventory.view', 'Dapat view pada modul inventory', 'inventory', 'view', '2025-05-17 22:38:43'),
(54, 'inventory.manage_stock', 'Dapat manage_stock pada modul inventory', 'inventory', 'manage_stock', '2025-05-17 22:38:43'),
(55, 'employees.view', 'Dapat view pada modul employees', 'employees', 'view', '2025-05-17 22:38:43'),
(56, 'transactions.view', 'Dapat view pada modul transactions', 'transactions', 'view', '2025-05-17 22:38:43'),
(57, 'transactions.change_status', 'Dapat change_status pada modul transactions', 'transactions', 'change_status', '2025-05-17 22:38:43'),
(58, 'service_history.view', 'Dapat view pada modul service history', 'service_history', 'view', '2025-05-17 22:38:43'),
(59, 'tracking.view', 'Dapat view pada modul tracking', 'tracking', 'view', '2025-05-17 22:38:43'),
(60, 'tracking.update_status', 'Dapat update_status pada modul tracking', 'tracking', 'update_status', '2025-05-17 22:38:43'),
(61, 'hrd_employees.view', 'Dapat view pada modul hrd employees', 'hrd_employees', 'view', '2025-05-17 22:38:43'),
(62, 'hrd_employees.create', 'Dapat create pada modul hrd employees', 'hrd_employees', 'create', '2025-05-17 22:38:43'),
(63, 'hrd_employees.update', 'Dapat update pada modul hrd employees', 'hrd_employees', 'update', '2025-05-17 22:38:43'),
(64, 'hrd_employees.delete', 'Dapat delete pada modul hrd employees', 'hrd_employees', 'delete', '2025-05-17 22:38:43'),
(65, 'hrd_attendances.view', 'Dapat view pada modul hrd attendances', 'hrd_attendances', 'view', '2025-05-17 22:38:43'),
(66, 'hrd_attendances.create', 'Dapat create pada modul hrd attendances', 'hrd_attendances', 'create', '2025-05-17 22:38:43'),
(67, 'hrd_attendances.update', 'Dapat update pada modul hrd attendances', 'hrd_attendances', 'update', '2025-05-17 22:38:43'),
(68, 'hrd_attendances.delete', 'Dapat delete pada modul hrd attendances', 'hrd_attendances', 'delete', '2025-05-17 22:38:43'),
(69, 'hrd_attendances.manage_report', 'Dapat manage_report pada modul hrd attendances', 'hrd_attendances', 'manage_report', '2025-05-17 22:38:43'),
(70, 'hrd_payrolls.view', 'Dapat view pada modul hrd payrolls', 'hrd_payrolls', 'view', '2025-05-17 22:38:43'),
(71, 'hrd_payrolls.create', 'Dapat create pada modul hrd payrolls', 'hrd_payrolls', 'create', '2025-05-17 22:38:43'),
(72, 'hrd_payrolls.update', 'Dapat update pada modul hrd payrolls', 'hrd_payrolls', 'update', '2025-05-17 22:38:43'),
(73, 'hrd_payrolls.delete', 'Dapat delete pada modul hrd payrolls', 'hrd_payrolls', 'delete', '2025-05-17 22:38:43'),
(74, 'hrd_payrolls.process', 'Dapat process pada modul hrd payrolls', 'hrd_payrolls', 'process', '2025-05-17 22:38:43'),
(75, 'hrd_payrolls.manage_report', 'Dapat manage_report pada modul hrd payrolls', 'hrd_payrolls', 'manage_report', '2025-05-17 22:38:43'),
(76, 'hrd_performance_reviews.view', 'Dapat view pada modul hrd performance reviews', 'hrd_performance_reviews', 'view', '2025-05-17 22:38:43'),
(77, 'hrd_performance_reviews.create', 'Dapat create pada modul hrd performance reviews', 'hrd_performance_reviews', 'create', '2025-05-17 22:38:43'),
(78, 'hrd_performance_reviews.update', 'Dapat update pada modul hrd performance reviews', 'hrd_performance_reviews', 'update', '2025-05-17 22:38:43'),
(79, 'hrd_performance_reviews.delete', 'Dapat delete pada modul hrd performance reviews', 'hrd_performance_reviews', 'delete', '2025-05-17 22:38:43'),
(80, 'hrd_leave_requests.view', 'Dapat view pada modul hrd leave requests', 'hrd_leave_requests', 'view', '2025-05-17 22:38:43'),
(81, 'hrd_leave_requests.create', 'Dapat create pada modul hrd leave requests', 'hrd_leave_requests', 'create', '2025-05-17 22:38:43'),
(82, 'hrd_leave_requests.update', 'Dapat update pada modul hrd leave requests', 'hrd_leave_requests', 'update', '2025-05-17 22:38:43'),
(83, 'hrd_leave_requests.delete', 'Dapat delete pada modul hrd leave requests', 'hrd_leave_requests', 'delete', '2025-05-17 22:38:43'),
(84, 'hrd_leave_requests.approve', 'Dapat approve pada modul hrd leave requests', 'hrd_leave_requests', 'approve', '2025-05-17 22:38:43'),
(85, 'hrd_leave_requests.reject', 'Dapat reject pada modul hrd leave requests', 'hrd_leave_requests', 'reject', '2025-05-17 22:38:43'),
(86, 'hrd_training_sessions.view', 'Dapat view pada modul hrd training sessions', 'hrd_training_sessions', 'view', '2025-05-17 22:38:43'),
(87, 'hrd_training_sessions.create', 'Dapat create pada modul hrd training sessions', 'hrd_training_sessions', 'create', '2025-05-17 22:38:43'),
(88, 'hrd_training_sessions.update', 'Dapat update pada modul hrd training sessions', 'hrd_training_sessions', 'update', '2025-05-17 22:38:43'),
(89, 'hrd_training_sessions.delete', 'Dapat delete pada modul hrd training sessions', 'hrd_training_sessions', 'delete', '2025-05-17 22:38:43'),
(90, 'hrd_training_sessions.manage_participants', 'Dapat manage_participants pada modul hrd training sessions', 'hrd_training_sessions', 'manage_participants', '2025-05-17 22:38:43'),
(91, 'hrd_documents.view', 'Dapat view pada modul hrd documents', 'hrd_documents', 'view', '2025-05-17 22:38:43'),
(92, 'hrd_documents.create', 'Dapat create pada modul hrd documents', 'hrd_documents', 'create', '2025-05-17 22:38:43'),
(93, 'hrd_documents.update', 'Dapat update pada modul hrd documents', 'hrd_documents', 'update', '2025-05-17 22:38:43'),
(94, 'hrd_documents.delete', 'Dapat delete pada modul hrd documents', 'hrd_documents', 'delete', '2025-05-17 22:38:43'),
(95, 'hrd_documents.manage_types', 'Dapat manage_types pada modul hrd documents', 'hrd_documents', 'manage_types', '2025-05-17 22:38:43'),
(96, 'hrd_position_salaries.view', 'Dapat view pada modul hrd position salaries', 'hrd_position_salaries', 'view', '2025-05-17 22:38:43'),
(97, 'hrd_position_salaries.create', 'Dapat create pada modul hrd position salaries', 'hrd_position_salaries', 'create', '2025-05-17 22:38:43'),
(98, 'hrd_position_salaries.update', 'Dapat update pada modul hrd position salaries', 'hrd_position_salaries', 'update', '2025-05-17 22:38:43'),
(99, 'hrd_position_salaries.delete', 'Dapat delete pada modul hrd position salaries', 'hrd_position_salaries', 'delete', '2025-05-17 22:38:43'),
(100, 'finance_expenses.view', 'Dapat view pada modul finance expenses', 'finance_expenses', 'view', '2025-05-17 22:38:43'),
(101, 'finance_expenses.create', 'Dapat create pada modul finance expenses', 'finance_expenses', 'create', '2025-05-17 22:38:43'),
(102, 'finance_expenses.update', 'Dapat update pada modul finance expenses', 'finance_expenses', 'update', '2025-05-17 22:38:43'),
(103, 'finance_expenses.delete', 'Dapat delete pada modul finance expenses', 'finance_expenses', 'delete', '2025-05-17 22:38:43'),
(104, 'finance_expenses.manage_report', 'Dapat manage_report pada modul finance expenses', 'finance_expenses', 'manage_report', '2025-05-17 22:38:43'),
(105, 'finance_expense_categories.view', 'Dapat view pada modul finance expense categories', 'finance_expense_categories', 'view', '2025-05-17 22:38:43'),
(106, 'finance_expense_categories.create', 'Dapat create pada modul finance expense categories', 'finance_expense_categories', 'create', '2025-05-17 22:38:43'),
(107, 'finance_expense_categories.update', 'Dapat update pada modul finance expense categories', 'finance_expense_categories', 'update', '2025-05-17 22:38:43'),
(108, 'finance_expense_categories.delete', 'Dapat delete pada modul finance expense categories', 'finance_expense_categories', 'delete', '2025-05-17 22:38:43'),
(109, 'finance_profit_loss_reports.view', 'Dapat view pada modul finance profit loss reports', 'finance_profit_loss_reports', 'view', '2025-05-17 22:38:43'),
(110, 'finance_profit_loss_reports.generate', 'Dapat generate pada modul finance profit loss reports', 'finance_profit_loss_reports', 'generate', '2025-05-17 22:38:43'),
(111, 'finance_profit_loss_reports.save', 'Dapat save pada modul finance profit loss reports', 'finance_profit_loss_reports', 'save', '2025-05-17 22:38:43'),
(112, 'finance_profit_loss_reports.delete', 'Dapat delete pada modul finance profit loss reports', 'finance_profit_loss_reports', 'delete', '2025-05-17 22:38:43'),
(113, 'finance_profit_loss_reports.manage_report', 'Dapat manage_report pada modul finance profit loss reports', 'finance_profit_loss_reports', 'manage_report', '2025-05-17 22:38:43'),
(114, 'finance_cashflow.view', 'Dapat view pada modul finance cashflow', 'finance_cashflow', 'view', '2025-05-17 22:38:43'),
(115, 'finance_cashflow.manage_report', 'Dapat manage_report pada modul finance cashflow', 'finance_cashflow', 'manage_report', '2025-05-17 22:38:43'),
(116, 'settings_general.view', 'Dapat view pada modul settings general', 'settings_general', 'view', '2025-05-17 22:38:43'),
(117, 'settings_general.update', 'Dapat update pada modul settings general', 'settings_general', 'update', '2025-05-17 22:38:43'),
(118, 'settings_notifications.view', 'Dapat view pada modul settings notifications', 'settings_notifications', 'view', '2025-05-17 22:38:43'),
(119, 'settings_notifications.update', 'Dapat update pada modul settings notifications', 'settings_notifications', 'update', '2025-05-17 22:38:43'),
(120, 'settings_notifications.manage_templates', 'Dapat manage_templates pada modul settings notifications', 'settings_notifications', 'manage_templates', '2025-05-17 22:38:43'),
(121, 'users.view', 'Dapat view pada modul users', 'users', 'view', '2025-05-17 22:38:43'),
(122, 'users.change_role', 'Dapat change_role pada modul users', 'users', 'change_role', '2025-05-17 22:38:43'),
(123, 'roles.view', 'Dapat view pada modul roles', 'roles', 'view', '2025-05-17 22:38:43'),
(124, 'roles.manage', 'Dapat manage pada modul roles', 'roles', 'manage', '2025-05-17 22:38:43'),
(125, 'permissions.view', 'Dapat view pada modul permissions', 'permissions', 'view', '2025-05-17 22:38:43'),
(126, 'reports_operational.view', 'Dapat view pada modul reports operational', 'reports_operational', 'view', '2025-05-17 22:38:43'),
(127, 'reports_operational.export', 'Dapat export pada modul reports operational', 'reports_operational', 'export', '2025-05-17 22:38:43'),
(128, 'reports_financial.view', 'Dapat view pada modul reports financial', 'reports_financial', 'view', '2025-05-17 22:38:43'),
(129, 'reports_financial.export', 'Dapat export pada modul reports financial', 'reports_financial', 'export', '2025-05-17 22:38:43'),
(130, 'reports_hrd.view', 'Dapat view pada modul reports hrd', 'reports_hrd', 'view', '2025-05-17 22:38:43'),
(131, 'reports_hrd.export', 'Dapat export pada modul reports hrd', 'reports_hrd', 'export', '2025-05-17 22:38:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `position_salaries`
--

CREATE TABLE `position_salaries` (
  `id` int(11) NOT NULL,
  `position` varchar(50) NOT NULL,
  `daily_rate` int(11) NOT NULL,
  `monthly_salary` int(11) NOT NULL,
  `allowances` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowances`)),
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `position_salaries`
--

INSERT INTO `position_salaries` (`id`, `position`, `daily_rate`, `monthly_salary`, `allowances`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Manager', 150000, 4500000, NULL, 'Manager posisi tertinggi', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'Supervisor', 120000, 3600000, NULL, 'Supervisor level menengah', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'Cashier', 100000, 3000000, NULL, 'Kasir penjaga kasir', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'Washer', 90000, 2700000, NULL, 'Tukang cuci kendaraan', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(5, 'Detailer', 110000, 3300000, NULL, 'Spesialis detail dan poles', '2025-05-16 22:46:54', '2025-05-16 22:46:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `profit_loss_reports`
--

CREATE TABLE `profit_loss_reports` (
  `id` int(11) NOT NULL,
  `period` varchar(20) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `revenue` int(11) NOT NULL,
  `expenses` int(11) NOT NULL,
  `total_salaries` int(11) NOT NULL DEFAULT 0,
  `profit` int(11) NOT NULL,
  `report_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`report_data`)),
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrator dengan akses penuh', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'manager', 'Manager dengan akses terbatas ke fitur admin', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'cashier', 'Kasir dengan akses hanya ke transaksi', '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'kasir', 'Kasir dengan akses terbatas pada operasional transaksi dan pelanggan.', '2025-05-17 22:32:45', '2025-05-17 22:32:45');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
(134, 3, 11, '2025-05-17 17:38:13'),
(135, 3, 12, '2025-05-17 17:38:13'),
(136, 3, 13, '2025-05-17 17:38:13'),
(137, 3, 20, '2025-05-17 17:38:13'),
(138, 3, 23, '2025-05-17 17:38:13'),
(139, 3, 16, '2025-05-17 17:38:13'),
(140, 3, 28, '2025-05-17 17:38:13'),
(141, 3, 33, '2025-05-17 17:38:13'),
(142, 3, 30, '2025-05-17 17:38:13'),
(143, 3, 31, '2025-05-17 17:38:13'),
(4113, 1, 50, '2025-05-19 12:06:22'),
(4114, 1, 51, '2025-05-19 12:06:22'),
(4115, 1, 11, '2025-05-19 12:06:22'),
(4116, 1, 13, '2025-05-19 12:06:22'),
(4117, 1, 14, '2025-05-19 12:06:22'),
(4118, 1, 52, '2025-05-19 12:06:22'),
(4119, 1, 15, '2025-05-19 12:06:22'),
(4120, 1, 17, '2025-05-19 12:06:22'),
(4121, 1, 18, '2025-05-19 12:06:22'),
(4122, 1, 53, '2025-05-19 12:06:22'),
(4123, 1, 19, '2025-05-19 12:06:22'),
(4124, 1, 21, '2025-05-19 12:06:22'),
(4125, 1, 22, '2025-05-19 12:06:22'),
(4126, 1, 54, '2025-05-19 12:06:22'),
(4127, 1, 55, '2025-05-19 12:06:22'),
(4128, 1, 24, '2025-05-19 12:06:22'),
(4129, 1, 26, '2025-05-19 12:06:22'),
(4130, 1, 27, '2025-05-19 12:06:22'),
(4131, 1, 56, '2025-05-19 12:06:22'),
(4132, 1, 28, '2025-05-19 12:06:22'),
(4133, 1, 31, '2025-05-19 12:06:22'),
(4134, 1, 32, '2025-05-19 12:06:22'),
(4135, 1, 57, '2025-05-19 12:06:22'),
(4136, 1, 58, '2025-05-19 12:06:22'),
(4137, 1, 59, '2025-05-19 12:06:22'),
(4138, 1, 60, '2025-05-19 12:06:22'),
(4139, 1, 61, '2025-05-19 12:06:22'),
(4140, 1, 62, '2025-05-19 12:06:22'),
(4141, 1, 63, '2025-05-19 12:06:22'),
(4142, 1, 64, '2025-05-19 12:06:22'),
(4143, 1, 65, '2025-05-19 12:06:22'),
(4144, 1, 66, '2025-05-19 12:06:22'),
(4145, 1, 67, '2025-05-19 12:06:22'),
(4146, 1, 68, '2025-05-19 12:06:22'),
(4147, 1, 69, '2025-05-19 12:06:22'),
(4148, 1, 70, '2025-05-19 12:06:22'),
(4149, 1, 71, '2025-05-19 12:06:22'),
(4150, 1, 72, '2025-05-19 12:06:22'),
(4151, 1, 73, '2025-05-19 12:06:22'),
(4152, 1, 74, '2025-05-19 12:06:22'),
(4153, 1, 75, '2025-05-19 12:06:22'),
(4154, 1, 76, '2025-05-19 12:06:22'),
(4155, 1, 77, '2025-05-19 12:06:22'),
(4156, 1, 78, '2025-05-19 12:06:22'),
(4157, 1, 79, '2025-05-19 12:06:22'),
(4158, 1, 80, '2025-05-19 12:06:22'),
(4159, 1, 81, '2025-05-19 12:06:22'),
(4160, 1, 82, '2025-05-19 12:06:22'),
(4161, 1, 83, '2025-05-19 12:06:22'),
(4162, 1, 84, '2025-05-19 12:06:22'),
(4163, 1, 85, '2025-05-19 12:06:22'),
(4164, 1, 86, '2025-05-19 12:06:22'),
(4165, 1, 87, '2025-05-19 12:06:22'),
(4166, 1, 88, '2025-05-19 12:06:22'),
(4167, 1, 89, '2025-05-19 12:06:22'),
(4168, 1, 90, '2025-05-19 12:06:22'),
(4169, 1, 91, '2025-05-19 12:06:22'),
(4170, 1, 92, '2025-05-19 12:06:22'),
(4171, 1, 93, '2025-05-19 12:06:22'),
(4172, 1, 94, '2025-05-19 12:06:22'),
(4173, 1, 95, '2025-05-19 12:06:22'),
(4174, 1, 96, '2025-05-19 12:06:22'),
(4175, 1, 97, '2025-05-19 12:06:22'),
(4176, 1, 98, '2025-05-19 12:06:22'),
(4177, 1, 99, '2025-05-19 12:06:22'),
(4178, 1, 100, '2025-05-19 12:06:22'),
(4179, 1, 101, '2025-05-19 12:06:22'),
(4180, 1, 102, '2025-05-19 12:06:22'),
(4181, 1, 103, '2025-05-19 12:06:22'),
(4182, 1, 104, '2025-05-19 12:06:22'),
(4183, 1, 105, '2025-05-19 12:06:22'),
(4184, 1, 106, '2025-05-19 12:06:22'),
(4185, 1, 107, '2025-05-19 12:06:22'),
(4186, 1, 108, '2025-05-19 12:06:22'),
(4187, 1, 109, '2025-05-19 12:06:22'),
(4188, 1, 110, '2025-05-19 12:06:22'),
(4189, 1, 111, '2025-05-19 12:06:22'),
(4190, 1, 112, '2025-05-19 12:06:22'),
(4191, 1, 113, '2025-05-19 12:06:22'),
(4192, 1, 114, '2025-05-19 12:06:22'),
(4193, 1, 115, '2025-05-19 12:06:22'),
(4194, 1, 116, '2025-05-19 12:06:22'),
(4195, 1, 117, '2025-05-19 12:06:22'),
(4196, 1, 118, '2025-05-19 12:06:22'),
(4197, 1, 119, '2025-05-19 12:06:22'),
(4198, 1, 120, '2025-05-19 12:06:22'),
(4199, 1, 121, '2025-05-19 12:06:22'),
(4200, 1, 1, '2025-05-19 12:06:22'),
(4201, 1, 3, '2025-05-19 12:06:22'),
(4202, 1, 4, '2025-05-19 12:06:22'),
(4203, 1, 122, '2025-05-19 12:06:22'),
(4204, 1, 123, '2025-05-19 12:06:22'),
(4205, 1, 6, '2025-05-19 12:06:22'),
(4206, 1, 8, '2025-05-19 12:06:22'),
(4207, 1, 9, '2025-05-19 12:06:22'),
(4208, 1, 124, '2025-05-19 12:06:22'),
(4209, 1, 125, '2025-05-19 12:06:22'),
(4210, 1, 10, '2025-05-19 12:06:22'),
(4211, 1, 126, '2025-05-19 12:06:22'),
(4212, 1, 127, '2025-05-19 12:06:22'),
(4213, 1, 128, '2025-05-19 12:06:22'),
(4214, 1, 129, '2025-05-19 12:06:22'),
(4215, 1, 130, '2025-05-19 12:06:22'),
(4216, 1, 131, '2025-05-19 12:06:22'),
(4217, 2, 50, '2025-05-19 12:06:22'),
(4218, 2, 51, '2025-05-19 12:06:22'),
(4219, 2, 11, '2025-05-19 12:06:22'),
(4220, 2, 13, '2025-05-19 12:06:22'),
(4221, 2, 14, '2025-05-19 12:06:22'),
(4222, 2, 52, '2025-05-19 12:06:22'),
(4223, 2, 15, '2025-05-19 12:06:22'),
(4224, 2, 17, '2025-05-19 12:06:22'),
(4225, 2, 18, '2025-05-19 12:06:22'),
(4226, 2, 53, '2025-05-19 12:06:22'),
(4227, 2, 19, '2025-05-19 12:06:22'),
(4228, 2, 21, '2025-05-19 12:06:22'),
(4229, 2, 22, '2025-05-19 12:06:22'),
(4230, 2, 54, '2025-05-19 12:06:22'),
(4231, 2, 55, '2025-05-19 12:06:22'),
(4232, 2, 24, '2025-05-19 12:06:22'),
(4233, 2, 26, '2025-05-19 12:06:22'),
(4234, 2, 27, '2025-05-19 12:06:22'),
(4235, 2, 56, '2025-05-19 12:06:22'),
(4236, 2, 28, '2025-05-19 12:06:22'),
(4237, 2, 31, '2025-05-19 12:06:22'),
(4238, 2, 32, '2025-05-19 12:06:22'),
(4239, 2, 57, '2025-05-19 12:06:22'),
(4240, 2, 58, '2025-05-19 12:06:22'),
(4241, 2, 59, '2025-05-19 12:06:22'),
(4242, 2, 60, '2025-05-19 12:06:22'),
(4243, 2, 61, '2025-05-19 12:06:22'),
(4244, 2, 62, '2025-05-19 12:06:22'),
(4245, 2, 63, '2025-05-19 12:06:23'),
(4246, 2, 64, '2025-05-19 12:06:23'),
(4247, 2, 65, '2025-05-19 12:06:23'),
(4248, 2, 66, '2025-05-19 12:06:23'),
(4249, 2, 67, '2025-05-19 12:06:23'),
(4250, 2, 68, '2025-05-19 12:06:23'),
(4251, 2, 69, '2025-05-19 12:06:23'),
(4252, 2, 70, '2025-05-19 12:06:23'),
(4253, 2, 71, '2025-05-19 12:06:23'),
(4254, 2, 72, '2025-05-19 12:06:23'),
(4255, 2, 73, '2025-05-19 12:06:23'),
(4256, 2, 74, '2025-05-19 12:06:23'),
(4257, 2, 75, '2025-05-19 12:06:23'),
(4258, 2, 76, '2025-05-19 12:06:23'),
(4259, 2, 77, '2025-05-19 12:06:23'),
(4260, 2, 78, '2025-05-19 12:06:23'),
(4261, 2, 79, '2025-05-19 12:06:23'),
(4262, 2, 80, '2025-05-19 12:06:23'),
(4263, 2, 81, '2025-05-19 12:06:23'),
(4264, 2, 82, '2025-05-19 12:06:23'),
(4265, 2, 83, '2025-05-19 12:06:23'),
(4266, 2, 84, '2025-05-19 12:06:23'),
(4267, 2, 85, '2025-05-19 12:06:23'),
(4268, 2, 86, '2025-05-19 12:06:23'),
(4269, 2, 87, '2025-05-19 12:06:23'),
(4270, 2, 88, '2025-05-19 12:06:23'),
(4271, 2, 89, '2025-05-19 12:06:23'),
(4272, 2, 90, '2025-05-19 12:06:23'),
(4273, 2, 91, '2025-05-19 12:06:23'),
(4274, 2, 92, '2025-05-19 12:06:23'),
(4275, 2, 93, '2025-05-19 12:06:23'),
(4276, 2, 94, '2025-05-19 12:06:23'),
(4277, 2, 95, '2025-05-19 12:06:23'),
(4278, 2, 96, '2025-05-19 12:06:23'),
(4279, 2, 97, '2025-05-19 12:06:23'),
(4280, 2, 98, '2025-05-19 12:06:23'),
(4281, 2, 99, '2025-05-19 12:06:23'),
(4282, 2, 100, '2025-05-19 12:06:23'),
(4283, 2, 101, '2025-05-19 12:06:23'),
(4284, 2, 102, '2025-05-19 12:06:23'),
(4285, 2, 103, '2025-05-19 12:06:23'),
(4286, 2, 104, '2025-05-19 12:06:23'),
(4287, 2, 105, '2025-05-19 12:06:23'),
(4288, 2, 106, '2025-05-19 12:06:23'),
(4289, 2, 107, '2025-05-19 12:06:23'),
(4290, 2, 108, '2025-05-19 12:06:23'),
(4291, 2, 109, '2025-05-19 12:06:23'),
(4292, 2, 110, '2025-05-19 12:06:23'),
(4293, 2, 111, '2025-05-19 12:06:23'),
(4294, 2, 112, '2025-05-19 12:06:23'),
(4295, 2, 113, '2025-05-19 12:06:23'),
(4296, 2, 114, '2025-05-19 12:06:23'),
(4297, 2, 115, '2025-05-19 12:06:23'),
(4298, 2, 116, '2025-05-19 12:06:23'),
(4299, 2, 118, '2025-05-19 12:06:23'),
(4300, 2, 119, '2025-05-19 12:06:23'),
(4301, 2, 120, '2025-05-19 12:06:23'),
(4302, 2, 10, '2025-05-19 12:06:23'),
(4303, 2, 126, '2025-05-19 12:06:23'),
(4304, 2, 127, '2025-05-19 12:06:23'),
(4305, 2, 128, '2025-05-19 12:06:23'),
(4306, 2, 129, '2025-05-19 12:06:23'),
(4307, 2, 130, '2025-05-19 12:06:23'),
(4308, 2, 131, '2025-05-19 12:06:23'),
(4309, 4, 50, '2025-05-19 12:06:23'),
(4310, 4, 51, '2025-05-19 12:06:23'),
(4311, 4, 11, '2025-05-19 12:06:23'),
(4312, 4, 13, '2025-05-19 12:06:23'),
(4313, 4, 52, '2025-05-19 12:06:23'),
(4314, 4, 56, '2025-05-19 12:06:23'),
(4315, 4, 28, '2025-05-19 12:06:23'),
(4316, 4, 31, '2025-05-19 12:06:23'),
(4317, 4, 57, '2025-05-19 12:06:23'),
(4318, 4, 58, '2025-05-19 12:06:23'),
(4319, 4, 59, '2025-05-19 12:06:23');

-- --------------------------------------------------------

--
-- Struktur dari tabel `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `vehicle_type` varchar(20) NOT NULL,
  `is_popular` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL,
  `warranty` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `price`, `duration`, `vehicle_type`, `is_popular`, `is_active`, `image_url`, `warranty`, `created_at`, `updated_at`) VALUES
(1, 'Cuci Mobil Standar', 'Cuci body luar dan vacuum interior', 35000, 30, 'car', 1, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'Cuci Mobil Premium', 'Cuci body luar, vacuum interior, dashboard cleaning', 50000, 45, 'car', 1, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'Detailing Mobil', 'Cuci detail, poles, wax, interior deep clean', 250000, 180, 'car', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(4, 'Poles Body', 'Poles body mobil menghilangkan baret halus', 200000, 120, 'car', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(5, 'Coating Kaca', 'Aplikasi hydrophobic coating pada kaca', 150000, 60, 'car', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(6, 'Cuci Motor Standar', 'Cuci body motor dan engine ringan', 15000, 20, 'motorcycle', 1, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(7, 'Cuci Motor Premium', 'Cuci body, engine, poles ringan', 25000, 30, 'motorcycle', 1, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(8, 'Detailing Motor', 'Cuci detail, poles, wax', 100000, 90, 'motorcycle', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(9, 'Coating Motor', 'Full coating body motor', 350000, 180, 'motorcycle', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(10, 'Cuci Mesin Motor', 'Perawatan dan pembersihan mesin', 50000, 45, 'motorcycle', 0, 1, NULL, 0, '2025-05-16 22:46:54', '2025-05-16 22:46:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `training_participants`
--

CREATE TABLE `training_participants` (
  `id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'registered',
  `score` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `training_sessions`
--

CREATE TABLE `training_sessions` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `trainer` varchar(100) DEFAULT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` int(11) NOT NULL,
  `payment_method` varchar(20) NOT NULL DEFAULT 'cash',
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `tracking_code` varchar(50) DEFAULT NULL,
  `notifications_sent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notifications_sent`)),
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `customer_id`, `employee_id`, `date`, `total`, `payment_method`, `status`, `notes`, `tracking_code`, `notifications_sent`, `notifications_enabled`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2025-05-17 08:37:14', 300000, 'cash', 'completed', '', 'WC-KXODZ7', NULL, 1, '2025-05-17 15:37:14', '2025-05-17 15:44:58'),
(2, 2, NULL, '2025-05-17 17:38:28', 475000, 'cash', 'completed', '', 'WC-8ZC2U2', NULL, 1, '2025-05-18 00:38:28', '2025-05-18 00:38:40'),
(3, 3, NULL, '2025-05-18 23:40:02', 300000, 'cash', 'completed', '', 'WC-9PP233', NULL, 1, '2025-05-19 06:40:02', '2025-05-19 06:41:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `discount` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `service_id`, `price`, `quantity`, `discount`, `created_at`) VALUES
(1, 1, 2, 50000, 1, 0, '2025-05-17 15:37:14'),
(2, 1, 3, 250000, 1, 0, '2025-05-17 15:37:14'),
(3, 2, 7, 25000, 1, 0, '2025-05-18 00:38:28'),
(4, 2, 8, 100000, 1, 0, '2025-05-18 00:38:28'),
(5, 2, 9, 350000, 1, 0, '2025-05-18 00:38:28'),
(6, 3, 2, 50000, 1, 0, '2025-05-19 06:40:02'),
(7, 3, 3, 250000, 1, 0, '2025-05-19 06:40:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'staff',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `email`, `phone`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin', '3c2e58bad251d1bb77f1c99d6effe6200b8519d4b94c07c948611bcee4933c25fac5df8510c23e780983eb1163748184d3ef689931a8cf8675aec7eb4562b3e2.4b13c18b514ff82cc88e48d316909130', 'Admin Wash Corner', 'admin', 'admin@washcorner.com', '0812345678', 1, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(2, 'manager', 'ce3842081c996fbf3f367f79684ba467542e1eef7f157705c2dd673ed7301a782f1edccd3cb2e0d0b2bf47e83d26e1cebf51ebd026a1f60f91d0713f3f761245.1e88ef83182e25e00bdd5bab2347f2cc', 'Manager Wash Corner', 'manager', 'manager@washcorner.com', '0812345679', 1, '2025-05-16 22:46:54', '2025-05-16 22:46:54'),
(3, 'kasir', 'c8a1c2eca28ceb803ccd8596e6f80de1987fda181a772dc356cfee49973c324b234f260504d2929e71cfcd52f35d3378aeaccd451c0dc7866daa8102ba20d5d7.cdd34ab55800ae918ea3ee66c485e0df', 'Kasir Wash Corner', 'kasir', 'kasir@washcorner.com', '0812345680', 1, '2025-05-16 22:46:54', '2025-05-16 22:46:54');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indeks untuk tabel `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `approved_by_id` (`approved_by_id`),
  ADD KEY `created_by_id` (`created_by_id`);

--
-- Indeks untuk tabel `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `hrd_documents`
--
ALTER TABLE `hrd_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indeks untuk tabel `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `inventory_usage`
--
ALTER TABLE `inventory_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `inventory_item_id` (`inventory_item_id`);

--
-- Indeks untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `approved_by_id` (`approved_by_id`);

--
-- Indeks untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indeks untuk tabel `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indeks untuk tabel `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `position_salaries`
--
ALTER TABLE `position_salaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `position` (`position`);

--
-- Indeks untuk tabel `profit_loss_reports`
--
ALTER TABLE `profit_loss_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period` (`period`),
  ADD KEY `created_by_id` (`created_by_id`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indeks untuk tabel `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `training_participants`
--
ALTER TABLE `training_participants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_id` (`training_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indeks untuk tabel `training_sessions`
--
ALTER TABLE `training_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indeks untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `hrd_documents`
--
ALTER TABLE `hrd_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `inventory_usage`
--
ALTER TABLE `inventory_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT untuk tabel `position_salaries`
--
ALTER TABLE `position_salaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `profit_loss_reports`
--
ALTER TABLE `profit_loss_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4320;

--
-- AUTO_INCREMENT untuk tabel `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `training_participants`
--
ALTER TABLE `training_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `training_sessions`
--
ALTER TABLE `training_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`approved_by_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`created_by_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `hrd_documents`
--
ALTER TABLE `hrd_documents`
  ADD CONSTRAINT `hrd_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `inventory_usage`
--
ALTER TABLE `inventory_usage`
  ADD CONSTRAINT `inventory_usage_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_usage_ibfk_2` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`approved_by_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `payrolls_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `profit_loss_reports`
--
ALTER TABLE `profit_loss_reports`
  ADD CONSTRAINT `profit_loss_reports_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `training_participants`
--
ALTER TABLE `training_participants`
  ADD CONSTRAINT `training_participants_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `training_participants_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
