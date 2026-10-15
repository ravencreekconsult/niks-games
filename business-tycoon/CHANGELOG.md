# v33 - October 15, 2026
- 300 earned operating-strategy comparisons preserve success and failure outcomes, covering staffing/delegation, restock limits and short express bridge. No economy rebalance.
- Manager stock controls now show held/target/order units and warn when cash or budget leaves the current target short. A spending cap is not a fixed purchase or free payroll protection.
- Engine checks unchanged at176 plus34 life; all strategy/soak/fuzz/UI suites required before extracted-package delivery.

# v32 - October 15, 2026
- Fast week buttons now surface a negative cash forecast before settlement, with inspect/back/run-anyway choices. No forced bailout, auto-rebalance or extra prompt for nonnegative plans.
- Compact cash review keeps all choices on screen at 320x568. Back gets initial focus. Cancel/inspect preserve save bytes; explicit confirmation settles once.
- No economy/save changes. Full extracted runner and actual pixels required before delivery.

# v31 - October 15, 2026
- Books shows cash after the forecast settlement, unpaid payroll/premises remaining afterward and a planning-only earmarked balance. Negative forecast balances are explicit.
- Equipment nearing capacity loss has a separate repair quote, never silently included in settlement.
- 100 earned low-reserve stock/invoice/maintenance scenarios: 55 survive, 45 expected first-negative stops. Failure states stay importable. No balance change or save reset.
- 176 engine and 34 life checks; full extracted-package runner and pixels required before handoff.

# v30 - October 15, 2026
- Logistics now chooses invoice account rounds or lower-throughput, higher-fuel express work paid this settlement. Existing receivables keep their due dates.
- Live phone-first dispatch comparison puts operating profit and company cash side by side in meaning, with capacity/fuel details behind disclosure. Old route-free saves keep previous economics.
- 172 engine checks, 34 life checks, 50 earned single-industry paths and 10 earned mixed portfolios; full extracted runner/pixels required before handoff.
- Adopted review principles from design-taste/better-design, no repository code or new dependencies.

# Preview build history

Earlier entries describe the state at that version, not current limits. INTEGRATION.md is the current contract.

## v0.1 initial slice

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

## v0.8 manager delegation and economic stress update

Managed inventory firms can delegate restocking through a terms review, with a $250/$1,000/$3,000 weekly purchase cap. They buy only toward projected capacity/demand and leave $500 cash before bills. That is a purchase guard, not enough guaranteed cash for wages/rent/debt; the UI states this. Factory production delegation remains separate. Managers use current supplier prices and weighted paid cost basis. Branches start with purchasing off. Cash planner includes orders, production-ready goods and earlier firms' operating cash before estimating later purchase budgets. Manual purchases remain available. No real-money effects.

117 deterministic checks now include all seven industries through 52-week cash/ledger reconciliation, manager order budget/reserve/no-unneeded-stock, integrated factory pack buying/production, multiple firm purchase timing, negative-cash recovery without erased companies and cafe investor share after spoilage. Fixed report omissions: fictional stock dividends and collectible storage now have line items so the report explains its total. 10,000 random transitions exercise the new settings too. Earned 20-week path, pointer/keyboard/recovery and deep UI regressions pass. Manager review and control pixels inspected at 390. The scenes remain illustrative, not dynamic building simulation; live cloud/deploy remains unverified here.

## v0.9 founder decisions and history continuity

Books reviews now expose distinct confirmed claims, cash risk and counteroffer terms for each founder, rather than just unlocking a button. Asked founder questions are saved through refresh. Closed round follow-on is rejected; a follow-on on the dilution week reverses that round's dilution before adding the new investment. Cash exits keep founder/proceeds/week/ownership in permanent scenario history and block repeating the same scenario to farm money. Milestone completion persists when a business is sold or founder exited. Stock-shortfall warning distinguishes missing inventory from a labor/capacity gap, so buying ads is not suggested as a cure.

123 deterministic checks, 10,000 fuzz transitions and all three UI suites pass. Diligence findings visually inspected at 390. Authored answers and modeled odds remain explicitly labeled; this is not open-ended AI founder dialogue. Closed histories migrate safely as new optional defaults. Use v09 rather than v08-corrected; no cloud-account/deployment validation claimed here.

## v0.10 long-session and transaction truth pass

127 deterministic checks, 10,000 randomized transitions and all three UI suites pass. New soak.mjs exercises a mixed four-company/three-property/three-founder/stocks/collectible portfolio for 550 weekly settlements, validating reports, finite economics, repeated JSON restore and all mortgage payoffs. Separate 200-week unattended property test found condition dropping below zero and invalidating saves; fixed a zero floor and zero-condition renovation fallback.

Company openings/branches/acquisition now take the first free location label rather than duplicating an occupied location after a sale. Restore repairs legacy duplicate labels without removing companies or cash. Company sale refuses a negative net modeled value rather than secretly charging the player; outside equity also requires positive cumulative profit and positive value. Sale review clarifies stock, invoices and accrued bills included and separate growth loans retained. Branch headline includes copied-equipment cost. Sale review actual 390 pixels inspected. No live deployment/auth verification claimed here.

## v0.11 earned full founder lifecycle and local file backup

Fourth UI script continues the actual earned $110 start through week 31, founder operating support, follow-on, milestone, buyer review and cash exit. It retains closed outcome/proceeds after reload. The same actual UI save exports as a downloaded JSON file; the game advances a week, selects that file in the real import input, reviews both states, backs up the device, imports, reloads and exactly restores company/cash/week/closed-history values. No state/cash injection in this path. This proves local export/import, not live authenticated cloud sync.

Save dialogs now have a labeled dialog role, focus-on-open, tab trap, Escape for cancel/close and prior-focus restoration. Palette and touch targets match game decision UI; import and exit-history pixels inspected at 390. Blob object URLs release after download. 127 engine checks, 10,000 fuzz, 550-week/200-week soak, earned/deep/interactions/lifecycle UI suites pass.

## v0.12 actual mobile touch and import consistency

New touch-emulated Chrome regression caught a delayed synthesized click adding work after a long touch release, despite mouse tests passing. Hold release suppression now covers the delayed touch click without blocking the next intentional pointer or keyboard action. Actual touch tap/hold/release/cancel passes along with mouse, keyboard, Save trap and recovery checks. This is Chrome touch emulation, not an actual iPhone/Safari claim.

135 deterministic checks, 10,000 fuzz transitions, long-session soaks and lifecycle/deep/touch UI pass. Import validation now covers all cross-asset IDs, prototype-key property/founder/hustle types, integer course levels, typed automation/startup flags/support and loan relationships. Collectibles are capped at 50 holdings so legitimate play cannot overflow its own report/import bounds. No live auth/deploy verification here.

## v0.13 repeatable acceptance and input safety

148 deterministic checks now include bad quantity/NaN/infinite/string/fractional/action-enum/name inputs, all rejected without mutating original state. run-tests.sh runs syntax, engine, fuzz and soak; --ui adds the five sequential Chrome suites. UI scripts now accept BUSINESS_GAME_ROOT and BUSINESS_GAME_OUTPUT, so extracted package tests are not tied to the author's source directory. TESTING.md separates evidence, fixture limits, dependencies, hands-on morning smoke and unverified live acceptance. Full runner passed. Runtime visual layout unchanged; no new visual claim beyond prior inspected screens. No live auth/deploy verification here.

## v0.14 strategic cash history and conservative paths

Books now retains 24 real weekly settlements, with a cash trend and last eight weeks' end cash, settlement net and company operating profit. It distinguishes week-end balance from settlement-only net and paper value from cash. Earned week-21 pixels inspected at 390. Old saves start collecting history going forward, not fabricated history.

strategy.mjs proves 15 conservative 32-week paths (employee, concurrent side hustles, first service company across five seeds), starting at $110, without manual-job farming or injected capital. None goes insolvent. It is evidence of viable alternatives, not calibrated difficulty or proof that all choices work. Cash at 32 weeks: employee $14,290, side hustles $29,495, first company ~$29,073-$31,944. Side hustles and wages are currently deterministic; company performance responds to seeded events/rivals. Full test runner now includes strategy checks and passes 150 deterministic, fuzz, soaks and five UI suites. Live account/deploy remains unverified.

## v0.15 marginal upgrade comparison

A collapsed comparison under Capacity & quality shows the next hire, equipment, training, maintenance, footprint and manufacturing input contract: cash cost now, capacity/sales changes and weekly operating-profit change under current assumptions. It exposes when the real bottleneck means another hire or machine adds cost with no immediate gain. Snapshots do not mutate state and are not cash forecasts or promised payback; wages/ongoing operating changes included, purchase cost separate. Current stock/lead-time caveats shown. Phone comparison pixels inspected. 153 deterministic checks verify pure preview and actual hire forecast equality plus machine-limited counterexample. Full five-UI/fuzz/soak/strategy runner passes. Live auth/deploy unverified.

## v0.17 compact viewport audit

Added sixth UI suite at 320x568 and 667x375, navigation/dialog/save overlays. Inspection found landscape home primary action offscreen under the fixed scene minimum. Reduced short-landscape scene, removed redundant map pins in that orientation and kept the primary action above bottom navigation. Compact dialogs scroll within viewport. Revised actual landscape pixels inspected. Full six-UI runner plus all 153/fuzz/soak/strategy checks passes. No gameplay balance change or live verification.

## v0.18 recovered-source audit

Recovered v17 from repository backup after working storage reset; all runtime hashes matched. Engine/fuzz/soak/strategy/six UI rerun passed. Slow fresh Chrome startup needed a longer bounded test harness wait with explicit timeout reporting. Imported HTML-like company/event/report strings tested as inert text, including native sale dialog title. Shell runner/package executable bits restored on the recovered copy. No gameplay or visual layout change.

## v0.19 acquisition terms audit

Removed stale hardcoded cafe acquisition capacity. Review now uses the same forecast rules as the acquired company, including current skills/events/rivals, condition, stock and wages, and labels spoilage/extras. Pure review-to-acquired forecast equality regression added. 154 checks and full six-UI/fuzz/soak/strategy runner pass; acquisition phone pixels inspected. No other economy changes or live verification.


## v0.20 - unemployed room-first opening
- Actual room overlay with daily bars, tap-to-earn cents, food/rest/learning/social sheets, household sales and tap upgrades.
- Casual employment does not end clicker; first full-time job opens career/company bridge. First company retires tapping.
- Optional validated life save object; existing saves preserve old progression. Required life.mjs module.
- 18 new apartment checks; separate fresh-start earned Chrome suite. Existing six suites are explicitly v19-save compatibility checks.


## v0.21 - career takes the lead, then ownership
- Full-time salary shifts become primary room action; tapping stays secondary until first company.
- Daily life condition applies to pre-owner weekly career/study work. Shared productive weekly time budget, aligned sleep/next-week calendar.
- Consistent first-company reserve guidance; normalized company fields on creation.
- 21 apartment checks and fresh earned UI proof through first company, employee and actual exported-file restore.


## v0.22 - no cash lock, meaningful overwork and faster recovery
- Fix negative balances incorrectly blocking free apartment actions.
- Sustained-work streak drives extra mood drain; meaningful break resets and exact learning previews.
- Skip-to-next-week rest choice, matched sleep/skip overnight effects and single settlement.
- 26 apartment checks, 10,000 new randomized life transitions, earned negative recovery, real touch/keyboard earning and stronger legacy keyboard assertions.


## v0.23 - room discovery and three authored daily odd jobs
- Cupboard/closet searches reveal one-off sale items; prior life saves retain listings.
- Three rotating condition-gated daily odd jobs in the desk, with saved completion and knowledge rewards. They never count as full-time employment.
- 30 apartment checks plus earned menu proof for discovery, sales and odd-job payout.


## v0.24 - action availability and tap feedback
- Exact lock reasons on personal actions and career shift; engine preflight runs only on a clone.
- Rising earned-cash tap feedback, reduced-motion support and weekly exhaustion guidance.
- Tap quote matches payout across the overwork low-mood threshold.
- 31 deterministic apartment checks plus full prior regression and real-touch visual proof.


## v0.25 - workshop as the next operating world
- New-opening owners get forecasts, demand/capacity bar, hiring/management/inspection and weekly settlement on the workshop.
- Short recruiting cash is visible before hire; first-company review/reserve remains intact.
- 15 additional earned fresh-life strategies across three routes/five seeds; 24 owner weeks and management, no injected capital or manual-job farming.
- Actual earned workshop/inspection and phone/desktop checks in the fresh UI suite; prior regression preserved.


## v26 - career consequences and visible pay progression
Career Jobs now shows the next shift's exact pay, time and condition costs (including overwork mood), projected remaining stats, low-condition warning and quick food/rest routes. Shift outcome reports actual earnings/stats or an earned pay rise. Promotion progress and first-company cash target use bars and actual state; the target is guidance, not a debit. Pay rises still apply only from the following shift, and careers keep separate XP. No economy/save changes; legacy saves keep their condition-free rules. Shared careerShiftQuote backs the preview and shift condition charge. Added three engine assertions for exact outcome/promotion/legacy behavior (34 apartment checks), and fresh-browser proof exercises the preview, real shift, updated stats and modal rest route at phone widths.


## v27 - industry-specific cash timing before settlement
Each company now has a cash-vs-profit view for the next settlement: customer collections, stock order cash, payroll/rent actually due, other operations, investor share and net cash. Deferred wages/rent remain visible after settlement, with their billing cycle, and existing invoice dates can be expanded. New delayed sales are identified with their settlement week even when no saleable output is forecast. A whole-portfolio link includes the omitted personal/property/loan/hustle flows. This exposes existing different industry mechanics, not a new economy.

The existing cashPlan now returns additive per-company rows using the same sequential shared-budget simulation. No save schema or settlement changes. Eight new deterministic tests reconcile forecast rows with actual settlement for seven industries over three weeks, plus a multi-firm shared-budget case. They check collections, cash, accounting profit and deferred payroll/rent. Total 162 engine +34 apartment checks. Deep UI inspects factory timing and invoice schedule at 320/390/1280. Engine test fixtures are not earned-opening proof; existing fresh browser route and fresh-life strategy suite stay separate.


## v28 - earned industry runway and cafe service choices
Added strategy-industries.mjs to runner/package: 45 fully earned salary-to-company paths (seven industries plus counter/table cafe variants x five seeds), 32 owner weeks, per-action nonnegative cash and exact restore. Capital comes from actual personal-day salary shifts; no injected cash or manual customer-job farming. Outside salary stops when the firm opens. These are conservative, high-reserve strategies, not claims of minimum capital or fastest progression. Baseline cafes and counter-style cafes survived but drew down reserves under passive two-staff management; table service grew cash. No promise all configurations grow or survive indefinitely.

Cafe service choices now change real visit ticket, demand and capacity: standard preserves the previous behavior; counter lowers ticket 10%, raises capacity 30% and demand 10%; table raises ticket 25%, lowers capacity 25% and demand 10%. Free reversible format changes preserve ingredient units and paid cost basis. Local previews show actual projected visits/profit and warn that stock/demand limit outcomes. Exact-cent tickets are shown. Engine tests prove forecast/settlement match, retained stock/cash, rejected wrong-firm/invalid styles, save restore, and that one-employee vs two-employee contexts prefer different formats. Optional cafeStyle is absent on older saves, which retain standard behavior. Finance fuzz includes style changes.

Final acceptance: 165 engine checks, 34 apartment checks; all previous fuzz/soak/strategy/UI suites plus the new 45-path matrix. Deep UI uses an explicitly funded local cafe fixture to select table service and check actual setting, stock/cash preservation and settlement; that UI fixture is not earned-start proof. ROADMAP.md now included in package.


## v29 - shared cash allocation and earned four-firm portfolios
Books now exposes the existing sequential settlement rule with per-firm collection/stock/bills/net rows and free reversible earlier/later controls. Order changes the shared cash available for manager restock after preceding collections/bills. No setup cost or time passes when reordering; array order persists through save/restore. Existing saves keep their current order. The view explains that the manager's $500 purchasing floor is not a solvency guarantee and that living/property/loan flows differ from firm-only cash.

Two tests prove free reversible ordering, validation, persistence and tight-cash order-sensitive stock funding with actual settlement reconciliation. Financial fuzz includes order changes. Deep UI uses a labeled local two-firm tight-cash fixture, reorders, checks saved/displayed order and exact settlement, and captures 320/390/1280. This fixture is not earned-path evidence.

strategy-portfolios.mjs adds 10 fully earned fresh-to-four-firm 120-week portfolios: service/shop/manufacturing/logistics and service/mechanic/cafe/transport across five seeds. Starting capital is salary-earned, salary stops at first ownership, later firms are funded by company operations, no cash injection/manual customer-job farming. Conservative reserve thresholds; not minimum-capital claims. Per-action solvency, shared cash forecast reconciliation, order changes and exact restore required. End cash about $135k-$189k; all four firms earned by weeks 40-54. Run full extracted runner: 167 engine +34 apartment checks and all previous fuzz/soak/strategy/seven-UI checks. ROADMAP updated with next goals.
