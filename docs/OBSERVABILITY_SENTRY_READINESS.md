# Observability — Sentry readiness

## Current behavior

- `resolveObservabilityBackend()` picks `SENTRY` when `SENTRY_DSN` is set; otherwise `NONE`.
- `captureErrorSafe` logs to stderr with **redacted** context — does **not** bundle `@sentry/nextjs` yet.

## Next step (when approved)

1. Add `@sentry/nextjs` dependency.
2. Wire `Sentry.init` in `instrumentation.ts` / Next config per vendor guide.
3. Replace `console.error` branch with real capture; keep `redactObservabilityContext` + `redactFreeText`.

## Honesty

- Do not label Sentry as “live” in UI unless DSN is configured **and** SDK initialized.
