#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MYSQL_DIR="$ROOT_DIR/.tools/mysql-8.4.9-macos15-arm64"
DATA_DIR="$ROOT_DIR/.tools/mysql-data"
RUN_DIR="$ROOT_DIR/.tools/mysql-run"
LOG_DIR="$ROOT_DIR/.tools/mysql-logs"

mkdir -p "$DATA_DIR" "$RUN_DIR" "$LOG_DIR"

exec "$MYSQL_DIR/bin/mysqld" \
  --basedir="$MYSQL_DIR" \
  --datadir="$DATA_DIR" \
  --socket="$RUN_DIR/mysql.sock" \
  --pid-file="$RUN_DIR/mysql.pid" \
  --log-error="$LOG_DIR/error.log" \
  --bind-address=127.0.0.1 \
  --port=3306

