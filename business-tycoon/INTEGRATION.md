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

## v0.4 operating-life update

72 deterministic engine checks plus 10,000 randomized action/save/forecast transitions across 20 seeded runs pass. Four distinct side hustles can run concurrently: website clients, weekend resale, tutoring and mobile repairs. Each has startup cost, direct cost, personal-hour use and upgrades; a full schedule can prevent sales. Pause/resume determines priority. The old website save migrates once. Specialization courses affect only relevant industries and sales skill affects quoting. Current opportunities remain visible when unaffordable.

Local economic events change matching-industry demand or new input purchases. Inventory retains actual paid cost basis rather than retroactively changing cost when a supplier event ends. Rivals make changing price/quality offers that affect demand. Equipment condition changes throughput and paid maintenance restores it. Cafe unsold ingredients spoil. These are bounded simulated rules, not a full competitor AI or macroeconomic model.

Save validation now checks market IDs/history, bounded company fields, inventory/receivables, property state, founder scenario IDs, hustle registry and economic event state. Randomized transitions test legitimate saves still restore. No private account data used. UI tested starting two concurrent hustles and taking specialization courses; inspected phone hustle controls, factory maintenance/input controls and the home-action scroll. All prior width checks stay green. Next work remains richer skill/career progression, multiple product recipes, scenario pacing and deeper financial strategy.

## v0.5 career, production and finance update

85 deterministic checks and expanded 10,000 randomized transitions pass. Six careers now include dispatch and production technician roles. Technical roles require relevant practical courses, promotions are earned separately in each job, and technical shifts build matching industry experience that modestly reduces startup friction. Universal job-level history still gates senior applications for old-save compatibility, but no longer gives a new career's pay raise automatically.

Manufacturing now chooses standard components, commercial fixtures or precision assemblies. Each recipe uses different input packs, machine time, selling price, demand, upgrade/course requirements and lead time. Work-in-progress has its paid cost basis and contributes to value; it cannot be changed into a more expensive product by switching a dropdown. Slower recipes need one/two full weeks before inventory can sell, followed by the existing two-week invoice collection delay. No multi-product factory line yet.

A managed company with eight settled weeks and positive cumulative profit can secure a bounded 12% fixed annual growth loan, 52 amortizing weekly payments. Principal raises cash and debt equally, interest and principal are visible separately, payoff uses actual cash, and selling the company does not erase the loan. This is a simplified personally liable loan, not a full secured-lending/legal model. Terms are reviewed in a confirmation dialog.

UI checks selected the fixtures recipe, bought packs, scheduled work-in-progress, selected machinist career and reviewed/accepted a growth loan on a labeled local eligibility fixture. Actual pixels inspected show recipe controls and complete loan terms. Earlier widths/scenarios still pass. No cloud-account or deployment verification claimed.

## v0.6 earned-path and cash clarity update

88 deterministic engine checks plus 10,000 fuzz transitions pass. A separate Chromium UI run starts from $110 and makes only real UI actions: shifts, foundation class, hands-on customer jobs, first company, employees, manager, equipment, second logistics company, apartment property, founder diligence and negotiated investment over 20 weeks. No injected cash or altered game state. It reaches $37,737.54 cash at week 21 with two companies, property and funded founder, without negative cash. Refresh preserves substantive progress (restore may add safe default fields). This tests one viable path, not every balance choice.

Opening a company from Deals now takes the player straight to its operations. A next-steps panel makes the progression discoverable. Before-week cash planner shows bills due, collections/rents and the estimated operating cash gap, including accrued premises/payroll billing and loan payments. Its scope excludes new purchases, side hustles and dividends; production/tenants/demand can change results. Start-company review states a planning reserve for recruiting/wages/premises, not an extra fee.

Actual pixels inspected: earned second company/district, achieved milestones and labeled bills/collections forecast. Deep scenario regression at 320/390/1280 remains green, including recipes, loans and hustles. No production cloud account, staging, live deployment or GitHub verification claimed by this lane.

## v0.7 reliability update

100 deterministic checks plus 10,000 randomized action/save/forecast transitions pass. UI retains keyboard focus and expanded details on action rerender. Pointer holding stops on release, cancel, leaving the work button, loss of window focus and rejected work; long hold release no longer creates an extra work action. Real Chrome mouse/keyboard regressions verify tap, hold/release, blur stopping, keyboard focus and expanded sections. The fresh 20-week earned journey and 320/390/1280 scenarios still pass.

Validation is now nonthrowing for malformed saves, rejects malformed reports, prototype-key careers/industries, invalid counters, oversize record arrays and company labels/locations. This is structural crash prevention, not anti-cheat authentication. If an invalid local save is found, its exact original bytes are retained in business-sim-v1-recovery before using a fresh state. A visible notice lets the player download those bytes for repair. Recovery card inspected at 390 pixels. Cloud account boundaries are unchanged and remain live-unverified here.
