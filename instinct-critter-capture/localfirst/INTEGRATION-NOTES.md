# Rivenmoore (Critter Capture) - local-first modular build - source package

Packaged 2026-10-15 ~15:46 PT from the canonical tree at
`/home/sandbox/recovery/public/localfirst/` (deploy agent workspace).

## Provenance / source of truth
- This directory IS the current complete source. It is byte-identical to the
  trees deployed on both Cloudflare workers (verified with `diff -rq` against
  games-merge-live-deploy and games-merge-stage-deploy on 2026-10-15).
- No separate upstream repo with tests exists in the current workspace; the
  niks-games GitHub repo does NOT contain this build (see below).
- The public niks-games repo (ravencreekconsult/niks-games,
  `instinct-critter-capture/` folder) holds only the legacy single-HTML
  adventure builds (1-adventure8xx.html) - it predates the modular local-first
  rewrite entirely. Backup is STALE.

## Live URLs
- Live:    https://game-accounts.ravencreek.workers.dev/local-first/
           (also served under /localfirst/)
- Staging: https://instinct-critter-staging.ravencreek.workers.dev/local-first/

## Current live fingerprints (2026-10-15)
- js/game.js            md5 d93fadd4fff4a7a95af82991b8e855d5
- index.html            md5 ac5de4b0bdcb09ee487cea205aa96521 (via /local-first/)
- sw.js cache name      havenmoore-localfirst-cartoon-v19
- note: /localfirst/game.js at the root 404s by design; the entry is
  /localfirst/js/game.js.

## Module map (25 source files + 40 assets)
- index.html, style.css, bootstrap.js - shell + boot
- js/game.js - main game module (cartoon build)
- js/data.js, js/adventure-data.js, js/expansion-data.js, js/investigation-data.js - content
- js/art.js, js/environment-art.js, js/cartoon-pack.js, js/capture-presentation.js - rendering
- sw.js - service worker (offline cache, cache name above)
- sync.js - cloud save sync client
- ghost-client.js - ghost/presence client
- staging-room-ui.js, staging-battle-ui.js - staging room + battle UI
- drift-pool-ui.js - drift pool UI
- coop-quest-ui.js/.css - co-op quests
- spectator-ui.js/.css - spectator mode
- invite-link-ui.js, invite-link.mjs - invite links
- ownership-handoff.mjs - ownership transfer flow
- assets/ (40 files): painted/ (world + cast art), capture/, environment/, icon.svg

## Save / auth contract (do not break)
- Local-first: offline saves stay playable and untouched until opt-in migration.
- Cloud sync through the dashboard account origin; /api/games/session GET -> 405,
  POST /private-room/drift/list -> 409 are the expected probe responses.
- Legacy offline "843" saves remain playable untouched.

## Tests
- No automated test files for this build exist in the current workspace (they
  predate the current sandbox). Verification has been smoke + visual + md5
  regression per deploy; see OVERNIGHT-LOG.md for the full history.

## Deploy route (for the build lane)
- Canonical tree first, rsync to both deploy dirs, stage deploy, smoke,
  Free-plan $0 verify on the dash, live deploy, regression. Boundaries: $0
  spend; never touch the critter-capture or niks-realtime Cloudflare projects;
  never deploy/edit instinct-apps-dashboard; never clear/reset any save.
