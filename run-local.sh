#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

SECRET_KEY="${SECRET_KEY:-dev-secret-key}"
ALGORITHM="${ALGORITHM:-HS256}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-1234567890}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-FYP}"
DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}}"
CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:3000,http://127.0.0.1:3000}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://${BACKEND_HOST}:${BACKEND_PORT}/api}"
BACKEND_URL="${BACKEND_URL:-http://${BACKEND_HOST}:${BACKEND_PORT}/api}"
GOOGLE_API_KEY="${GOOGLE_API_KEY:-${GEMINI_API_KEY:-}}"
GEMINI_API_KEY="${GEMINI_API_KEY:-${GOOGLE_API_KEY:-}}"

BACKEND_LOG="${ROOT_DIR}/backend.local.log"
FRONTEND_LOG="${ROOT_DIR}/frontend.local.log"

command -v uvicorn >/dev/null 2>&1 || { echo "Missing 'uvicorn' in PATH"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Missing 'npm' in PATH"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Missing 'python3' in PATH"; exit 1; }

cleanup() {
  echo
  echo "Stopping local services..."
  [[ -n "${BACKEND_PID:-}" ]] && kill "${BACKEND_PID}" >/dev/null 2>&1 || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "Checking PostgreSQL on ${DB_HOST}:${DB_PORT}..."
if ! python3 - <<PY
import socket
s = socket.socket()
s.settimeout(1.5)
try:
    s.connect(("${DB_HOST}", int("${DB_PORT}")))
except Exception:
    raise SystemExit(1)
finally:
    s.close()
PY
then
  echo "Cannot connect to PostgreSQL at ${DB_HOST}:${DB_PORT}."
  echo "Start PostgreSQL first, then rerun this script."
  echo "Examples:"
  echo "  brew services start postgresql@16"
  echo "  pg_ctl -D /opt/homebrew/var/postgresql@16 start"
  exit 1
fi

echo "Starting backend on http://${BACKEND_HOST}:${BACKEND_PORT}"
(
  cd "${ROOT_DIR}"
  export PYTHONPATH="${ROOT_DIR}:${BACKEND_DIR}"
  export SECRET_KEY ALGORITHM DATABASE_URL DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD CORS_ORIGINS GOOGLE_API_KEY GEMINI_API_KEY
  uvicorn backend.app.main:app --host "${BACKEND_HOST}" --port "${BACKEND_PORT}"
) >"${BACKEND_LOG}" 2>&1 &
BACKEND_PID=$!

echo "Starting frontend on http://${FRONTEND_HOST}:${FRONTEND_PORT}"
(
  cd "${FRONTEND_DIR}"
  export NEXT_PUBLIC_API_URL BACKEND_URL
  npm run dev -- --hostname "${FRONTEND_HOST}" --port "${FRONTEND_PORT}"
) >"${FRONTEND_LOG}" 2>&1 &
FRONTEND_PID=$!

echo "Backend PID: ${BACKEND_PID} (log: ${BACKEND_LOG})"
echo "Frontend PID: ${FRONTEND_PID} (log: ${FRONTEND_LOG})"
echo "App URL: http://${FRONTEND_HOST}:${FRONTEND_PORT}/patient/ai-assistant"
echo "Press Ctrl+C to stop."

wait -n "${BACKEND_PID}" "${FRONTEND_PID}"
echo "One service exited. Check logs:"
echo "  tail -f ${BACKEND_LOG}"
echo "  tail -f ${FRONTEND_LOG}"
