#!/usr/bin/env bash
#
# revival-ui/ship.sh — one command to push the shared design system.
#
#   ./ship.sh "what changed"
#
# Exists so shipping this repo is the same muscle memory as facilities' `npm run
# ship` (Aaron, 2026-08-21: "why are you giving me two commands to push each time?").
# No test suite here — it's a stylesheet and two scripts — but the JS files are at
# least parsed before anything is committed, because a syntax error in a shared file
# breaks four apps at once.
#
# Pushes to main; Cloudflare Pages deploys to assets.revival.tv on its own.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "ship: needs a commit message."
  echo "      ./ship.sh \"what changed and why\""
  exit 1
fi

# The gate: every .js file must parse.
for f in *.js; do
  node --check "$f" || { echo "ship: $f does not parse. Nothing committed."; exit 1; }
done

git add -A
git commit -m "$MSG" || { echo "ship: nothing to commit."; exit 0; }
git pull --rebase
git push
echo "ship: pushed. assets.revival.tv updates in about a minute."
