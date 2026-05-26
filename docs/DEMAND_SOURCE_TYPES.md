# Demand source types

Canonical enum strings live in `lib/ingredient-demand/types.ts` (`DEMAND_SOURCE_TYPES`).

| Source | Implemented | Notes |
|--------|-------------|-------|
| `CONFIRMED_ORDERS` | Yes | `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED` |
| `DRAFT_ORDERS` | Yes | `PENDING` |
| `STOREFRONT_PREORDERS` | Yes | Same orders table when `storefrontOrder` exists |
| `PRODUCTION_PLAN` | Yes | Work items tied to non-archived batches in date window |
| `MENU_FORECAST` | Stub | Info warning when enabled |
| `CATERING_EVENTS` | Stub | |
| `BAKERY_BATCHES` | Stub | Prefer enabling `PRODUCTION_PLAN` + bakery modes |
| `BAR_PREP` | Stub | |
| `CAFE_SPECIALS` | Stub | |
| `MANUAL_PLAN` | Stub | |
| `HISTORICAL_FORECAST` | Stub | |

Toggle + confidence live under `enabledSources` in settings JSON.
