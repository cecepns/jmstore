# API Management Feature

## Overview
Fitur Manajemen API memungkinkan admin untuk mengelola pengaturan API untuk berbagai layanan seperti WhatsApp Gateway, Payment Gateway, SMS Gateway, dan lainnya. Fitur ini menyediakan antarmuka yang user-friendly untuk CRUD (Create, Read, Update, Delete) operasi pada pengaturan API.

## Database Schema

### Tabel `api_settings`
```sql
CREATE TABLE api_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(100) NOT NULL,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  endpoint_url VARCHAR(500),
  method ENUM('GET', 'POST', 'PUT', 'DELETE') DEFAULT 'GET',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Migration
File: `supabase/migrations/20250705193535_add_method_to_api_settings.sql`
```sql
-- Add method field to api_settings table
USE pulsa_store;

-- Add method column to api_settings table
ALTER TABLE api_settings 
ADD COLUMN method ENUM('GET', 'POST', 'PUT', 'DELETE') DEFAULT 'GET' AFTER endpoint_url;

-- Update existing records to have GET as default method
UPDATE api_settings SET method = 'GET' WHERE method IS NULL;
```

## Frontend Components

### ApiManagement.jsx
Lokasi: `src/components/dashboard/admin/ApiManagement.jsx`

Fitur:
- **Daftar API Settings**: Menampilkan semua pengaturan API dalam tabel
- **Tambah API**: Form modal untuk menambah pengaturan API baru
- **Edit API**: Form modal untuk mengedit pengaturan API yang ada
- **Hapus API**: Konfirmasi dan hapus pengaturan API
- **Toggle Password Visibility**: Tampilkan/sembunyikan API key dan secret
- **Status Indicator**: Indikator visual untuk API yang aktif/nonaktif
- **Method Badge**: Badge berwarna untuk HTTP method (GET, POST, PUT, DELETE)
- **Provider Icons**: Icon yang berbeda untuk setiap jenis provider

### Integrasi dengan Admin Dashboard
- Menu item ditambahkan ke sidebar admin
- Route: `/admin/api`
- Icon: `link`

## Backend API Endpoints

### GET `/api/admin/api-settings`
Mendapatkan semua pengaturan API
```json
{
  "data": [
    {
      "id": 1,
      "provider": "whatsapp_gateway",
      "api_key": "YOUR_TOKEN_HERE",
      "api_secret": "YOUR_INSTANCE_ID",
      "endpoint_url": "https://app.multichat.id/api/v1/send-text",
      "method": "GET",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/admin/api-settings`
Membuat pengaturan API baru
```json
{
  "provider": "payment_gateway",
  "api_key": "YOUR_API_KEY",
  "api_secret": "YOUR_API_SECRET",
  "endpoint_url": "https://api.payment.com/process",
  "method": "POST",
  "is_active": true
}
```

### PUT `/api/admin/api-settings/:id`
Update pengaturan API
```json
{
  "provider": "payment_gateway_updated",
  "api_key": "UPDATED_API_KEY",
  "api_secret": "UPDATED_API_SECRET",
  "endpoint_url": "https://api.payment.com/process/v2",
  "method": "PUT",
  "is_active": false
}
```

### DELETE `/api/admin/api-settings/:id`
Hapus pengaturan API

## Provider Types

Sistem mendukung berbagai jenis provider dengan icon yang berbeda:

| Provider | Icon | Deskripsi |
|----------|------|-----------|
| `whatsapp_gateway` | 💬 | WhatsApp Gateway untuk notifikasi |
| `payment_gateway` | 💳 | Payment Gateway untuk pembayaran |
| `sms_gateway` | 📱 | SMS Gateway untuk notifikasi SMS |
| `email_service` | 📧 | Email Service untuk notifikasi email |
| `pulsa_api` | 📞 | API untuk layanan pulsa |
| `kuota_api` | 📶 | API untuk layanan kuota data |

## HTTP Methods

Sistem mendukung semua HTTP methods standar dengan warna yang berbeda:

| Method | Warna | Deskripsi |
|--------|-------|-----------|
| GET | 🟢 Hijau | Untuk mengambil data |
| POST | 🔵 Biru | Untuk membuat data baru |
| PUT | 🟡 Kuning | Untuk update data |
| DELETE | 🔴 Merah | Untuk menghapus data |

## Security Features

### Authentication & Authorization
- Semua endpoint memerlukan authentication token
- Hanya admin yang dapat mengakses fitur ini
- Menggunakan middleware `authenticateToken` dan `requireRole(['admin'])`

### Data Protection
- API key dan secret dapat disembunyikan/ditampilkan
- Password visibility toggle untuk keamanan
- Validasi input untuk mencegah injection

### Validation
- Provider field wajib diisi
- Method harus salah satu dari: GET, POST, PUT, DELETE
- Endpoint URL harus valid URL format
- is_active harus boolean

## Usage Examples

### 1. Menambah WhatsApp Gateway
```json
{
  "provider": "whatsapp_gateway",
  "api_key": "YOUR_MULTICHAT_TOKEN",
  "api_secret": "YOUR_INSTANCE_ID",
  "endpoint_url": "https://app.multichat.id/api/v1/send-text",
  "method": "GET",
  "is_active": true
}
```

### 2. Menambah Payment Gateway
```json
{
  "provider": "payment_gateway",
  "api_key": "YOUR_MIDTRANS_SERVER_KEY",
  "api_secret": "YOUR_MIDTRANS_CLIENT_KEY",
  "endpoint_url": "https://api.midtrans.com/v2/charge",
  "method": "POST",
  "is_active": true
}
```

### 3. Menambah SMS Gateway
```json
{
  "provider": "sms_gateway",
  "api_key": "YOUR_ZENZIVA_API_KEY",
  "api_secret": "YOUR_ZENZIVA_USER_KEY",
  "endpoint_url": "https://reguler.zenziva.net/apps/smsapi.php",
  "method": "GET",
  "is_active": true
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Provider is required"
}
```

#### 401 Unauthorized
```json
{
  "message": "Access denied"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Failed to create API setting"
}
```

## Testing

### Manual Testing
1. Login sebagai admin
2. Akses menu "Manajemen API"
3. Test semua operasi CRUD
4. Test error cases

### Automated Testing
File: `test_api_management.js`
```bash
node test_api_management.js
```

## Integration with Existing Features

### WhatsApp Gateway Integration
API settings untuk WhatsApp gateway sudah terintegrasi dengan fitur notifikasi order manual:

```javascript
// Get WhatsApp gateway settings
const [apiSettings] = await connection.execute(
  'SELECT endpoint_url, api_key, api_secret FROM api_settings WHERE provider = "whatsapp_gateway" AND is_active = TRUE LIMIT 1'
);
```

### Future Integrations
- Payment Gateway untuk topup otomatis
- SMS Gateway untuk notifikasi status transaksi
- Email Service untuk laporan dan notifikasi
- Pulsa/Kuota API untuk pembelian otomatis

## Maintenance

### Database Migration
Jalankan migration untuk menambah field `method`:
```bash
mysql -u username -p database_name < supabase/migrations/20250705193535_add_method_to_api_settings.sql
```

### Backup
Backup tabel `api_settings` sebelum melakukan perubahan:
```sql
CREATE TABLE api_settings_backup AS SELECT * FROM api_settings;
```

## Troubleshooting

### Common Issues

1. **API setting tidak muncul**
   - Periksa apakah user login sebagai admin
   - Periksa token authentication
   - Periksa database connection

2. **Error saat create/update**
   - Periksa validasi input (provider wajib diisi)
   - Periksa format URL endpoint
   - Periksa method yang valid

3. **Password visibility tidak berfungsi**
   - Periksa state management di frontend
   - Periksa event handler untuk toggle

### Debug Steps

1. Periksa browser console untuk error JavaScript
2. Periksa server logs untuk error backend
3. Periksa database connection dan query
4. Test API endpoints dengan Postman/curl

## Future Enhancements

1. **API Testing Feature**
   - Test koneksi API langsung dari interface
   - Validasi endpoint dan credentials
   - Response time monitoring

2. **API Usage Analytics**
   - Track penggunaan API
   - Monitor error rates
   - Performance metrics

3. **Advanced Security**
   - Encryption untuk API keys
   - Audit trail untuk perubahan
   - Rate limiting

4. **Bulk Operations**
   - Import/export API settings
   - Bulk enable/disable
   - Template management 