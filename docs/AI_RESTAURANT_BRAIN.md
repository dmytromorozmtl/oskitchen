# AI Restaurant Brain — Daily Briefing Engine

Cycle 1 of the AI Restaurant Brain moat. Generates a structured daily briefing from existing KitchenOS operational data.

## Service

- `services/ai/ai-restaurant-brain.ts` — `generateDailyBriefing(workspaceId)` orchestrator
- `lib/ai/restaurant-brain-types.ts` — payload types
- `lib/ai/restaurant-brain-builders.ts` — pure, testable insight builders

Also exposed via `generateDailyBriefingForUser(userId)` and composed into `buildOperationalIntelligenceSnapshot`.

## Insight categories

| Category | Data sources | Notes |
|----------|--------------|-------|
| Inventory alerts | Ingredient demand command center | Shortages, days remaining, reorder qty |
| Labor insights | AI schedule plan, labor realtime, overtime predictions | Under/overstaffing, OT risk |
| Menu profitability | Latest costing run vs previous run | Margin trend, food cost % |
| Staff performance | POS transactions by staff, packing accuracy | Order volume, tip rate proxy |
| Profit analysis | Executive overview, costing KPIs, labor % | Revenue, margin, food & labor cost |
| Weekly forecast | Schedule plan + recent daily revenue | Confidence scales with history depth |

## Honest AI labeling

- Every insight message is prefixed or described as **AI-assisted suggestion**.
- Each section includes an explicit `confidence` score (0–1).
- `DailyBriefing.overallConfidence` is the mean of section confidences.
- No generative LLM is required; insights are deterministic aggregates aligned with `deterministic-insights-service`.

## Privacy

- Aggregates only — no customer PII in briefing payloads.
- Staff names appear only when tied to in-workspace POS/timeclock data the owner already sees.

## Limitations

- Menu week-over-week trend requires at least two completed costing runs.
- Staff insights need POS transactions with `staffId` populated.
- Labor understaffing uses demand-based schedule plan, not live KDS queue length.
- Forecast confidence is low when order history is sparse (< 2 weeks).

## Tests

- Unit: `tests/unit/ai-restaurant-brain.test.ts`, `tests/unit/predictive-alerts.test.ts`
- Integration (mocked deps): `tests/integration/ai-restaurant-brain.integration.test.ts`, `tests/integration/predictive-alerts.integration.test.ts`

## Predictive alerts (Cycle 3)

- `services/ai/predictive-alerts.ts` — `generatePredictiveAlerts(workspaceId)`
- Types: `inventory_shortage`, `labor_gap`, `margin_decline`, `demand_surge`
- Each alert includes `impact` (USD), `confidence` (0–1), `suggestedAction`, `expiresAt`
- Sorted by impact descending

## Briefing delivery (Cycle 4)

- `services/ai/briefing-delivery.ts` — `deliverDailyBriefing(workspaceId)`
- `getNotificationSettings(workspaceId)` — email/SMS channels + local delivery time
- Settings stored in `KitchenSettings.settingsCenterJson.aiBriefingDelivery`
- Email: HTML briefing + predictive alerts via Resend (logged in `notification_logs`)
- SMS: critical predictive alerts only (when `sms.criticalOnly`, default true)
- `deliverDailyBriefingIfScheduled` for cron jobs (respects timezone + `deliveryTimeLocal`)

## Next cycles

- ~~Cycle 2: Owner Dashboard UI (`app/dashboard/today/page.tsx`)~~ — done (`AiBriefingPanel`)
- ~~Cycle 3: Predictive alerts engine~~ — done (`services/ai/predictive-alerts.ts`)
- ~~Cycle 4: Email/SMS briefing delivery~~ — done (`services/ai/briefing-delivery.ts`)

**AI Restaurant Brain complete (cycles 1–4).** Next feature: Digital Twin (cycle 5).
