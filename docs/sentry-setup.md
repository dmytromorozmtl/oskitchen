# Sentry setup — OS Kitchen (Vercel production)

Production health currently reports `sentryServer.ok: false` when `SENTRY_DSN` is unset. This guide closes that gap without changing application code paths.

## Prerequisites

- Sentry project created at [sentry.io](https://sentry.io) (Next.js platform)
- Vercel project access for `os-kitchen.com`
- `@sentry/nextjs` already installed (see `package.json`)

## How initialization works

| Layer | File | Trigger |
|-------|------|---------|
| Instrumentation hook | `instrumentation.ts:1-14` | Next.js `register()` on server/edge boot |
| Node server SDK | `sentry.server.config.ts:6-11` | `Sentry.init` when `SENTRY_DSN` is set |
| Edge SDK | `sentry.edge.config.ts` | Same DSN on edge runtime |
| Browser SDK | `sentry.client.config.ts` | When `NEXT_PUBLIC_SENTRY_DSN` is set |
| Safe capture API | `services/observability/error-reporting-service.ts` | `captureErrorSafe()` — no-op without DSN |

Server errors route through `captureErrorSafe`. Health exposes status via `/api/health` → `checks.sentryServer`.

## Step 1 — Create DSN

1. Sentry → Projects → **os-kitchen** (or create)
2. Settings → Client Keys (DSN)
3. Copy the **DSN** URL (`https://…@….ingest.sentry.io/…`)

Use the same DSN for server; optionally mirror to public for browser errors.

## Step 2 — Set Vercel environment variables

### Manual (Vercel dashboard)

Project → Settings → Environment Variables → **Production**:

| Variable | Required | Example | Notes |
|----------|:--------:|---------|-------|
| `SENTRY_DSN` | **Yes** | `https://abc@o123.ingest.sentry.io/456` | Server + edge |
| `SENTRY_TRACES_SAMPLE_RATE` | No | `0.1` | Default from `lib/observability/apm.ts` if unset |
| `NEXT_PUBLIC_SENTRY_DSN` | No | same as above | Browser errors only |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | No | `0` | Keep 0 unless profiling needed |

Redeploy after saving env vars.

### CLI (repo script)

Dry-run:

```bash
npm run sentry:production:activate
```

Apply (requires Vercel CLI + login):

```bash
SENTRY_DSN=https://YOUR_DSN npm run sentry:production:activate -- --apply
```

Apply and trigger redeploy:

```bash
SENTRY_DSN=https://YOUR_DSN npm run sentry:production:activate -- --apply --deploy
```

Script: `scripts/push-vercel-production-sentry.ts`

## Step 3 — Verify

1. Redeploy production (or wait for next deploy)
2. `curl -s https://os-kitchen.com/api/health | jq .checks.sentryServer`
   - Expect: `"ok": true`, `"configured": true`, `"status": "live"`
3. Trigger a test error in staging (never in prod without approval):

```typescript
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
captureErrorSafe(new Error("Sentry smoke test"), { tags: { smoke: "sentry-setup" } });
```

4. Confirm event in Sentry Issues (filter by environment `production`)

## Local development

Optional `.env.local`:

```env
SENTRY_DSN=https://YOUR_DSN
SENTRY_TRACES_SAMPLE_RATE=0
```

Without DSN, capture is a no-op (`tests/unit/sentry-capture-safe.test.ts`).

## Human gates (not faked)

| Gate | Owner | Evidence |
|------|-------|----------|
| DSN created in Sentry org | Ops | Sentry project settings screenshot |
| Vercel env vars set | Ops | Vercel env list or `vercel env ls` |
| Health `sentryServer.ok` | QA | `/api/health` JSON after deploy |
| Alert rules | Ops | See `docs/SENTRY_ALERT_RULES.md` |

## Related docs

- `docs/SENTRY_REAL_INTEGRATION_READINESS.md` — live vs not_configured definitions
- `docs/SENTRY_ALERT_RULES.md` — on-call alert configuration

## Sales-safe language

- **OK:** "Error monitoring via Sentry when configured"
- **NOT OK:** "24/7 Sentry monitoring" until health check shows `live`
