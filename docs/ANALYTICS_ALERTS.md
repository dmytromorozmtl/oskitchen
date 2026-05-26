# Alerts

All alerts are rule-based and explainable. We never call ML / AI APIs.

## Rules (`services/analytics/alerts-service.ts`)

| Type | Trigger |
|------|---------|
| `LATE_PACKING_RATE` | packingCompletionRate < 0.85 (critical < 0.7) |
| `PRODUCTION_OVERLOAD` | productionCompletionRate < 0.80 (critical < 0.6) |
| `ROUTE_OVERLOAD` | deliveryCompletionRate < 0.80 (critical < 0.6) |
| `LOW_REPEAT_RATE` | repeatRate < 10% AND activeCustomers ≥ 50 |
| `RISING_CANCELLATIONS` | cancelled / (gross + cancelled) > 10% (critical > 20%) |
| `CATERING_EVENT_CONFLICT` | reserved for future |
| `DECLINING_REVENUE` | reserved for future |
| `HIGH_RISK_SHORTAGE` | reserved for future (hook to purchasing) |
| `VIP_CHURN_RISK` | reserved for future |

## Lifecycle

1. Owner toggles alerts via `actions/analytics.ts:toggleAnalyticsAlertAction`.
2. `evaluateAnalyticsAlerts(userId)` evaluates current overview metrics.
3. If a triggered type is enabled, we set `lastTriggered` on the row
   and write an `analytics_events` row of type `ALERT_TRIGGERED`.

## UI surfacing

Triggered alerts are surfaced inline on the executive overview when
implemented. The persistence model is already wired so a future
"Alerts inbox" can show timeline of triggers.
