# Deterministic insights

The deterministic engine is the **source of truth** for the copilot.
It must always work, even when:

- `OPENAI_API_KEY` is missing.
- The AI provider is down.
- The user has set `deterministicOnly = true`.
- The outbound guardrail trips.

## Where it lives

`services/ai/deterministic-insights-service.ts` →
`buildDeterministicSnapshot(userId)`.

Internally it reuses `loadExecutiveOverview` so the copilot and the
Executive Command Center never disagree about the same numbers.

## Insight types

| Type | Trigger | Severity |
|------|---------|----------|
| `throughput_today` | Always emitted (window order count + cancellations) | INFO |
| `failed_integrations` | ≥ 1 integration in `NEEDS_AUTH` / `ERROR` | CRITICAL |
| `production_overdue` | Production items not yet completed | WARNING / CRITICAL (≥ 10) |
| `packing_accuracy_low` | Packing accuracy < 90% | WARNING |
| `failed_delivery_stops` | Any `DeliveryStop.status = FAILED` | WARNING |
| `inventory_shortage_upcoming` | Open ingredient shortage in next 3 days | CRITICAL |
| `inventory_shortage` | Open shortage outside the 3-day horizon | WARNING |
| `purchasing_open` | Any open / draft PO | INFO / WARNING (stale > 0) |
| `catering_followup_overdue` | Pending catering follow-ups past due | INFO |
| `meal_plan_cycles_missing` | Active meal plans with no upcoming cycle | WARNING |
| `overdue_tasks` | > 5 overdue kitchen tasks | WARNING |
| `low_margin_item` | Profitability lines flagged | WARNING |
| `low_repeat_rate` | Repeat rate < 20% | INFO |

## Output shape

```ts
type DeterministicSnapshot = {
  rangeLabel: string;            // e.g. "2026-05-04 → 2026-05-11"
  bulletSummary: string;         // newline-joined "- title: summary → action"
  insights: CopilotInsightSeed[];
};
```

`bulletSummary` is what the narrative engine receives as user content
(after the guardrail). It contains no PII because the upstream
`loadExecutiveOverview` already aggregates to counts.

## Persistence

`persistDeterministicInsights(scope)` clears unresolved deterministic
rows and re-creates the current seed set. Each insight gets:

- `deterministic = true`
- `sourceType` / `actionRoute` for one-click drilldowns
- `severity` + `summary` rendered by `CopilotInsightCard`
