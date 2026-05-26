# Operational AI engine

## Services (code)

- `services/ai/operational-ai-service.ts` — wraps deterministic executive-aligned snapshot; exposes whether `OPENAI_API_KEY` is configured **without printing the secret**.
- `services/ai/forecast-ai-service.ts` — latest `ForecastRun` row pointer.
- `services/ai/anomaly-ai-service.ts` — rule-based flags from `loadOperationHealth`.
- `services/ai/recommendation-ai-service.ts` — maps deterministic copilot seeds to **approval-required** recommendations.
- **Ground truth:** `services/ai/deterministic-insights-service.ts`.

## Permissions

- `lib/ai/ai-permissions.ts` aliases `copilot-permissions` capabilities.

## Surfaces

Today, Executive, Forecast, Purchasing, Platform — wire read-only bundles first; **no autonomous writes**.

## Priority

**P1** — differentiate from generic chat using deterministic + optional LLM narrative.
