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

- **Frontend**: Static HTML, CSS, and vanilla JavaScript
- **Backend**: FastAPI (Python) with SQLite persistence (`backend/`)
- **Auth**: Real sign up / sign in — passwords hashed with bcrypt, sessions via JWT

Sign up creates a persistent user record (hashed password) and seeds demo
accounts, goals, and transactions for that member. The frontend stores the
returned JWT in `localStorage` and uses it to load the member's data from
`GET /api/me`; protected pages verify the token server-side before revealing
the dashboard.

### API

- `POST /api/auth/signup` — `{ name, email, password, phone? }` → `{ token, name, email }`
- `POST /api/auth/signin` — `{ email, password }` → `{ token, name, email }`
- `GET /api/me` — send the JWT via the `X-Auth-Token` header (or `Authorization: Bearer`) → member + accounts/goals/transactions

Config via env vars: `JWT_SECRET` (set a strong value in production), `DB_PATH`
(SQLite file location), and `STATIC_DIR` (optional — when set, the API also
serves the frontend from the same origin).

## Local Development

Run the FastAPI backend, which can also serve the frontend from the same origin:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
STATIC_DIR=.. uvicorn main:app --reload --port 8000
```

Then open `http://localhost:8000`. Sign up creates a real account; sign back in
later to see it persisted.

To serve the frontend separately (e.g. a static host), point it at the API by
setting `window.NORTHSTAR_API_BASE` to the backend URL before `js/auth.js` loads.

## Deployment

The backend needs a server-capable host (it runs a Python/ASGI process and
writes to SQLite). The included `Dockerfile` builds a single container that
runs the API and serves the frontend from the same origin (`STATIC_DIR=/app`),
persisting SQLite to `/data/northstar.db` — mount a volume there. Set a strong
`JWT_SECRET`. This deploys as-is to any container host (Railway, Render,
Fly.io, etc.). Alternatively, host the static files separately and set
`window.NORTHSTAR_API_BASE` to the API URL.

## Project layout

- `*.html` — pages (landing, dashboard, and marketing/detail pages)
- `css/` — shared stylesheets (design system + page styles)
- `js/auth.js` — auth client (sign in/up via the API, JWT session, sign out, page guard)
- `js/dashboard-interactions.js` — dashboard button interactions
- `backend/main.py` — FastAPI app (auth + SQLite persistence, optional static serving)
- `backend/requirements.txt`, `backend/pyproject.toml` — backend dependencies
- `server.js` — legacy Express server (superseded by the FastAPI backend)

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
