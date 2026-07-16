FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# The API also serves the static frontend from the repo root (same origin),
# and persists SQLite to /data (mount a volume there in production).
ENV STATIC_DIR=/app
ENV DB_PATH=/data/northstar.db

WORKDIR /app/backend

# Railway/most PaaS provide $PORT; default to 8000 locally.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
