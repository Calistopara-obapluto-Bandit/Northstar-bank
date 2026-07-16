"""Northstar Bank API.

Self-contained backend for the Northstar Bank demo: real user sign up / sign in
with hashed passwords (bcrypt) and JWT sessions, persisted in SQLite. On sign up
a member gets seeded demo accounts, goals, and transactions so the dashboard can
show real, per-user data.
"""
import os
import re
import sqlite3
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Optional path to the static frontend (HTML/CSS/JS). When set, the API also
# serves the site so everything lives on one origin (no CORS, and any proxy
# Basic-auth is shared by page + API requests).
STATIC_DIR = os.environ.get("STATIC_DIR")

JWT_SECRET = os.environ.get("JWT_SECRET", "northstar-demo-secret-change-me-in-production-please")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 days

# Persist on the Fly volume when present, otherwise fall back to a local file.
DB_PATH = os.environ.get(
    "DB_PATH", "/data/northstar.db" if os.path.isdir("/data") else "northstar.db"
)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = FastAPI(title="Northstar Bank API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                name TEXT NOT NULL,
                balance REAL NOT NULL DEFAULT 0,
                account_number TEXT
            );
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                icon TEXT,
                target_amount REAL NOT NULL,
                current_amount REAL NOT NULL DEFAULT 0,
                deadline TEXT
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                detail TEXT,
                amount REAL NOT NULL,
                date TEXT
            );
            """
        )


SEED_ACCOUNTS = [
    ("checking", "Everyday Checking", 12458.42, "**** 4821"),
    ("savings", "Goal Savings", 10915.67, "**** 9064"),
    ("credit", "Rewards Credit Card", 1284.33, "**** 1139"),
]
SEED_GOALS = [
    ("Home Down Payment", "🏠", 20000, 13600, "Dec 2027"),
    ("New Car", "🚗", 10000, 4200, "Jun 2027"),
    ("Vacation Fund", "🌴", 3000, 2550, "Aug 2026"),
]
SEED_TRANSACTIONS = [
    ("Payroll Deposit", "Direct Deposit", 3240.00, "Yesterday"),
    ("Whole Foods Market", "Debit Card", -156.82, "Jul 14, 2026"),
    ("Netflix Subscription", "Auto-pay", -15.99, "Jul 14, 2026"),
    ("Interest Credit", "Automatic", 22.75, "Jul 13, 2026"),
    ("Shell Gas Station", "Credit Card", -45.00, "Jul 12, 2026"),
    ("ATM Withdrawal", "ATM", -200.00, "Jul 11, 2026"),
]


def seed_member(conn, user_id: int):
    conn.executemany(
        "INSERT INTO accounts (user_id, type, name, balance, account_number) VALUES (?, ?, ?, ?, ?)",
        [(user_id, t, n, b, a) for (t, n, b, a) in SEED_ACCOUNTS],
    )
    conn.executemany(
        "INSERT INTO goals (user_id, name, icon, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?, ?, ?)",
        [(user_id, n, i, ta, ca, d) for (n, i, ta, ca, d) in SEED_GOALS],
    )
    conn.executemany(
        "INSERT INTO transactions (user_id, description, detail, amount, date) VALUES (?, ?, ?, ?, ?)",
        [(user_id, d, det, amt, dt) for (d, det, amt, dt) in SEED_TRANSACTIONS],
    )


def make_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def current_user(
    x_auth_token: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    # Prefer a dedicated header so the standard Authorization header stays free
    # for any proxy-level Basic auth in front of the API.
    token = None
    if x_auth_token:
        token = x_auth_token.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing auth token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, phone FROM users WHERE id = ?", (payload["sub"],)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(row)


class SignupBody(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None


class SigninBody(BaseModel):
    email: str
    password: str


class TransferBody(BaseModel):
    from_account_id: int
    to_account_id: Optional[int] = None
    external_name: Optional[str] = None
    amount: float
    memo: Optional[str] = None


# Assumed credit limit per credit account, used to show "available credit".
CREDIT_LIMIT = 10000.0


def today_str() -> str:
    return datetime.now(timezone.utc).strftime("%b %d, %Y")


def me_payload(conn, user: dict) -> dict:
    accounts = [dict(r) for r in conn.execute(
        "SELECT id, type, name, balance, account_number FROM accounts WHERE user_id = ? ORDER BY id",
        (user["id"],),
    ).fetchall()]
    goals = [dict(r) for r in conn.execute(
        "SELECT name, icon, target_amount, current_amount, deadline FROM goals WHERE user_id = ?",
        (user["id"],),
    ).fetchall()]
    transactions = [dict(r) for r in conn.execute(
        "SELECT description, detail, amount, date FROM transactions WHERE user_id = ? ORDER BY id DESC",
        (user["id"],),
    ).fetchall()]
    return {
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "credit_limit": CREDIT_LIMIT,
        "accounts": accounts,
        "goals": goals,
        "transactions": transactions,
    }


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/healthz")
def health():
    return {"status": "ok", "service": "northstar-api"}


@app.post("/api/auth/signup")
def signup(body: SignupBody):
    name = body.name.strip()
    email = body.email.strip()
    if not name or not email or not body.password:
        raise HTTPException(status_code=400, detail="All fields are required")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    password_hash = bcrypt.hashpw(body.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        cur = conn.execute(
            "INSERT INTO users (email, password_hash, name, phone, created_at) VALUES (?, ?, ?, ?, ?)",
            (email, password_hash, name, (body.phone or "").strip(), int(time.time())),
        )
        user_id = cur.lastrowid
        seed_member(conn, user_id)

    return {"token": make_token(user_id), "name": name, "email": email}


@app.post("/api/auth/signin")
def signin(body: SigninBody):
    email = body.email.strip()
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()
    if not row or not bcrypt.checkpw(body.password.encode("utf-8"), row["password_hash"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": make_token(row["id"]), "name": row["name"], "email": row["email"]}


@app.get("/api/me")
def me(user=Depends(current_user)):
    with get_db() as conn:
        return me_payload(conn, user)


@app.post("/api/transfers")
def create_transfer(body: TransferBody, user=Depends(current_user)):
    amount = round(float(body.amount), 2)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Enter an amount greater than zero")

    memo = (body.memo or "").strip()
    date = today_str()

    with get_db() as conn:
        src = conn.execute(
            "SELECT id, name, balance FROM accounts WHERE id = ? AND user_id = ?",
            (body.from_account_id, user["id"]),
        ).fetchone()
        if not src:
            raise HTTPException(status_code=404, detail="From account not found")
        if src["balance"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient funds in the selected account")

        if body.to_account_id is not None:
            if body.to_account_id == body.from_account_id:
                raise HTTPException(status_code=400, detail="Choose two different accounts")
            dst = conn.execute(
                "SELECT id, name FROM accounts WHERE id = ? AND user_id = ?",
                (body.to_account_id, user["id"]),
            ).fetchone()
            if not dst:
                raise HTTPException(status_code=404, detail="To account not found")
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src["id"]))
            conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst["id"]))
            conn.execute(
                "INSERT INTO transactions (user_id, description, detail, amount, date) VALUES (?, ?, ?, ?, ?)",
                (user["id"], "Transfer to " + dst["name"], memo or "Internal transfer", -amount, date),
            )
            conn.execute(
                "INSERT INTO transactions (user_id, description, detail, amount, date) VALUES (?, ?, ?, ?, ?)",
                (user["id"], "Transfer from " + src["name"], memo or "Internal transfer", amount, date),
            )
        else:
            recipient = (body.external_name or "").strip() or "External account"
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src["id"]))
            conn.execute(
                "INSERT INTO transactions (user_id, description, detail, amount, date) VALUES (?, ?, ?, ?, ?)",
                (user["id"], "Transfer to " + recipient, memo or "External transfer", -amount, date),
            )

        return me_payload(conn, user)


# Serve the static frontend from the same origin (must be mounted last so the
# /api/* and /healthz routes above take precedence).
if STATIC_DIR and os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="site")
