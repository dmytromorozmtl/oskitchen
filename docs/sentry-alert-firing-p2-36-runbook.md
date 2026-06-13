# Sentry alert firing verification (P2-36)

Policy: `sentry-alert-firing-p2-36-v1`

Verify that a safe cron failure reaches Sentry and triggers the configured alert within **5 minutes**.

## Prerequisites

1. `SENTRY_DSN` live on staging/production (`npm run sentry:production:verify`).
2. Sentry alert rules configured — see [SENTRY_ALERT_RULES.md](./SENTRY_ALERT_RULES.md).
3. Staging has `ENABLE_EXPERIMENTAL_CRONS=true` and `CRON_SECRET` set.

## Flow

| Step | Action |
|------|--------|
| 1. `trigger_error` | `GET /api/cron/health-ping?fail=1` with `Authorization: Bearer $CRON_SECRET` |
| 2. `verify_sentry_capture` | Issue appears in Sentry with tag `ops_signal:cron_failure` |
| 3. `assert_alert_rules_doc` | Alert rule filters on `cron_failure` (see SENTRY_ALERT_RULES §1) |
| 4. `verify_production_health` | `npm run sentry:production:verify` → `checks.sentryServer.ok === true` |

## Staging trigger

```bash
export ENABLE_EXPERIMENTAL_CRONS=true
export CRON_SECRET=...
export STAGING_URL=https://your-staging.example.com

curl -s -w "\nHTTP %{http_code}\n" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$STAGING_URL/api/cron/health-ping?fail=1"
# Expect HTTP 500 and JSON opsSignal=cron_failure
```

Or use the orchestrator:

```bash
SENTRY_ALERT_FIRING_LIVE=true \
  CRON_SECRET=... \
  STAGING_URL=https://your-staging.example.com \
  npm run run:sentry-alert-firing-p2-36
```

## Alert SLA

- **Target:** notification within **5 minutes** of trigger.
- Artifact: `artifacts/sentry-alert-firing-p2-36-summary.json`

## CI / deploy gate

Static wiring is audited on every deploy:

```bash
npm run audit:sentry-alert-firing-p2-36
npm run check:sentry-alert-firing-p2-36
```

Live firing is **manual ops verification** — not run in CI (requires secrets + Sentry UI confirmation).
