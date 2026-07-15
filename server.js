const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/northstar-bank';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Account Schema
const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['checking', 'savings', 'credit'], required: true },
  balance: { type: Number, default: 0 },
  accountNumber: String,
  interestRate: String,
  interestYTD: Number,
  creditLimit: Number,
  rewardsPoints: Number,
  createdAt: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'payment'], required: true },
  amount: { type: Number, required: true },
  description: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Goal Schema
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: String,
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', goalSchema);

// API Routes

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ email, password, name, phone });
    await user.save();
    
    // Create default accounts
    const checkingAccount = new Account({
      userId: user._id,
      type: 'checking',
      balance: 12458.42,
      accountNumber: '**** 4821',
      interestRate: '0.01% APY',
      interestYTD: 12.45
    });
    
    const savingsAccount = new Account({
      userId: user._id,
      type: 'savings',
      balance: 10915.67,
      accountNumber: '**** 9064',
      interestRate: '2.50% APY',
      interestYTD: 272.89
    });
    
    const creditAccount = new Account({
      userId: user._id,
      type: 'credit',
      balance: 1284.33,
      accountNumber: '**** 1139',
      creditLimit: 10000,
      rewardsPoints: 2450
    });
    
    await Promise.all([checkingAccount.save(), savingsAccount.save(), creditAccount.save()]);
    
    // Create default goals
    const goals = [
      { userId: user._id, name: 'Home Down Payment', icon: '🏠', targetAmount: 20000, currentAmount: 13600, deadline: new Date('2027-12-01') },
      { userId: user._id, name: 'New Car', icon: '🚗', targetAmount: 10000, currentAmount: 4200, deadline: new Date('2027-06-01') },
      { userId: user._id, name: 'Vacation Fund', icon: '🌴', targetAmount: 3000, currentAmount: 2550, deadline: new Date('2026-08-01') }
    ];
    
    await Goal.insertMany(goals);
    
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ message: 'Sign in successful', userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Account Routes
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.params.userId });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction Routes
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    
    // Update account balance
    const account = await Account.findById(req.body.accountId);
    if (account) {
      if (req.body.type === 'deposit' || req.body.type === 'transfer') {
        account.balance += req.body.amount;
      } else {
        account.balance -= req.body.amount;
      }
      await account.save();
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Goal Routes
app.get('/api/goals/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Northstar Bank server running on port ${PORT}`);
});
