# Next production readiness pass — report

**Date:** 2026-05-15  
**Scope:** Staging webhook async honesty, distributed rate limits, Sentry wiring, Stripe async design-only, E2E scaffolding, marketing/pricing touch, replay PII policy, failed webhook → error recovery, documentation.

## Summary

| Workstream | Status |
|------------|--------|
| Priority audit doc | `docs/PRODUCTION_READINESS_NEXT_PRIORITY_AUDIT.md` |
| Staging webhook async runbook | `docs/STAGING_WEBHOOK_ASYNC_VERIFICATION_RUNBOOK.md` |
| Distributed rate limiting | Implemented (memory + Upstash); `REDIS_URL` node adapter **not** implemented (reserved) |
| Sentry | `@sentry/nextjs` + `instrumentation.ts` + client/server/edge configs; `captureErrorSafe` uses SDK when DSN + client exist; health shows `live` only when both true |
| Stripe async billing | **Design doc only** — `docs/STRIPE_ASYNC_OUTBOX_IDEMPOTENCY_DESIGN.md`; capability row `stripe_async_billing` = `DESIGN_READY` |
| E2E CI | `tests/e2e/*.spec.ts` + Playwright project `ci-critical-paths`; all tests **explicitly skipped** pending fixtures |
| Marketing / pricing | Landing TEAM tier copy + matrix row; full site pass remains **P2** follow-up |
| Replay PII | `AUDIT_REASON_RETENTION_MODE` + `buildAuditReasonMetadata` + replay UI hint |
| FAILED webhooks → recovery | Upsert + resolve wired; rollup + workspace/platform error lists |
| Woo/Shopify webhooks | **No** retry behavior change; distributed ingest limit only when Upstash active, post-signature |

## Command results (local)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **Pass** (exit 0) |
| `npm run build` | **Pass** (exit 0) |
| `npm run lint` | **Pass** (exit 0; existing repo warnings unchanged) |
| `npm test` | **Pass** — 32 files, 100 tests |

## Remaining priorities

| Tier | Items |
|------|-------|
| **P0** | Run staging migration + real Woo/Shopify webhook validation per runbook |
| **P1** | Enable Upstash in staging/prod; set `SENTRY_DSN` + verify `sentryServer: live`; activate E2E CI job with ephemeral DB |
| **P2** | Marketing pages full audit vs matrix; optional `REDIS_URL` ioredis adapter if required |
| **P3** | Enterprise roadmap (SSO/SCIM/SOC2) per matrix |

## Recommended next PRs

1. Staging DB migrate + cron + real provider webhook validation (P0).  
2. Upstash project + env wiring + load test (P1).  
3. Sentry project + DSN + release health checklist (P1).  
4. E2E CI: seed script + GitHub Action + un-skip one spec at a time (P1).  
5. Stripe async outbox implementation **after** explicit design approval (P2+).

No git commit was created in this pass.
