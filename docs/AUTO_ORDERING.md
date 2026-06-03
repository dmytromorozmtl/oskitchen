# Advanced Inventory Auto-Ordering

Signal-adjusted purchase proposals and batch PO creation on top of AI Purchasing.

## Route

`/dashboard/inventory/auto-ordering` (requires `inventory` plan feature)

## Signals

| Signal | Source | Effect |
|--------|--------|--------|
| **Weather** | Day-of-week + seasonal heuristics | Weekend / summer / winter lifts |
| **Holiday** | US holiday windows (14d horizon) | Demand boost near major dates |
| **Trend** | 14d forecast vs daily usage | Up to +10% or −5% on quantity |

Combined multiplier is capped **0.85×–1.35×** per line.

## Actions

- `updateAutoOrderingSettingsAction` — enable signals / auto-ordering
- `runAutoOrderingBatchAction` — dry run or create POs (critical + high urgency, max 12)
- `refreshAutoOrderingDashboardAction`

## Services

```
services/inventory/auto-ordering-service.ts
lib/inventory/auto-ordering-builders.ts
services/ai/ai-purchasing.ts              — base recommendations
services/ai/ai-purchasing-orders.ts       — PO creation
```

## Related

- `/dashboard/inventory/purchasing-ai` — manual order flow
- Settings key: `settingsCenterJson.inventoryAutoOrdering`
