# Observability setup — OS Kitchen

**Version:** 1.0 · **June 2026**  
**Audience:** Engineering + Ops  
**Scope:** Error monitoring (Sentry), distributed tracing (OpenTelemetry), health signals, and safe logging.

Production today (`GET /api/health`) may report `observability.backend: "NONE"` and `sentryServer.status: "not_configured"` until env vars are set. Both backends are **optional no-ops** when unset — no code changes required to activate.

---

## Architecture overview

| Layer | Purpose | Active when |
|-------|---------|-------------|
| **Sentry** | Server/edge/browser exceptions + optional performance spans | `SENTRY_DSN` set |
| **OpenTelemetry** | Storefront experiment trace export (OTLP HTTP) | `OTEL_EXPORTER_OTLP_ENDPOINT` set and `EXPERIMENT_OTEL≠0` |
| **In-app error events** | Workspace/platform error rollups in dashboard | Always (DB-backed) |
| **Structured logging** | `lib/logger.ts` — dev console, prod-safe redaction | Always |

Backend resolution (`lib/observability/observability-config.ts`):

1. `SENTRY_DSN` → backend **`SENTRY`** (Sentry takes precedence)
2. else `OTEL_EXPORTER_OTLP_ENDPOINT` → backend **`OTEL`**
3. else **`NONE`**

Boot sequence (`instrumentation.ts`):

```
register() [nodejs]
  → assertNodeStartupReadiness()
  → sentry.server.config.ts   (Sentry.init when DSN present)
  → initExperimentOtel()      (OTLP exporter when endpoint present)
register() [edge]
  → sentry.edge.config.ts
```

Application code should use:

- `captureErrorSafe()` — `services/observability/error-reporting-service.ts`
- `tracePerformance()` — `lib/observability/apm.ts` (Sentry spans when configured)
- `recordExperimentOtelSpan()` — `lib/observability/experiment-otel.ts` (storefront experiment flows)

**Rule:** never attach secrets, raw webhook bodies, or PII to error/trace context. Use `redactObservabilityContext()` (`lib/observability/redaction.ts`).

---

## Part 1 — Sentry (recommended for production)

Detailed step-by-step: **[`docs/sentry-setup.md`](./sentry-setup.md)**

### Quick reference

| Variable | Required | Environment | Notes |
|----------|:--------:|-------------|-------|
| `SENTRY_DSN` | **Yes** (server) | Production, Preview (optional) | Node + edge init |
| `SENTRY_TRACES_SAMPLE_RATE` | No | Production | Default `0.1` in prod via `lib/observability/apm.ts` |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Production | Browser errors only |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | No | Production | Keep `0` unless profiling needed |

### Vercel activation

1. Create Sentry project (Next.js platform) → copy DSN
2. Vercel → Project → Settings → Environment Variables → **Production**
3. Set `SENTRY_DSN` (and optional public DSN)
4. Redeploy

Or use the repo script:

```bash
# Dry-run
npm run sentry:production:activate

# Apply + redeploy
SENTRY_DSN=https://YOUR_DSN npm run sentry:production:activate -- --apply --deploy
```

Script: `scripts/push-vercel-production-sentry.ts`

### Verify Sentry

```bash
curl -s https://os-kitchen.com/api/health | jq '.checks.observability, .checks.sentryServer'
```

Expected after deploy:

```json
{ "backend": "SENTRY" }
{ "ok": true, "configured": true, "status": "live" }
```

Staging smoke (never prod without approval):

```typescript
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
captureErrorSafe(new Error("Sentry smoke test"), { tags: { smoke: "observability-setup" } });
```

Alert rules: [`docs/SENTRY_ALERT_RULES.md`](./SENTRY_ALERT_RULES.md)  
Readiness definitions: [`docs/SENTRY_REAL_INTEGRATION_READINESS.md`](./SENTRY_REAL_INTEGRATION_READINESS.md)

---

## Part 2 — OpenTelemetry (storefront experiment traces)

OTEL is **scoped** to storefront experiment flows — not full APM for every route. It complements Sentry; Sentry wins when both DSN and OTEL endpoint are set (`resolveObservabilityBackend()`).

Implementation: `lib/observability/experiment-otel.ts`  
Init: `initExperimentOtel()` from `instrumentation.ts` (Node runtime only)

### Environment variables

| Variable | Required | Example | Notes |
|----------|:--------:|---------|-------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | **Yes** | `https://api.datadoghq.com` | Base URL; `/v1/traces` appended automatically |
| `OTEL_SERVICE_NAME` | No | `kitchenos-storefront-experiment` | Default if unset |
| `EXPERIMENT_OTEL` | No | `1` | Set `0` to disable export while keeping endpoint |
| `DD_API_KEY` | For Datadog | — | Sent as `dd-api-key` header |
| `HONEYCOMB_API_KEY` | For Honeycomb | — | Sent as `x-honeycomb-team` header |
| `DATADOG_SITE` | No | `datadoghq.com` | Used for trace deep-link URLs |
| `DATADOG_APP_URL` | No | `https://app.datadoghq.com` | Override trace URL builder |
| `HONEYCOMB_APP_URL` | No | `https://ui.honeycomb.io/your-env` | Override trace URL builder |

### Datadog example (Vercel Production)

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadoghq.com
OTEL_SERVICE_NAME=kitchenos-storefront-experiment
DD_API_KEY=your_datadog_api_key
DATADOG_SITE=datadoghq.com
EXPERIMENT_OTEL=1
```

### Honeycomb example

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_SERVICE_NAME=kitchenos-storefront-experiment
HONEYCOMB_API_KEY=your_honeycomb_key
HONEYCOMB_APP_URL=https://ui.honeycomb.io/your-env
EXPERIMENT_OTEL=1
```

### Verify OTEL

1. Enable experiment tracing on a storefront checkout path (see `lib/storefront/experiment-trace.ts`)
2. Confirm spans in Datadog/Honeycomb UI
3. Health check shows OTEL backend **only when Sentry DSN is unset**:

```bash
# With SENTRY_DSN unset and OTEL endpoint set:
curl -s "$STAGING_URL/api/health" | jq '.checks.observability'
# → "OTEL"
```

Trace deep links: `experimentTraceUrl(traceId)` in `lib/observability/experiment-otel.ts`

**Not in scope today:** auto-instrumentation of all HTTP/Prisma/Redis calls. General span wrapper `services/observability/tracing-service.ts` remains a no-op placeholder for future full APM.

---

## Part 3 — Health & ops signals

| Endpoint / surface | What it reports |
|--------------------|-----------------|
| `GET /api/health` | `observability` backend, `sentryServer` status, DB, cron, queue, rate limit |
| `/platform/health` | Extended ops dashboard (Sentry live badge) |
| `/dashboard/developer` | Workspace observability panel (error event rollups) |

Contract tests: `tests/unit/api-health-contract.test.ts`, `tests/e2e/public-health.spec.ts`

### Recommended production minimum

| Gate | Owner | Evidence |
|------|-------|----------|
| `SENTRY_DSN` on Vercel Production | Ops | Vercel env list |
| `/api/health` → `sentryServer.status: live` | QA | JSON after deploy |
| Sentry alert rules configured | Ops | Sentry project settings |
| Cron + webhook synthetic green | Ops | [`docs/OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md`](./OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md) |
| OTEL (optional) | Engineering | Spans visible for experiment checkout |

Full activation checklist: [`docs/OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md`](./OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md)  
Webhook/cron runbook: [`docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md`](./OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md)

---

## Part 4 — Logging policy

Use **`lib/logger.ts`** — never `console.log` for production diagnostics without redaction.

| Do | Don't |
|----|-------|
| Log correlation IDs, HTTP status, duration | Log API keys, webhook secrets, session tokens |
| Use `redactForLog()` for payloads | Log full customer PII in production |
| Classify integration errors (`auth`, `rate_limit`, …) | Attach raw Stripe/WooCommerce bodies to Sentry |

Console.log audit (planned): Task 24 — `scripts/audit-console-log.sh`

---

## Local development

`.env.local` (optional — both backends no-op when unset):

```env
# Sentry (optional local testing)
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0

# OpenTelemetry (optional — requires reachable OTLP collector)
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=kitchenos-local
EXPERIMENT_OTEL=0
```

Unit tests: `tests/unit/sentry-capture-safe.test.ts`, `tests/unit/apm.test.ts`

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`sentry-setup.md`](./sentry-setup.md) | Sentry DSN, Vercel vars, verification |
| [`OBSERVABILITY.md`](./OBSERVABILITY.md) | Logging, correlation IDs, support checklist |
| [`OBSERVABILITY_FOUNDATION.md`](./OBSERVABILITY_FOUNDATION.md) | Code module map |
| [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) | Full env reference |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Staging vault + smoke prerequisites |

---

## Sales-safe language

| OK | Not OK |
|----|--------|
| "Error monitoring via Sentry when configured" | "24/7 Sentry monitoring" (until health shows `live`) |
| "Experiment trace export via OpenTelemetry when enabled" | "Full APM on every route" |
| "In-app error rollups for workspace operators" | "SOC 2 certified observability" |
