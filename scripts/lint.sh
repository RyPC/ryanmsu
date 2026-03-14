#!/usr/bin/env bash
# Run ESLint across the project using next lint (eslint-config-next).
# Usage: ./scripts/lint.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Running ESLint (next lint)..."
npm run lint

echo ""
echo "✓ No lint errors."
