# Sentry — real integration readiness

## Dependency

- `@sentry/nextjs` is installed.
- Config files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
- `instrumentation.ts` loads server + edge configs.
- Root `app/layout.tsx` imports `../sentry.client.config` so browser SDK initializes when `NEXT_PUBLIC_SENTRY_DSN` is set.

## Server capture API

- `services/observability/error-reporting-service.ts` — `captureErrorSafe(error, context?)`
  - Sends to Sentry only when `SENTRY_DSN` is set **and** `Sentry.getClient()` is non-null after `Sentry.init`.
  - Tags are passed through `redactObservabilityContext` — no raw payloads, tokens, or secrets.

## Honest “live” definition

| State | Meaning |
|-------|---------|
| `sentryServer: not_configured` | No `SENTRY_DSN` |
| `sentryServer: dsn_uninitialized` | DSN present but SDK not initialized (build/instrumentation issue) |
| `sentryServer: live` | DSN + client present |

Exposed via `loadExtendedHealthSnapshot()` and `/platform/health` UI.

## Client vs server DSN

- **Server** events: `SENTRY_DSN`.
- **Browser** events: `NEXT_PUBLIC_SENTRY_DSN` (optional; do not put secret keys in `NEXT_PUBLIC_*`).

## Tests

- `tests/unit/sentry-capture-safe.test.ts` — no-op without DSN; capture with mocked client when DSN set.
