-- Add withdrawals table for user balance withdrawals
-- Migration: 20250705193532_add_withdrawals.sql

USE pulsa_store;

-- Create withdrawals table
CREATE TABLE withdrawals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  notes TEXT,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Add withdrawal type to balance_history table
ALTER TABLE balance_history 
MODIFY COLUMN type ENUM('topup', 'purchase', 'refund', 'adjustment', 'withdrawal') NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at); 