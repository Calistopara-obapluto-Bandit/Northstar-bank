const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => console.error('Database connection error:', err));

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, name, phone } = req.body;

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    await client.query('BEGIN');

    const userResult = await client.query(
      'INSERT INTO users (email, password, name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, password, name, phone || null]
    );
    const userId = userResult.rows[0].id;

    // Create default accounts
    await client.query(
      `INSERT INTO accounts (user_id, type, balance, account_number, interest_rate, interest_ytd)
       VALUES ($1, 'checking', 12458.42, '**** 4821', '0.01% APY', 12.45),
              ($1, 'savings',  10915.67, '**** 9064', '2.50% APY', 272.89)`,
      [userId]
    );
    await client.query(
      `INSERT INTO accounts (user_id, type, balance, account_number, credit_limit, rewards_points)
       VALUES ($1, 'credit', 1284.33, '**** 1139', 10000, 2450)`,
      [userId]
    );

    // Create default goals
    await client.query(
      `INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES
       ($1, 'Home Down Payment', '🏠', 20000, 13600, '2027-12-01'),
       ($1, 'New Car',           '🚗', 10000, 4200,  '2027-06-01'),
       ($1, 'Vacation Fund',     '🌴', 3000,  2550,  '2026-08-01')`,
      [userId]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    res.json({ message: 'Sign in successful', userId: user.id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Account Routes ───────────────────────────────────────────────────────────

app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY type',
      [req.params.userId]
    );
    // Map snake_case → camelCase so the frontend doesn't need changes
    const accounts = result.rows.map(r => ({
      _id: r.id,
      userId: r.user_id,
      type: r.type,
      balance: parseFloat(r.balance),
      accountNumber: r.account_number,
      interestRate: r.interest_rate,
      interestYTD: r.interest_ytd ? parseFloat(r.interest_ytd) : null,
      creditLimit: r.credit_limit ? parseFloat(r.credit_limit) : null,
      rewardsPoints: r.rewards_points,
      createdAt: r.created_at
    }));
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Transaction Routes ───────────────────────────────────────────────────────

app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 50',
      [req.params.userId]
    );
    const transactions = result.rows.map(r => ({
      _id: r.id,
      userId: r.user_id,
      accountId: r.account_id,
      type: r.type,
      amount: parseFloat(r.amount),
      description: r.description,
      category: r.category,
      date: r.date
    }));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, accountId, type, amount, description, category } = req.body;

    await client.query('BEGIN');

    const txResult = await client.query(
      `INSERT INTO transactions (user_id, account_id, type, amount, description, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, accountId || null, type, amount, description || null, category || null]
    );

    if (accountId) {
      const delta = (type === 'deposit' || type === 'transfer') ? amount : -amount;
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [delta, accountId]
      );
    }

    await client.query('COMMIT');

    const r = txResult.rows[0];
    res.status(201).json({
      _id: r.id, userId: r.user_id, accountId: r.account_id,
      type: r.type, amount: parseFloat(r.amount),
      description: r.description, category: r.category, date: r.date
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ─── Goal Routes ──────────────────────────────────────────────────────────────

app.get('/api/goals/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at',
      [req.params.userId]
    );
    const goals = result.rows.map(r => ({
      _id: r.id,
      userId: r.user_id,
      name: r.name,
      icon: r.icon,
      targetAmount: parseFloat(r.target_amount),
      currentAmount: parseFloat(r.current_amount),
      deadline: r.deadline,
      createdAt: r.created_at
    }));
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { userId, name, icon, targetAmount, currentAmount, deadline } = req.body;
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, name, icon || null, targetAmount, currentAmount || 0, deadline || null]
    );
    const r = result.rows[0];
    res.status(201).json({
      _id: r.id, userId: r.user_id, name: r.name, icon: r.icon,
      targetAmount: parseFloat(r.target_amount),
      currentAmount: parseFloat(r.current_amount),
      deadline: r.deadline, createdAt: r.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const { name, icon, targetAmount, currentAmount, deadline } = req.body;
    const result = await pool.query(
      `UPDATE goals
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           target_amount = COALESCE($3, target_amount),
           current_amount = COALESCE($4, current_amount),
           deadline = COALESCE($5, deadline)
       WHERE id = $6 RETURNING *`,
      [name, icon, targetAmount, currentAmount, deadline, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
    const r = result.rows[0];
    res.json({
      _id: r.id, userId: r.user_id, name: r.name, icon: r.icon,
      targetAmount: parseFloat(r.target_amount),
      currentAmount: parseFloat(r.current_amount),
      deadline: r.deadline, createdAt: r.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Static fallback ──────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Northstar Bank server running on port ${PORT}`);
});
