#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for path in localfirst/js/*.js localfirst/*.js; do node --check "$path"; done
node tests/boundaries.mjs
node tests/damage-regression.mjs
python3 tests/tactical-ui.py
