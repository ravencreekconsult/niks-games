# Preview testing

No account or external paid service is required for local testing.

- Engine tests: `./run-tests.sh`
- Full local browser regression: `./run-tests.sh --ui`
- UI dependencies: Python 3 with websocket-client, google-chrome-stable and Node supporting ES modules/structuredClone. UI tests use localhost port 8799 and sequential Chrome debug ports; do not run suites in parallel.
- Output defaults to /tmp/business-ui. Override BUSINESS_GAME_OUTPUT to keep screenshots/logs elsewhere. The runner derives the runtime root from its own directory.

## What is proved

148 deterministic checks; 10,000 seeded randomized transitions; 550-week mixed portfolio and mortgage payoff; 200-week unattended property deterioration. UI tests cover one earned start-to-portfolio path, late-system fixtures and widths 320/390/1280, mouse/keyboard, Chrome touch emulation, corrupt save retention, a funded founder through support/round/exit, and downloaded-file export/import with backup. Fixture-based checks are not evidence those late states were earned. Chrome touch emulation is not a real Safari/device test.

## Morning hands-on smoke

1. New browser profile: confirm $110/week 1. Work shift, take class, complete customer job, open home services, hire. Read recruiting/wage/premises costs first.
2. Run weeks, inspect cash vs. accounting profit. Keep personal hours and reserves in view. Hire manager and see delegation remove routine input.
3. Open a second different industry. For stock businesses, buy stock before sales; for a factory, buy input packs and schedule a recipe. Invoices collect after sale, not on purchase.
4. Review automatic restocking limits. Verify terms, purchase cap and $500 pre-bill guard are clear. It is not a guarantee that all bills can be met.
5. Ask founder questions, verify books, compare acceptance and negotiation. Funding is illiquid and can fail; support and follow-on cost cash.
6. Export a save, advance, import the earlier file, inspect the restore review and backup. Confirm cash/week/portfolio restore after reload.
7. Check narrow phone width and keyboard-only navigation, native decision dialog and Save dialog. Look for hidden/overlapping controls, excessive scrolling and unclear terms.

## Must not infer

Local passes do not verify the production route, dashboard card, signed-in cloud save/conflict/history, account separation, real Safari or real-device behavior. Shared deployment and those acceptance checks belong to the integration lane. This remains a preview: four firms, three listed properties, authored founders, simplified lending/defaults/taxes, seeded fictional market and illustrative city scenes rather than dynamic buildings.
