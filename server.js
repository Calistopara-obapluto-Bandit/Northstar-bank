const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL Connection (Replit built-in database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@helium/heliumdb?sslmode=disable',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0,
        account_number VARCHAR(50),
        interest_rate VARCHAR(50),
        interest_ytd DECIMAL(10, 2),
        credit_limit DECIMAL(10, 2),
        rewards_points INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        account_id INTEGER REFERENCES accounts(id),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create goals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        target_amount DECIMAL(10, 2) NOT NULL,
        current_amount DECIMAL(10, 2) DEFAULT 0,
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database
initDB();

// API Routes

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, password, name, phone]
    );
    const userId = userResult.rows[0].id;
    
    // Create default accounts
    await pool.query(
      'INSERT INTO accounts (user_id, type, balance, account_number, interest_rate, interest_ytd) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'checking', 12458.42, '**** 4821', '0.01% APY', 12.45]
    );
    
    await pool.query(
      'INSERT INTO accounts (user_id, type, balance, account_number, interest_rate, interest_ytd) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'savings', 10915.67, '**** 9064', '2.50% APY', 272.89]
    );
    
    await pool.query(
      'INSERT INTO accounts (user_id, type, balance, account_number, credit_limit, rewards_points) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'credit', 1284.33, '**** 1139', 10000, 2450]
    );
    
    // Create default goals
    await pool.query(
      'INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'Home Down Payment', '🏠', 20000, 13600, '2027-12-01']
    );
    
    await pool.query(
      'INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'New Car', '🚗', 10000, 4200, '2027-06-01']
    );
    
    await pool.query(
      'INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'Vacation Fund', '🌴', 3000, 2550, '2026-08-01']
    );
    
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    res.json({ message: 'Sign in successful', userId: user.id, name: user.name });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Accounts
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Transactions
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 50',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Transaction
app.post('/api/transactions', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { userId, accountId, type, amount, description, category } = req.body;
    
    // Create transaction
    const result = await client.query(
      'INSERT INTO transactions (user_id, account_id, type, amount, description, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, accountId, type, amount, description, category]
    );
    
    // Update account balance
    if (type === 'deposit' || type === 'transfer') {
      await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, accountId]);
    } else {
      await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, accountId]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get Goals
app.get('/api/goals/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Goal
app.post('/api/goals', async (req, res) => {
  try {
    const { userId, name, icon, targetAmount, currentAmount, deadline } = req.body;
    const result = await pool.query(
      'INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, icon, targetAmount, currentAmount, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Goal
app.put('/api/goals/:id', async (req, res) => {
  try {
    const { name, icon, targetAmount, currentAmount, deadline } = req.body;
    const result = await pool.query(
      'UPDATE goals SET name = $1, icon = $2, target_amount = $3, current_amount = $4, deadline = $5 WHERE id = $6 RETURNING *',
      [name, icon, targetAmount, currentAmount, deadline, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Northstar Bank server running on port ${PORT}`);
  console.log(`📊 Using PostgreSQL database`);
});
