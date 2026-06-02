# OS Kitchen AI Moats

Seven AI-assisted operational moats that differentiate OS Kitchen from generic restaurant software. Every feature is **deterministic-first**, labeled **AI-assisted**, and ships with explicit **confidence scores**. No PII in aggregates; privacy-first by default.

---

## AI Restaurant Brain

**Location:** `services/ai/ai-restaurant-brain.ts` · UI: `app/dashboard/today/page.tsx`

- Daily briefing with six insight categories: inventory, labor, menu, staff, profit, weekly forecast
- Predictive alerts (`services/ai/predictive-alerts.ts`) — inventory shortage, labor gap, margin decline, demand surge with $ impact
- Email + SMS delivery (`services/ai/briefing-delivery.ts`) with configurable schedule
- AI confidence scores on all insights; thumbs feedback on briefing cards

---

## Digital Twin

**Location:** `services/ai/digital-twin.ts` · UI: `app/dashboard/analytics/digital-twin/page.tsx`

- Kitchen simulation: stations, staff, equipment, menu mix
- What-if scenario builder — orders, time window, bottleneck detection
- Real-time KDS integration (`services/ai/real-time-twin.ts`) — live queue state, predictions, alert if bottleneck delay > 15 min
- Utilization gauges and exportable simulation reports

---

## Universal Menu Engine

**Location:** `services/menu/universal-menu-engine.ts` · UI: `app/dashboard/menu/universal/page.tsx`

- One edit → push to POS, Website, Shopify, Uber Eats, DoorDash, Grubhub, Kiosk
- Channel-specific overrides per item
- Sync status monitoring (green / yellow / red) per channel
- Bulk edit, sync history, CSV import/export
- Channel sync: `services/menu/sync/` (`syncMenuItemToShopify`, `syncMenuItemToUberEats`, etc.)

---

## Food Cost AI

**Location:** `services/ai/food-cost-ai.ts` · UI: `app/dashboard/analytics/food-cost/page.tsx`

- Recipe-level ingredient breakdown with price trends
- Real-time margin analysis and recommendations
- Alerts when margin < 30% or ingredient price spike > 10% (`services/ai/food-cost-alerts.ts`)
- 30-day trend chart, profitability drill-down, what-if calculator, waste tracking

---

## AI Purchasing

**Location:** `services/ai/ai-purchasing.ts` · UI: `app/dashboard/inventory/purchasing-ai/page.tsx`

- Purchase recommendations: daily usage, 14-day demand forecast, EOQ, best/alternative supplier with savings
- Auto-ordering with approval workflow (`services/ai/purchasing-automation.ts`) — confidence > 0.85, days remaining < 3, $500 auto-approve threshold
- Order All / per-item Order / Skip with reason; savings tracker

---

## Kitchen Camera AI

**Location:** `services/ai/kitchen-camera.ts` · UI: `app/dashboard/kitchen/cameras/page.tsx`

- On-device processing framework (privacy-first) — queue length, activity level, PPE compliance, equipment status
- Live 4-up camera grid with station overlays
- Alert feed, 30-min timeline, hourly activity heatmap, PPE compliance report
- Digital Twin integration (`services/ai/camera-twin-integration.ts`) — `updateTwinWithCameraData()` feeds real queue data into simulation and KDS predictions

---

## Benchmark Network

**Location:** `services/ai/benchmark-network.ts` · UI: `app/dashboard/analytics/benchmarks/page.tsx`

- 20+ metrics vs anonymized industry cohorts (percentile rank, quartile bands, trend)
- Radar chart, historical comparison, opportunities with estimated $ impact
- Network effects: `contributeData()` (bucketed anonymized KPIs) + `getNetworkStatus()` (total restaurants, cohorts, contribution impact)
- Peer group selector; opt-in data contribution with one-way hash ID

---

## AI Honesty Policy

All AI moat surfaces must:

1. Label outputs as **AI-assisted** (not autonomous or guaranteed)
2. Show **confidence scores** where insights are generated
3. Avoid forbidden claims: "guaranteed", "100% accurate", "always correct", "perfect predictions"
4. Use deterministic operational data as the source of truth; AI layers interpret, not invent

---

## Tracker & Artifacts

- Progress tracker: `artifacts/ai-moats-tracker.json` (22/22 complete)
- Execution log: `artifacts/execution-log.txt`
- Per-moat docs: `docs/AI_RESTAURANT_BRAIN.md`, `docs/DIGITAL_TWIN.md`, `docs/FOOD_COST_AI.md`, `docs/AI_PURCHASING.md`, `docs/KITCHEN_CAMERA_AI.md`, `docs/BENCHMARK_NETWORK.md`
- Final polish: `docs/ai-moats.md` (this file)

---

## Architecture Pattern

```
lib/ai/*-types.ts       — pure types
lib/ai/*-builders.ts   — pure logic (percentiles, alerts, simulation)
services/ai/*.ts        — orchestrators (workspace scope, prisma, existing modules)
app/dashboard/**        — server page → client dashboard component
actions/*.ts            — server actions for interactive UI
tests/unit + integration
```
