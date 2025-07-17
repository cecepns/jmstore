const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pulsa_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const dbJmStore = mysql.createPool(dbConfig);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/jmstore/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;
    
    // Check if user exists
    const [existingUsers] = await dbJmStore.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await dbJmStore.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/jmstore/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const [users] = await dbJmStore.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password;

    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/jmstore/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await dbJmStore.execute(
      'SELECT id, name, email, phone, role, balance FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Password Reset Route
app.post('/api/jmstore/auth/reset-password', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Nomor HP diperlukan' });
    }

    // Format phone number to Indonesian format
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
      formattedPhone = '62' + phone;
    }

    // Find user by phone number
    const [users] = await dbJmStore.execute(
      'SELECT id, name, email, phone FROM users WHERE phone = ? OR phone = ?',
      [phone, formattedPhone]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Nomor HP tidak ditemukan dalam sistem' });
    }

    const user = users[0];
    
    // Generate new random password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + Math.floor(Math.random() * 1000);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await dbJmStore.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Get WhatsApp gateway settings
    const [apiSettings] = await dbJmStore.execute(
      'SELECT endpoint_url, api_key, api_secret FROM api_settings WHERE provider = "whatsapp_gateway" AND is_active = TRUE LIMIT 1'
    );
    
    if (apiSettings.length === 0) {
      return res.status(500).json({ message: 'WhatsApp gateway tidak tersedia. Silakan hubungi admin.' });
    }
    
    const whatsappSettings = apiSettings[0];
    
    // Create WhatsApp message
    const message = `🔐 *RESET PASSWORD - JM Store*

Halo ${user.name || 'User'},

Password baru Anda telah dibuat:

📱 *Username:* ${user.email}
🔑 *Password Baru:* ${newPassword}

⚠️ *PENTING:*
• Segera login dan ubah password Anda
• Jangan bagikan password ini kepada siapapun
• Password ini hanya berlaku sekali

🔗 Login di: https://jmstore.vercel.app/login

Terima kasih,
Tim JM Store`;
    
    // Prepare WhatsApp API payload
    const whatsappPayload = {
      token: whatsappSettings.api_key,
      instance_id: whatsappSettings.api_secret,
      jid: `${formattedPhone}@s.whatsapp.net`,
      msg: message
    };
    
    console.log('Sending password reset WhatsApp:', {
      url: whatsappSettings.endpoint_url,
      payload: whatsappPayload
    });
    
    // Send WhatsApp notification
    const whatsappResponse = await axios.get(
      whatsappSettings.endpoint_url,
      {
        params: whatsappPayload,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );
    
    console.log('Password reset WhatsApp sent:', whatsappResponse.data);

    res.json({ 
      message: 'Password baru telah dikirim ke WhatsApp Anda',
      success: true
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Gagal mengirim password baru. Silakan coba lagi.' });
  }
});

// User Profile Routes
app.put('/api/jmstore/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user data
    const [users] = await dbJmStore.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const updates = [];
    const params = [];

    // Update basic info
    if (name !== undefined && name !== user.name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email !== undefined && email !== user.email) {
      // Check if email is already taken by another user
      const [existingUsers] = await dbJmStore.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already taken by another user' });
      }
      
      updates.push('email = ?');
      params.push(email);
    }

    if (phone !== undefined && phone !== user.phone) {
      updates.push('phone = ?');
      params.push(phone);
    }

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    // If no updates, return success
    if (updates.length === 0) {
      return res.json({ message: 'No changes to update' });
    }

    // Add user ID to params
    params.push(userId);

    // Update user
    await dbJmStore.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// User Routes
app.get('/api/jmstore/user/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user balance
    const [userResult] = await dbJmStore.execute(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    );

    // Get transaction stats
    const [transactionStats] = await dbJmStore.execute(
      'SELECT COUNT(*) as total_transactions, COALESCE(SUM(amount), 0) as total_spent FROM transactions WHERE user_id = ? AND status = "completed"',
      [userId]
    );

    // Get recent transactions
    const [recentTransactions] = await dbJmStore.execute(
      'SELECT t.*, p.name as package_name FROM transactions t JOIN packages p ON t.package_id = p.id WHERE t.user_id = ? ORDER BY t.created_at DESC LIMIT 5',
      [userId]
    );

    res.json({
      balance: userResult[0]?.balance || 0,
      totalTransactions: transactionStats[0]?.total_transactions || 0,
      totalSpent: transactionStats[0]?.total_spent || 0,
      recentTransactions
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
});

app.get('/api/jmstore/user/balance', authenticateToken, async (req, res) => {
  try {
    const [users] = await dbJmStore.execute(
      'SELECT balance FROM users WHERE id = ?',
      [req.user.id]
    );

    // Ensure balance is returned as a number
    const balance = parseFloat(users[0]?.balance) || 0;
    // console.log('Balance API - Raw from DB:', users[0]?.balance, 'Converted:', balance);
    res.json({ balance: balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Failed to get balance' });
  }
});

app.post('/api/jmstore/user/topup', authenticateToken, async (req, res) => {
  try {
    const { amount, payment_method } = req.body;
    const userId = req.user.id;

    // Insert topup request
    const [result] = await dbJmStore.execute(
      'INSERT INTO topups (user_id, amount, payment_method, status) VALUES (?, ?, ?, "pending")',
      [userId, amount, payment_method]
    );

    res.json({ 
      message: 'Topup request submitted successfully',
      topupId: result.insertId 
    });
  } catch (error) {
    console.error('Topup error:', error);
    res.status(500).json({ message: 'Failed to submit topup request' });
  }
});

app.get('/api/jmstore/packages', async (req, res) => {
  try {
    const { role = 'user' } = req.query;
    
    // Get packages with role-based pricing
    const [packages] = await dbJmStore.execute(
      `SELECT 
        p.*,
        CASE 
          WHEN ? = 'user' THEN COALESCE(p.price_user, p.price)
          WHEN ? = 'seller' THEN COALESCE(p.price_seller, p.price * 0.95)
          WHEN ? = 'reseller' THEN COALESCE(p.price_reseller, p.price * 0.90)
          ELSE p.price
        END as display_price
      FROM packages p 
      WHERE p.status = "active" 
        AND JSON_CONTAINS(p.available_for, ?)
        AND (
          (p.category = 'api')
          OR (p.category != 'api' AND (p.stock IS NULL OR p.stock > 0))
        )
      ORDER BY p.provider, p.type, p.price`,
      [role, role, role, JSON.stringify(role)]
    );

    // Convert display_price to number for all packages
    const packagesWithNumericPrices = packages.map(pkg => ({
      ...pkg,
      display_price: parseFloat(pkg.display_price) || parseFloat(pkg.price) || 0,
      price: parseFloat(pkg.price) || 0
    }));

    res.json(packagesWithNumericPrices);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Failed to get packages' });
  }
});

// Add user-specific packages endpoint
app.get('/api/jmstore/user/packages', authenticateToken, async (req, res) => {
  try {
    const { search = '', type = '', provider = '' } = req.query;
    const userRole = req.user.role;
    
    let whereClause = 'WHERE p.status = "active" AND JSON_CONTAINS(p.available_for, ?) AND ((p.category = "api") OR (p.category != "api" AND (p.stock IS NULL OR p.stock > 0)))';
    const params = [JSON.stringify(userRole)];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.denomination LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type) {
      whereClause += ' AND p.type = ?';
      params.push(type);
    }

    if (provider) {
      whereClause += ' AND p.provider = ?';
      params.push(provider);
    }

    // Get packages with role-based pricing
    const [packages] = await dbJmStore.execute(
      `SELECT 
        p.*,
        CASE 
          WHEN ? = 'user' THEN COALESCE(p.price_user, p.price)
          WHEN ? = 'seller' THEN COALESCE(p.price_seller, p.price * 0.95)
          WHEN ? = 'reseller' THEN COALESCE(p.price_reseller, p.price * 0.90)
          ELSE p.price
        END as display_price
      FROM packages p 
      ${whereClause}
      ORDER BY p.provider, p.type, p.price`,
      [userRole, userRole, userRole, ...params]
    );

    // Convert display_price to number for all packages
    const packagesWithNumericPrices = packages.map(pkg => ({
      ...pkg,
      display_price: parseFloat(pkg.display_price) || parseFloat(pkg.price) || 0,
      price: parseFloat(pkg.price) || 0
    }));

    res.json(packagesWithNumericPrices);
  } catch (error) {
    console.error('Get user packages error:', error);
    res.status(500).json({ message: 'Failed to get packages' });
  }
});

app.post('/api/jmstore/user/purchase', authenticateToken, async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { package_id, phone_number } = req.body;
    const userId = req.user.id;

    // Get user details and package details
    const [users] = await connection.execute(
      'SELECT name, balance, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // Get package details with role-based pricing
    const [packages] = await connection.execute(
      `SELECT 
        p.*,
        CASE 
          WHEN ? = 'user' THEN COALESCE(p.price_user, p.price)
          WHEN ? = 'seller' THEN COALESCE(p.price_seller, p.price * 0.95)
          WHEN ? = 'reseller' THEN COALESCE(p.price_reseller, p.price * 0.90)
          ELSE p.price
        END as display_price
      FROM packages p 
      WHERE p.id = ? AND p.status = "active" 
        AND JSON_CONTAINS(p.available_for, ?)
        AND (p.stock IS NULL OR p.stock > 0)`,
      [user.role, user.role, user.role, package_id, JSON.stringify(user.role)]
    );

    if (packages.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Package not found or not available for your role' });
    }

    const packageData = packages[0];
    
    
    // Ensure finalPrice is a number
    const finalPrice = parseFloat(packageData.display_price) || parseFloat(packageData.price) || 0;


    // Convert balance from string to number and use integer comparison
    const userBalance = parseFloat(user.balance || 0);
    const balanceInCents = Math.floor(userBalance * 100);
    const priceInCents = Math.floor(parseFloat(finalPrice || 0) * 100);

    if (balanceInCents < priceInCents) {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Saldo Tidak Cukup',
        debug: {
          balance: userBalance,
          price: finalPrice,
          balanceInCents,
          priceInCents
        }
      });
    }

    // Handle different package categories
    let transactionStatus = 'completed';
    let apiResponse = null;

    if (packageData.category === 'manual') {
      // For manual packages, set status to pending
      transactionStatus = 'pending';
      console.log('Manual package - setting status to pending');
    } else if (packageData.category === 'api') {
      // For API packages, call external API
      console.log('API package - calling external API');
      
      // Format phone number to Indonesian format
      let formattedPhone = phone_number;
      if (phone_number.startsWith('0')) {
        formattedPhone = '62' + phone_number.substring(1);
      } else if (!phone_number.startsWith('62')) {
        formattedPhone = '62' + phone_number;
      }

      try {
        // Get KHFY API settings from database
        const [khfySettings] = await connection.execute(
          'SELECT endpoint_url, api_key FROM api_settings WHERE provider = "khfy" AND is_active = TRUE LIMIT 1'
        );
        
        if (khfySettings.length === 0) {
          console.error('KHFY API settings not found');
          transactionStatus = 'failed';
          apiResponse = { error: 'KHFY API settings not configured' };
        } else {
          const khfyConfig = khfySettings[0];
          
          const apiPayload = {
            api_key: khfyConfig.api_key,
            mode: 'callback',
            msisdn: formattedPhone,
            package_id: packageData.package_api_id,
            url: 'https://api-inventory.isavralabel.com/api/jmstore/health'
          };

          console.log('Calling external API with payload:', apiPayload);
          

          const apiResult = await axios.post(
            khfyConfig.endpoint_url,
            apiPayload,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 seconds timeout
            }
          );

          apiResponse = apiResult.data;
          console.log('API Response:', apiResponse);

          if (apiResponse.status === true) {
            transactionStatus = 'completed';
            console.log('API call successful - setting status to completed');
          } else {
            transactionStatus = 'failed';
            console.log('API call failed - setting status to failed');
          }
        }
      } catch (apiError) {
        console.error('API call error:', apiError);
        transactionStatus = 'failed';
        apiResponse = { error: apiError.message };
      }
    }

    // Calculate new balance before updating
    const newBalance = userBalance - finalPrice;

    // Create transaction with appropriate status
    const [transactionResult] = await connection.execute(
      'INSERT INTO transactions (user_id, package_id, phone_number, amount, status) VALUES (?, ?, ?, ?, ?)',
      [userId, package_id, phone_number, finalPrice, transactionStatus]
    );

    // Send WhatsApp notification for manual orders
    if (packageData.category === 'manual') {
      try {
        // Get WhatsApp gateway settings
        const [apiSettings] = await connection.execute(
          'SELECT endpoint_url, api_key, api_secret FROM api_settings WHERE provider = "whatsapp_gateway" AND is_active = TRUE LIMIT 1'
        );
        
        if (apiSettings.length > 0) {
          const whatsappSettings = apiSettings[0];
          
          // Get admin WhatsApp number from system settings
          const [systemSettings] = await dbJmStore.execute(
            'SELECT setting_value FROM system_settings WHERE setting_key = "whatsapp_notification" LIMIT 1'
          );
          
          const adminWhatsAppNumber = systemSettings[0]?.setting_value || '6282235365392';
          
          
          // Format phone number to Indonesian format
          let formattedPhone = phone_number;
          if (phone_number.startsWith('0')) {
            formattedPhone = '62' + phone_number.substring(1);
          } else if (!phone_number.startsWith('62')) {
            formattedPhone = '62' + phone_number;
          }
          
          // Create WhatsApp message
          const message = `🛒 *ORDER MANUAL BARU*
          
📦 *Paket:* ${packageData.name}
💰 *Harga:* Rp ${finalPrice.toLocaleString()}
📱 *Nomor:* ${formattedPhone}
👤 *Pelanggan:* ${user.name || 'User'}
🆔 *User ID:* ${userId}
📅 *Tanggal:* ${new Date().toLocaleString('id-ID')}
🆔 *Transaction ID:* ${transactionResult.insertId}

Silakan proses order ini segera!`;
          
          // Prepare WhatsApp API payload
          const whatsappPayload = {
            token: whatsappSettings.api_key,
            instance_id: whatsappSettings.api_secret,
            jid: `${adminWhatsAppNumber}@s.whatsapp.net`,
            msg: message
          };
          
          console.log('Sending WhatsApp notification:', {
            url: whatsappSettings.endpoint_url,
            payload: whatsappPayload
          });
          
          // Send WhatsApp notification
          const whatsappResponse = await axios.get(
            whatsappSettings.endpoint_url,
            {
              params: whatsappPayload,
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 10000 // 10 seconds timeout
            }
          );
          
          console.log('WhatsApp notification sent:', whatsappResponse.data);
        }
      } catch (whatsappError) {
        console.error('WhatsApp notification error:', whatsappError);
        // Don't fail the transaction if WhatsApp notification fails
      }
    }

    // Only deduct balance if transaction is completed
    if (transactionStatus === 'completed') {
      // Update user balance
      await connection.execute(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [finalPrice, userId]
      );

      // Insert balance history
      await connection.execute(
        'INSERT INTO balance_history (user_id, amount, type, description, balance_after) VALUES (?, ?, "purchase", ?, ?)',
        [userId, -finalPrice, `Purchase ${packageData.name}`, newBalance]
      );
    }

    await connection.commit();

    res.json({ 
      message: transactionStatus === 'completed' ? 'Package purchased successfully' : 
               transactionStatus === 'pending' ? 'Order submitted successfully. Please wait for manual processing.' :
               'Purchase failed. Please try again.',
      transactionId: transactionResult.insertId,
      status: transactionStatus,
      apiResponse: apiResponse
    });
  } catch (error) {
    await connection.rollback();
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Purchase failed' });
  } finally {
    connection.release();
  }
});

app.get('/api/jmstore/user/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, dateFrom, dateTo, search } = req.query;

    let query = `
      SELECT t.*, p.name as package_name, p.type as package_type, p.provider 
      FROM transactions t 
      JOIN packages p ON t.package_id = p.id 
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND p.type = ?';
      params.push(type);
    }

    if (dateFrom) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(t.created_at) <= ?';
      params.push(dateTo);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR t.phone_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.created_at DESC';

    const [transactions] = await dbJmStore.execute(query, params);

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
});

// New endpoint for all transaction types
app.get('/api/jmstore/user/all-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, dateFrom, dateTo, search } = req.query;

    let allTransactions = [];

    // Get purchase transactions
    let purchaseQuery = `
      SELECT 
        t.id,
        t.created_at,
        t.amount,
        t.status,
        t.phone_number,
        p.name as package_name,
        p.type as package_type,
        p.provider,
        'purchase' as transaction_type,
        CONCAT('Pembelian ', p.name) as description
      FROM transactions t 
      JOIN packages p ON t.package_id = p.id 
      WHERE t.user_id = ?
    `;
    const purchaseParams = [userId];

    if (status) {
      purchaseQuery += ' AND t.status = ?';
      purchaseParams.push(status);
    }

    if (type && type === 'purchase') {
      // Only filter by package type for purchases
      purchaseQuery += ' AND p.type = ?';
      purchaseParams.push(req.query.packageType || 'pulsa');
    }

    if (dateFrom) {
      purchaseQuery += ' AND DATE(t.created_at) >= ?';
      purchaseParams.push(dateFrom);
    }

    if (dateTo) {
      purchaseQuery += ' AND DATE(t.created_at) <= ?';
      purchaseParams.push(dateTo);
    }

    if (search) {
      purchaseQuery += ' AND (p.name LIKE ? OR t.phone_number LIKE ?)';
      purchaseParams.push(`%${search}%`, `%${search}%`);
    }

    purchaseQuery += ' ORDER BY t.created_at DESC';

    const [purchases] = await dbJmStore.execute(purchaseQuery, purchaseParams);
    allTransactions.push(...purchases.map(t => ({ ...t, transaction_type: 'purchase' })));

    // Get topup transactions
    let topupQuery = `
      SELECT 
        id,
        created_at,
        amount,
        status,
        NULL as phone_number,
        NULL as package_name,
        NULL as package_type,
        NULL as provider,
        'topup' as transaction_type,
        COALESCE(description, 'Top Up Saldo') as description
      FROM topups 
      WHERE user_id = ?
    `;
    const topupParams = [userId];

    if (status) {
      topupQuery += ' AND status = ?';
      topupParams.push(status);
    }

    if (type && type === 'topup') {
      // Only include topups
    } else if (type && type !== 'topup') {
      // Skip topups if other type is selected
      topupQuery += ' AND 1=0';
    }

    if (dateFrom) {
      topupQuery += ' AND DATE(created_at) >= ?';
      topupParams.push(dateFrom);
    }

    if (dateTo) {
      topupQuery += ' AND DATE(created_at) <= ?';
      topupParams.push(dateTo);
    }

    if (search) {
      topupQuery += ' AND (description LIKE ?)';
      topupParams.push(`%${search}%`);
    }

    topupQuery += ' ORDER BY created_at DESC';

    const [topups] = await dbJmStore.execute(topupQuery, topupParams);
    allTransactions.push(...topups.map(t => ({ ...t, transaction_type: 'topup' })));

    // Get withdrawal transactions
    let withdrawalQuery = `
      SELECT 
        id,
        created_at,
        amount,
        status,
        NULL as phone_number,
        NULL as package_name,
        NULL as package_type,
        NULL as provider,
        'withdrawal' as transaction_type,
        CONCAT('Penarikan ke ', COALESCE(bank_name, ''), ' - ', COALESCE(account_number, '')) as description
      FROM withdrawals 
      WHERE user_id = ?
    `;
    const withdrawalParams = [userId];

    if (status) {
      withdrawalQuery += ' AND status = ?';
      withdrawalParams.push(status);
    }

    if (type && type === 'withdrawal') {
      // Only include withdrawals
    } else if (type && type !== 'withdrawal') {
      // Skip withdrawals if other type is selected
      withdrawalQuery += ' AND 1=0';
    }

    if (dateFrom) {
      withdrawalQuery += ' AND DATE(created_at) >= ?';
      withdrawalParams.push(dateFrom);
    }

    if (dateTo) {
      withdrawalQuery += ' AND DATE(created_at) <= ?';
      withdrawalParams.push(dateTo);
    }

    if (search) {
      withdrawalQuery += ' AND (bank_name LIKE ? OR account_number LIKE ? OR account_name LIKE ?)';
      withdrawalParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    withdrawalQuery += ' ORDER BY created_at DESC';

    const [withdrawals] = await dbJmStore.execute(withdrawalQuery, withdrawalParams);
    allTransactions.push(...withdrawals.map(t => ({ ...t, transaction_type: 'withdrawal' })));

    // Get adjustment transactions from balance_history
    let adjustmentQuery = `
      SELECT 
        id,
        created_at,
        ABS(amount) as amount,
        CASE 
          WHEN amount > 0 THEN 'completed'
          ELSE 'completed'
        END as status,
        NULL as phone_number,
        NULL as package_name,
        NULL as package_type,
        NULL as provider,
        type as transaction_type,
        description
      FROM balance_history 
      WHERE user_id = ? AND type IN ('adjustment', 'refund')
    `;
    const adjustmentParams = [userId];

    if (status) {
      adjustmentQuery += ' AND (CASE WHEN amount > 0 THEN "completed" ELSE "completed" END) = ?';
      adjustmentParams.push(status);
    }

    if (type && type === 'adjustment') {
      // Only include adjustments
    } else if (type && type !== 'adjustment') {
      // Skip adjustments if other type is selected
      adjustmentQuery += ' AND 1=0';
    }

    if (dateFrom) {
      adjustmentQuery += ' AND DATE(created_at) >= ?';
      adjustmentParams.push(dateFrom);
    }

    if (dateTo) {
      adjustmentQuery += ' AND DATE(created_at) <= ?';
      adjustmentParams.push(dateTo);
    }

    if (search) {
      adjustmentQuery += ' AND (description LIKE ?)';
      adjustmentParams.push(`%${search}%`);
    }

    adjustmentQuery += ' ORDER BY created_at DESC';

    const [adjustments] = await dbJmStore.execute(adjustmentQuery, adjustmentParams);
    allTransactions.push(...adjustments.map(t => ({ ...t, transaction_type: t.transaction_type })));

    // Sort all transactions by date (newest first)
    allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allTransactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
});

app.get('/api/jmstore/user/balance-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get balance history
    const [history] = await dbJmStore.execute(
      'SELECT * FROM balance_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    // Get stats
    const [stats] = await dbJmStore.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'topup' THEN amount ELSE 0 END), 0) as total_topups,
        COALESCE(SUM(CASE WHEN type = 'purchase' THEN ABS(amount) ELSE 0 END), 0) as total_spent,
        COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0) as total_withdrawals,
        COALESCE(SUM(CASE WHEN type IN ('topup', 'purchase', 'withdrawal') AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN amount ELSE 0 END), 0) as this_month
       FROM balance_history WHERE user_id = ?`,
      [userId]
    );

    res.json({
      history,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get balance history error:', error);
    res.status(500).json({ message: 'Failed to get balance history' });
  }
});

// User withdrawal request
app.post('/api/jmstore/user/withdraw', authenticateToken, async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { amount, bank_name, account_number, account_name, notes } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    
    // Check if user has sufficient balance
    if (currentBalance < amount) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
    }

    // Calculate new balance
    const newBalance = currentBalance - amount;

    // Create withdrawal request
    const [withdrawalResult] = await connection.execute(
      'INSERT INTO withdrawals (user_id, amount, balance_before, balance_after, bank_name, account_number, account_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, amount, currentBalance, newBalance, bank_name, account_number, account_name, notes]
    );

    // Update user balance immediately (will be refunded if rejected)
    await connection.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [amount, userId]
    );

    // Insert balance history
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_before, balance_after) VALUES (?, ?, "withdrawal", ?, ?, ?)',
      [userId, -amount, `Withdrawal request #${withdrawalResult.insertId}`, currentBalance, newBalance]
    );

    await connection.commit();

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawalResult.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Failed to submit withdrawal request' });
  } finally {
    connection.release();
  }
});

// Get user withdrawal history
app.get('/api/jmstore/user/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, dateFrom, dateTo } = req.query;

    let query = 'SELECT * FROM withdrawals WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at DESC';

    const [withdrawals] = await dbJmStore.execute(query, params);

    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Failed to get withdrawals' });
  }
});

// Admin Routes
app.get('/api/jmstore/admin/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get user count
    const [userCount] = await dbJmStore.execute('SELECT COUNT(*) as count FROM users');
    
    // Get transaction count and revenue
    const [transactionStats] = await dbJmStore.execute(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue FROM transactions WHERE status = "completed"'
    );

    // Get package count
    const [packageCount] = await dbJmStore.execute('SELECT COUNT(*) as count FROM packages');

    // Get recent transactions
    const [recentTransactions] = await dbJmStore.execute(
      'SELECT t.*, p.name as package_name, u.name as user_name FROM transactions t JOIN packages p ON t.package_id = p.id JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 10'
    );

    res.json({
      totalUsers: userCount[0].count,
      totalTransactions: transactionStats[0].count,
      totalRevenue: transactionStats[0].revenue,
      totalPackages: packageCount[0].count,
      recentTransactions
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to get admin stats' });
  }
});

app.get('/api/jmstore/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    // Get total count
    const [countResult] = await dbJmStore.execute(
      `SELECT COUNT(*) as total FROM users WHERE 1=1${whereClause}`,
      params
    );
    
    // Get paginated data
    const [users] = await dbJmStore.execute(
      `SELECT id, name, email, phone, role, balance, created_at 
       FROM users 
       WHERE 1=1${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

app.put('/api/jmstore/admin/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, balance } = req.body;

    await dbJmStore.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, balance = ? WHERE id = ?',
      [name, email, phone, role, balance, id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Admin deduct user balance endpoint
app.post('/api/jmstore/admin/users/:id/deduct-balance', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { amount, reason } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Invalid deduction amount' });
    }

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [id]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    
    // Check if user has sufficient balance
    if (currentBalance < amount) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient balance for deduction' });
    }

    // Calculate new balance
    const newBalance = currentBalance - amount;

    // Update user balance
    await connection.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [amount, id]
    );

    // Insert balance history for deduction
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_before, balance_after) VALUES (?, ?, "adjustment", ?, ?, ?)',
      [id, -amount, `Admin deduction: ${reason}`, currentBalance, newBalance]
    );

    await connection.commit();

    res.json({ 
      message: 'Balance deducted successfully',
      deductedAmount: amount,
      newBalance: newBalance
    });
  } catch (error) {
    await connection.rollback();
    console.error('Deduct balance error:', error);
    res.status(500).json({ message: 'Failed to deduct balance' });
  } finally {
    connection.release();
  }
});

app.get('/api/jmstore/admin/packages', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', type = '', provider = '', category = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR denomination LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    if (provider) {
      whereClause += ' AND provider = ?';
      params.push(provider);
    }
    
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await dbJmStore.execute(
      `SELECT COUNT(*) as total FROM packages WHERE 1=1${whereClause}`,
      params
    );
    
    // Get paginated data
    const [packages] = await dbJmStore.execute(
      `SELECT * FROM packages 
       WHERE 1=1${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: packages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Failed to get packages' });
  }
});

app.post('/api/jmstore/admin/packages', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      price_user, 
      price_seller, 
      price_reseller, 
      type, 
      provider, 
      denomination, 
      category,
      status,
      stock,
      available_for,
      package_api_id 
    } = req.body;

    // Set default prices if not provided
    const finalPriceUser = price_user || price;
    const finalPriceSeller = price_seller || (price * 0.95);
    const finalPriceReseller = price_reseller || (price * 0.90);
    const finalAvailableFor = available_for ? JSON.stringify(available_for) : JSON.stringify(['user', 'seller', 'reseller']);
    const finalStatus = status || 'active';
    const finalStock = stock || 0;

    const [result] = await dbJmStore.execute(
      'INSERT INTO packages (name, description, price, price_user, price_seller, price_reseller, type, provider, denomination, category, status, stock, available_for, package_api_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, finalPriceUser, finalPriceSeller, finalPriceReseller, type, provider, denomination, category, finalStatus, finalStock, finalAvailableFor, package_api_id]
    );

    res.json({ 
      message: 'Package created successfully',
      packageId: result.insertId 
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Failed to create package' });
  }
});

app.put('/api/jmstore/admin/packages/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      price_user, 
      price_seller, 
      price_reseller, 
      type, 
      provider, 
      denomination, 
      category,
      status,
      stock,
      available_for,
      package_api_id 
    } = req.body;

    // Set default prices if not provided
    const finalPriceUser = price_user || price;
    const finalPriceSeller = price_seller || (price * 0.95);
    const finalPriceReseller = price_reseller || (price * 0.90);
    const finalAvailableFor = available_for ? JSON.stringify(available_for) : JSON.stringify(['user', 'seller', 'reseller']);
    const finalStatus = status || 'active';
    const finalStock = stock || 0;

    await dbJmStore.execute(
      'UPDATE packages SET name = ?, description = ?, price = ?, price_user = ?, price_seller = ?, price_reseller = ?, type = ?, provider = ?, denomination = ?, category = ?, status = ?, stock = ?, available_for = ?, package_api_id = ? WHERE id = ?',
      [name, description, price, finalPriceUser, finalPriceSeller, finalPriceReseller, type, provider, denomination, category, finalStatus, finalStock, finalAvailableFor, package_api_id, id]
    );

    res.json({ message: 'Package updated successfully' });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Failed to update package' });
  }
});

app.delete('/api/jmstore/admin/packages/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await dbJmStore.execute('DELETE FROM packages WHERE id = ?', [id]);

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Failed to delete package' });
  }
});

app.get('/api/jmstore/admin/topups', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await dbJmStore.execute(
      `SELECT COUNT(*) as total FROM topups t JOIN users u ON t.user_id = u.id WHERE 1=1${whereClause}`,
      params
    );
    
    // Get paginated data
    const [topups] = await dbJmStore.execute(
      `SELECT t.*, u.name as user_name, u.email as user_email 
       FROM topups t JOIN users u ON t.user_id = u.id 
       WHERE 1=1${whereClause}
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: topups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get topups error:', error);
    res.status(500).json({ message: 'Failed to get topups' });
  }
});

app.post('/api/jmstore/admin/topups', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId, amount, description } = req.body;

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    const newBalance = currentBalance + amount;

    // Insert topup
    const [topupResult] = await connection.execute(
      'INSERT INTO topups (user_id, amount, type, description, status) VALUES (?, ?, "manual", ?, "approved")',
      [userId, amount, description]
    );

    // Update user balance
    await connection.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [amount, userId]
    );

    // Insert balance history
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_after) VALUES (?, ?, "topup", ?, ?)',
      [userId, amount, description || 'Manual topup by admin', newBalance]
    );

    await connection.commit();

    res.json({ 
      message: 'Manual topup added successfully',
      topupId: topupResult.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Manual topup error:', error);
    res.status(500).json({ message: 'Failed to add manual topup' });
  } finally {
    connection.release();
  }
});

app.put('/api/jmstore/admin/topups/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    // Get topup details
    const [topups] = await connection.execute(
      'SELECT * FROM topups WHERE id = ? AND status = "pending"',
      [id]
    );

    if (topups.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Topup not found or already processed' });
    }

    const topup = topups[0];

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [topup.user_id]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    const newBalance = currentBalance + topup.amount;

    // Update topup status to approved
    await connection.execute(
      'UPDATE topups SET status = "approved" WHERE id = ?',
      [id]
    );

    // Update user balance
    await connection.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [topup.amount, topup.user_id]
    );

    // Insert balance history
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_after) VALUES (?, ?, "topup", ?, ?)',
      [topup.user_id, topup.amount, topup.description || 'Topup approved', newBalance]
    );

    await connection.commit();

    res.json({ message: 'Topup approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve topup error:', error);
    res.status(500).json({ message: 'Failed to approve topup' });
  } finally {
    connection.release();
  }
});

app.put('/api/jmstore/admin/topups/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Update topup status to rejected
    const [result] = await dbJmStore.execute(
      'UPDATE topups SET status = "rejected" WHERE id = ? AND status = "pending"',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Topup not found or already processed' });
    }

    res.json({ message: 'Topup rejected successfully' });
  } catch (error) {
    console.error('Reject topup error:', error);
    res.status(500).json({ message: 'Failed to reject topup' });
  }
});

// Admin transaction approval endpoint
app.put('/api/jmstore/admin/transactions/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    // Get transaction details
    const [transactions] = await connection.execute(
      'SELECT t.*, p.name as package_name FROM transactions t JOIN packages p ON t.package_id = p.id WHERE t.id = ? AND t.status = "pending"',
      [id]
    );

    if (transactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found or already processed' });
    }

    const transaction = transactions[0];

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [transaction.user_id]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    const newBalance = currentBalance - transaction.amount;

    // Check if user has sufficient balance
    if (currentBalance < transaction.amount) {
      await connection.rollback();
      return res.status(400).json({ message: 'User has insufficient balance' });
    }

    // Update transaction status to completed
    await connection.execute(
      'UPDATE transactions SET status = "completed" WHERE id = ?',
      [id]
    );

    // Update user balance
    await connection.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [transaction.amount, transaction.user_id]
    );

    // Insert balance history
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_after) VALUES (?, ?, "purchase", ?, ?)',
      [transaction.user_id, -transaction.amount, `Purchase ${transaction.package_name} (approved)`, newBalance]
    );

    await connection.commit();

    res.json({ message: 'Transaction approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve transaction error:', error);
    res.status(500).json({ message: 'Failed to approve transaction' });
  } finally {
    connection.release();
  }
});

app.put('/api/jmstore/admin/transactions/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    // Get transaction details
    const [transactions] = await connection.execute(
      'SELECT t.*, p.name as package_name FROM transactions t JOIN packages p ON t.package_id = p.id WHERE t.id = ? AND t.status = "pending"',
      [id]
    );

    if (transactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found or already processed' });
    }

    const transaction = transactions[0];

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [transaction.user_id]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    const newBalance = currentBalance + transaction.amount;

    // Update transaction status to failed
    await connection.execute(
      'UPDATE transactions SET status = "failed" WHERE id = ?',
      [id]
    );

    // Refund user balance
    await connection.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [transaction.amount, transaction.user_id]
    );

    // Insert balance history for refund
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_after) VALUES (?, ?, "refund", ?, ?)',
      [transaction.user_id, transaction.amount, `Refund for rejected transaction #${transaction.id} - ${transaction.package_name}`, newBalance]
    );

    await connection.commit();

    res.json({ message: 'Transaction rejected successfully. User has been refunded.' });
  } catch (error) {
    await connection.rollback();
    console.error('Reject transaction error:', error);
    res.status(500).json({ message: 'Failed to reject transaction' });
  } finally {
    connection.release();
  }
});

// Admin withdrawal management endpoints
app.get('/api/jmstore/admin/withdrawals', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR w.account_name LIKE ? OR w.account_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND w.status = ?';
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await dbJmStore.execute(
      `SELECT COUNT(*) as total FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE 1=1${whereClause}`,
      params
    );
    
    // Get paginated data
    const [withdrawals] = await dbJmStore.execute(
      `SELECT w.*, u.name as user_name, u.email as user_email 
       FROM withdrawals w JOIN users u ON w.user_id = u.id 
       WHERE 1=1${whereClause}
       ORDER BY w.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: withdrawals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Failed to get withdrawals' });
  }
});

app.put('/api/jmstore/admin/withdrawals/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Update withdrawal status to approved
    const [result] = await dbJmStore.execute(
      'UPDATE withdrawals SET status = "approved", approved_by = ?, approved_at = NOW(), notes = ? WHERE id = ? AND status = "pending"',
      [req.user.id, notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Withdrawal not found or already processed' });
    }

    res.json({ message: 'Withdrawal approved successfully' });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Failed to approve withdrawal' });
  }
});

app.put('/api/jmstore/admin/withdrawals/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await dbJmStore.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { notes } = req.body;

    // Get withdrawal details
    const [withdrawals] = await connection.execute(
      'SELECT * FROM withdrawals WHERE id = ? AND status = "pending"',
      [id]
    );

    if (withdrawals.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Withdrawal not found or already processed' });
    }

    const withdrawal = withdrawals[0];

    // Get current user balance
    const [userResult] = await connection.execute(
      'SELECT balance FROM users WHERE id = ?',
      [withdrawal.user_id]
    );
    
    if (userResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentBalance = parseFloat(userResult[0].balance) || 0;
    const newBalance = currentBalance + withdrawal.amount;

    // Update withdrawal status to rejected
    await connection.execute(
      'UPDATE withdrawals SET status = "rejected", approved_by = ?, approved_at = NOW(), notes = ? WHERE id = ?',
      [req.user.id, notes, id]
    );

    // Refund user balance
    await connection.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [withdrawal.amount, withdrawal.user_id]
    );

    // Insert balance history for refund
    await connection.execute(
      'INSERT INTO balance_history (user_id, amount, type, description, balance_before, balance_after) VALUES (?, ?, "refund", ?, ?, ?)',
      [withdrawal.user_id, withdrawal.amount, `Refund for rejected withdrawal #${withdrawal.id}`, currentBalance, newBalance]
    );

    await connection.commit();

    res.json({ message: 'Withdrawal rejected successfully. User has been refunded.' });
  } catch (error) {
    await connection.rollback();
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Failed to reject withdrawal' });
  } finally {
    connection.release();
  }
});

// Admin Transactions Routes
app.get('/api/jmstore/admin/transactions', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', type = '', dateFrom = '', dateTo = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR p.name LIKE ? OR t.phone_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }
    
    if (type) {
      whereClause += ' AND p.type = ?';
      params.push(type);
    }
    
    if (dateFrom) {
      whereClause += ' AND DATE(t.created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND DATE(t.created_at) <= ?';
      params.push(dateTo);
    }
    
    // Get total count
    const [countResult] = await dbJmStore.execute(
      `SELECT COUNT(*) as total FROM transactions t 
       JOIN packages p ON t.package_id = p.id 
       JOIN users u ON t.user_id = u.id 
       WHERE 1=1${whereClause}`,
      params
    );
    
    // Get paginated data
    const [transactions] = await dbJmStore.execute(
      `SELECT t.*, p.name as package_name, p.type as package_type, p.provider, u.name as user_name, u.email as user_email 
       FROM transactions t 
       JOIN packages p ON t.package_id = p.id 
       JOIN users u ON t.user_id = u.id 
       WHERE 1=1${whereClause}
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get balance adjustments (deductions) from balance_history
    let adjustmentWhereClause = '';
    const adjustmentParams = [];
    
    if (search) {
      adjustmentWhereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR bh.description LIKE ?)';
      adjustmentParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      adjustmentWhereClause += ' AND bh.type = ?';
      adjustmentParams.push(status === 'completed' ? 'adjustment' : '');
    }
    
    if (type && type === 'adjustment') {
      // Only include adjustments
    } else if (type && type !== 'adjustment') {
      // Skip adjustments if other type is selected
      adjustmentWhereClause += ' AND 1=0';
    }
    
    if (dateFrom) {
      adjustmentWhereClause += ' AND DATE(bh.created_at) >= ?';
      adjustmentParams.push(dateFrom);
    }
    
    if (dateTo) {
      adjustmentWhereClause += ' AND DATE(bh.created_at) <= ?';
      adjustmentParams.push(dateTo);
    }

    const [adjustments] = await dbJmStore.execute(
      `SELECT 
        bh.id,
        bh.created_at,
        ABS(bh.amount) as amount,
        'completed' as status,
        NULL as phone_number,
        NULL as package_name,
        NULL as package_type,
        NULL as provider,
        u.name as user_name,
        u.email as user_email,
        bh.description,
        'adjustment' as transaction_type
       FROM balance_history bh
       JOIN users u ON bh.user_id = u.id
       WHERE bh.type = 'adjustment'${adjustmentWhereClause}
       ORDER BY bh.created_at DESC
       LIMIT ? OFFSET ?`,
      [...adjustmentParams, parseInt(limit), offset]
    );

    // Combine and sort all transactions
    const allTransactions = [...transactions, ...adjustments];
    allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      data: allTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin transactions error:', error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
});

app.get('/api/jmstore/admin/transactions/export', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search = '', status = '', type = '', dateFrom = '', dateTo = '' } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR p.name LIKE ? OR t.phone_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }
    
    if (type) {
      whereClause += ' AND p.type = ?';
      params.push(type);
    }
    
    if (dateFrom) {
      whereClause += ' AND DATE(t.created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND DATE(t.created_at) <= ?';
      params.push(dateTo);
    }
    
    const [transactions] = await dbJmStore.execute(
      `SELECT t.id, t.phone_number, t.amount, t.status, t.created_at, 
              p.name as package_name, p.type as package_type, p.provider,
              u.name as user_name, u.email as user_email 
       FROM transactions t 
       JOIN packages p ON t.package_id = p.id 
       JOIN users u ON t.user_id = u.id 
       WHERE 1=1${whereClause}
       ORDER BY t.created_at DESC`,
      params
    );

    // Convert to CSV
    const csvHeader = 'Transaction ID,User Name,User Email,Package Name,Package Type,Provider,Phone Number,Amount,Status,Date\n';
    const csvData = transactions.map(t => 
      `${t.id},"${t.user_name}","${t.user_email}","${t.package_name}","${t.package_type}","${t.provider}","${t.phone_number}",${t.amount},"${t.status}","${t.created_at}"`
    ).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ message: 'Failed to export transactions' });
  }
});

// Admin Profit Report Routes
app.get('/api/jmstore/admin/profit-report', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Validate date parameters
    if (!from || !to) {
      return res.status(400).json({ message: 'Date range is required' });
    }

    // Get total profit for the date range
    const [totalProfitResult] = await dbJmStore.execute(
      'SELECT COALESCE(SUM(amount), 0) as total_profit FROM transactions WHERE status = "completed" AND DATE(created_at) BETWEEN ? AND ?',
      [from, to]
    );

    // Get monthly profit (current month)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const [monthlyProfitResult] = await dbJmStore.execute(
      'SELECT COALESCE(SUM(amount), 0) as monthly_profit FROM transactions WHERE status = "completed" AND DATE_FORMAT(created_at, "%Y-%m") = ?',
      [currentMonth]
    );

    // Calculate profit growth (compare with previous month)
    const previousMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7);
    const [previousMonthResult] = await dbJmStore.execute(
      'SELECT COALESCE(SUM(amount), 0) as previous_month_profit FROM transactions WHERE status = "completed" AND DATE_FORMAT(created_at, "%Y-%m") = ?',
      [previousMonth]
    );

    const currentMonthProfit = parseFloat(monthlyProfitResult[0].monthly_profit) || 0;
    const previousMonthProfit = parseFloat(previousMonthResult[0].previous_month_profit) || 0;
    
    let profitGrowth = 0;
    if (previousMonthProfit > 0) {
      profitGrowth = ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100;
    }

    // Get top selling packages for the date range
    const [topPackagesResult] = await dbJmStore.execute(
      `SELECT 
        p.id,
        p.name,
        p.type,
        p.provider,
        COUNT(t.id) as total_sales,
        COALESCE(SUM(t.amount), 0) as total_profit
       FROM packages p
       LEFT JOIN transactions t ON p.id = t.package_id 
         AND t.status = "completed" 
         AND DATE(t.created_at) BETWEEN ? AND ?
       WHERE p.status = "active"
       GROUP BY p.id, p.name, p.type, p.provider
       HAVING total_sales > 0
       ORDER BY total_profit DESC
       LIMIT 10`,
      [from, to]
    );

    // Get monthly data for the last 6 months
    const [monthlyDataResult] = await dbJmStore.execute(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(amount), 0) as profit
       FROM transactions 
       WHERE status = "completed" 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC
       LIMIT 6`
    );

    // Format monthly data with month names
    const monthNames = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const monthlyData = monthlyDataResult.map(row => ({
      month: `${monthNames[row.month.split('-')[1]]} ${row.month.split('-')[0]}`,
      profit: parseFloat(row.profit) || 0
    }));

    res.json({
      totalProfit: parseFloat(totalProfitResult[0].total_profit) || 0,
      monthlyProfit: currentMonthProfit,
      profitGrowth: profitGrowth,
      topPackages: topPackagesResult.map(pkg => ({
        ...pkg,
        total_sales: parseInt(pkg.total_sales) || 0,
        total_profit: parseFloat(pkg.total_profit) || 0
      })),
      monthlyData: monthlyData
    });
  } catch (error) {
    console.error('Get profit report error:', error);
    res.status(500).json({ message: 'Failed to get profit report' });
  }
});

// Admin create user endpoint
app.post('/api/jmstore/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user', balance = 0 } = req.body;
    
    // Check if user exists
    const [existingUsers] = await dbJmStore.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await dbJmStore.execute(
      'INSERT INTO users (name, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role, balance]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Admin WhatsApp Gateway Settings endpoints
app.get('/api/jmstore/admin/whatsapp-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get WhatsApp gateway settings
    const [apiSettings] = await dbJmStore.execute(
      'SELECT * FROM api_settings WHERE provider = "whatsapp_gateway" LIMIT 1'
    );
    
    // Get admin WhatsApp number
    const [systemSettings] = await dbJmStore.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "whatsapp_admin_number" LIMIT 1'
    );
    
    res.json({
      whatsappSettings: apiSettings[0] || null,
      adminNumber: systemSettings[0]?.setting_value || '08123456789'
    });
  } catch (error) {
    console.error('Get WhatsApp settings error:', error);
    res.status(500).json({ message: 'Failed to get WhatsApp settings' });
  }
});

app.put('/api/jmstore/admin/whatsapp-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { endpoint_url, api_key, api_secret, admin_number } = req.body;
    
    // Update or insert WhatsApp gateway settings
    const [existingSettings] = await dbJmStore.execute(
      'SELECT id FROM api_settings WHERE provider = "whatsapp_gateway" LIMIT 1'
    );
    
    if (existingSettings.length > 0) {
      // Update existing settings
      await dbJmStore.execute(
        'UPDATE api_settings SET endpoint_url = ?, api_key = ?, api_secret = ? WHERE provider = "whatsapp_gateway"',
        [endpoint_url, api_key, api_secret]
      );
    } else {
      // Insert new settings
      await dbJmStore.execute(
        'INSERT INTO api_settings (provider, endpoint_url, api_key, api_secret, is_active) VALUES (?, ?, ?, ?, TRUE)',
        ['whatsapp_gateway', endpoint_url, api_key, api_secret]
      );
    }
    
    // Update admin WhatsApp number
    await dbJmStore.execute(
      'INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      ['whatsapp_admin_number', admin_number, 'Admin WhatsApp number for manual order notifications']
    );
    
    res.json({ message: 'WhatsApp settings updated successfully' });
  } catch (error) {
    console.error('Update WhatsApp settings error:', error);
    res.status(500).json({ message: 'Failed to update WhatsApp settings' });
  }
});

app.post('/api/jmstore/admin/test-whatsapp', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { test_message = 'Test WhatsApp notification from Pulsa Store' } = req.body;
    
    // Get WhatsApp gateway settings
    const [apiSettings] = await dbJmStore.execute(
      'SELECT endpoint_url, api_key, api_secret FROM api_settings WHERE provider = "whatsapp_gateway" AND is_active = TRUE LIMIT 1'
    );
    
    if (apiSettings.length === 0) {
      return res.status(400).json({ message: 'WhatsApp gateway settings not found' });
    }
    
    const whatsappSettings = apiSettings[0];
    
    // Get admin WhatsApp number
    const [systemSettings] = await dbJmStore.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "whatsapp_notification" LIMIT 1'
    );
    
    const adminWhatsAppNumber = systemSettings[0]?.setting_value || '6282235365392';
    
    // Prepare WhatsApp API payload
    const whatsappPayload = {
      token: whatsappSettings.api_key,
      instance_id: whatsappSettings.api_secret,
      jid: `${adminWhatsAppNumber}@s.whatsapp.net`,
      msg: test_message
    };
    
    // Send test WhatsApp notification
    const whatsappResponse = await axios.get(
      whatsappSettings.endpoint_url,
      {
        params: whatsappPayload,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );
    
    res.json({ 
      message: 'Test WhatsApp notification sent successfully',
      response: whatsappResponse.data
    });
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ 
      message: 'Failed to send test WhatsApp notification',
      error: error.message 
    });
  }
});

// Admin update user password endpoint
app.put('/api/jmstore/admin/users/:id/password', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await dbJmStore.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Topup Account Settings endpoints
app.get('/api/jmstore/admin/topup-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [settings] = await dbJmStore.execute(
      'SELECT * FROM topup_account_settings ORDER BY sort_order ASC'
    );
    
    res.json({ data: settings });
  } catch (error) {
    console.error('Get topup settings error:', error);
    res.status(500).json({ message: 'Failed to get topup settings' });
  }
});

app.post('/api/jmstore/admin/topup-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      payment_method, 
      display_name, 
      account_name, 
      account_number, 
      bank_name, 
      qr_code_url, 
      instructions, 
      minimum_amount, 
      maximum_amount, 
      is_active, 
      sort_order 
    } = req.body;

    const [result] = await dbJmStore.execute(
      `INSERT INTO topup_account_settings 
       (payment_method, display_name, account_name, account_number, bank_name, qr_code_url, instructions, minimum_amount, maximum_amount, is_active, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payment_method, display_name, account_name, account_number, bank_name, qr_code_url, instructions, minimum_amount, maximum_amount, is_active, sort_order]
    );

    res.status(201).json({ 
      message: 'Topup setting created successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Create topup setting error:', error);
    res.status(500).json({ message: 'Failed to create topup setting' });
  }
});

app.put('/api/jmstore/admin/topup-settings/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      payment_method, 
      display_name, 
      account_name, 
      account_number, 
      bank_name, 
      qr_code_url, 
      instructions, 
      minimum_amount, 
      maximum_amount, 
      is_active, 
      sort_order 
    } = req.body;

    await dbJmStore.execute(
      `UPDATE topup_account_settings SET 
       payment_method = ?, display_name = ?, account_name = ?, account_number = ?, bank_name = ?, 
       qr_code_url = ?, instructions = ?, minimum_amount = ?, maximum_amount = ?, is_active = ?, sort_order = ? 
       WHERE id = ?`,
      [payment_method, display_name, account_name, account_number, bank_name, qr_code_url, instructions, minimum_amount, maximum_amount, is_active, sort_order, id]
    );

    res.json({ message: 'Topup setting updated successfully' });
  } catch (error) {
    console.error('Update topup setting error:', error);
    res.status(500).json({ message: 'Failed to update topup setting' });
  }
});

app.delete('/api/jmstore/admin/topup-settings/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await dbJmStore.execute(
      'DELETE FROM topup_account_settings WHERE id = ?',
      [id]
    );

    res.json({ message: 'Topup setting deleted successfully' });
  } catch (error) {
    console.error('Delete topup setting error:', error);
    res.status(500).json({ message: 'Failed to delete topup setting' });
  }
});

// User get topup payment methods endpoint
app.get('/api/jmstore/user/topup-methods', authenticateToken, async (req, res) => {
  try {
    const [methods] = await dbJmStore.execute(
      'SELECT * FROM topup_account_settings WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    
    res.json({ data: methods });
  } catch (error) {
    console.error('Get topup methods error:', error);
    res.status(500).json({ message: 'Failed to get topup methods' });
  }
});

// API Settings Management endpoints
app.get('/api/jmstore/admin/api-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [settings] = await dbJmStore.execute(
      'SELECT * FROM api_settings ORDER BY provider ASC'
    );
    
    res.json({ data: settings });
  } catch (error) {
    console.error('Get API settings error:', error);
    res.status(500).json({ message: 'Failed to get API settings' });
  }
});

app.post('/api/jmstore/admin/api-settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      provider, 
      api_key, 
      api_secret, 
      endpoint_url, 
      method = 'GET',
      is_active = true 
    } = req.body;

    if (!provider) {
      return res.status(400).json({ message: 'Provider is required' });
    }

    const [result] = await dbJmStore.execute(
      `INSERT INTO api_settings 
       (provider, api_key, api_secret, endpoint_url, method, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider, api_key, api_secret, endpoint_url, method, is_active]
    );

    res.status(201).json({ 
      message: 'API setting created successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Create API setting error:', error);
    res.status(500).json({ message: 'Failed to create API setting' });
  }
});

app.put('/api/jmstore/admin/api-settings/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      provider, 
      api_key, 
      api_secret, 
      endpoint_url, 
      method = 'GET',
      is_active = true 
    } = req.body;

    if (!provider) {
      return res.status(400).json({ message: 'Provider is required' });
    }

    await dbJmStore.execute(
      `UPDATE api_settings SET 
       provider = ?, api_key = ?, api_secret = ?, endpoint_url = ?, method = ?, is_active = ? 
       WHERE id = ?`,
      [provider, api_key, api_secret, endpoint_url, method, is_active, id]
    );

    res.json({ message: 'API setting updated successfully' });
  } catch (error) {
    console.error('Update API setting error:', error);
    res.status(500).json({ message: 'Failed to update API setting' });
  }
});

app.delete('/api/jmstore/admin/api-settings/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await dbJmStore.execute(
      'DELETE FROM api_settings WHERE id = ?',
      [id]
    );

    res.json({ message: 'API setting deleted successfully' });
  } catch (error) {
    console.error('Delete API setting error:', error);
    res.status(500).json({ message: 'Failed to delete API setting' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});