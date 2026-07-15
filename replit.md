# Northstar Bank

A professional banking web application with a modern interface, built with Node.js/Express and MongoDB Atlas.

## How to run

The app is configured to start automatically via the **Start application** workflow (`npm start`). It serves on port 5000.

## Required secrets

| Secret | Description |
|--------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) |

## Stack

- **Frontend**: Static HTML/CSS/JS pages served by Express
- **Backend**: Node.js + Express REST API (`server.js`)
- **Database**: MongoDB Atlas via Mongoose

## Key pages

- `/` — Landing page (`index.html`)
- `/login.html` — Sign in / sign up
- `/dashboard.html` — Account overview
- `/accounts.html` — Account details
- `/transfers.html` — Money transfers
- `/payments.html` — Bill pay
- `/cards.html` — Card management
- `/goals.html` — Savings goals

## API endpoints

- `POST /api/auth/signup` — Register new user (creates default accounts + goals)
- `POST /api/auth/signin` — Sign in
- `GET /api/accounts/:userId` — Get user accounts
- `GET /api/transactions/:userId` — Get transactions
- `POST /api/transactions` — Create transaction
- `GET /api/goals/:userId` — Get savings goals
- `POST /api/goals` — Create goal
- `PUT /api/goals/:id` — Update goal

## User preferences

<!-- Add user preferences here -->
