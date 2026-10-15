# Rivenmoore - current build and next work

Updated October15,2026. Tycoon work is paused. Current Rivenmoore source was transferred from the canonical live deployment tree, not the stale public single-HTML game.

## Tactical readout increment
- Move choices and double-battle target choices now show the current non-critical on-hit damage range, using the same calculation as actual hits.
- Inherited IVs, nature and traits, training, stages, held items, abilities, maturity, weather and terrain affect these ranges exactly as they affect battle damage. No new stat bonus or balance change.
- Type, hit-rate, status, priority and recoil hints remain. Read the battle explains snapshot limits, criticals and skipped actions. A faster opponent, defensive stage gain or switch can change the later result.
- Only js/game.js and the service-worker cache name change. No save/auth/sync/backend, account, trade ownership or asset edits.

## Verified evidence
The new regression harness compares6,000 actual old-v19 and new hit resolutions, including random-call sequence, HP/status/stages/PP/logs;4,872 powered-move range snapshots remain read-only and contain sampled non-critical hits. Sixty-three other runtime files stay byte-identical.

Browser opening uses actual hero/name/starter, pad movement, grass encounter, fight and ball buttons to catch a second companion. Seeded RNG is test control, not granted money/stats/position. Full earned save reload retains state bytes. Separate high-level tactical fixtures check320/390/1280 move choices, per-foe double targeting, read-only notes and an actual hit inside the range. They are not an earned high-level playthrough or two-phone co-op acceptance.

## Priority order
1. Matthew's phone-playtest fix list takes priority when it arrives.
2. Establish broader earned Chapter One regression coverage: actual route permits, keeper battles/community alternatives, nursery drop-off/pickup, legacy progression and valley ending. The recovered tree had no surviving automated tests; this increment starts rebuilding them, not a claim of full acceptance.
3. Use those paths to select a real content gap connecting family traits, team building and field decisions, not another isolated reward checklist. Preserve freedom to use story permits and the valley Chapter One ending.
4. Test co-op on two real phones separately before claiming friend-play acceptance. Do not change ownership/auth semantics from local browser evidence.

## Honest limits
39 species/21 areas are authored preview content, not a verified10-12hour Chapter One or full planned game. Static cartoon map art is not a new editable map system. Existing genetics/lineage/nursery/community stories remain; damage previews make their battle consequences legible rather than inventing a new game mode. Chrome emulation is not Safari/device testing. No real-money mechanics, paid luck or reset of existing families.
