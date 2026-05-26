# Platform tools

## Access

`/platform/tools` and `/platform/tools/db-health` require `platform:tools:run`.

## Implemented

- Database latency / connectivity check via `checkDatabaseHealth`.
- Public `/api/health` JSON link.

## Planned dangerous tools

Per product spec: replay webhook, clear cache, export diagnostics — each must:

1. Require explicit confirmation + reason.
2. Use founder-only or scoped permission (`platform:dangerous-actions:run`).
3. Call `recordPlatformAudit` with structured metadata (no secrets).
