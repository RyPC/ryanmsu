#!/usr/bin/env bash
# Run a full Next.js production build.
# A clean build is the primary correctness check — no automated tests exist yet.
# Usage: ./scripts/build.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Installing dependencies..."
npm install --prefer-offline --silent

echo "▶ Running TypeScript type-check + Next.js build..."
npm run build

echo ""
echo "✓ Build succeeded. Output in .next/"
