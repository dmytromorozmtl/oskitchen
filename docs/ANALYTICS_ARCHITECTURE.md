# Analytics architecture

## Layered design

```
app/dashboard/analytics/*               — Next.js routes (Server Components)
   │
   ▼
components/dashboard/analytics-*        — Subnav, filter bar, bar/area chart
   │
   ▼
services/analytics/*                    — Aggregation + reporting + alerts + snapshots
   │
   ▼
lib/analytics/*                         — Pure helpers (no Prisma)
   │
   ▼
prisma (Order, ExternalOrder, ProductionBatch, PackingBatch,
         DeliveryRoute/Stop, CateringQuote, MealPlan, KitchenCustomer,
         Ingredient/Recipe/IngredientDemand*, AnalyticsSnapshot/Event/SavedView/Alert)
```

## Files

| Layer | Path | Purpose |
|-------|------|---------|
| lib | `lib/analytics/kpi-definitions.ts` | Canonical metric catalogue with formulas. |
| lib | `lib/analytics/channel-attribution.ts` | Unified `AnalyticsChannel` taxonomy + `channelForOrder`. |
| lib | `lib/analytics/revenue-metrics.ts` | Revenue-eligibility predicate + `sumRevenue`. |
| lib | `lib/analytics/operational-metrics.ts` | `safeRate`, late-order predicate, delivery aggregator. |
| lib | `lib/analytics/customer-metrics.ts` | Repeat-rate / new-customer math. |
| lib | `lib/analytics/forecasting.ts` | Moving-average forecaster (returns `null` when history is short). |
| lib | `lib/analytics/filters.ts` | URL filter parser + serialiser + window math. |
| lib | `lib/analytics/analytics-permissions.ts` | Role-based gating, superadmin override. |
| lib | `lib/analytics/terminology.ts` | Business-mode page titles. |
| lib | `lib/analytics/server-helpers.ts` | `loadFilterableBrandsAndLocations`. |
| service | `services/analytics/analytics-service.ts` | Executive overview + per-tab loaders (orders, channels, customers, production, packing/delivery, catering, meal plans, inventory). |
| service | `services/analytics/kpi-service.ts` | KPI map with previous-period change %. |
| service | `services/analytics/snapshot-service.ts` | `createAnalyticsSnapshot` + listing. |
| service | `services/analytics/reporting-service.ts` | CSV builders (formula-injection safe, masked email). |
| service | `services/analytics/forecast-service.ts` | 90-day history + 14-day MA forecast. |
| service | `services/analytics/alerts-service.ts` | Explainable threshold alerts. |
| action | `actions/analytics.ts` | Snapshot, saved-view CRUD, alert toggle, CSV export. |

## Tables

- `analytics_snapshots` (one row per snapshot, dense KPIs)
- `analytics_events` (audit trail — snapshot generated / view saved / alert triggered)
- `analytics_saved_views` (named filters + tab)
- `analytics_alerts` (per-user / per-type, enabled flag + threshold JSON)

All four tables cascade on `users.id` and have efficient `(userId, …)` indexes.
