#!/bin/bash
# sync-to-famous.sh
# Ports all shared engine files from demo → famous-smoke.
# Brand-specific files (index.html, app.js copy) are intentionally preserved.
#
# Usage: bash sync-to-famous.sh
# Run from the demo/ directory after making engine changes.

set -e

DEMO="$(cd "$(dirname "$0")" && pwd)"
FAMOUS="$(cd "$DEMO/../famous-smoke" && pwd)"

echo "Syncing demo → famous-smoke..."
echo "  From: $DEMO"
echo "  To:   $FAMOUS"
echo ""

# ── Files that are IDENTICAL between both repos (engine / data) ──────────────
# Changes to these in demo should always be ported to famous.

sync_file() {
  local src="$DEMO/$1"
  local dst="$FAMOUS/$1"
  mkdir -p "$(dirname "$dst")"
  if ! diff -q "$src" "$dst" > /dev/null 2>&1; then
    cp "$src" "$dst"
    echo "  ✅ synced: $1"
  else
    echo "  — unchanged: $1"
  fi
}

# Core recommendation engine (always in sync)
sync_file "netlify/functions/recommend.js"
sync_file "netlify/functions/hello.js"
sync_file "netlify.toml"

# Cigar database
sync_file "data/cigars.json"

echo ""
echo "── Brand-specific files (NOT synced — edit directly in each repo) ──"
echo "  index.html    — colors, header, layout"
echo "  app.js        — copy, status messages, hint chips"
echo ""

# ── Commit and push famous-smoke if anything changed ─────────────────────────
cd "$FAMOUS"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "sync: port engine changes from demo

Auto-synced via sync-to-famous.sh:
- netlify/functions/recommend.js
- data/cigars.json"
  git push
  echo "✅ famous-smoke pushed to GitHub."
else
  echo "✅ famous-smoke already up to date — nothing to push."
fi

echo ""
echo "Done. Both repos are in sync."
