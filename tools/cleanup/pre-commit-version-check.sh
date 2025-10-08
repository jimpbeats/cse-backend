#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Checking for versioned imports in staged files..."

if git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx)$' | xargs grep -nE "@[^\"']+@[vV]?[0-9]" > /dev/null; then
  echo "❌ Commit blocked: Versioned imports detected."
  echo "👉 Please remove any import like '@package@v1' and try again."
  exit 1
else
  echo "✅ Pre-commit check passed."
fi
