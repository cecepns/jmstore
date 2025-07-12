-- Add pricing fields for different user roles and package availability
-- Migration: 20250705193531_add_package_pricing.sql

USE pulsa_store;

-- Add new columns to packages table
ALTER TABLE packages 
ADD COLUMN price_user DECIMAL(15,2) DEFAULT 0.00 AFTER price,
ADD COLUMN price_seller DECIMAL(15,2) DEFAULT 0.00 AFTER price_user,
ADD COLUMN price_reseller DECIMAL(15,2) DEFAULT 0.00 AFTER price_seller,
ADD COLUMN available_for JSON DEFAULT '["user", "seller", "reseller"]' AFTER price_reseller;

-- Update existing packages with default pricing
UPDATE packages SET 
  price_user = price,
  price_seller = price * 0.95,
  price_reseller = price * 0.90,
  available_for = '["user", "seller", "reseller"]';

-- Create index for better performance (using generated column for JSON indexing)
ALTER TABLE packages 
ADD COLUMN available_for_text VARCHAR(100) GENERATED ALWAYS AS (CAST(available_for AS CHAR(100))) VIRTUAL;

CREATE INDEX idx_packages_available_for ON packages(available_for_text);

-- Update sample packages with proper pricing
UPDATE packages SET 
  price_user = 6000.00,
  price_seller = 5700.00,
  price_reseller = 5400.00
WHERE name = 'Telkomsel 5K';

UPDATE packages SET 
  price_user = 11000.00,
  price_seller = 10450.00,
  price_reseller = 9900.00
WHERE name = 'Telkomsel 10K';

UPDATE packages SET 
  price_user = 21000.00,
  price_seller = 19950.00,
  price_reseller = 18900.00
WHERE name = 'Telkomsel 20K';

UPDATE packages SET 
  price_user = 15000.00,
  price_seller = 14250.00,
  price_reseller = 13500.00
WHERE name = 'Telkomsel 1GB';

UPDATE packages SET 
  price_user = 25000.00,
  price_seller = 23750.00,
  price_reseller = 22500.00
WHERE name = 'Telkomsel 2GB';

UPDATE packages SET 
  price_user = 5800.00,
  price_seller = 5510.00,
  price_reseller = 5220.00
WHERE name = 'Indosat 5K';

UPDATE packages SET 
  price_user = 10800.00,
  price_seller = 10260.00,
  price_reseller = 9720.00
WHERE name = 'Indosat 10K';

UPDATE packages SET 
  price_user = 14000.00,
  price_seller = 13300.00,
  price_reseller = 12600.00
WHERE name = 'Indosat 1GB';

UPDATE packages SET 
  price_user = 5900.00,
  price_seller = 5605.00,
  price_reseller = 5310.00
WHERE name = 'XL 5K';

UPDATE packages SET 
  price_user = 10900.00,
  price_seller = 10355.00,
  price_reseller = 9810.00
WHERE name = 'XL 10K';

UPDATE packages SET 
  price_user = 14500.00,
  price_seller = 13775.00,
  price_reseller = 13050.00
WHERE name = 'XL 1GB'; 