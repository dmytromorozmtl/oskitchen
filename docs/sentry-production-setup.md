# Sentry production setup — OS Kitchen

**Task:** DEV-03 / Era 70 (`era70-sentry-production-v1`)  
**Status:** SDK wired — activate with `npm run sentry:production:activate`  
**Smoke:** `npm run smoke:sentry-production` → `artifacts/sentry-production-smoke-summary.json`  
**UI:** `/dashboard/developer/sentry`  
**Evidence:** `GET /api/health` → `checks.sentryServer.ok` flips true after Vercel DSN + redeploy

This guide activates Sentry on **production** (`os-kitchen.com`). SDK wiring is already in the repo; only DSN env vars are missing.

---

## 1. What is already wired (no code changes needed)

| Layer | File | Behavior |
|-------|------|----------|
| Instrumentation hook | `instrumentation.ts:4-17` | Loads `sentry.server.config` (Node) and `sentry.edge.config` (Edge) on boot |
| Server SDK | `sentry.server.config.ts:5-14` | `Sentry.init()` when `resolveSentryServerDsn()` returns a DSN |
| DSN resolution | `lib/observability/apm.ts:26-28` | Prefers `SENTRY_DSN`, falls back to `NEXT_PUBLIC_SENTRY_DSN` |
| Request errors | `instrumentation.ts:19` | `onRequestError = Sentry.captureRequestError` |
| Safe capture API | `services/observability/error-reporting-service.ts` | `captureErrorSafe()` — no-op without DSN |
| Health check | `/api/health` | Reports `sentryServer.ok` and `observability.backend` |
| Vercel push script | `scripts/push-vercel-production-sentry.ts` | `npm run sentry:production:activate` |

Extended reference: [sentry-setup.md](./sentry-setup.md), [SENTRY_ALERT_RULES.md](./SENTRY_ALERT_RULES.md).

---

## 2. Create Sentry project (one-time)

1. Sign in at [sentry.io](https://sentry.io).
2. Create project **Next.js** named `os-kitchen` (or match `SENTRY_PROJECT` in `next.config.ts`).
3. Copy the **DSN** (format: `https://<key>@<org>.ingest.sentry.io/<project-id>`).
4. Do **not** commit the DSN to git — set only in Vercel env.

---

## 3. Set Vercel Production environment variables

| Variable | Required | Value |
|----------|:--------:|-------|
| `SENTRY_DSN` | **Yes** | Server DSN from Sentry project settings |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Same DSN (enables browser Replay + client errors) |
| `SENTRY_TRACES_SAMPLE_RATE` | No | `0.1` in production (default in `lib/observability/apm.ts:12`) |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | No | `0.1` in production |
| `SENTRY_AUTH_TOKEN` | Build only | Source map upload — Vercel **Build** env, never in repo |
| `SENTRY_ORG` | Build | e.g. `os-kitchen` |
| `SENTRY_PROJECT` | Build | e.g. `os-kitchen` |

### Option A — CLI script (recommended)

```bash
# Dry-run: shows which keys are ready
npm run sentry:production:activate

# Apply to Vercel Production (requires vercel CLI + login)
SENTRY_DSN="https://YOUR_KEY@oXXXX.ingest.sentry.io/YYYY" \
  npm run sentry:production:activate -- --apply --mirror-public-dsn

# Apply + trigger redeploy
SENTRY_DSN="https://YOUR_KEY@oXXXX.ingest.sentry.io/YYYY" \
  npm run sentry:production:activate -- --apply --deploy --mirror-public-dsn
```

Script source: `scripts/push-vercel-production-sentry.ts`.

### Option B — Vercel dashboard

1. Project → **Settings** → **Environment Variables**
2. Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` for **Production**
3. **Redeploy** production (env vars apply on next deploy only)

---

## 4. Verify after redeploy

```bash
curl -s https://os-kitchen.com/api/health | python3 -m json.tool
```

**Pass criteria:**

```json
{
  "checks": {
    "sentryServer": {
      "ok": true,
      "configured": true,
      "status": "live"
    },
    "observability": {
      "ok": true,
      "backend": "SENTRY",
      "configured": true,
      "sentryConnected": true
    }
  }
}
```

Platform health UI: `/platform/health` — badge **Live — SDK initialized with SENTRY_DSN** (`app/platform/health/page.tsx:78-81`).

Optional server smoke (staging only — do not run in prod customer traffic):

```typescript
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
captureErrorSafe(new Error("Sentry smoke test"), { tags: { smoke: "sentry-production-setup" } });
```

Confirm event in Sentry Issues within ~60s.

---

## 5. Alert rules (post-activation)

Configure in Sentry UI per [SENTRY_ALERT_RULES.md](./SENTRY_ALERT_RULES.md):

- New issue → Slack/email
- Error rate spike on `/dashboard/*` routes
- Cron job failures (`/api/cron/*`)

---

## 6. Acceptance criteria (DEV-03 done)

- [ ] `SENTRY_DSN` set in Vercel Production
- [ ] Production redeploy completed
- [ ] `/api/health` → `sentryServer.ok: true`
- [ ] Test exception visible in Sentry dashboard (staging smoke)
- [ ] No secrets committed to git

**Note:** This document is the ops runbook. `sentryServer.ok` flips to `true` only after a human completes steps 2–4 — cannot be faked in CI without real DSN.

---

## Related

- [monitoring.md](./monitoring.md) — health scripts, Lighthouse
- [SENTRY_REAL_INTEGRATION_READINESS.md](./SENTRY_REAL_INTEGRATION_READINESS.md) — integration readiness checklist
