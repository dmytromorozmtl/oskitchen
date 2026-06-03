# Restaurant Network Effects

OS Kitchen becomes more accurate as anonymized KPIs flow into the shared benchmark pool — without exposing any PII.

## Overview

- **Intelligence index** (0–100): rises with live contributors, pooled metrics, and contribution impact
- **Milestones**: unlock at 1, 5, 10, 25, and 50 live contributors
- **Cohort mesh**: seed industry baselines + live peer deltas per cohort
- **Contribution**: same anonymized pipeline as Benchmark Network (`contributeData`)

## Routes

| Path | Description |
|------|-------------|
| `/dashboard/analytics/network` | Network effects dashboard |
| `/dashboard/analytics/benchmarks` | Peer benchmarks (links here) |

## Services

```
services/ai/network-effects-service.ts  — loadNetworkEffectsDashboard, contributeToNetworkEffects
lib/ai/network-effects-builders.ts        — intelligence index, milestones, cohort insights
services/ai/benchmark-network.ts          — getNetworkStatus, contributeData (pool storage)
```

## Actions

- `contributeNetworkEffectsAction` — contribute anonymized KPIs and refresh
- `refreshNetworkEffectsDashboardAction` — reload dashboard
