# Operational Analytics & Forecasting (Final)

## Analytics

- Primary implementation remains `services/analytics/analytics-service.ts` (`loadExecutiveOverview`).  
- Enterprise aliases:  
  - `services/analytics/ops-analytics-service.ts`  
  - `services/analytics/kpi-snapshot-service.ts` (default window via `defaultFilters()`)

## Forecasting

- **Demand / production:** deterministic `buildProductionForecast` (`services/forecasting/production-forecast.ts`) re-exported via `demand-forecast-service` / `production-forecast-service`.  
- **Labor:** `labor-forecast-service.ts` stub — explicit low confidence + notes (no payroll claims).  
- **Route risk:** `route-risk-service.ts` stub — requires dispatch telemetry before precision claims.

## AI

- Optional narratives remain behind `OPENAI_API_KEY` in copilot/AI modules — **never** required for core KPIs.

## Honesty requirements

- Always show **confidence** and **data prerequisites** on forecast UI.  
- Never present synthetic precision for churn or margin without labeled sources.
