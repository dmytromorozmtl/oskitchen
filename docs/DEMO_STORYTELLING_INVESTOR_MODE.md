# Demo Storytelling & Investor Mode

## Surfaces

- `/demo` — public hub with **Investor / sales demo mode** badge + simulated data disclaimer.  
- `/dashboard/demo/scenarios` — six golden scenarios with controls + audit-aware seeding.  
- Demo workspace banner (existing `DemoBanner` client) — reset remains explicit.

## Scenario coverage

Backed by `GOLDEN_DEMO_SCENARIOS` / `listGoldenDemoScenarioPlans`:

1. Meal prep  
2. Café POS  
3. Bakery preorder  
4. Catering event  
5. Ghost kitchen  
6. Multi-brand commissary  

## Narrative rules

- Always restate: **simulated data**, **no live marketplace/payment traffic**, **workspace-scoped**.  
- Link operators to **Today** + **Order hub** after seeding.

## Next upgrades

- Lightweight guided walkthrough (stepper overlay) — optional client module.  
- “Sample data health” panel summarizing last seed + freshness.
