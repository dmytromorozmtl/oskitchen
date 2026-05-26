# Demo page scenario clarity

## Public `/demo`

- Added **Six golden demo scenarios** grid sourced from `GOLDEN_DEMO_SCENARIOS`.
- Each card: title, vertical, sample plan lines, last safety note, CTAs to checklist (`/dashboard/demo/scenarios` when signed in), book demo, beta.
- Clear separation: **seeded simulated data** vs **live integrations** (no API keys on the public page).

## Platform `/platform/demo`

- Shows static audit summary from `auditGoldenDemoScenarioPlans()` (PASS/WARN/FAIL counts).
- Links to `/demo` and `/dashboard/demo/scenarios`.

## Scripts

- `npm run check-demo-scenarios` — validates plan lines vs `DEMO_SCENARIO_REQUIREMENTS` without DB access.
