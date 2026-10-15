# Business simulation preview integration

Current package: v0.26. Slug: business-tycoon. Dashboard label: Business sim (final name not chosen).
Runtime folder: public/games/business-tycoon/.

## Runtime allowlist

Copy only index.html, style.css, app.mjs, engine.mjs, life.mjs, content.mjs, cloud-save.js and assets/apartment.webp, assets/workshop.webp, assets/city.webp into the game runtime. Test scripts and Markdown are source/acceptance material, not public runtime assets. There are no package dependencies, build step, credentials or paid services in the runtime.

Save key business-sim-v1; envelope game business-tycoon; schemaVersion 1. Optional fields restore with safe defaults. Invalid local original bytes are retained under business-sim-v1-recovery for download. Private account data was not used in development tests.

## Shared integration boundary

Additive changes only: shared cloud-saves.mjs slug/key allowlist, http.mjs route regex, worker.mjs asset regex and dashboard card/rewrite. Shared files are not included and must not be overwritten. Stage/live promotion, plan verification and GitHub additive backup belong to the dashboard owner. Recheck established $0 gates and unrelated asset hashes before each deployment.

The included cloud-save client follows the transferred account contract and restricts cloud behavior to supported game-account origins. Local export/import/backup is exercised; signed-in cloud write, conflict, history and account separation require live acceptance. Do not report those as passed from local tests.

## Current playable depth

Apartment work/classes and six careers with individual promotions; 40 personal hours/week; four concurrent side hustles; matching-industry courses and experience. Seven company industries have different capacity, input, demand, cost and collection timing. Multiple firms/branches, staff/tools/training, managers and bounded automatic purchasing/production. Paid stock basis, cafe spoilage, three manufacturing recipes/lead times/work-in-progress, delayed invoices, accrued payroll/premises bills, maintenance, simulated rivals/events. Upgrade comparisons expose current bottleneck and marginal cost/profit.

Outside equity, actual-history buyer values and amortizing growth loans; three unique financed rental properties with condition/lease/vacancy/repair; three authored founders with saved questions, distinct books reviews, negotiation/support/follow-on/dilution/milestone/exit history. Fictional stocks/dividends and collectibles. Cash planner, itemized reports and 24-week cash history distinguish cash from paper value. No real money or paid recovery.

## Verified local evidence

154 legacy deterministic checks plus 31 new apartment checks, 10,000 seeded randomized transitions, 550-week mixed portfolio/payoffs/JSON restores, 200-week unattended property and 15 conservative 32-week strategies. Seven Chrome UI suites (six explicitly seeded with existing v19 saves for compatibility; one unseeded fresh clicker run): earned path, deep fixtures/widths, mouse/keyboard/recovery, founder exit plus real exported-file import/backup, and touch emulation plus compact landscape/phone layouts. ./run-tests.sh --ui is the acceptance entry point; TESTING.md has requirements and hands-on smoke. Package audit also verifies extracted-path execution and runtime hashes. See CHANGELOG.md for the history, not current facts.

## Honest limits

Playable preview, not full-depth completion. Four concurrent companies, three listed properties, one active product line per factory, authored limited founder choices and modeled failure odds, simplified personal-liability lending/defaults/taxes, grouped tenants, seeded fictional stocks, illustrative static city scenes rather than dynamic buildings. Wages and side-hustle demand are deterministic. Chrome touch emulation is not real iPhone/Safari testing. Existing clean environment art does not fully match the painterly reference target. Live route/dashboard/cloud and real-device verification are unverified in this build lane.


## v20 opening
Fresh profiles start unemployed at $12.50, daily life bars, $0.50 taps, three per-tap upgrades, three one-off fictional Facebook sales, learning/food/rest/social choices and casual jobs. First full-time coordinator requires 6 knowledge and 2 casual shifts. Only that role opens the existing career/company game; tap income remains until first company. Existing v19 saves have no life object and remain exactly on their old path. Do not clear user saves to show the new opening. Use a fresh browser profile or local save backup before intentional restart.

life.mjs is a REQUIRED new runtime module. Copy it alongside engine.mjs/app.mjs; an omitted module prevents startup. No shared dashboard files changed. Screenshots show actual tested local app, not mockups. Transition wiring is a working bridge in v20; v21 shares productive time with the 40h weekly budget and proves the fresh opening through company ownership and an actual exported-file restore. Free pantry once per day, free walks/books/rest and no real-time wait prevent pay/clock softlocks. Food costs are additional to the existing weekly $75 living cost.


## v21 transition increment
Full-time employment changes the main room action from tapping to a salary shift. Tapping remains a smaller action until first company; it is removed at ownership. Daily hours/energy/mood/nourishment now apply to salary shifts, foundation training/classes, customer work and practical courses before ownership. Productive apartment tasks share the existing 40h/week budget; food/rest/social actions use daily hours only. Next week aligns the personal calendar to the next weekly boundary, while sleep advances one personal day. Weekly living costs settle only once.

Fresh Chrome UI run now earns $12.50 start -> household sale/upgrade -> casual shifts/books -> full-time -> company/first employee without injected money/state, then exports an actual file, advances, imports it and checks exact restoration. New company records carry save defaults immediately so export/restore does not add fields on first reload. New path is separate from the legacy portfolio path. No cloud/Safari claim.


## v22 recovery and meaningful mood
IMPORTANT FIX: negative cash no longer blocks free apartment work, learning, pantry or casual shifts. New UI proof starts on a second empty origin, skips the first week into -$62.50, then earns back above zero using free actions/casual work, without injected state or a reset.

Sustained productive work/study beyond 4 hours since a proper break costs 2 extra mood per hour. Walks/friends/full naps clear that streak; power naps/full meals reduce it by 2 hours and fast food by 1. Exact learning effect previews include the extra mood cost, and the room warns about overwork. Sleep clears the streak; sleep/skip-week overnight changes match and apply once. Rest sheet offers skip-to-next-week with costs and lost time explicit.

Verification now includes 10,000 additional seeded apartment/career/save transitions, real Chrome touch tap and keyboard earning with actual balance assertions, mood drain/break proof, earned negative-balance recovery and the prior fresh-to-company/export/restore path. Existing six suites retain legacy save coverage. No live cloud/real Safari claim.


## v23 early variability and room discovery
New fresh openings know only the spare headphones. Searching the cupboard and closet finds two more one-off sale items; searches use productive time and energy and cannot be repeated. Saves from v20-v22 without found-items metadata retain all their old listings, so the update takes nothing away.

The desk has three authored rotating daily small offers: photo tagging, printer help and pop-up retail help. Each has distinct pay/time/condition effects, knowledge prerequisites and minimum mood/food. One per day, paid once, saved across reload. Completing one builds knowledge but is explicitly not full-time employment; it does not bypass the full-time gate. These are three authored offers, not unlimited generated content or actual external work.

Fresh UI proof additionally searches both room places, sells the finds and earns the current daily offer through the actual menu. 30 deterministic apartment checks plus 10,000 randomized life transitions and the full previous runner pass.


## v24 clearer decisions and tap response
Personal-action buttons preflight through a cloned engine state and show the exact current lock reason (cash/time/energy/condition/prerequisites). Unavailable buttons stay keyboard-focusable and can explain their reason; they cannot mutate state because the actual engine still enforces every requirement. The personal-action preview is never used as execution authority. Salary shift availability uses the same check.

Real touch/keyboard taps now show a small rising earned-cash indicator, including cents, and brief button feedback. Reduced-motion preference removes the movement. Fixed the edge case where overwork crossed the low-mood threshold during a tap: the displayed tap quote now matches the actual paid amount. Weekly-hour exhaustion has an explicit room hint to use Rest -> Skip to next week.

31 deterministic apartment checks; all other runner coverage unchanged. UI additionally inspects lock reasons and actual tap feedback after a real touch event.


## v25 workshop operating surface and fresh-life strategies
For players who came through the new life opening, the workshop is now an active operating screen rather than a scenic interlude: sales/profit forecast, demand-served bar, bottleneck, hiring/manager/inspection controls and next-week cash/settlement. If hiring cash is short the prompt says so rather than offering a failing hire. Legacy v19 saves keep the previous presentation. At portfolio stage the existing city still takes over.

Added 15 earned life-to-owner strategies across five seeds and three opening routes: free books, paid course, condition-gated odd jobs. No injected capital or manual customer-job farming. Each reaches the first full-time job on personal day 3 or 4, ownership in week 2, then survives 24 owner weeks and reaches management. These are engine strategy checks, separate from the real UI earned path. Company-opening reserve guidance remains a recommendation, not money charged.

All previous checks plus fresh-life strategy matrix are included in run-tests.sh; runtime file allowlist unchanged. Actual earned workshop view and 320/390/1280 widths verified. No new paid services or shared files.


## v26 - career consequences and visible pay progression
Career Jobs now shows the next shift's exact pay, time and condition costs (including overwork mood), projected remaining stats, low-condition warning and quick food/rest routes. Shift outcome reports actual earnings/stats or an earned pay rise. Promotion progress and first-company cash target use bars and actual state; the target is guidance, not a debit. Pay rises still apply only from the following shift, and careers keep separate XP. No economy/save changes; legacy saves keep their condition-free rules. Shared careerShiftQuote backs the preview and shift condition charge. Added three engine assertions for exact outcome/promotion/legacy behavior (34 apartment checks), and fresh-browser proof exercises the preview, real shift, updated stats and modal rest route at phone widths.
