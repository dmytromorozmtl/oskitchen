> **DEPRECATED — Historical priority audit.** Do not use for release or sales decisions.  
> **Canonical source:** [`docs/canonical-doc-index.md`](./canonical-doc-index.md) → [`p0-hardening-roadmap.md`](./p0-hardening-roadmap.md), [`implementation-backlog.md`](./implementation-backlog.md).

# Production readiness — next priority audit (OS Kitchen)

This audit summarizes **current behavior**, **production risk**, **recommended fix**, **implementability**, **staging/provider needs**, and **priority tier** (P0–P3). It is intentionally honest: nothing here claims live partner certification.

## Webhook processing jobs migration

| Area | Current | Risk | Fix | Now? | Staging? | Priority |
|------|---------|------|-----|------|----------|----------|
| `webhook_processing_jobs` | Prisma model + migration path in repo; status depends on `npm run db:deploy` on each env | Jobs never run if table missing | Run migration on staging/prod; verify with `prisma migrate status` | Yes (SQL in repo) | **Required** | **P0** |
| `WEBHOOK_ASYNC_QUEUE` | Gates enqueue + cron worker; when false, inline Woo/Shopify paths run | Misconfigured env → surprise inline load or stuck queue | Document + validate in `/api/health` queue posture | Yes | Staging flip + cron | **P0** |
| `/api/cron/webhook-jobs` + `CRON_SECRET` | Bearer check; batch drain | Missing secret → 401 (good) or weak secret → abuse | Strong `CRON_SECRET`; Vercel/scheduler only | Yes | Staging cron job | **P0** |
| Woo async | Enqueue after valid signature; retries via job runner | Exhausted retries → FAILED + recovery row | Staging real delivery test (runbook) | Yes | **Real Woo staging store** | **P0** |
| Shopify async | Same pattern; unsupported topics → processor honest path | Fake success if handlers lie | Keep explicit UNSUPPORTED/IGNORED semantics in processor | Yes | **Real Shopify webhook** | **P0** |
| Retry / FAILED | `RETRYING` with `nextAttemptAt`; terminal `FAILED` | Silent loss if no recovery surfacing | Error recovery upsert (implemented) + observability | Yes | Staging forced failure | **P1** |
| Replay + audit | Audited replay; metadata uses reason policy service | PII in free-text reasons | `AUDIT_REASON_RETENTION_MODE` + UI hint | Yes | Policy review | **P1** |

## Rate limiting

| Area | Current | Risk | Fix | Now? | Staging? | Priority |
|------|---------|------|-----|------|----------|----------|
| In-memory | Per-instance fixed window (`checkRateLimit`) | Multi-instance bypass / uneven quotas | Upstash adapter when `RATE_LIMIT_ADAPTER=upstash` + REST creds | Yes | Upstash project | **P1** |
| Distributed | `@upstash/redis` INCR+PEXPIRE keyed by route/policy | Mis-keying blocks legit traffic | Provider webhook keys = `provider+connection+topic` (high ceiling); public forms = IP/user bucket | Yes | Load test | **P1** |
| Production memory | `rateLimitProductionWarning()` in health snapshot | Ops blind to split-brain limits | Wire into dashboards (platform health + trust status) | Yes | None | **P2** |

## Sentry

| Area | Current | Risk | Fix | Now? | Staging? | Priority |
|------|---------|------|-----|------|----------|----------|
| SDK | `@sentry/nextjs` + `instrumentation.ts` + client/server/edge configs | Double init / bundle noise | Keep `captureErrorSafe` as single server capture API | Yes | DSN project | **P1** |
| Honesty | Health shows `sentryServer: live` only if `getClient()` + `SENTRY_DSN` | Marketing “live” without SDK | Capability matrix + health badges | Yes | DSN in staging | **P1** |

## Stripe async billing

| Area | Current | Risk | Fix | Now? | Staging? | Priority |
|------|---------|------|-----|------|----------|----------|
| Async / outbox | **Not implemented** — design doc only | Double charge / reorder without idempotency | Outbox + billing state machine (see dedicated doc) | **Design only** | N/A until approved | **P2** roadmap |

## E2E / CI

| Area | Current | Risk | Fix | Now? | Staging? | Priority |
|------|---------|------|-----|------|----------|----------|
| Critical paths | `tests/e2e/*.spec.ts` **skipped** with explicit reasons | False confidence | Fixtures + CI secrets per `E2E_CI_*` docs | Scaffold done | CI DB + env | **P1** |

## Marketing / capability matrix

| Area | Current | Risk | Fix | Now? | Priority |
|------|---------|------|-----|------|----------|
| Uber / SMS / offline | Matrix rows + pricing tweak (landing) | Over-claim | Keep “partner access required” language | Partial pass | **P2** |
| Sentry / Stripe async | New matrix row `stripe_async_billing` + health | Mismatch | Single source: matrix + `/platform/health` | Done | **P2** |

## FAILED webhook jobs → error recovery

| Area | Current | Risk | Fix | Now? | Priority |
|------|---------|------|-----|------|----------|
| Linkage | Upsert on terminal failure; resolve on success; listed in error events | Duplicates | Unique `(source, sourceId)` + upsert | Yes | **P1** |

---

**P0** — staging migration + cron + real webhook validation before calling async queue “verified”.  
**P1** — closed beta: distributed limits, Sentry DSN, recovery visibility, E2E CI activation.  
**P2** — paid pilot: marketing parity, rate-limit load proof, Stripe async implementation after design sign-off.  
**P3** — enterprise extras (SSO/SCIM/SOC2) remain roadmap per matrix.
