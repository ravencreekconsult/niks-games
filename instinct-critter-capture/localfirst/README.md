# Rivenmoore (Havenmoore "localfirst")

Creature-capture RPG in vanilla JS (no framework, no bundler, no package.json). Live at https://game-accounts.ravencreek.workers.dev/localfirst/

## Known-good version
- Commit 70bd036 of this repo (main). js/game.js md5 c9a2320e679cacf74560033bb4a5b918 matches live as of 10/19/2026.
- Service worker cache: havenmoore-localfirst-cartoon-v44 (sw.js).

## Local run
- No official command. Static files, so any static server pointed at this folder serves the UI (for example `python3 -m http.server`). Not verified by the author.
- Account, sync, co-op and private-room features need the shared Worker backend (below). The page expects window.LocalFirstContext (account, slot) from the host.

## Test
- None. There is no automated test suite. Verification has been manual (browser plus localStorage edits, md5 of live vs local). js/game.js is IIFE-wrapped, so it can't be driven from outside.

## Deploy
- This folder is served from public/localfirst/ of the shared Cloudflare Worker `game-accounts` (wrangler.toml and worker.js are NOT in this repo). The deploy lane publishes it. The exact publish command is UNKNOWN to the author.
- Never deploy from a partial root: overlay only this folder onto the current live tree. Bump the CACHE name in sw.js on every ship.
- Do not touch the critter-capture or niks-realtime projects, the serial-tycoon worker, or instinct-apps-dashboard.

## Saves
- Browser localStorage, key `havenmoore-localfirst-prototype-runtime-<account>-<slot>`. Save validation requires version 1. Do not add top-level save fields (put extras in state.daily or on companions) and never reset a save.

## Caveats
- parallel/ghost/ghost-presence.js is a reconstruction of a lost original.
- game.js is dense (421 long lines); use grep, not line edits.
- Art provenance and licensing are UNKNOWN.
