# Sentry alert firing — production verification (P1-40)

**Policy:** `sentry-alert-firing-p1-40-v1`

Gap closure for QA/DevOps task P1-40: error → Sentry dashboard → alert notification within 5 minutes.

## Chain

```
error trigger → Sentry capture → alert notification (<5 min)
```

| Step | Implementation |
|------|----------------|
| `trigger_error` | GET `/api/cron/health-ping?fail=1` with `CRON_SECRET` |
| `verify_sentry_capture` | `emitCronFailure` → Sentry with `ops_signal:cron_failure` |
| `verify_alert_notification` | Issue alert rule in `docs/SENTRY_ALERT_RULES.md` — 5 min SLA |
| `verify_production_health` | `scripts/verify-sentry-production-health.ts` |

## Live verification

```bash
SENTRY_ALERT_FIRING_LIVE=true CRON_SECRET=... STAGING_URL=https://... \
  npm run run:sentry-alert-firing-p2-36
```

## CI

```bash
npm run check:sentry-alert-firing-p1-40
```

## Artifact

`artifacts/sentry-alert-firing-p1-40.json`
