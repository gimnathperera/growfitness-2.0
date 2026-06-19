#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required but was not found in PATH." >&2
  exit 1
fi

if [ ! -f "$API_DIR/package.json" ]; then
  echo "Error: API package was not found at $API_DIR." >&2
  exit 1
fi

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo "Error: dependencies are not installed. Run 'pnpm install' from the project root first." >&2
  exit 1
fi

if [ ! -f "$API_DIR/.env" ] && [ ! -f "$API_DIR/.env.local" ] && [ -z "${MONGODB_URI:-}" ]; then
  echo "Warning: no API environment file or MONGODB_URI was found."
  echo "The API will use its default local MongoDB connection."
  echo
fi

echo "Create a Grow Fitness portal administrator"
echo "The account will be created in the database configured for the API."
echo

cd "$API_DIR"
exec pnpm create-admin
