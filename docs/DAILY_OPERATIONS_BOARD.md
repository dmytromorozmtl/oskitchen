# Daily operations board (“Today”)

**Route:** `/dashboard/today`

## Intent

Single operational home for the shift: orders needing attention, production/packing cues, routes, tasks, and integration health snippets — **mode-aware copy** should come from `lib/business-modes.ts` / `lib/terminology.ts` as those sections grow.

## Data sources (evolve incrementally)

- Orders: same queries as dashboard summaries.
- Production / packing: `production` / `packing` modules.
- Routes, tasks, low stock: wire when reliable aggregates exist.

## KPIs

See [BUSINESS_KPIS.md](./BUSINESS_KPIS.md) for the registry; Today should surface **three to five** primary KPIs per mode, not the full executive deck.
