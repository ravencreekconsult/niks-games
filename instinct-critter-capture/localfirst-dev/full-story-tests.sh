#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export RIVENMOORE_OUTPUT="${RIVENMOORE_OUTPUT:-/tmp/rivenmoore-story-proof}"
for stage in chapter keeper valley ending finale training healed beacon; do
  echo "STORY STAGE: $stage"
  python3 "tests/$stage-ui.py"
done
