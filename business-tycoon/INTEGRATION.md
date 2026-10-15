# Business simulation playable slice

Slug: business-tycoon
Folder: public/games/business-tycoon/
Save key: business-sim-v1
Envelope game: business-tycoon, schemaVersion: 1
Dashboard label: Business sim (name not chosen)
Description: Apartment beginnings → your first company → a city of businesses → portfolio strategy.

Additive integration only. Add slug/save key to shared cloud-saves.mjs whitelist, http.mjs route regex, worker.mjs asset route regex and dashboard card rewrite/card. Shared files are not part of this package and are not to be overwritten.

Client uses the transferred duck-hunt cloud-save.js pattern, with business-tycoon added to the origin/path allowlist. No game-specific credentials. Browser-local saving is active. Cloud save requires normal account API integration and explicit reviewed choice.

Package contains index.html, style.css, app.mjs, engine.mjs, cloud-save.js and assets/*.webp. test-engine.mjs can be run with node. No dependencies or build step. Scope build assets only to the new game folder. Do not deploy helper Python scripts.

Testing: 33 deterministic engine tests (including inventory, delayed collection, amortization, dilution, outside equity, negative-cash recovery and anti-flip guard). Local Chromium interaction tests at 320,390,1280 widths, no horizontal document overflow. Fresh-earned opening: shift, class, seven jobs, start company, hire. Separate local fixtures test late-game states. Save survives refresh. No real account/save mutations made during local testing.

Limitations: still a first slice, not the requested full-depth finish. Seven industries with differentiated constraints; manufacturing uses raw packs, batches and machine capacity but not multiple product recipes or production lead times yet. Immediate retail receipts vs. delayed B2B invoices; overdue/default risk not yet modeled. One residential property template, one founder scenario with authored questions and two equity offers; no broad negotiation tree yet. Market prices use a seeded cycle rather than complete company earnings. Four-company initial limit. No multiplayer. Art is generated static environment art with separate coded controls; it is not a 3D city simulation.

Stage, live promotion, plan verification and GitHub additive backup remain with the dashboard owner. $0 gates and unrelated asset hashes must be rechecked through the established route before each deploy. Do not publish a full-game completion claim from this slice.

## v0.2 depth update

Add content.mjs to the shipped runtime assets. It holds three authored founder scenarios and three unique property opportunities. Founder asks, diligence, round size/timing, help, milestone and exit timing differ; investment states run concurrently. Property opportunities include apartments, a retail unit and warehouse, with separate fixed-rate financing and condition/lease/vacancy rules. Repairs and finding tenants consume cash. Buying the same listed building twice is blocked.

Billing now carries accrued wage/premises liabilities separately from accounting profit: service/cafe premises weekly, logistics/transport fixed bills fortnightly, mechanic/factory/shop premises every four operating weeks. Payroll is weekly for size 1, fortnightly for size 2. Unpaid bills lower business sale value and appear in weekly books. A larger footprint raises physical capacity without inventing worker-hours. Branches keep an existing investor's stake but do not duplicate stock, liabilities, or completed production. A managed factory can delegate production using only purchased inputs and remaining capacity.

51 deterministic engine tests pass. UI tested founder selection/question/diligence/negotiated investment, insufficient-cash rejection and a successful retail property purchase, price change, weekly books, scroll-bottom controls, and 320/390/1280 widths. Decisive pixels inspected: founder questions, property costs and owned property controls, operating books, business bottom controls. Earned engine run gets from $110 to a staffed managed business with no fixture cash; late-game UI remains fixture-tested. Full real-account/cloud integration and deployment remain unverified here.

Supersedes v01. No longer accurate: one property type/one founder scenario. Still bounded: no per-product factory recipes/lead times, tenant-by-tenant leasing, invoice default risk, full stock earnings model or multiplayer. This is continuous overnight build work, not the final depth promised.

## v0.3 visual and time update

55 deterministic engine checks pass. A 40-hour active weekly budget now connects shifts, classes and manual jobs. Part-time vs. full-time schedules differ, and growing companies let the player move away from hands-on labor. Staff have their own capacity. Job/skill/hustle controls remain available after becoming an operator.

Adopted visual-direction production palette, full-bleed home scenes, coded top-left week/cash pills, slim action capsule and quiet bottom navigation. Existing clean environment artwork is still used; the new flattened concept frames are reference only and were not shipped as functional UI. Scene action scrolls to the real controls. Full deal terms remain readable before simulated commitment. 320/390/1280 pixels inspected for scene HUD/crop, accessible controls, factory production and local-save menu.

Additional UI interaction coverage: bought factory inputs, manual production, delegated production, delayed invoice creation, scene-action scroll, local export/import menu. Live cloud auth/save remains integration-owner verification work, not a test passed in this sandbox.
