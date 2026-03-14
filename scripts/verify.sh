#!/usr/bin/env bash
# Full pre-commit verification: lint + build.
# Run this after any code change before committing.
# Usage: ./scripts/verify.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================"
echo " ryanmsu — pre-commit verification"
echo "========================================"
echo ""

echo "[1/2] Lint..."
npm run lint
echo "      ✓ lint passed"
echo ""

echo "[2/2] Build (type-check + compile)..."
npm run build
echo "      ✓ build passed"
echo ""

echo "========================================"
echo " All checks passed. Safe to commit."
echo "========================================"
