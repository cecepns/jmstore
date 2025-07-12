-- Add topup account settings table
-- This table will store payment method configurations for topup

CREATE TABLE topup_account_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_method VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(100),
  bank_name VARCHAR(100),
  qr_code_url VARCHAR(500),
  instructions TEXT,
  minimum_amount DECIMAL(15,2) DEFAULT 10000.00,
  maximum_amount DECIMAL(15,2) DEFAULT 5000000.00,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default payment methods
INSERT INTO topup_account_settings (payment_method, display_name, account_name, account_number, bank_name, instructions, sort_order) VALUES
('bank_transfer', 'Transfer Bank', 'PT Pulsa Store Indonesia', '1234567890', 'Bank BCA', 'Transfer ke rekening BCA: 1234567890\nAtas nama: PT Pulsa Store Indonesia\nLakukan transfer sesuai nominal yang diminta', 1),
('e_wallet', 'E-Wallet', 'Pulsa Store', '08123456789', 'DANA/OVO/GoPay', 'Kirim ke nomor: 08123456789\nAtas nama: Pulsa Store\nPilih metode DANA/OVO/GoPay', 2),
('qris', 'QRIS', 'Pulsa Store', NULL, NULL, 'Scan QRIS code yang muncul\nPilih bank atau e-wallet Anda\nLakukan pembayaran sesuai nominal', 3),
('internet_banking', 'Internet Banking', 'PT Pulsa Store Indonesia', '1234567890', 'Bank BCA', 'Login ke internet banking\nPilih transfer\nMasukkan rekening tujuan: 1234567890\nAtas nama: PT Pulsa Store Indonesia', 4);

-- Create index for better performance
CREATE INDEX idx_topup_account_settings_active ON topup_account_settings(is_active);
CREATE INDEX idx_topup_account_settings_sort_order ON topup_account_settings(sort_order); 