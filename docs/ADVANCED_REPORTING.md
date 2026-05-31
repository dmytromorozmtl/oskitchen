# Advanced reporting

Unified advanced analytics combining benchmarking, forecasting, and anomaly detection.

## Surface

`/dashboard/analytics/advanced`

## Components

| Capability | Implementation |
|------------|----------------|
| Benchmarking | Current vs prior period (same length): revenue, orders, AOV, cancellation rate |
| Forecasting | 7-day moving-average revenue projection (`lib/analytics/forecasting.ts`) |
| Anomaly detection | Rule-based revenue/order spikes, cancellation thresholds, plus existing analytics alerts and operational flags |

## Service

`services/analytics/advanced-reporting-service.ts`

Forecasts and anomalies are deterministic — no synthetic AI claims.

See `tests/unit/advanced-reporting.test.ts`.
