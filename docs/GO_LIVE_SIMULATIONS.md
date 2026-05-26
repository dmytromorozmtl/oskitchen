# Launch simulations

## Goal

Run **deterministic** test-day simulations against the current
workspace snapshot without touching live data. Each simulation
produces a structured `SimulationReport` stored in
`GoLiveSimulation.outputJson` along with the result.

## Scenarios

| Type | Target orders | Window | Channels |
|------|---------------|--------|----------|
| `LUNCH_RUSH` | 120 | 150 min | storefront, uber-eats |
| `MEAL_PREP_BATCH` | 80 | 8 h | storefront |
| `CATERING_EVENT` | 1 large quote | 4 h | manual |
| `MULTI_LOCATION_DAY` | 300 | 10 h | storefront, shopify |
| `DELIVERY_SURGE` | 200 | 4 h | uber-direct, storefront |
| `HOLIDAY_VOLUME` | 500 | 12 h | storefront, shopify, uber-eats |
| `GHOST_KITCHEN_SPIKE` | 250 | 4 h | uber-eats, uber-direct |
| `CUSTOM` | 50 | 2 h | user-defined |

## Findings

Each scenario emits findings shaped like:

```
{ level: 'OK' | 'WARNING' | 'ERROR', module, message, recommendation? }
```

Modules currently inspected:

- `catalog`, `staffing`, `kitchen`, `integrations`, `mapping`,
  `routes`, `packing`, `labels`, `analytics`, `throughput`.

The result tag is computed deterministically from the findings:

- Any `ERROR` → `FAILED`
- Any `WARNING` (no ERROR) → `WARNING`
- Otherwise → `PASSED`

## Throughput estimate

```
base = max(5, staffActive * 8)
packing = packingValidated > 0 ? 1.2 : 0.8
integrations = brokenConnections > 0 ? 0.5 : 1
business = MEAL_PREP ? 1.4 : GHOST_KITCHEN ? 1.2 : 1
estimated = round(base * packing * integrations * business)
```

If the estimate is below the scenario's required throughput
(`targetOrders / (durationMinutes / 60)`), a warning is added.

## Safety

- No Prisma writes outside of the simulation row itself.
- No external API calls.
- No real orders, no inventory mutation, no notifications.
- Output JSON is bounded — only the findings + recommendations.
