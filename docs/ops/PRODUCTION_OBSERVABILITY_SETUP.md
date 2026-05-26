# Production Observability Setup

**Related:** Week 1 checklist · `docs/GTM_EXECUTION_PLAN_24MAY2026.md` (item OPS-01)

---

## 1. Sentry (errors + APM)

### Vercel environment variables

| Variable | Example | Required |
|----------|---------|----------|
| `SENTRY_DSN` | `https://…@….ingest.sentry.io/…` | Yes |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` | Recommended (10% traces in prod) |
| `SENTRY_AUTH_TOKEN` | CI only | For source maps upload |

### Push helper

Dry-run:

```bash
npm run sentry:production:activate
```

Apply + deploy:

```bash
SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy
```

Optional browser capture:

```bash
SENTRY_DSN=https://... NEXT_PUBLIC_SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy
```

### Verify

```bash
curl -s https://os-kitchen.com/api/health | jq '.checks.observability, .checks.sentryServer'
# Expect after DSN setup:
# { "ok": true, "backend": "SENTRY", "configured": true, "sentryConnected": true, ... }
# { "ok": true, "configured": true, "status": "live" }
```

Trigger a test error in staging, confirm event in Sentry.

### Alerts (Sentry UI)

| Alert | Condition |
|-------|-----------|
| High error rate | >10 events / 5 min |
| DB slow | Transaction `database` p95 > 800ms |
| Cron failure | Tag `cron` + level error |

**Cost:** ~$26/mo Team plan with performance.

---

## 2. PostHog (product analytics)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` (default) |

Events captured when key is set:

- `$pageview` (dashboard + marketing via `PostHogProvider`)
- `nps_score` (in-app NPS prompt)

**Recommended dashboards:** signup funnel, first order created, pilot started.

---

## 3. GA4 (marketing)

Already in CSP. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` if not on production.

---

## 4. Weekly production smoke (GitHub Actions)

Workflow: `.github/workflows/production-weekly-smoke.yml`

Runs every **Monday 14:00 UTC** against `https://os-kitchen.com` (public health + sitemap).

Manual run: Actions → Production weekly smoke → Run workflow.

---

## 5. Health endpoint contract

`GET /api/health` returns:

- `database.ok`, `database.latencyMs` — alert if p95 >500ms sustained
- `rateLimitAdapter` — must be `upstash` in production
- `observability.backend` — `SENTRY` when DSN set, else `NONE`
- `sentryServer.status` — `live`, `not_configured`, or `dsn_uninitialized`

---

*After setup, mark observability items complete in `docs/WEEK_1_LAUNCH_CHECKLIST.md`.*
