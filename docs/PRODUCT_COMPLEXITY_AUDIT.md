# Product complexity audit (Phase 1)

The maintained module-by-module matrix and vertical fit scores live in **[FOODOPS_FULL_MODULE_AUDIT.md](./FOODOPS_FULL_MODULE_AUDIT.md)**. Use that file for per-module detail, confusion notes, and rename ideas.

## Classification shorthand

1. **Core (all)** — Most food businesses touch this weekly.
2. **Core (segment)** — Strong fit for named modes only.
3. **Advanced / optional** — Valuable after basics work; easy to hide via module settings.
4. **Enterprise** — Multi-site, compliance-heavy, or white-glove implementation paths.
5. **Internal / admin** — Platform, growth, or partner consoles; not customer kitchen work.
6. **Hidden by default** — Recommend off until business type or maturity warrants it.
7. **Needs simplification** — Overlaps another surface or naming overload.
8. **Candidate merge** — Keep routes; unify entry points or tabs (see [MODULE_CONSOLIDATION_PLAN.md](./MODULE_CONSOLIDATION_PLAN.md)).

## Recommendation table (default visibility)

Ghost and cloud kitchen columns match **Ghost / cloud**; meal prep column is **Meal prep**. Default visibility: **On** = show in recommended nav for that mode; **Off** = recommend hidden until enabled in **Settings → Modules**.

| Module | Restaurant | Café | Bar | Bakery | Catering | Meal prep | Ghost / cloud | Default (new workspace) | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard / Today | On | On | On | On | On | On | On | On | P0 |
| Orders / Order hub | On | On | On | On | On | On | On | On | P0 |
| Weekly menus / Menu planner | Off | On | Off | On | On | On | On | Mode-based | P0–P1 |
| Menu items | On | On | On | On | On | On | On | On | P0 |
| Kitchen production / Screen | On | On | On | On | On | On | On | On | P0 |
| Packing / Verify / Labels | Segment | Segment | Off | On | On | On | On | Mode-based | P0–P2 |
| Storefront / Sales channels | On | On | On | On | On | On | On | On | P0 |
| Ingredient demand / Purchasing / Costing | On | On | On | On | On | On | On | On | P1 |
| Routes | Segment | Off | Off | Segment | On | On | On | Mode-based | P1 |
| CRM / Meal plans / Catering quotes | Segment | On | Segment | Segment | On | On | Off | Mode-based | P1 |
| Tasks / Staff / Locations | On | On | On | On | On | On | On | On | P1 |
| Analytics / Forecast / Reports / Executive | Off | Off | Off | Off | On | On | On | Grow into | P1–P2 |
| Implementation / Import / Go-live / Training | Off | Off | Off | Off | Off | Off | Off | Off | P2 |
| Growth / Partner / Platform / Beta | Internal | Internal | Internal | Internal | Internal | Internal | Internal | Superadmin only | — |

For **business mode definitions** and experience defaults, see [BUSINESS_MODES.md](./BUSINESS_MODES.md). For **module gating in the app**, see [MODULE_VISIBILITY.md](./MODULE_VISIBILITY.md).
