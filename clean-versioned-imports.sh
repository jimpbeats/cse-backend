#!/bin/bash

# Script: clean-versioned-imports.sh
# Description: Remove inline version suffixes (e.g. @v1, @v2.3.1) from import paths

echo "🔍 Searching for versioned imports..."

# Find all files with imports that include "@<something>@v<version>"
matches=$(grep -rlE "@[^\"']+@[vV]?[0-9]" . --include=\*.{ts,tsx,js,jsx})

if [ -z "$matches" ]; then
  echo "✅ No versioned imports found."
  exit 0
fi

echo "🛠️  Removing version suffixes from the following files:"
echo "$matches"

# Edit files in-place
for file in $matches; do
  perl -i -pe 's/@([a-zA-Z0-9\/_-]+)@v[0-9.]+/\1/g' "$file" 
done

echo "✅ Version suffixes removed."

# Final verification
echo "🔁 Verifying cleanup..."
remaining=$(grep -rnE "@[^\"']+@[vV]?[0-9]" . --include=\*.{ts,tsx,js,jsx})

if [ -z "$remaining" ]; then
  echo "🎉 Cleanup complete: No remaining versioned imports."
else
  echo "⚠️  Still found some versioned imports:"
  echo "$remaining"
fi
