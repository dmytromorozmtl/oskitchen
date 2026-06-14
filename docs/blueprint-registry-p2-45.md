# Blueprint registry — Sentry production sync (P2-45)

**Policy:** `blueprint-registry-p2-45-v1`  
**Artifact:** `artifacts/blueprint-registry.json`

Gap P2-45 closes stale blueprint registry drift: Sentry was marked **blocked** in `absolute-final-tracker.json` while production `/api/health` reports `checks.sentryServer.ok: true` and `status: live`.

## Sync targets

| Registry | Sentry key | Required value |
|----------|------------|----------------|
| `artifacts/blueprint-registry.json` | `1-sentry-dsn-production` | `ok: true`, `status: done` |
| `artifacts/blueprint-tracker.json` | `1-sentry-dsn-production` | `"done"` |
| `artifacts/sentry-p0-unblock-status.json` | `status` | `"done"` + `healthCheck.sentryServer.status=live` |
| `artifacts/absolute-final-tracker.json` | `2-activate-sentry-dsn` | `"done"` |

## Production proof

- **URL:** `https://os-kitchen.com/api/health`
- **Contract:** `checks.sentryServer.ok === true`, `status === "live"`
- **Verified:** 2026-06-13 (sentry-p0-unblock-status)

## CI

```bash
npm run check:blueprint-registry-p2-45
```

## Related

- `docs/fullreport14june.md` — item 24: blueprint registry stale
- `artifacts/blueprint-complete-registry.json` — 148/150 done; Sentry not in blockedTasks
