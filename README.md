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
- **Auth**: Client-side demo authentication (localStorage) — no backend or database required
- **Server (optional)**: Node.js + Express, used only to serve the static files (`server.js`)

The app is a fully self-contained static site. Sign in / sign up store the
member name in the browser's `localStorage` and unlock the dashboard pages;
the dashboards display representative demo data.

## Local Development

You can open the site directly, or serve it with the bundled Express server.

Option A — open the files directly:

- Open `index.html` in your browser (or use any static file server).

Option B — run the Express static server:

```bash
npm install
npm start
```

Then navigate to `http://localhost:3000`.

## Deployment

Because the app is a static site, it can be deployed to any static host
(Netlify, GitHub Pages, Cloudflare Pages, Vercel, Replit, etc.) — just serve
the repository root. When using a Node host, `npm start` runs `server.js`,
which serves the same static files.

## Project layout

- `*.html` — pages (landing, dashboard, and marketing/detail pages)
- `css/` — shared stylesheets (design system + page styles)
- `js/auth.js` — localStorage demo auth (sign in/up, sign out, page guard)
- `js/dashboard-interactions.js` — dashboard button interactions
- `server.js` — optional Express static server

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
