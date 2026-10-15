# Deploy species rarity / field hunting

Deploy ONLY localfirst/contents, not this archive root/tests/docs and not any backend or dashboard. Runtime differs from tactical-v20 only in js/game.js,js/expansion-data.js,sw.js. Cache is havenmoore-localfirst-cartoon-v21. Other62runtime files unchanged.

Future wild species probabilities deliberately change outside beginner Reedway. Common/Uncommon/Rare multipliers are1/0.2/0.05on existing habitat weights before existing time/weather filtering. Continuous roll corrects integer-percent quantization. Rare coats/genes/stats/catch code remain unchanged; new notes explain existing rules. No saved fields, roster additions, auth/sync/ownership or money changes.

Use RUNTIME-SHA256SUMS from inside localfirst/for all65runtime files. SHA256SUMS is the received-v19 baseline; BASELINE-V20-SHA256SUMS is the last tactical build. Neither old manifest is the current runtime manifest.

Run ./run-tests.sh from the extracted archive before relay. Stage -> smoke -> Free-plan$0 verification -> live -> unrelated-game regression remains the parent/deploy lane route. No deploy occurred in this build workspace. Do not publish internal ops logs. Tests contain local-only harnesses, not real accounts or cloud mutations.
