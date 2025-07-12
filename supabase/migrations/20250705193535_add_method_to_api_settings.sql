-- Add method field to api_settings table
-- Migration: 20250705193535_add_method_to_api_settings.sql

USE pulsa_store;

-- Add method column to api_settings table
ALTER TABLE api_settings 
ADD COLUMN method ENUM('GET', 'POST', 'PUT', 'DELETE') DEFAULT 'GET' AFTER endpoint_url;

-- Update existing records to have GET as default method
UPDATE api_settings SET method = 'GET' WHERE method IS NULL; 