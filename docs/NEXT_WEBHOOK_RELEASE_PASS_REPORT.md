# Next webhook release pass — report

## Implemented

- Shopify async queue + shared provider router.
- Cron route: dry-run, batch env, structured JSON, logging.
- Audited webhook replay (platform + workspace) with UI rows.
- Rate limits: book demo, sales/partner inquiries, support tickets, public API order POST.
- Observability: consolidated `lib/observability/redaction.ts` (+ `redactFreeText`).
- Docs: audit, migration runbook, processor, cron, Woo verify, replay, Shopify/Stripe position, public POST RL, E2E notes, marketing alignment pointer, Sentry readiness, checklist.
- E2E: `e2e/webhook-cron-public.spec.ts`.
- Tests: `webhook-job-config` unit test; integration action copy update.

## Command results (local)

- `npm run typecheck` — pass  
- `npm test` — pass  
- `npm run lint` — pass (existing warnings)  
- `npm run build` — pass (Next.js production build)

## Remaining limitations

- Rate limits are in-process (not distributed).
- Stripe webhooks intentionally **not** moved to async queue.
- Replay can duplicate commerce side effects — operator training required.
- Full signup→order E2E still env-dependent.

## Recommended next PRs

1. Redis-backed rate limiter.
2. `@sentry/nextjs` real SDK wiring behind feature flag.
3. DB integration tests for job state machine with Testcontainers.
4. Marketing homepage pass using `CapabilityMatrixPanel` excerpts.
