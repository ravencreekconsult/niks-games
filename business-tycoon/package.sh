#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
out="${1:-/tmp/business-tycoon-package.tar.gz}"
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
for path in index.html style.css app.mjs engine.mjs content.mjs cloud-save.js assets test-engine.mjs fuzz.mjs soak.mjs strategy.mjs balance.mjs run-tests.sh package.sh TESTING.md INTEGRATION.md CHANGELOG.md ui-tests; do cp -r "$path" "$stage/"; done
(cd "$stage" && sha256sum index.html style.css app.mjs engine.mjs content.mjs cloud-save.js assets/*.webp > RUNTIME-SHA256SUMS)
tar -czf "$out" -C "$stage" .
printf '%s\n' "$out"
