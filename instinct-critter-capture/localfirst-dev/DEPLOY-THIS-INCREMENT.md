# Merge and deployment boundary

This is the complete recovered localfirst/ runtime plus tests and notes. Deploy ONLY the localfirst/ contents to the existing local-first/localfirst routes through the usual canonical -> both deploy trees -> stage smoke -> Free$0 verify -> live -> regressions route. Parent coordinates deploy and backup. Do not replace the worker/backend, dashboard or other games with this archive root.

Changed runtime files: localfirst/js/game.js and localfirst/sw.js only. SW cache: havenmoore-localfirst-cartoon-v20. No new runtime files. RUNTIME-SHA256SUMS verifies this release from inside localfirst/. SHA256SUMS is deliberately the original received-v19 manifest, retained for boundaries.mjs baseline checks.

Preserve auth bindings, secrets, sessions, save slots, trading/drift ownership and all existing families. Never clear/reset saves. Do not touch critter-capture/niks-realtime projects or instinct-apps-dashboard. No spend authorized. INTEGRATION-NOTES.md records the original source provenance and constraints; these are unchanged.

Rollback: restore the two original files from the transferred v19 complete source, preserving all player state. No migration needed.
