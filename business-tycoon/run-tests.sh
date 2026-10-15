#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export BUSINESS_GAME_ROOT="$PWD"
export BUSINESS_GAME_OUTPUT="${BUSINESS_GAME_OUTPUT:-/tmp/business-ui}"
mkdir -p "$BUSINESS_GAME_OUTPUT"
node --check app.mjs
node --check cloud-save.js
node test-life.mjs > "$BUSINESS_GAME_OUTPUT/life-results.txt"
tail -1 "$BUSINESS_GAME_OUTPUT/life-results.txt"
node test-engine.mjs > "$BUSINESS_GAME_OUTPUT/engine-results.txt"
tail -1 "$BUSINESS_GAME_OUTPUT/engine-results.txt"
node fuzz-life.mjs
node fuzz.mjs
node soak.mjs
node strategy-portfolios.mjs > "$BUSINESS_GAME_OUTPUT/strategy-portfolios-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-portfolios-results.txt"
node strategy-alternates.mjs > "$BUSINESS_GAME_OUTPUT/strategy-alternates-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-alternates-results.txt"
node strategy-stress.mjs > "$BUSINESS_GAME_OUTPUT/strategy-stress-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-stress-results.txt"
node strategy-industries.mjs > "$BUSINESS_GAME_OUTPUT/strategy-industries-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-industries-results.txt"
node strategy-life.mjs > "$BUSINESS_GAME_OUTPUT/strategy-life-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-life-results.txt"
node strategy.mjs > "$BUSINESS_GAME_OUTPUT/strategy-results.txt"
grep '^PASS' "$BUSINESS_GAME_OUTPUT/strategy-results.txt"
if [[ ${1:-} == --ui ]]; then
  command -v google-chrome-stable >/dev/null
  python3 -c 'import websocket'
  for name in earned deep interactions lifecycle touch compact life; do
    python3 "ui-tests/test-business-${name}-ui.py" > "$BUSINESS_GAME_OUTPUT/${name}-results.txt"
    printf 'PASS UI suite: %s\n' "$name"
  done
fi
