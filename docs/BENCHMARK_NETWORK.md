# Benchmark Network

Anonymized industry comparison engine — compare your restaurant KPIs against peer cohorts with percentile ranks, quartile bands, and trend direction.

## Overview

The Benchmark Network compares **20+ operational metrics** from your workspace against anonymized industry cohorts. Each metric includes:

- **Your value** vs industry average, top quartile, and bottom quartile
- **Percentile rank** (1–99)
- **Trend** (up / down / stable) from period-over-period deltas
- **Sample size** from the anonymized cohort pool

All outputs are labeled **AI-assisted** with explicit confidence scores. No PII leaves the workspace; cohort data uses aggregated industry baselines until the live network pool grows.

## Architecture

```
services/ai/benchmark-network.ts     — getBenchmarkData(workspaceId)
lib/ai/benchmark-network-types.ts    — BenchmarkData types
lib/ai/benchmark-cohort-seeds.ts     — anonymized cohort baselines (RESTAURANT, CAFE, MEAL_PREP, ALL)
lib/ai/benchmark-network-builders.ts — percentile math, metric assembly
lib/ai/benchmark-workspace-metrics.ts — extract KPIs from executive + food cost + labor + KDS
```

## Metrics (23)

| Category | Metrics |
|----------|---------|
| Cost | Food cost %, gross margin %, waste %, cost variance alerts |
| Labor | Labor cost % |
| Revenue | Avg ticket, orders/day, revenue/day, channel diversity, menu velocity, catering pipeline |
| Operations | Production completion, packing accuracy, delivery completion, health score, open task rate, KDS wait, integration failures |
| Inventory | Shortage rate, PO overdue rate, demand shortage lines |
| Customers | Repeat rate, active meal plans |

## Usage

```typescript
import { getBenchmarkData, listBenchmarkCohorts } from "@/services/ai/benchmark-network";

const benchmarks = await getBenchmarkData(workspaceId);
console.log(benchmarks.summary.averagePercentile);
console.log(benchmarks.metrics.find((m) => m.key === "food_cost_percent"));

// Override cohort
const cafe = await getBenchmarkData(workspaceId, { cohortId: "cafe-na" });
```

## Cohorts

Cohorts are selected automatically from `KitchenSettings.businessType`:

- `RESTAURANT` → Full-service restaurants · North America (n≈1,240)
- `CAFE` → Cafés & quick service · North America (n≈890)
- `MEAL_PREP` → Meal prep & delivery · North America (n≈620)
- Default → All restaurant types · North America (n≈2,750)

## Data sources

- Executive dashboard (`loadExecutiveOverview`) — revenue, orders, operations, health
- Food Cost AI (`analyzeFoodCost`) — food cost % and gross margin
- Labor realtime — labor cost % of revenue
- Real-time Digital Twin — KDS predicted wait times

## Network effects

```typescript
import { contributeData, getNetworkStatus } from "@/services/ai/benchmark-network";

// Opt-in: share bucketed anonymized KPIs (one-way hash ID, no PII)
const result = await contributeData(workspaceId);
console.log(result.networkStatus.contributionImpact);

// Network-wide status
const status = await getNetworkStatus(workspaceId);
console.log(status.totalRestaurants, status.liveContributors);
```

Live contributions are stored in `artifacts/benchmark-network-pool.json` and merged into cohort statistics. Each workspace tracks opt-in state in `settingsCenterJson.benchmarkNetwork.contribution`.

## Related

- Benchmark UI: `app/dashboard/analytics/benchmarks/page.tsx`
- Cycle 22: Network effects (`contributeData`, `getNetworkStatus`)
