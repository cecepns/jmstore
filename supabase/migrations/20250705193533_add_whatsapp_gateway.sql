-- Add WhatsApp Gateway Settings
-- Migration: 20250705193533_add_whatsapp_gateway.sql

USE pulsa_store;

-- Insert WhatsApp gateway settings
INSERT INTO api_settings (provider, api_key, api_secret, endpoint_url, is_active) VALUES
('whatsapp_gateway', 'YOUR_TOKEN_HERE', 'YOUR_INSTANCE_ID', 'https://app.multichat.id/api/v1/send-text', TRUE);

-- Update system settings to include WhatsApp notification number
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('whatsapp_admin_number', '08123456789', 'Admin WhatsApp number for manual order notifications')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value); 