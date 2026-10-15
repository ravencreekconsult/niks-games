# Business simulation preview integration

Current package: v0.19. Slug: business-tycoon. Dashboard label: Business sim (final name not chosen).
Runtime folder: public/games/business-tycoon/.

## Runtime allowlist

Copy only index.html, style.css, app.mjs, engine.mjs, content.mjs, cloud-save.js and assets/apartment.webp, assets/workshop.webp, assets/city.webp into the game runtime. Test scripts and Markdown are source/acceptance material, not public runtime assets. There are no package dependencies, build step, credentials or paid services in the runtime.

Save key business-sim-v1; envelope game business-tycoon; schemaVersion 1. Optional fields restore with safe defaults. Invalid local original bytes are retained under business-sim-v1-recovery for download. Private account data was not used in development tests.

## Shared integration boundary

Additive changes only: shared cloud-saves.mjs slug/key allowlist, http.mjs route regex, worker.mjs asset regex and dashboard card/rewrite. Shared files are not included and must not be overwritten. Stage/live promotion, plan verification and GitHub additive backup belong to the dashboard owner. Recheck established $0 gates and unrelated asset hashes before each deployment.

The included cloud-save client follows the transferred account contract and restricts cloud behavior to supported game-account origins. Local export/import/backup is exercised; signed-in cloud write, conflict, history and account separation require live acceptance. Do not report those as passed from local tests.

## Current playable depth

Apartment work/classes and six careers with individual promotions; 40 personal hours/week; four concurrent side hustles; matching-industry courses and experience. Seven company industries have different capacity, input, demand, cost and collection timing. Multiple firms/branches, staff/tools/training, managers and bounded automatic purchasing/production. Paid stock basis, cafe spoilage, three manufacturing recipes/lead times/work-in-progress, delayed invoices, accrued payroll/premises bills, maintenance, simulated rivals/events. Upgrade comparisons expose current bottleneck and marginal cost/profit.

Outside equity, actual-history buyer values and amortizing growth loans; three unique financed rental properties with condition/lease/vacancy/repair; three authored founders with saved questions, distinct books reviews, negotiation/support/follow-on/dilution/milestone/exit history. Fictional stocks/dividends and collectibles. Cash planner, itemized reports and 24-week cash history distinguish cash from paper value. No real money or paid recovery.

## Verified local evidence

154 deterministic checks, 10,000 seeded randomized transitions, 550-week mixed portfolio/payoffs/JSON restores, 200-week unattended property and 15 conservative 32-week strategies. Six Chrome UI suites: earned path, deep fixtures/widths, mouse/keyboard/recovery, founder exit plus real exported-file import/backup, and touch emulation plus compact landscape/phone layouts. ./run-tests.sh --ui is the acceptance entry point; TESTING.md has requirements and hands-on smoke. Package audit also verifies extracted-path execution and runtime hashes. See CHANGELOG.md for the history, not current facts.

## Honest limits

Playable preview, not full-depth completion. Four concurrent companies, three listed properties, one active product line per factory, authored limited founder choices and modeled failure odds, simplified personal-liability lending/defaults/taxes, grouped tenants, seeded fictional stocks, illustrative static city scenes rather than dynamic buildings. Wages and side-hustle demand are deterministic. Chrome touch emulation is not real iPhone/Safari testing. Existing clean environment art does not fully match the painterly reference target. Live route/dashboard/cloud and real-device verification are unverified in this build lane.
