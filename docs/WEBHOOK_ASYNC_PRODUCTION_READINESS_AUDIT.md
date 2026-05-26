# Webhook async production readiness audit

**Scope:** DB-backed `webhook_processing_jobs`, WooCommerce + Shopify ingress, cron worker, replay, rate limits, observability, tests.

## Summary

| Area | Current behavior | Production risk | Priority |
|------|------------------|-----------------|----------|
| Migration | `20260615180000_webhook_processing_jobs` adds enum + table + indexes | Staging/prod must run `npm run db:deploy` before async | **P0** |
| Prisma model | `WebhookProcessingJob` 1:1 with `WebhookEvent`; statuses QUEUED→PROCESSING→… | Schema differs from aspirational “sanitizedPayloadJson” field doc — payload stays on `WebhookEvent` | **P1** document |
| Woo ingress | Fast return when async; inline fallback | Misconfigured cron = backlog | **P0** when async on |
| Shopify ingress | Same pattern as Woo after this pass | Same as Woo | **P1** staging verify |
| Stripe ingress | **Remains synchronous** — billing idempotency via `billingEvent` | Correct: do not queue payment webhooks without dedicated design | **P2** |
| `WEBHOOK_ASYNC_QUEUE` | Env flag read in `lib/webhooks/webhook-queue-mode.ts` | Typo leaves inline-only | **P1** |
| Cron `/api/cron/webhook-jobs` | Bearer `CRON_SECRET`; JSON summary; optional `?dryRun=1` | Missing secret → 503 | **P0** |
| Retry | Exponential backoff + max attempts | Poison messages visible as FAILED | **P1** |
| Replay | Audited `requestWebhookReplay` + row UI | Duplicate commerce writes if abused | **P1** |
| Rate limits | In-memory fixed window on public forms + API POST | Not distributed | **P2** |
| Tests | Vitest + Playwright cron smoke | Full Woo async path needs DB fixture | **P2** |

## P0 (before async in prod)

- Apply migration; set `CRON_SECRET`; enable cron; smoke one Woo + one Shopify job.
- Confirm `WEBHOOK_JOB_MAX_ATTEMPTS` / `WEBHOOK_JOB_BATCH_SIZE` sane for traffic.

## P1 (before staging sign-off)

- Run `WOOCOMMERCE_WEBHOOK_ASYNC_VERIFICATION.md` checklist.
- Validate replay audit rows in `audit_logs`.

## P2 (paid pilot hardening)

- Distributed rate limit / Redis.
- Auto-create platform error rows on FAILED jobs.

## P3 (enterprise)

- Multi-region job leasing, dead-letter export, signed replay approvals.
