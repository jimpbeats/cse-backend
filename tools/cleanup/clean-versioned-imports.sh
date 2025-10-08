#!/bin/bash

echo "🔍 Searching for versioned imports..."

matches=$(grep -rlE "@[^\"']+@[vV]?[0-9]" . --include=\*.{ts,tsx,js,jsx})

if [ -z "$matches" ]; then
  echo "✅ No versioned imports found."
  exit 0
fi

echo "🛠️  Removing version suffixes from:"
echo "$matches"

for file in $matches; do
  perl -i -pe 's/(@[a-zA-Z0-9\/_-]+)@[vV]?[0-9][0-9.]*(?:-[a-zA-Z0-9]+)?/\1/g' "$file"
done

echo "✅ Cleaned. Verifying..."

remaining=$(grep -rnE "@[^\"']+@[vV]?[0-9]" . --include=\*.{ts,tsx,js,jsx})
if [ -z "$remaining" ]; then
  echo "🎉 Cleanup complete. No remaining versioned imports."
else
  echo "⚠️  Still found some:"
  echo "$remaining"
fi