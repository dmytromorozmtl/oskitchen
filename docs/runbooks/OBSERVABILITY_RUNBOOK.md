# Observability runbook

## Symptoms

- No Sentry events despite errors.

## Checks

1. `SENTRY_DSN` set?
2. `captureErrorSafe` only forwards when backend resolves to `SENTRY` — SDK not bundled yet.

## Actions

- Until SDK wired, rely on platform logs + DB audit tables.
