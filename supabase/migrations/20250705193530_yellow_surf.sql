-- Pulsa & Kuota Store Database Schema
-- Created for Express.js backend with MySQL

CREATE DATABASE IF NOT EXISTS pulsa_store;
USE pulsa_store;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'reseller', 'seller', 'user') DEFAULT 'user',
  balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  type ENUM('pulsa', 'kuota') NOT NULL,
  provider ENUM('telkomsel', 'indosat', 'xl', 'axis', 'three', 'smartfren') NOT NULL,
  denomination VARCHAR(100) NOT NULL,
  category ENUM('manual', 'api') DEFAULT 'manual',
  status ENUM('active', 'inactive') DEFAULT 'active',
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  package_id INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Topups table
CREATE TABLE topups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method ENUM('bank_transfer', 'e_wallet', 'credit_card', 'manual') DEFAULT 'manual',
  type ENUM('manual', 'automatic') DEFAULT 'manual',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  description TEXT,
  receipt_url VARCHAR(500),
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Balance history table
CREATE TABLE balance_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type ENUM('topup', 'purchase', 'refund', 'adjustment') NOT NULL,
  description TEXT,
  balance_before DECIMAL(15,2),
  balance_after DECIMAL(15,2) NOT NULL,
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Profits table (for tracking reseller/seller profits)
CREATE TABLE profits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type ENUM('reseller', 'seller') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Price lists for different user roles
CREATE TABLE price_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  package_id INT NOT NULL,
  role ENUM('user', 'seller', 'reseller') NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  profit_margin DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id),
  UNIQUE KEY unique_package_role (package_id, role)
);

-- API settings table
CREATE TABLE api_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(100) NOT NULL,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  endpoint_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System settings table
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (name, email, password, role, balance) VALUES 
('Admin', 'admin@pulsastore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1000000.00);
-- Default password is 'password' (hashed)

-- Insert sample packages
INSERT INTO packages (name, description, price, type, provider, denomination, category) VALUES
('Telkomsel 5K', 'Pulsa Telkomsel 5.000', 6000.00, 'pulsa', 'telkomsel', '5000', 'manual'),
('Telkomsel 10K', 'Pulsa Telkomsel 10.000', 11000.00, 'pulsa', 'telkomsel', '10000', 'manual'),
('Telkomsel 20K', 'Pulsa Telkomsel 20.000', 21000.00, 'pulsa', 'telkomsel', '20000', 'manual'),
('Telkomsel 1GB', 'Kuota Telkomsel 1GB', 15000.00, 'kuota', 'telkomsel', '1GB', 'manual'),
('Telkomsel 2GB', 'Kuota Telkomsel 2GB', 25000.00, 'kuota', 'telkomsel', '2GB', 'manual'),
('Indosat 5K', 'Pulsa Indosat 5.000', 5800.00, 'pulsa', 'indosat', '5000', 'manual'),
('Indosat 10K', 'Pulsa Indosat 10.000', 10800.00, 'pulsa', 'indosat', '10000', 'manual'),
('Indosat 1GB', 'Kuota Indosat 1GB', 14000.00, 'kuota', 'indosat', '1GB', 'manual'),
('XL 5K', 'Pulsa XL 5.000', 5900.00, 'pulsa', 'xl', '5000', 'manual'),
('XL 10K', 'Pulsa XL 10.000', 10900.00, 'pulsa', 'xl', '10000', 'manual'),
('XL 1GB', 'Kuota XL 1GB', 14500.00, 'kuota', 'xl', '1GB', 'manual');

-- Insert price lists for different roles
INSERT INTO price_lists (package_id, role, price, profit_margin) VALUES
-- Telkomsel 5K
(1, 'user', 6000.00, 0.00),
(1, 'seller', 5800.00, 200.00),
(1, 'reseller', 5600.00, 400.00),
-- Telkomsel 10K
(2, 'user', 11000.00, 0.00),
(2, 'seller', 10700.00, 300.00),
(2, 'reseller', 10400.00, 600.00),
-- Telkomsel 1GB
(4, 'user', 15000.00, 0.00),
(4, 'seller', 14500.00, 500.00),
(4, 'reseller', 14000.00, 1000.00);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', 'Pulsa Store', 'Application name'),
('min_topup_amount', '10000', 'Minimum topup amount'),
('max_topup_amount', '5000000', 'Maximum topup amount'),
('whatsapp_notification', '08123456789', 'WhatsApp number for notifications'),
('maintenance_mode', 'false', 'Maintenance mode status');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_packages_type ON packages(type);
CREATE INDEX idx_packages_provider ON packages(provider);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_topups_user_id ON topups(user_id);
CREATE INDEX idx_topups_status ON topups(status);
CREATE INDEX idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX idx_balance_history_type ON balance_history(type);