# Observability foundation

- `lib/observability/observability-config.ts` — resolves NONE / SENTRY / OTEL from env.
- `services/observability/error-reporting-service.ts` — `captureErrorSafe` console hook when `SENTRY_DSN` set (SDK embed deferred).
- `services/observability/tracing-service.ts` — no-op span wrapper for future OTEL.
- `services/observability/health-check-service.ts` — `getServerHealthSignals` + `loadExtendedHealthSnapshot` for `/api/health` extras (queue mode + observability backend label).

**Rule:** never attach secrets or raw webhook bodies to error contexts.
