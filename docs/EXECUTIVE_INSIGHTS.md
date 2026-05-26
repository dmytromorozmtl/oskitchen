# Executive insights

Insights are the "what should I do next?" cards. They live in two
places:

1. **In-memory** seeds returned by `deriveInsights(InsightContext)` in
   `lib/executive/executive-insights.ts`.
2. **Persisted** rows in the `executive_insights` table, kept in sync
   by `syncExecutiveInsights(scope, overview)`.

## Insight types

| Type | Severity | Trigger |
|------|----------|---------|
| `revenue_drop` | WARNING | Revenue trend ≤ −20% vs. previous window |
| `packing_accuracy_low` | WARNING | Packing accuracy < 90% |
| `production_overdue` | WARNING / CRITICAL (≥ 10) | Production items not yet completed in window |
| `production_capacity_warning` | WARNING | Orders up > 25% **and** production completion < 90% |
| `inventory_shortage_upcoming` | CRITICAL | ≥ 1 shortage with `demandDate` within 3 days |
| `inventory_shortage_upcoming` | WARNING | Any open shortage outside the 3-day horizon |
| `low_repeat_rate` | INFO | Repeat rate < 20% |
| `low_margin_item` | WARNING | Any profitability line flagged in latest costing run |
| `failed_channel_integration` | CRITICAL | Any integration in `NEEDS_AUTH` / `ERROR` |
| `failed_delivery_stops` | WARNING | Any `DeliveryStop` in `FAILED` |
| `catering_followup_overdue` | INFO | Pending catering follow-ups past `dueAt` |
| `meal_plan_cycles_missing` | WARNING | Active meal plans with zero upcoming / ready-to-generate cycles |
| `overdue_tasks` | WARNING | More than 5 overdue kitchen tasks |
| `purchase_order_stale` | INFO | Draft purchase orders older than 7 days |
| `all_clear` | SUCCESS | None of the above |

## Sync semantics

`syncExecutiveInsights` is the only place that touches the persistence
layer:

1. For each open insight whose type is no longer present in the seeds,
   transition to `RESOLVED` (`resolvedBy = "auto"`).
2. For each seed, if an open row of the same type exists, update its
   title / description / severity / metadata. Otherwise insert a new
   row.

This means dashboards always reflect the latest snapshot **without
duplicating rows**.

## Manual resolution

`resolveExecutiveInsightAction(id)` and
`dismissExecutiveInsightAction(id)` transition rows to `RESOLVED` /
`DISMISSED`. Only roles with `executive.insights.manage` (owner /
manager / admin / superadmin) can call them.

The next snapshot run can re-create an insight if its trigger
condition is still true. Dismissed insights are *not* automatically
re-created with the same id — they reappear with a fresh row.
