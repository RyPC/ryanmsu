#!/usr/bin/env bash
# Start the Next.js development server on http://localhost:3000
# Usage: ./scripts/dev.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Installing dependencies (if needed)..."
npm install --prefer-offline --silent

echo "▶ Starting dev server at http://localhost:3000"
npm run dev
