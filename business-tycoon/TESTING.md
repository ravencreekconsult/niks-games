# Preview testing

No account or external paid service is required for local testing.

- Engine tests: `./run-tests.sh`
- Full local browser regression: `./run-tests.sh --ui`
- UI dependencies: Python 3 with websocket-client, google-chrome-stable and Node supporting ES modules/structuredClone. UI tests use localhost port 8799 and sequential Chrome debug ports; do not run suites in parallel.
- Output defaults to /tmp/business-ui. Override BUSINESS_GAME_OUTPUT to keep screenshots/logs elsewhere. The runner derives the runtime root from its own directory.

## What is proved

172 deterministic engine checks plus 34 apartment checks; two separate 10,000-transition seeded fuzz runs; 550-week mixed portfolio and mortgage payoff; 200-week unattended property deterioration. UI tests cover one earned start-to-portfolio path, late-system fixtures and widths 320/390/1280, mouse/keyboard, Chrome touch emulation, corrupt save retention, a funded founder through support/round/exit, and downloaded-file export/import with backup. Fixture-based checks are not evidence those late states were earned. Chrome touch emulation is not a real Safari/device test.

## Morning hands-on smoke

1. Fresh browser profile: confirm $12.50, day 1, energy/mood/knowledge/nourishment. Tap earns $0.50; sell an item, upgrade, read books, take casual shifts and sleep. First full-time job needs 6 knowledge + 2 casual shifts; only it opens the broader simulation. Existing v19 saves retain their $110-era start/progress and old UI. Never clear a user save for a smoke test.
2. Run weeks, inspect cash vs. accounting profit. Keep personal hours and reserves in view. Hire manager and see delegation remove routine input.
3. Open a second different industry. For stock businesses, buy stock before sales; for a factory, buy input packs and schedule a recipe. Invoices collect after sale, not on purchase.
4. Review automatic restocking limits. Verify terms, purchase cap and $500 pre-bill guard are clear. It is not a guarantee that all bills can be met.
5. Ask founder questions, verify books, compare acceptance and negotiation. Funding is illiquid and can fail; support and follow-on cost cash.
6. Export a save, advance, import the earlier file, inspect the restore review and backup. Confirm cash/week/portfolio restore after reload.
7. Check narrow phone width and keyboard-only navigation, native decision dialog and Save dialog. Look for hidden/overlapping controls, excessive scrolling and unclear terms.

## Must not infer

Local passes do not verify the production route, dashboard card, signed-in cloud save/conflict/history, account separation, real Safari or real-device behavior. Shared deployment and those acceptance checks belong to the integration lane. This remains a preview: four firms, three listed properties, authored founders, simplified lending/defaults/taxes, seeded fictional market and illustrative city scenes rather than dynamic buildings.


## v20 evidence distinction
Six legacy browser suites now seed an explicit existing v19 initial save before first load; their earned portfolio path proves compatibility, not a fresh clicker-to-portfolio path. The seventh suite starts with empty storage and earns the opening through full-time employment using only UI actions, then checks reload and 320/390/1280 widths. No injected money in that run. Engine opening suite includes 70 days / 2,800 taps with save restores, free pantry, activity effects, partial/first-full-time gates and ownership tap retirement. v21 extends that same earned fresh path into company/first employee, removes tapping at ownership, exports the actual save, advances the game, imports that file and verifies exact restoration.


## v21 time/transition checks
Salary shifts, foundation training/classes, practical courses and completed customer jobs use daily time/condition before ownership. Productive apartment work/learning/taps share the 40 active-hour weekly budget. Sleep resets daily hours; only the seventh night settles a week. Next week skips to the next personal-week boundary. Activities fail atomically if either budget is unavailable. First-company review retains its full recruitment/operating-reserve warning; the room goal now uses that reserve instead of a too-small living-only target.


## v22 recovery/mood acceptance
- Skip the first week with no earnings: balance becomes -$62.50, but taps/free pantry/books/casual shifts must still work. Earn above zero without reset or paid rescue.
- Work/study beyond 4 focused hours: extra mood drain is visible and included in learning effect previews. Take a walk/friend/full nap to clear the streak.
- Seventh-night sleep and Next week apply overnight mood/food once, not twice.
- New fuzz-life.mjs runs 10,000 seeded apartment/career/save transitions. New UI suite actually changes balance with a real touch event and keyboard Enter; focus alone is not counted as activation.


## v23 discovery/offers
On a genuinely fresh start, only headphones are listed. Cupboard/closet searches reveal the other sale items, each once. Verify old v20-v22 saves with missing discovery metadata retain all previous listings. Desk offer rotates over three authored variants by personal day. It requires matching knowledge, mood >=25 and nourishment >=20; it pays once/day, gives knowledge, consumes productive hours and never counts as full-time employment. Earned UI test covers search/sale and current pop-up offer without injected state.


## v24 interaction acceptance
Unavailable personal actions show exact current cash/time/energy/prerequisite reason before clicking; buttons remain focusable and engine-enforced. Tap quote/payout agree at the overwork mood boundary. A real touch or keyboard tap shows the earned cents indicator. Reduced-motion CSS removes movement. All personal actions preflight on clones, never mutate the real save during render.


## v25 workshop/earned-strategy acceptance
Fresh opening through company ownership: the workshop shows actual forecast sales/profit, demand-served bar and bottleneck. Hiring/manager options and weekly cash/bills remain on the world image; insufficient recruiting cash is explicit. Inspect button opens the real company controls. Verify 320/390/1280 without overlapping core controls. Legacy v19 saves preserve their previous home presentation.
strategy-life.mjs adds 15 earned fresh-start paths (books, paid course, odd jobs x five seeds), each through 24 weeks of ownership and management, without injected capital or manual-job farming. This is engine evidence, not 15 UI runs.


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

## v30 evidence
50 fully earned fresh-to-industry 32-week paths: all seven industries, cafe styles and express logistics across five seeds; startup earned by salary, no outside salary after opening. Existing 10 earned 120-week four-firm paths remain. Conservative reserves, not minimal opening capital. Five new deterministic dispatch tests cover free switching, capacity/fuel/profit/cash tradeoff, invoice non-retiming, collection exactly once, cash-plan reconciliation over switches, validation and restore. v29 no-route numeric forecasts and cash plans separately compared equal across seven industries.

Local funded logistics UI fixture checks switching, existing invoice dates, no setup charge, exact price label, 44px buttons, no horizontal overflow at 320/390/1280, and focus with reduced-motion emulation. This does not claim real Safari or a full accessibility audit. Actual screenshots inspected.

Design reference review adopted the identity-first and hierarchy/a11y review principles described at https://github.com/madebymustafa/design-taste and https://github.com/marvkr/better-design. No third-party code installed. The first dispatch layout hid key cash values below the phone fold; revised to compact profit/cash rows and expandable capacity/fuel terms, then inspected again. Eight supplied repo pages skimmed; Hyperiux/trickle fetches unavailable. No new dependency, shader or paid tool.
