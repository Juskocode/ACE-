#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ingestion_key="${ACE_INGESTION_KEY:-ace-local-development-key}"
backend_port="${ACE_BACKEND_PORT:-8090}"
backend_origin="${ACE_API_URL:-http://127.0.0.1:${backend_port}}"

cleanup() {
  if [[ -n "${backend_pid:-}" ]]; then
    kill "$backend_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

(cd "$project_dir/backend" && SERVER_PORT="$backend_port" SERVER_ADDRESS="127.0.0.1" ACE_INGESTION_KEY="$ingestion_key" mvn spring-boot:run) &
backend_pid=$!

cd "$project_dir/frontend"
ACE_API_URL="$backend_origin" ACE_INGESTION_KEY="$ingestion_key" npm run dev -- --host 0.0.0.0
