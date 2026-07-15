# Northstar Bank

A professional banking application with a modern interface.

## Features

- Account Management (Checking, Savings, Credit Cards)
- Money Transfers
- Bill Pay
- Card Management
- Savings Goals Tracking
- Transaction History
- Responsive Design

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Deployment**: Cyclic.sh

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get your connection string
   - Create a `.env` file with your connection string:
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/northstar-bank?retryWrites=true&w=majority
PORT=3000
```

3. Run the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment to Cyclic.sh

1. Push your code to GitHub

2. Go to [Cyclic.sh](https://cyclic.sh)

3. Click "New Project" and connect your GitHub repository

4. Cyclic will automatically detect it as a Node.js project

5. Add your MongoDB Atlas connection string as an environment variable:
   - Go to Project Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string
   - Add `PORT` with value `3000`

6. Click "Deploy"

7. Your app will be live at `https://your-app-name.cyclic.app`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/signin` - Sign in existing user

### Accounts
- `GET /api/accounts/:userId` - Get user's accounts

### Transactions
- `GET /api/transactions/:userId` - Get user's transactions
- `POST /api/transactions` - Create a new transaction

### Goals
- `GET /api/goals/:userId` - Get user's savings goals
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/:id` - Update a goal

## Pages

- `index.html` - Landing page
- `dashboard.html` - Account overview
- `accounts.html` - Account details
- `transfers.html` - Money transfers
- `payments.html` - Bill pay
- `cards.html` - Card management
- `goals.html` - Savings goals
- `statements.html` - Account statements
- `support.html` - Help & support
- `locations.html` - Branch locations
- `products.html` - Banking products
- `borrow.html` - Lending options
- `invest.html` - Investment options
- `security.html` - Security center

## Credits

Northstar Bank - Banking made clear.
